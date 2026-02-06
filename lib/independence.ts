import type { YearData, FossilFuelYearData } from './types';

export interface IndependenceScore {
  score: number; // 0-100 (final weighted score)
  band: 'fortress' | 'strong' | 'moderate' | 'dependent' | 'critical';
  label: string;
  color: string;
  // V2 detailed breakdown
  breakdown: {
    renewable: { twh: number; pct: number; contribution: number };
    nuclear: { twh: number; pct: number; contribution: number };
    coal: { twh: number; pct: number; independence: number; contribution: number };
    gas: { twh: number; pct: number; independence: number; contribution: number };
    oil: { twh: number; pct: number; independence: number; contribution: number };
  };
  // Strengths and vulnerabilities
  strengths: string[];
  vulnerabilities: string[];
}

/**
 * Calculate Energy Independence Score v2
 *
 * This version accounts for fossil fuel import dependency:
 * - Renewables and nuclear are 100% domestic (independent)
 * - Fossil fuels are weighted by production/consumption ratio
 *
 * Score = (renewables × 100%) + (nuclear × 100%) +
 *         (coal × coal_indep%) + (gas × gas_indep%) + (oil × oil_indep%)
 */
export function calculateIndependenceScoreV2(
  yearData: YearData,
  fossilData: FossilFuelYearData | null
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

  // Nuclear is 100% independent
  const nuclearTwh = gen.nuclear?.twh || 0;
  const nuclearPct = (nuclearTwh / total) * 100;

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
  const nuclearContribution = nuclearPct;
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
    strengths.push(`${Math.round(nuclearPct)}% nuclear provides stable baseload`);
  } else if (nuclearPct >= 10) {
    strengths.push(`${Math.round(nuclearPct)}% nuclear capacity`);
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
  if (gasIndep < 0.3 && gasPct >= 10) {
    vulnerabilities.push(`${Math.round((1 - gasIndep) * 100)}% of natural gas is imported`);
  }

  if (oilIndep < 0.3 && oilPct >= 5) {
    vulnerabilities.push(`${Math.round((1 - oilIndep) * 100)}% of oil is imported`);
  }

  if (coalIndep < 0.5 && coalPct >= 15) {
    vulnerabilities.push(`${Math.round((1 - coalIndep) * 100)}% of coal is imported`);
  }

  if (yearData.aggregates.fossil_pct > 60) {
    vulnerabilities.push(`${Math.round(yearData.aggregates.fossil_pct)}% fossil fuel dependency`);
  }

  if (nuclearPct === 0 && renewablePct < 40 && yearData.aggregates.fossil_pct > 50) {
    vulnerabilities.push('No nuclear baseload capacity');
  }

  return {
    score: Math.round(score * 10) / 10,
    band,
    label,
    color,
    breakdown: {
      renewable: { twh: renewableTwh, pct: renewablePct, contribution: renewableContribution },
      nuclear: { twh: nuclearTwh, pct: nuclearPct, contribution: nuclearContribution },
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
      nuclear: { twh: nuclearTwh, pct: total > 0 ? (nuclearTwh / total) * 100 : 0, contribution: 0 },
      coal: { twh: coalTwh, pct: total > 0 ? (coalTwh / total) * 100 : 0, independence: 1, contribution: 0 },
      gas: { twh: gasTwh, pct: total > 0 ? (gasTwh / total) * 100 : 0, independence: 1, contribution: 0 },
      oil: { twh: oilTwh, pct: total > 0 ? (oilTwh / total) * 100 : 0, independence: 1, contribution: 0 },
    },
    strengths: [],
    vulnerabilities: [],
  };
}

function getScoreBand(score: number): { band: IndependenceScore['band']; label: string; color: string } {
  if (score >= 90) {
    return { band: 'fortress', label: 'Energy Fortress', color: '#059669' }; // emerald-600
  } else if (score >= 70) {
    return { band: 'strong', label: 'Strong Position', color: '#22C55E' }; // green-500
  } else if (score >= 50) {
    return { band: 'moderate', label: 'Moderate', color: '#EAB308' }; // yellow-500
  } else if (score >= 30) {
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
