import type { CountriesData, FossilFuelData, YearData } from './types';
import { carbonIntensity } from './gridMetrics';
import { calculateIndependenceScoreV2, getFossilDataForYear } from './independence';

/**
 * World medians for the head-to-head rows.
 *
 * The compare page already holds every country in memory, so a median is a sort
 * away and needs no new data file. What it does need is memoising: the page
 * recomputes on every selection change, and walking 214 countries seven times
 * per keystroke is work nobody asked for.
 *
 * The population is every country reporting that metric in that year - not the
 * two selected, and not a bloc's members. A median of two numbers is one of the
 * two numbers.
 */

export type CompareMetric =
  | 'total_generation'
  | 'clean_pct'
  | 'renewables_pct'
  | 'wind_solar_pct'
  | 'emissions'
  | 'carbon_intensity'
  | 'independence';

export interface Distribution {
  /** Ascending, so a rank is an index. */
  sorted: number[];
  median: number;
  n: number;
}

const cache = new Map<string, Distribution | null>();

function valueOf(
  metric: CompareMetric,
  d: YearData,
  iso3: string,
  year: number,
  fossil: FossilFuelData | null
): number | null {
  switch (metric) {
    case 'total_generation':
      return d.total_generation_twh > 0 ? d.total_generation_twh : null;
    case 'clean_pct':
      return d.aggregates?.clean_pct ?? null;
    case 'renewables_pct':
      return d.aggregates?.renewables_pct ?? null;
    case 'wind_solar_pct':
      return d.aggregates?.wind_solar_pct ?? null;
    case 'emissions':
      return d.emissions?.total_mtco2 ?? null;
    case 'carbon_intensity':
      return carbonIntensity(d);
    case 'independence': {
      const score = calculateIndependenceScoreV2(
        d,
        // The year matters: getFossilDataForYear falls back to the nearest
        // year at or before the target, so passing anything but the real one
        // scores the country against a different year's production.
        getFossilDataForYear(fossil?.countries[iso3], year).data,
        iso3
      );
      /*
       * Countries with no fossil-fuel data are left out rather than scored.
       *
       * `lib/independence.ts` treats an unknown consumption as imported, so a
       * flagged score reads LOW, not inflated - the inflation was the old
       * behaviour, which scored grids running on imported diesel as energy
       * fortresses, and it is fixed. The direction is the opposite of what it
       * looks like, but the conclusion is the same: half the countries
       * reporting in 2024 carry the flag, and a median dragged down by 98
       * deliberately conservative figures is not a world median.
       */
      return score && !score.missingFossilData ? score.score : null;
    }
  }
}

/** Every country reporting `metric` in `year`, sorted, or null if too few. */
export function distributionFor(
  metric: CompareMetric,
  year: number,
  countries: CountriesData,
  fossil: FossilFuelData | null
): Distribution | null {
  const key = `${metric}:${year}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const values: number[] = [];
  for (const [iso3, c] of Object.entries(countries)) {
    const d = c.years[String(year)];
    if (!d) continue;
    const v = valueOf(metric, d, iso3, year, fossil);
    if (v != null && Number.isFinite(v)) values.push(v);
  }

  // A median of a handful of countries is not a world figure.
  values.sort((a, b) => a - b);
  const result =
    values.length >= 30
      ? { sorted: values, median: values[Math.floor(values.length / 2)], n: values.length }
      : null;

  cache.set(key, result);
  return result;
}

/**
 * Where a value sits in the distribution, counted from the good end.
 *
 * `higherIsBetter` is what makes "96th cleanest" possible: for carbon intensity
 * and emissions the good end is the low one, and reporting a raw ascending rank
 * there would put the dirtiest grid first.
 */
export function rankOf(
  value: number,
  dist: Distribution,
  higherIsBetter: boolean
): { rank: number; n: number } {
  const below = dist.sorted.filter((v) => v < value).length;
  return { rank: higherIsBetter ? dist.n - below : below + 1, n: dist.n };
}
