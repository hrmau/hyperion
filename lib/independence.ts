import type { YearData, FossilFuelYearData, FossilFuelCountry } from './types';

/**
 * Uranium Independence Lookup Table
 *
 * Based on 2023-2024 uranium production data from World Nuclear Association.
 * Values represent the percentage of domestic uranium production relative to
 * consumption for nuclear power plants.
 *
 * Top 10 uranium producers account for 99%+ of world production:
 * 1. Kazakhstan (43%), 2. Canada (15%), 3. Namibia (11%), 4. Australia (8%)
 * 5. Uzbekistan (7%), 6. Russia (5%), 7. Niger (4%), 8. China (3%)
 * 9. India (1.6%), 10. Ukraine (1.1%)
 */
export const URANIUM_INDEPENDENCE: Record<string, number> = {
  // Major producers (self-sufficient, massive surplus for export)
  'KAZ': 100,  // Kazakhstan - world's #1 producer (43% of global)
  'CAN': 100,  // Canada - major exporter
  'NAM': 100,  // Namibia - major exporter
  'AUS': 100,  // Australia - major exporter (though no nuclear plants domestically)
  'UZB': 100,  // Uzbekistan - significant surplus
  'NER': 100,  // Niger - major exporter
  'RUS': 100,  // Russia - self-sufficient + exports

  // Significant producers (partially self-sufficient)
  'CHN': 50,   // China - produces ~half of needs, imports rest
  'UKR': 50,   // Ukraine - has some production
  'IND': 30,   // India - produces some, imports most

  // Minimal producers (99%+ import dependent)
  'USA': 1,    // USA produces <1% of needs (imports from Canada, Kazakhstan, Australia, Russia)
  'ZAF': 5,    // South Africa - tiny production
  'BRA': 5,    // Brazil - tiny production
  'CZE': 5,    // Czech Republic - tiny production
  'PAK': 5,    // Pakistan - minimal production

  // All other countries with nuclear power: 0% domestic uranium
  // (France, Germany, Japan, UK, South Korea, Spain, Belgium, Sweden,
  //  Finland, Switzerland, Taiwan, etc.)
};

/**
 * Get uranium independence for a country
 * Returns 0-100 representing the percentage of uranium needs met domestically
 */
export function getUraniumIndependence(iso3: string): number {
  return URANIUM_INDEPENDENCE[iso3] ?? 0;
}

export interface IndependenceScore {
  score: number; // 0-100 (final weighted score)
  band: 'fortress' | 'strong' | 'moderate' | 'dependent' | 'critical';
  label: string;
  color: string;
  // Detailed breakdown
  breakdown: {
    renewable: { twh: number; pct: number; contribution: number };
    nuclear: { twh: number; pct: number; independence: number; contribution: number };
    coal: { twh: number; pct: number; independence: number; contribution: number };
    gas: { twh: number; pct: number; independence: number; contribution: number };
    oil: { twh: number; pct: number; independence: number; contribution: number };
  };
  // Strengths and vulnerabilities
  strengths: string[];
  vulnerabilities: string[];
  // Data year used (may differ from requested year)
  fossilDataYear?: number;
}

/**
 * Get fossil fuel data for a country, falling back to nearest available year
 */
export function getFossilDataForYear(
  countryFossil: FossilFuelCountry | undefined,
  targetYear: number
): { data: FossilFuelYearData | null; actualYear: number | null } {
  if (!countryFossil?.years) {
    return { data: null, actualYear: null };
  }

  const years = Object.keys(countryFossil.years).map(Number).sort((a, b) => b - a);

  // Try exact year first
  if (countryFossil.years[targetYear.toString()]) {
    return {
      data: countryFossil.years[targetYear.toString()],
      actualYear: targetYear
    };
  }

  // Find closest year (prefer most recent if target is in future)
  for (const year of years) {
    if (year <= targetYear) {
      return {
        data: countryFossil.years[year.toString()],
        actualYear: year
      };
    }
  }

  // If target is older than all data, use oldest available
  if (years.length > 0) {
    const oldestYear = years[years.length - 1];
    return {
      data: countryFossil.years[oldestYear.toString()],
      actualYear: oldestYear
    };
  }

  return { data: null, actualYear: null };
}

/**
 * Calculate Energy Independence Score
 *
 * Accounts for fuel import dependency:
 * - Renewables are 100% domestic (independent)
 * - Nuclear is weighted by uranium production/consumption ratio
 * - Fossil fuels are weighted by production/consumption ratio
 *
 * Score = (renewables × 100%) + (nuclear × uranium_indep%) +
 *         (coal × coal_indep%) + (gas × gas_indep%) + (oil × oil_indep%)
 */
export function calculateIndependenceScoreV2(
  yearData: YearData,
  fossilData: FossilFuelYearData | null,
  iso3?: string
): IndependenceScore | null {
  const total = yearData.total_generation_twh;
  if (total <= 0) return null;

  const gen = yearData.generation;

  // Calculate renewable electricity (100% independent)
  const renewableTwh =
    (gen.hydro?.twh || 0) +
    (gen.wind?.twh || 0) +
    (gen.solar?.twh || 0) +
    (gen.bioenergy?.twh || 0);
  const renewablePct = (renewableTwh / total) * 100;

  // Nuclear - weighted by uranium import independence
  const nuclearTwh = gen.nuclear?.twh || 0;
  const nuclearPct = (nuclearTwh / total) * 100;
  const uraniumIndep = iso3 ? getUraniumIndependence(iso3) / 100 : 1.0;

  // Fossil fuel electricity
  const coalTwh = gen.coal?.twh || 0;
  const gasTwh = gen.gas?.twh || 0;
  // other_fossil often includes oil-based generation
  const oilTwh = gen.other_fossil?.twh || 0;

  const coalPct = (coalTwh / total) * 100;
  const gasPct = (gasTwh / total) * 100;
  const oilPct = (oilTwh / total) * 100;

  // Calculate fossil fuel independence ratios
  let coalIndep = 1.0; // Default to 100% if no data
  let gasIndep = 1.0;
  let oilIndep = 1.0;

  if (fossilData) {
    // Production / Consumption ratio, capped at 1.0 (100%)
    // If consumption is 0, they don't use that fuel = 100% independent of it
    coalIndep = fossilData.coal.consumption > 0
      ? Math.min(fossilData.coal.production / fossilData.coal.consumption, 1.0)
      : 1.0;
    gasIndep = fossilData.gas.consumption > 0
      ? Math.min(fossilData.gas.production / fossilData.gas.consumption, 1.0)
      : 1.0;
    oilIndep = fossilData.oil.consumption > 0
      ? Math.min(fossilData.oil.production / fossilData.oil.consumption, 1.0)
      : 1.0;
  }

  // Calculate weighted contributions
  const renewableContribution = renewablePct;
  const nuclearContribution = nuclearPct * uraniumIndep;
  const coalContribution = coalPct * coalIndep;
  const gasContribution = gasPct * gasIndep;
  const oilContribution = oilPct * oilIndep;

  // Final score
  const score = renewableContribution + nuclearContribution +
                coalContribution + gasContribution + oilContribution;

  // Determine band and styling
  const { band, label, color } = getScoreBand(score);

  // Generate insights
  const strengths: string[] = [];
  const vulnerabilities: string[] = [];

  if (renewablePct >= 50) {
    strengths.push(`${Math.round(renewablePct)}% renewable electricity is fully independent`);
  } else if (renewablePct >= 25) {
    strengths.push(`${Math.round(renewablePct)}% from domestic renewables`);
  }

  if (nuclearPct >= 30) {
    if (uraniumIndep >= 0.5) {
      strengths.push(`${Math.round(nuclearPct)}% nuclear with ${Math.round(uraniumIndep * 100)}% domestic uranium`);
    } else {
      strengths.push(`${Math.round(nuclearPct)}% nuclear provides stable baseload`);
    }
  } else if (nuclearPct >= 10) {
    if (uraniumIndep >= 0.5) {
      strengths.push(`${Math.round(nuclearPct)}% nuclear with domestic uranium supply`);
    } else {
      strengths.push(`${Math.round(nuclearPct)}% nuclear capacity`);
    }
  }

  if (coalIndep >= 0.8 && coalPct >= 10) {
    strengths.push(`Strong domestic coal production (${Math.round(coalIndep * 100)}% independent)`);
  }

  if (gasIndep >= 0.8 && gasPct >= 10) {
    strengths.push(`Strong domestic gas production (${Math.round(gasIndep * 100)}% independent)`);
  }

  if (oilIndep >= 0.8 && oilPct >= 10) {
    strengths.push(`Strong domestic oil production (${Math.round(oilIndep * 100)}% independent)`);
  }

  // Vulnerabilities
  if (uraniumIndep < 0.3 && nuclearPct >= 10) {
    vulnerabilities.push(`${Math.round((1 - uraniumIndep) * 100)}% of uranium for nuclear is imported`);
  }

  if (gasIndep < 0.3 && gasPct >= 10) {
    vulnerabilities.push(`${Math.round((1 - gasIndep) * 100)}% of natural gas is imported`);
  }

  if (oilIndep < 0.3 && oilPct >= 5) {
    vulnerabilities.push(`${Math.round((1 - oilIndep) * 100)}% of oil is imported`);
  }

  if (coalIndep < 0.5 && coalPct >= 15) {
    vulnerabilities.push(`${Math.round((1 - coalIndep) * 100)}% of coal is imported`);
  }

  // Only flag fossil dependency if they also import a significant portion
  // Calculate weighted fossil fuel independence based on each fuel's share
  const fossilTotal = coalPct + gasPct + oilPct;
  const weightedFossilIndep = fossilTotal > 0
    ? (coalPct * coalIndep + gasPct * gasIndep + oilPct * oilIndep) / fossilTotal
    : 1.0;

  if (yearData.aggregates.fossil_pct > 60 && weightedFossilIndep < 0.7) {
    // They have high fossil use AND import a significant portion
    vulnerabilities.push(`${Math.round(yearData.aggregates.fossil_pct)}% fossil fuel dependency (${Math.round((1 - weightedFossilIndep) * 100)}% imported)`);
  }

  // Only flag lack of nuclear as vulnerability if country has import dependency
  // Self-sufficient countries (like Kazakhstan) don't need nuclear for energy security
  if (nuclearPct === 0 && renewablePct < 40 && yearData.aggregates.fossil_pct > 50 && weightedFossilIndep < 0.7) {
    vulnerabilities.push('No nuclear baseload capacity');
  }

  return {
    score: Math.round(score * 10) / 10,
    band,
    label,
    color,
    breakdown: {
      renewable: { twh: renewableTwh, pct: renewablePct, contribution: renewableContribution },
      nuclear: { twh: nuclearTwh, pct: nuclearPct, independence: uraniumIndep, contribution: nuclearContribution },
      coal: { twh: coalTwh, pct: coalPct, independence: coalIndep, contribution: coalContribution },
      gas: { twh: gasTwh, pct: gasPct, independence: gasIndep, contribution: gasContribution },
      oil: { twh: oilTwh, pct: oilPct, independence: oilIndep, contribution: oilContribution },
    },
    strengths,
    vulnerabilities,
  };
}

/**
 * Legacy v1 calculation for backwards compatibility
 * Uses simple production/demand ratio
 */
export function calculateIndependenceScore(yearData: YearData): IndependenceScore | null {
  const { total_generation_twh, demand_twh } = yearData;

  if (!demand_twh || demand_twh <= 0) return null;

  const ratio = total_generation_twh / demand_twh;
  const score = Math.min(ratio * 100, 150); // Cap at 150% for display

  const { band, label, color } = getScoreBand(score);

  // Simple breakdown for v1
  const gen = yearData.generation;
  const total = yearData.total_generation_twh;
  const renewableTwh = (gen.hydro?.twh || 0) + (gen.wind?.twh || 0) +
                       (gen.solar?.twh || 0) + (gen.bioenergy?.twh || 0);
  const nuclearTwh = gen.nuclear?.twh || 0;
  const coalTwh = gen.coal?.twh || 0;
  const gasTwh = gen.gas?.twh || 0;
  const oilTwh = gen.other_fossil?.twh || 0;

  return {
    score: Math.round(score * 10) / 10,
    band,
    label,
    color,
    breakdown: {
      renewable: { twh: renewableTwh, pct: total > 0 ? (renewableTwh / total) * 100 : 0, contribution: 0 },
      nuclear: { twh: nuclearTwh, pct: total > 0 ? (nuclearTwh / total) * 100 : 0, independence: 1, contribution: 0 },
      coal: { twh: coalTwh, pct: total > 0 ? (coalTwh / total) * 100 : 0, independence: 1, contribution: 0 },
      gas: { twh: gasTwh, pct: total > 0 ? (gasTwh / total) * 100 : 0, independence: 1, contribution: 0 },
      oil: { twh: oilTwh, pct: total > 0 ? (oilTwh / total) * 100 : 0, independence: 1, contribution: 0 },
    },
    strengths: [],
    vulnerabilities: [],
  };
}

function getScoreBand(score: number): { band: IndependenceScore['band']; label: string; color: string } {
  if (score >= 95) {
    return { band: 'fortress', label: 'Energy Fortress', color: '#059669' }; // emerald-600
  } else if (score >= 80) {
    return { band: 'strong', label: 'Strong Position', color: '#22C55E' }; // green-500
  } else if (score >= 60) {
    return { band: 'moderate', label: 'Moderate', color: '#EAB308' }; // yellow-500
  } else if (score >= 40) {
    return { band: 'dependent', label: 'Dependent', color: '#F97316' }; // orange-500
  } else {
    return { band: 'critical', label: 'Critical Dependency', color: '#EF4444' }; // red-500
  }
}

export function formatIndependenceScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getIndependenceDescription(score: IndependenceScore): string {
  switch (score.band) {
    case 'fortress':
      return 'Highly energy independent with strong domestic production';
    case 'strong':
      return 'Mostly independent with limited import exposure';
    case 'moderate':
      return 'Balanced position with some import vulnerability';
    case 'dependent':
      return 'Heavily reliant on energy imports';
    case 'critical':
      return 'Extreme vulnerability to supply disruptions';
    default:
      return '';
  }
}
