import type { EnergySource, YearData } from './types';

/**
 * Fuel vocabulary for the redesign.
 *
 * The design system names eight fuels; the data pipeline names eight sources.
 * They correspond one-to-one, with two renames — see docs/design-system/readme.md
 * and scripts/transform-owid.py:
 *
 *   oil   <- other_fossil   (transform maps OWID's oil_electricity into it)
 *   other <- bioenergy      (already carries other_renewables, e.g. geothermal)
 */
export type Fuel =
  | 'wind'
  | 'solar'
  | 'other'
  | 'hydro'
  | 'nuclear'
  | 'gas'
  | 'oil'
  | 'coal';

/**
 * Canonical stacking order, top of chart to bottom: renewables at the top so
 * the transition reads as a rising band, fossils at the bottom.
 *
 * NEVER re-sort this per country. Charts that do lose comparability across
 * pages, which is the whole point of using one order everywhere.
 */
export const FUEL_ORDER: readonly Fuel[] = [
  'wind',
  'solar',
  'other',
  'hydro',
  'nuclear',
  'gas',
  'oil',
  'coal',
] as const;

export const FUEL_LABEL: Record<Fuel, string> = {
  wind: 'Wind',
  solar: 'Solar',
  other: 'Other',
  hydro: 'Hydro',
  nuclear: 'Nuclear',
  gas: 'Gas',
  oil: 'Oil',
  coal: 'Coal',
};

/** Chart fill. Tuned for large areas on the dark page — never use as text. */
export const FUEL_FILL: Record<Fuel, string> = {
  wind: 'var(--fuel-wind)',
  solar: 'var(--fuel-solar)',
  other: 'var(--fuel-other)',
  hydro: 'var(--fuel-hydro)',
  nuclear: 'var(--fuel-nuclear)',
  gas: 'var(--fuel-gas)',
  oil: 'var(--fuel-oil)',
  coal: 'var(--fuel-coal)',
};

/**
 * Text tint for a sentence that names a fuel ("burns gas for 42%").
 * The fills above fail contrast as text; these are the same hue family lifted
 * to >=4.5:1 on the page ink. Never use a fill as text or an ink as a fill.
 */
export const FUEL_INK: Record<Fuel, string> = {
  wind: 'var(--fuel-wind-ink)',
  solar: 'var(--fuel-solar-ink)',
  other: 'var(--fuel-other-ink)',
  hydro: 'var(--fuel-hydro-ink)',
  nuclear: 'var(--fuel-nuclear-ink)',
  gas: 'var(--fuel-gas-ink)',
  oil: 'var(--fuel-oil-ink)',
  coal: 'var(--fuel-coal-ink)',
};

/** Ink for text sitting ON a fuel fill (tile codes, chips inside a band). */
export const FUEL_ON_FILL: Record<Fuel, string> = {
  wind: 'var(--on-fuel-wind)',
  solar: 'var(--on-fuel-solar)',
  other: 'var(--on-fuel-other)',
  hydro: 'var(--on-fuel-hydro)',
  nuclear: 'var(--on-fuel-nuclear)',
  gas: 'var(--on-fuel-gas)',
  oil: 'var(--on-fuel-oil)',
  coal: 'var(--on-fuel-coal)',
};

/**
 * Coal and oil are near-black on a near-black page, so their legend swatches
 * need a hairline outline to be visible at all. Nothing else does.
 */
export function needsOutline(fuel: Fuel): boolean {
  return fuel === 'coal' || fuel === 'oil';
}

/** Data source -> design-system fuel. */
const SOURCE_TO_FUEL: Record<EnergySource, Fuel> = {
  wind: 'wind',
  solar: 'solar',
  bioenergy: 'other',
  hydro: 'hydro',
  nuclear: 'nuclear',
  gas: 'gas',
  other_fossil: 'oil',
  coal: 'coal',
};

export interface FuelShare {
  fuel: Fuel;
  twh: number;
  pct: number;
}

/**
 * A year's generation mix as fuel shares, in canonical order.
 * Fuels the country does not use are kept at zero rather than dropped, so a
 * legend and a stack stay aligned across countries.
 */
export function fuelShares(yearData: YearData): FuelShare[] {
  const byFuel = new Map<Fuel, { twh: number; pct: number }>();
  for (const fuel of FUEL_ORDER) byFuel.set(fuel, { twh: 0, pct: 0 });

  for (const [source, fuel] of Object.entries(SOURCE_TO_FUEL) as [EnergySource, Fuel][]) {
    const gen = yearData.generation[source];
    if (!gen) continue;
    const acc = byFuel.get(fuel)!;
    acc.twh += gen.twh || 0;
    acc.pct += gen.pct || 0;
  }

  return FUEL_ORDER.map((fuel) => ({ fuel, ...byFuel.get(fuel)! }));
}

/** The fuel a country generates most of, or null when nothing is generated. */
export function dominantFuel(yearData: YearData): Fuel | null {
  let best: Fuel | null = null;
  let bestTwh = 0;
  for (const { fuel, twh } of fuelShares(yearData)) {
    if (twh > bestTwh) {
      bestTwh = twh;
      best = fuel;
    }
  }
  return best;
}
