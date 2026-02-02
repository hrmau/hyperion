import type { EnergySource } from './types';

export const energyColors: Record<EnergySource, string> = {
  coal: '#374151',
  gas: '#F59E0B',
  other_fossil: '#D97706',
  nuclear: '#8B5CF6',
  hydro: '#3B82F6',
  wind: '#14B8A6',
  solar: '#FCD34D',
  bioenergy: '#22C55E',
};

export const energyLabels: Record<EnergySource, string> = {
  coal: 'Coal',
  gas: 'Gas',
  other_fossil: 'Other Fossil',
  nuclear: 'Nuclear',
  hydro: 'Hydro',
  wind: 'Wind',
  solar: 'Solar',
  bioenergy: 'Bioenergy',
};

// Order for stacked charts (fossil at bottom, renewables at top)
export const energyOrder: EnergySource[] = [
  'coal',
  'gas',
  'other_fossil',
  'nuclear',
  'hydro',
  'bioenergy',
  'wind',
  'solar',
];

// Choropleth scale — lightest bin must be clearly distinct from no-data (#F3F4F6)
export const choroColors = [
  '#BFDBFE', // blue-200 — lightest data color, clearly blue
  '#93C5FD', // blue-300
  '#60A5FA', // blue-400
  '#3B82F6', // blue-500
  '#1D4ED8', // blue-700
  '#1E3A8A', // blue-900
];
