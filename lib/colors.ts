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

// Choropleth scale — muted slate blues, lightest bin distinct from no-data (#F3F4F6)
export const choroColors = [
  '#D6DEE8', // pale greyish blue — lightest data color
  '#B4C4D6', // light muted blue
  '#8EA6BE', // soft slate blue
  '#6889A5', // medium slate blue
  '#486D8C', // deeper slate
  '#2E4F6E', // deep muted navy
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
