import type { EnergySource } from './types';
import { FUEL_FILL, FUEL_LABEL, FUEL_ORDER, type Fuel } from './fuels';

/**
 * Legacy fuel colour API, backed by lib/fuels.ts.
 *
 * The hardcoded hex palette that used to live here — amber gas, purple nuclear,
 * blue hydro — was eight competing hues. lib/fuels.ts owns the single ramp now;
 * this file exists only so the two remaining consumers (EnergyMixChart and the
 * Story timeline) keep working, and maps their EnergySource keys onto it.
 *
 * The choropleth palettes that were also here are gone: lib/scales.ts builds
 * those from the ramp directly.
 */

const SOURCE_TO_FUEL: Record<EnergySource, Fuel> = {
  coal: 'coal',
  gas: 'gas',
  other_fossil: 'oil',
  nuclear: 'nuclear',
  hydro: 'hydro',
  wind: 'wind',
  solar: 'solar',
  bioenergy: 'other',
  other_renewables: 'other',
};

export const energyColors: Record<EnergySource, string> = Object.fromEntries(
  (Object.keys(SOURCE_TO_FUEL) as EnergySource[]).map((s) => [s, FUEL_FILL[SOURCE_TO_FUEL[s]]])
) as Record<EnergySource, string>;

export const energyLabels: Record<EnergySource, string> = Object.fromEntries(
  (Object.keys(SOURCE_TO_FUEL) as EnergySource[]).map((s) => [s, FUEL_LABEL[SOURCE_TO_FUEL[s]]])
) as Record<EnergySource, string>;

/**
 * Canonical order, expressed in EnergySource keys. Never re-sort per country.
 *
 * flatMap, not map: "other" is fed by two sources (bioenergy and
 * other_renewables), and a find() here silently dropped the second — which cost
 * Kenya 46 points of its mix, all of it geothermal. Every source appears exactly
 * once, grouped by the fuel it draws as.
 */
export const energyOrder: EnergySource[] = FUEL_ORDER.flatMap((f) =>
  (Object.keys(SOURCE_TO_FUEL) as EnergySource[]).filter((s) => SOURCE_TO_FUEL[s] === f)
);

export type MapColorMode = 'production' | 'independence' | 'clean';
