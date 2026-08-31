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
    const selfFacts = facts[code];
    if (!self || !selfFacts) return [];

    const region = self.emberRegion;
    if (!region || region === 'Other') return [];

    const outputOf = (iso: string) => {
      const f = facts[iso];
      const yd = f && countries[iso]?.years[String(f.year)];
      return yd ? yd.total_generation_twh : null;
    };
    const mine = outputOf(code);
    if (mine == null) return [];

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
      .map((x) => ({
        iso3: x.iso3,
        name: facts[x.iso3].name,
        headline: facts[x.iso3].hero.headline,
      }));
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
