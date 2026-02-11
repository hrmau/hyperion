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

// Independence score scale — muted gradient (higher = more independent = greener)
export const independenceColors = [
  '#E5D4D4', // muted dusty rose — critical dependency
  '#E6D5C3', // muted sand — dependent
  '#E2DEC4', // muted wheat — moderate
  '#C5D4BE', // muted sage — strong
  '#9CC495', // dusty green — very strong
  '#6A9E6A', // forest green — fortress
];

// Clean energy scale — green gradient (higher = cleaner = greener)
export const cleanEnergyColors = [
  '#FEE2E2', // red-100 — very dirty
  '#FED7AA', // orange-200 — dirty
  '#FEF08A', // yellow-200 — mixed
  '#BBF7D0', // green-200 — mostly clean
  '#86EFAC', // green-300 — very clean
  '#22C55E', // green-500 — ultra clean
];

export type MapColorMode = 'production' | 'independence' | 'clean';
