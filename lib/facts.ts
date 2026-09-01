import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import type { CountriesData, Country, FossilFuelData, YearData } from './types';
import type { HeroShape } from './leadStat';

/**
 * Build-time access to the generated country facts.
 *
 * Read from the filesystem rather than fetched, because these pages are
 * prerendered and the whole point is that the claim is in the HTML — for the
 * reader on a slow connection and for the crawler alike. The 6MB dataset must
 * never reach the browser to render one country.
 *
 * Server-only by construction: `fs` does not exist in the browser.
 */

export type FactFamily =
  | 'rank'
  | 'trajectory'
  | 'crossover'
  | 'contradiction'
  | 'peer'
  | 'absence'
  | 'concentration';

export interface Fact {
  id: string;
  iso3: string;
  family: FactFamily;
  score: number;
  headline: string;
  detail: string | null;
  metric: string;
  year: number;
  comparisonSet: string;
  values: Record<string, number>;
  source: 'generated' | 'manual';
}

export interface CountryFacts {
  iso3: string;
  name: string;
  year: number;
  /** Data older than three years. The page must say which year it means. */
  stale: boolean;
  hero: Fact;
  supporting: Fact[];
  dataQuality: 'full' | 'partial' | 'thin';
}

const DATA = path.join(process.cwd(), 'public', 'data');
const readJSON = async <T,>(file: string): Promise<T> =>
  JSON.parse(await fs.readFile(path.join(DATA, file), 'utf8')) as T;

export const loadFacts = cache(async (): Promise<Record<string, CountryFacts>> =>
  readJSON<Record<string, CountryFacts>>('country-facts.json')
);

export const loadCountriesServer = cache(async (): Promise<CountriesData> =>
  readJSON<CountriesData>('countries-yearly.json')
);

/** Fossil production-vs-consumption, for the independence score. 99 countries. */
export const loadFossilServer = cache(async (): Promise<FossilFuelData['countries']> => {
  const file = await readJSON<FossilFuelData>('fossil-fuel-independence.json');
  return file.countries;
});

/** Every country with a publishable hook, which is the set that gets a page. */
export const publishableIso3 = cache(async (): Promise<string[]> => {
  const facts = await loadFacts();
  return Object.keys(facts).sort();
});

/** In the dataset, but with no hook — so no profile page. */
export const loadPagelessCountry = cache(async (iso3: string) => {
  const code = iso3.toUpperCase();
  const [facts, countries] = await Promise.all([loadFacts(), loadCountriesServer()]);
  if (facts[code]) return null;
  const c = countries[code];
  return c ? { iso3: code, name: c.name, region: c.emberRegion } : null;
});

/**
 * Carbon-intensity rank across every country with a page, cleanest first.
 *
 * A number on its own does not tell a reader whether 267 g is good. The rank is
 * what turns it into "cleaner than 7 in 10 grids", which is the part they can
 * actually use.
 */
export const loadIntensityRanks = cache(
  async (): Promise<{ ranks: Record<string, number>; of: number }> => {
    const [facts, countries] = await Promise.all([loadFacts(), loadCountriesServer()]);
    const rows: { iso3: string; g: number }[] = [];
    for (const [iso3, f] of Object.entries(facts)) {
      const yd = countries[iso3]?.years[String(f.year)];
      if (!yd) continue;
      const mt = yd.emissions?.total_mtco2;
      if (mt == null || !(yd.total_generation_twh > 0)) continue;
      const g = (mt * 1e12) / (yd.total_generation_twh * 1e9);
      if (g > 0) rows.push({ iso3, g });
    }
    rows.sort((a, b) => a.g - b.g);
    const ranks: Record<string, number> = {};
    rows.forEach((r, i) => (ranks[r.iso3] = i + 1));
    return { ranks, of: rows.length };
  }
);

/** Display name for an ISO3, from the dataset. */
export const countryName = cache(async (iso3: string): Promise<string | null> => {
  const countries = await loadCountriesServer();
  const c = countries[iso3.toUpperCase()];
  return c ? c.name : null;
});

export interface CountryProfile {
  facts: CountryFacts;
  country: Country;
  year: number;
  data: YearData;
  /** Years present in the series, ascending. */
  years: number[];
}

export interface NeighbourLink {
  iso3: string;
  name: string;
  headline: string;
  /** Clean share, so a card can say how the two actually differ. */
  cleanPct: number | null;
  /** True when the two share a land border, rather than merely being near. */
  borders: boolean;
}

interface Adjacency {
  borders: string[];
  nearest: string[];
}

const loadAdjacency = cache(async (): Promise<Record<string, Adjacency>> =>
  readJSON<Record<string, Adjacency>>('neighbours.json')
);

/**
 * A country's actual neighbours.
 *
 * These used to be "the grids nearest in size within the same region", which
 * made Thailand a neighbour of the United Arab Emirates, because Asia is a
 * region. Adjacency now comes from shared arcs in the shipped TopoJSON, with a
 * great-circle fallback for islands - see scripts/generate-neighbours.js.
 *
 * Land borders come first, because that is what the word means. Within them the
 * order is by similarity of output, so the reader is offered the comparison
 * worth making rather than the alphabetically first one, and nearest-by-distance
 * tops up anyone short.
 */
export const loadNeighbours = cache(
  async (iso3: string, limit = 5): Promise<NeighbourLink[]> => {
    const code = iso3.toUpperCase();
    const [facts, countries, adjacency] = await Promise.all([
      loadFacts(),
      loadCountriesServer(),
      loadAdjacency(),
    ]);
    const adj = adjacency[code];
    if (!adj) return [];

    const outputOf = (iso: string) => {
      const f = facts[iso];
      const yd = f && countries[iso]?.years[String(f.year)];
      return yd ? yd.total_generation_twh : null;
    };
    const mine = outputOf(code) ?? 0;
    const closenessInSize = (iso: string) => {
      const out = outputOf(iso);
      return out == null
        ? Number.POSITIVE_INFINITY
        : Math.abs(Math.log10(out + 0.01) - Math.log10(mine + 0.01));
    };

    const publishable = (iso: string) => iso !== code && Boolean(facts[iso]);

    // Borders inside the country's own region come first.
    //
    // France borders Brazil, because the topology puts French Guiana inside
    // France and that really is France's longest land border. True, and it reads
    // as a bug sitting above Germany and Spain, so a cross-region border sorts
    // last rather than being dropped.
    const myRegion = countries[code]?.emberRegion;
    const sameRegion = (iso: string) =>
      Boolean(myRegion) && countries[iso]?.emberRegion === myRegion;
    const bordering = adj.borders
      .filter(publishable)
      .sort(
        (a, b) =>
          Number(sameRegion(b)) - Number(sameRegion(a)) ||
          closenessInSize(a) - closenessInSize(b)
      );
    // `nearest` already arrives in distance order; keep it for the top-up.
    const nearby = adj.nearest.filter((i) => publishable(i) && !bordering.includes(i));

    return [...bordering, ...nearby].slice(0, limit).map((iso) => {
      const f = facts[iso];
      const yd = countries[iso]?.years[String(f.year)];
      return {
        iso3: iso,
        name: f.name,
        headline: f.hero.headline,
        cleanPct: yd ? yd.aggregates.clean_pct : null,
        borders: adj.borders.includes(iso),
      };
    });
  }
);

export const loadProfile = cache(async (iso3: string): Promise<CountryProfile | null> => {
  const code = iso3.toUpperCase();
  const [facts, countries] = await Promise.all([loadFacts(), loadCountriesServer()]);
  const f = facts[code];
  const country = countries[code];
  if (!f || !country) return null;

  const data = country.years[String(f.year)];
  if (!data) return null;

  const years = Object.keys(country.years)
    .map(Number)
    .filter((y) => y <= f.year)
    .sort((a, b) => a - b);

  return { facts: f, country, year: f.year, data, years };
});

/* -------------------------------------------------------------------------- */
/* Homepage views                                                              */
/* -------------------------------------------------------------------------- */

export interface HomeView {
  /** ISO3, or 'WORLD'. */
  key: string;
  name: string;
  /** ISO3 for a flag, or null for the world. */
  iso3: string | null;
  year: number;
  stale: boolean;
  headline: string;
  detail: string | null;
  /** Enough of the hero fact to pick which figure to set in green. */
  hero: HeroShape | null;
  /** The second claim, shown as the gorilla's reading beside the chart. */
  note: { headline: string; detail: string | null } | null;
  data: YearData;
  years: number[];
  yearData: (year: number) => YearData | undefined;
  /** Peer comparison when that is what the hook is about. */
  peer: { name: string; mine: number; theirs: number } | null;
  profilePath: string | null;
  neighbours: NeighbourLink[];
}

interface AggregateEntity {
  years: Record<string, YearData>;
}

const loadAggregates = cache(async (): Promise<Record<string, AggregateEntity>> => {
  const file = await readJSON<{ aggregates: Record<string, AggregateEntity> }>(
    'owid-aggregates.json'
  );
  return file.aggregates;
});

/**
 * The world view: what `/` shows when there is no usable location.
 *
 * Local dev, a VPN, a crawler, a country the dataset does not cover, and every
 * grid too small to have a hook all land here, so it has to be a real page
 * rather than an apology. Its headline is computed from the data for the same
 * reason every other one is — a hand-written "a third of the planet runs on
 * coal" is a claim that quietly stops being true.
 */
export const loadWorldView = cache(async (): Promise<HomeView | null> => {
  const world = (await loadAggregates())['World'];
  if (!world) return null;

  const years = Object.keys(world.years).map(Number).sort((a, b) => a - b);
  const year = years[years.length - 1];
  const data = world.years[String(year)];
  if (!data) return null;

  const coal = data.generation.coal?.pct ?? 0;
  const clean = data.aggregates.clean_pct;
  const solar = data.generation.solar?.pct ?? 0;
  const fiveBack = world.years[String(year - 5)];
  const solarThen = fiveBack?.generation.solar?.pct ?? null;

  return {
    key: 'WORLD',
    name: 'The world',
    iso3: null,
    year,
    stale: false,
    hero: null,
    headline: `Coal still makes ${Math.round(coal)}% of the world's electricity.`,
    detail: `Low-carbon sources reached ${Math.round(clean)}% of global generation in ${year}. The other half of the grid is the argument.`,
    note:
      solarThen != null
        ? {
            headline: 'Watch the solar band.',
            detail: `It was ${solarThen.toFixed(1)}% of world generation five years ago and is ${solar.toFixed(1)}% now - the fastest change on this chart, and the one most forecasts missed.`,
          }
        : null,
    data,
    years,
    yearData: (y: number) => world.years[String(y)],
    peer: null,
    profilePath: null,
    neighbours: [],
  };
});

/** The homepage as one country, or as the world. */
export const loadHomeView = cache(async (key: string): Promise<HomeView | null> => {
  if (key.toUpperCase() === 'WORLD') return loadWorldView();

  const p = await loadProfile(key);
  if (!p) return null;
  const { facts, country, data, year, years } = p;
  const note = facts.supporting[0] ?? null;

  let peer: HomeView['peer'] = null;
  if (facts.hero.family === 'peer') {
    const name = await countryName(facts.hero.comparisonSet);
    peer = {
      name: name ?? facts.hero.comparisonSet,
      mine: facts.hero.values.kwh_per_person ?? 0,
      theirs: facts.hero.values.peer_kwh_per_person ?? 0,
    };
  }

  return {
    key: facts.iso3,
    name: facts.name,
    iso3: facts.iso3,
    year,
    stale: facts.stale,
    hero: {
      family: facts.hero.family,
      metric: facts.hero.metric,
      comparisonSet: facts.hero.comparisonSet,
      values: facts.hero.values,
      year: facts.hero.year,
    },
    headline: facts.hero.headline,
    detail: facts.hero.detail,
    note: note ? { headline: note.headline, detail: note.detail } : null,
    data,
    years,
    yearData: (y: number) => country.years[String(y)],
    peer,
    profilePath: `/country/${facts.iso3.toLowerCase()}`,
    neighbours: await loadNeighbours(facts.iso3, 3),
  };
});

export interface HomeQuestion {
  prompt: string;
  a: { iso3: string; name: string };
  b: { iso3: string; name: string };
  aboutYou: boolean;
}

/**
 * A Higher-or-Lower question for the homepage card.
 *
 * Prefers one the visitor's own country is in — only about a third of countries
 * appear in the 56-question bank, so most visitors get a general one, and it
 * prefers the questions the generator marked surprising because a card that
 * gives itself away is not worth clicking.
 */
export const loadHomeQuestion = cache(async (iso3: string | null): Promise<HomeQuestion | null> => {
  const all = await readJSON<
    { id: string; prompt: string; surprising?: boolean; a: { iso3: string; name: string }; b: { iso3: string; name: string } }[]
  >('questions.json');
  if (!all.length) return null;

  const mine = iso3 ? all.filter((q) => q.a.iso3 === iso3 || q.b.iso3 === iso3) : [];
  const pool = mine.length ? mine : all.filter((q) => q.surprising) || all;
  const chosen = (pool.length ? pool : all)[0];
  return {
    prompt: chosen.prompt,
    a: { iso3: chosen.a.iso3, name: chosen.a.name },
    b: { iso3: chosen.b.iso3, name: chosen.b.name },
    aboutYou: mine.length > 0,
  };
});

/** Name and code for every country the switcher can offer. */
export const loadSwitcherIndex = cache(
  async (): Promise<{ iso3: string; name: string }[]> => {
    const facts = await loadFacts();
    return Object.values(facts)
      .map((c) => ({ iso3: c.iso3, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
);
