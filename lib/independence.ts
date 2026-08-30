import type { YearData, FossilFuelYearData, FossilFuelValue, FossilFuelCountry } from './types';

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
  score: number; // 0-100 (final weighted score, capped at 100 for net exporters)
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
    // Electricity imports (gap between demand and generation)
    electricityImports?: { twh: number; pct: number };
  };
  // Strengths and vulnerabilities
  strengths: string[];
  vulnerabilities: string[];
  // Data year used (may differ from requested year)
  fossilDataYear?: number;
  // Flag to indicate fossil fuel data is missing (score assumes 100% imports)
  missingFossilData?: boolean;
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
 * Accounts for fuel import dependency AND electricity imports:
 * - Score is based on demand_twh, not generation_twh
 * - Imported electricity (demand - generation) contributes 0 to independence
 * - Renewables are 100% domestic (independent)
 * - Nuclear is weighted by uranium production/consumption ratio
 * - Fossil fuels are weighted by production/consumption ratio
 *
 * Score = (renewables × 100%) + (nuclear × uranium_indep%) +
 *         (coal × coal_indep%) + (gas × gas_indep%) + (oil × oil_indep%)
 * All percentages are relative to DEMAND, not generation.
 */
export function calculateIndependenceScoreV2(
  yearData: YearData,
  fossilData: FossilFuelYearData | null,
  iso3?: string
): IndependenceScore | null {
  const generation = yearData.total_generation_twh;
  const demand = yearData.demand_twh;

  // Use demand as the denominator - this is the key change
  // If demand is not available or zero, fall back to generation
  const denominator = demand > 0 ? demand : generation;
  if (denominator <= 0) return null;

  const gen = yearData.generation;

  // Calculate electricity imports (gap between demand and generation)
  // Positive value means net imports, negative means net exports
  const electricityImportsTwh = demand > 0 ? Math.max(0, demand - generation) : 0;
  const electricityImportsPct = demand > 0 ? (electricityImportsTwh / demand) * 100 : 0;

  // Calculate renewable electricity (100% independent)
  // Percentages are now relative to demand, not generation
  const renewableTwh =
    (gen.hydro?.twh || 0) +
    (gen.wind?.twh || 0) +
    (gen.solar?.twh || 0) +
    (gen.bioenergy?.twh || 0);
  const renewablePct = (renewableTwh / denominator) * 100;

  // Nuclear - weighted by uranium import independence
  const nuclearTwh = gen.nuclear?.twh || 0;
  const nuclearPct = (nuclearTwh / denominator) * 100;
  const uraniumIndep = iso3 ? getUraniumIndependence(iso3) / 100 : 1.0;

  // Fossil fuel electricity
  const coalTwh = gen.coal?.twh || 0;
  const gasTwh = gen.gas?.twh || 0;
  // other_fossil often includes oil-based generation
  const oilTwh = gen.other_fossil?.twh || 0;

  const coalPct = (coalTwh / denominator) * 100;
  const gasPct = (gasTwh / denominator) * 100;
  const oilPct = (oilTwh / denominator) * 100;

  // Calculate fossil fuel independence ratios
  // Default to 0% (import-dependent) when no data - this is more honest than
  // assuming self-sufficiency. Countries with no data are likely small importers.
  // Independence per fuel, and whether we actually know it.
  //
  // The old rule was "consumption == 0 means they don't use this fuel, so they
  // are 100% independent of it". That is true when the zero is measured and
  // false when it is missing, and OWID uses a blank for "not tracked" — which
  // this pipeline used to collapse to 0. The result was that a country whose
  // fuel consumption nobody tracks scored as self-sufficient in it. Applied
  // widely that put American Samoa, Nauru and Comoros — grids running on
  // imported diesel — at 100, and Cuba, Moldova and Jordan close behind.
  //
  // Unknown is now unknown: it contributes nothing and is disclosed, which is
  // the same treatment a country absent from the file already gets.
  const fuelIndependence = (fuel: FossilFuelValue | undefined) => {
    if (!fuel) return { ratio: 0, known: false };
    const { production, consumption } = fuel;
    if (consumption == null) return { ratio: 0, known: false };
    // A measured zero: they burn none of it, so they cannot be dependent on it.
    // The contribution is multiplied by this fuel's share of demand, which is
    // also zero, so the ratio is academic — but it should still read as known.
    if (consumption === 0) return { ratio: 1, known: true };
    return { ratio: Math.min((production ?? 0) / consumption, 1.0), known: true };
  };

  const coal = fuelIndependence(fossilData?.coal);
  const gas = fuelIndependence(fossilData?.gas);
  const oil = fuelIndependence(fossilData?.oil);

  const coalIndep = coal.ratio;
  const gasIndep = gas.ratio;
  const oilIndep = oil.ratio;

  // "Incomplete" means a fuel the country actually burns whose consumption is
  // untracked. A country that burns no coal is not missing its coal data in any
  // sense that matters.
  const unknownBurnedFuels: string[] = [];
  let unknownShare = 0;
  if (!coal.known && coalPct > 0.5) { unknownBurnedFuels.push('coal'); unknownShare += coalPct; }
  if (!gas.known && gasPct > 0.5) { unknownBurnedFuels.push('gas'); unknownShare += gasPct; }
  if (!oil.known && oilPct > 0.5) { unknownBurnedFuels.push('oil'); unknownShare += oilPct; }
  const hasFossilData = fossilData != null && unknownBurnedFuels.length === 0;

  // Unknown fuel is treated as imported, and said so. That is deliberately
  // conservative and makes the score a LOWER BOUND — "at least this
  // independent" — rather than a measurement.
  //
  // Refusing to score these countries was tried and was worse: it removed 110
  // of 214 from the ranking, including every country with no fossil file entry
  // at all, whose lower bound was honest and useful. And of the two ways to be
  // wrong, understating independence is the safer one for a metric whose whole
  // purpose is flagging import exposure. Overstating it — which is what the old
  // rule did — makes a dependent grid look secure.

  // Calculate weighted contributions
  const renewableContribution = renewablePct;
  const nuclearContribution = nuclearPct * uraniumIndep;
  const coalContribution = coalPct * coalIndep;
  const gasContribution = gasPct * gasIndep;
  const oilContribution = oilPct * oilIndep;

  // Final score - capped at 100%
  // Net exporters (generation > demand) can exceed 100% in raw calculation,
  // but we cap at 100 since "fully independent" is the maximum meaningful state
  const rawScore = renewableContribution + nuclearContribution +
                   coalContribution + gasContribution + oilContribution;
  const score = Math.min(rawScore, 100);

  // Determine band and styling
  const { band, label, color } = getScoreBand(score);

  // Generate insights
  const strengths: string[] = [];
  const vulnerabilities: string[] = [];

  // Net exporter bonus - they generate more than they consume
  if (rawScore > 100) {
    const exportRatio = Math.round((generation / demand - 1) * 100);
    strengths.push(`Net electricity exporter (+${exportRatio}% of demand)`);
  }

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

  // Name the fuels whose import position is unknown, rather than a bare
  // "no data" — which of them is missing changes how much the score is worth.
  if (unknownBurnedFuels.length > 0) {
    vulnerabilities.push(
      `Import data missing for ${unknownBurnedFuels.join(', ')} — assumed imported`
    );
  } else if (!fossilData && yearData.aggregates.fossil_pct > 10) {
    vulnerabilities.push(
      `No fossil fuel import data (${Math.round(yearData.aggregates.fossil_pct)}% fossil assumed imported)`
    );
  }

  // Flag electricity imports as a vulnerability
  // This is the gap between demand and generation - electricity imported via interconnectors
  if (electricityImportsPct >= 5) {
    vulnerabilities.push(`${Math.round(electricityImportsPct)}% of electricity is imported via interconnectors`);
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
      // Track electricity imports for display
      electricityImports: electricityImportsTwh > 0 ? { twh: electricityImportsTwh, pct: electricityImportsPct } : undefined,
    },
    strengths,
    vulnerabilities,
    missingFossilData: !hasFossilData,
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

/**
 * Band colours are steps on the design system's one ramp, not five hues.
 *
 * They were emerald, green, yellow, orange and red — a traffic light, which
 * reads as a verdict. Independence is not a virtue: Norway scores high because
 * of geography it did not earn, and Saudi Arabia scoring low is an interesting
 * fact rather than a failing. Value steps describe; traffic lights judge.
 */
function getScoreBand(score: number): { band: IndependenceScore['band']; label: string; color: string } {
  if (score >= 95) {
    return { band: 'fortress', label: 'Energy Fortress', color: 'var(--scale-6)' };
  } else if (score >= 80) {
    return { band: 'strong', label: 'Strong Position', color: 'var(--scale-5)' };
  } else if (score >= 60) {
    return { band: 'moderate', label: 'Moderate', color: 'var(--scale-4)' };
  } else if (score >= 40) {
    return { band: 'dependent', label: 'Dependent', color: 'var(--scale-3)' };
  } else {
    return { band: 'critical', label: 'Critical Dependency', color: 'var(--scale-2)' };
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
