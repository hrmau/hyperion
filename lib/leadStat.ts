import { SOURCE_LABEL, sourceLabel } from './fuels';
import type { EnergySource, YearData } from './types';

/**
 * The one figure to set in green, chosen by what the hook is actually about.
 *
 * Three identical stat blocks under a headline about wind is a missed
 * opportunity: the reader has just been told something specific and then handed
 * generic totals. The lead stat is the number the sentence above it is making a
 * claim about, so the eye lands on the evidence for what it just read.
 *
 * Built from the hero fact's own `values` rather than recomputed from the data,
 * so the green number and the headline cannot drift apart. Everything printed
 * here already passed the generator's values check.
 */

export interface LeadStat {
  label: string;
  value: string;
  unit?: string;
  note: string;
}

export interface HeroShape {
  /** Needed to decide whether "other renewables" may be called geothermal. */
  iso3: string;
  family: string;
  metric: string;
  comparisonSet: string;
  values: Record<string, number>;
  year: number;
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th'];
const ordinal = (n: number) => ORDINAL[n] || `${n}th`;

const SET_LABEL: Record<string, string> = {
  world: 'in the world',
  EU: 'in the EU',
  G20: 'in the G20',
  OECD: 'in the OECD',
  NATO: 'in NATO',
  ASEAN: 'in ASEAN',
  BRICS: 'among BRICS+',
};
const setLabel = (s: string) => SET_LABEL[s] ?? `in ${s}`;

const num = (n: number, dp = 0) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

const isSource = (m: string): m is EnergySource => m in SOURCE_LABEL;

export function leadStat(hero: HeroShape, data: YearData): LeadStat | null {
  const v = hero.values;

  switch (hero.family) {
    case 'rank': {
      if (v.rank == null || v.of == null) return null;
      const where = `${ordinal(v.rank)} of ${v.of} ${setLabel(hero.comparisonSet)}`;
      if (isSource(hero.metric) && v.share_pct != null) {
        return { label: `${sourceLabel(hero.metric, hero.iso3)} share`, value: num(v.share_pct), unit: '%', note: where };
      }
      if (hero.metric === 'clean_pct' && v.clean_pct != null) {
        return { label: 'Clean share', value: num(v.clean_pct), unit: '%', note: where };
      }
      if (hero.metric === 'percap' && v.kwh_per_person != null) {
        return { label: 'Per person', value: num(v.kwh_per_person), unit: 'kWh', note: where };
      }
      if (hero.metric === 'total' && v.twh != null) {
        return { label: 'Total output', value: num(v.twh), unit: 'TWh', note: where };
      }
      return null;
    }

    case 'concentration': {
      if (v.share_pct != null && isSource(hero.metric)) {
        return {
          label: `${sourceLabel(hero.metric, hero.iso3)} share`,
          value: num(v.share_pct),
          unit: '%',
          note: 'of everything it generates',
        };
      }
      if (v.largest_share_pct != null) {
        return {
          label: 'Largest source',
          value: num(v.largest_share_pct),
          unit: '%',
          note: 'no fuel dominates',
        };
      }
      return null;
    }

    case 'contradiction':
      if (v.wind_solar_pct == null || v.fossil_pct == null) return null;
      return {
        label: 'Wind and solar',
        value: num(v.wind_solar_pct),
        unit: '%',
        note: `alongside ${num(v.fossil_pct)}% fossil`,
      };

    case 'trajectory':
      if (v.to_pct == null || v.from_pct == null || v.years == null) return null;
      return {
        label: 'Clean share',
        value: num(v.to_pct),
        unit: '%',
        note: `${num(v.from_pct)}% ${v.years} years ago`,
      };

    case 'crossover': {
      if (v.winner_pct == null || v.crossover_year == null) return null;
      const fuel = hero.metric.split('_over_')[0];
      return {
        label: isSource(fuel) ? `${sourceLabel(fuel, hero.iso3)} share` : 'Leading source',
        value: num(v.winner_pct),
        unit: '%',
        note: `ahead since ${v.crossover_year}`,
      };
    }

    case 'peer':
      if (v.kwh_per_person == null || v.ratio == null) return null;
      return {
        label: 'Per person',
        value: num(v.kwh_per_person),
        unit: 'kWh',
        note: `${num(v.ratio)}x less than its peer`,
      };

    case 'absence': {
      // Nothing to put a number on, so fall back to the headline aggregate.
      return {
        label: 'Clean share',
        value: num(data.aggregates.clean_pct),
        unit: '%',
        note: `in ${hero.year}`,
      };
    }

    default:
      return null;
  }
}
