import type { YearData } from './types';

export interface IndependenceScore {
  score: number; // 0-100+ (can exceed 100 for net exporters)
  ratio: number; // production / demand ratio
  band: 'surplus' | 'independent' | 'moderate' | 'dependent' | 'critical';
  label: string;
  color: string;
}

/**
 * Calculate Energy Independence Score based on production vs consumption ratio.
 *
 * Score interpretation:
 * - 100+ = Net exporter (energy surplus)
 * - 80-100 = Highly independent
 * - 50-80 = Partially dependent
 * - 30-50 = Heavily dependent
 * - <30 = Critical dependency
 */
export function calculateIndependenceScore(yearData: YearData): IndependenceScore | null {
  const { total_generation_twh, demand_twh } = yearData;

  // Need both values to calculate
  if (!demand_twh || demand_twh <= 0) return null;

  const ratio = total_generation_twh / demand_twh;
  const score = ratio * 100;

  let band: IndependenceScore['band'];
  let label: string;
  let color: string;

  if (score >= 100) {
    band = 'surplus';
    label = 'Net Exporter';
    color = '#059669'; // emerald-600
  } else if (score >= 80) {
    band = 'independent';
    label = 'Highly Independent';
    color = '#22C55E'; // green-500
  } else if (score >= 50) {
    band = 'moderate';
    label = 'Partially Dependent';
    color = '#EAB308'; // yellow-500
  } else if (score >= 30) {
    band = 'dependent';
    label = 'Heavily Dependent';
    color = '#F97316'; // orange-500
  } else {
    band = 'critical';
    label = 'Critical Dependency';
    color = '#EF4444'; // red-500
  }

  return { score, ratio, band, label, color };
}

export function formatIndependenceScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getIndependenceDescription(score: IndependenceScore): string {
  if (score.band === 'surplus') {
    return `Produces ${Math.round(score.ratio * 100 - 100)}% more electricity than it consumes`;
  }
  return `Produces ${Math.round(score.score)}% of electricity consumed`;
}
