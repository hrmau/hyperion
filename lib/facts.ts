import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import type { CountriesData, Country, YearData } from './types';

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
}

/**
 * Other grids in the same region, closest in size.
 *
 * These links are the point of the set, not decoration. Two hundred pages that
 * only link back to /explore are two hundred orphans, and a crawler has no
 * reason to walk them. Neighbours are chosen by proximity in total output rather
 * than alphabetically, so the comparison a reader clicks into is one worth
 * making.
 */
export const loadNeighbours = cache(
  async (iso3: string, limit = 5): Promise<NeighbourLink[]> => {
    const code = iso3.toUpperCase();
    const [facts, countries] = await Promise.all([loadFacts(), loadCountriesServer()]);
    const self = countries[code];
    if (!self) return [];

    const region = self.emberRegion;
    if (!region || region === 'Other') return [];

    const outputOf = (iso: string) => {
      const f = facts[iso];
      const yd = f && countries[iso]?.years[String(f.year)];
      return yd ? yd.total_generation_twh : null;
    };
    // Falls back to the country's own latest year when it has no facts — the
    // pageless ones still need somewhere to send a reader.
    // Falls back to the country's own latest year, and then to zero. Zero is not
    // a failure to find a size — Niue really does report no generation, and the
    // right neighbours for it are the smallest grids in its region, which is
    // exactly what a zero reference selects. Returning nothing here left the
    // pageless countries as the dead ends this is meant to fix.
    const mine =
      outputOf(code) ??
      (() => {
        const ys = Object.keys(self.years).map(Number).sort((a, b) => b - a);
        for (const y of ys) {
          const d = self.years[String(y)];
          if (d && d.total_generation_twh > 0) return d.total_generation_twh;
        }
        return 0;
      })();

    return Object.keys(facts)
      .filter((i) => i !== code && countries[i]?.emberRegion === region)
      .map((i) => ({ iso3: i, out: outputOf(i) }))
      .filter((x): x is { iso3: string; out: number } => x.out != null)
      .sort(
        (a, b) =>
          Math.abs(Math.log10(a.out + 0.01) - Math.log10(mine + 0.01)) -
          Math.abs(Math.log10(b.out + 0.01) - Math.log10(mine + 0.01))
      )
      .slice(0, limit)
      .map((x) => {
        const f = facts[x.iso3];
        const yd = countries[x.iso3]?.years[String(f.year)];
        return {
          iso3: x.iso3,
          name: f.name,
          headline: f.hero.headline,
          cleanPct: yd ? yd.aggregates.clean_pct : null,
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
    headline: `Coal still makes ${Math.round(coal)}% of the world's electricity.`,
    detail: `Low-carbon sources reached ${Math.round(clean)}% of global generation in ${year}. The other half of the grid is the argument.`,
    note:
      solarThen != null
        ? {
            headline: 'Watch the solar band.',
            detail: `It was ${solarThen.toFixed(1)}% of world generation five years ago and is ${solar.toFixed(1)}% now — the fastest change on this chart, and the one most forecasts missed.`,
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
