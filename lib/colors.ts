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

// Independence score scale — muted versions of the band colors from independence.ts
export const independenceColors = [
  '#EBBCBC', // muted red — critical (<30)
  '#EBC9A8', // muted orange — dependent (30-50)
  '#E8D8A0', // muted yellow — moderate (50-70)
  '#B8DCAC', // muted green — strong (70-85)
  '#8CD4A0', // muted green — very strong (85-95)
  '#5CB890', // muted emerald — fortress (95+)
];

// Clean energy scale — teal monotone (higher = cleaner = deeper teal)
export const cleanEnergyColors = [
  '#E8EEEC', // pale seafoam — very dirty
  '#B8D4CF', // light teal — dirty
  '#7FBDB4', // soft teal — mixed
  '#4BA89C', // medium teal — mostly clean
  '#2D8A7E', // teal — very clean
  '#1A6B61', // deep teal — ultra clean
];

export type MapColorMode = 'production' | 'independence' | 'clean';
