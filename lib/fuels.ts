import type { EnergySource, YearData } from './types';

/**
 * Fuel vocabulary for the redesign.
 *
 * The design system names eight fuels; the data pipeline names nine sources.
 * See docs/design-system/readme.md and scripts/transform-owid.py:
 *
 *   oil   <- other_fossil   (transform maps OWID's oil_electricity into it)
 *   other <- bioenergy + other_renewables
 *
 * "other" is the one many-to-one mapping. bioenergy and other_renewables are
 * distinct in the data — burning biomass is not geothermal — but the design
 * system names eight fuels and neither is big enough anywhere to earn its own
 * band. Keeping them separate in the data and merged on the chart is what lets
 * a country page say which one it actually is.
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

/**
 * Human labels for the nine data sources, as opposed to the eight chart fuels.
 * "Other renewables" needs saying in a sentence even though it draws as "Other".
 *
 * scripts/generate-facts.js has the same map for the generated hooks; keep them
 * in step so a stat and the headline above it call a fuel the same thing.
 */
export const SOURCE_LABEL: Record<EnergySource, string> = {
  coal: 'Coal',
  gas: 'Gas',
  other_fossil: 'Oil',
  nuclear: 'Nuclear',
  hydro: 'Hydro',
  wind: 'Wind',
  solar: 'Solar',
  bioenergy: 'Bioenergy',
  other_renewables: 'Other renewables',
};

/** Data source -> design-system fuel. */
const SOURCE_TO_FUEL: Record<EnergySource, Fuel> = {
  wind: 'wind',
  solar: 'solar',
  bioenergy: 'other',
  other_renewables: 'other',
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

/**
 * Fuel shares across a run of years, shaped for StackedAreaChart.
 *
 * Returns every fuel in canonical order — including ones the country never
 * uses — so a chart and its legend stay aligned when two countries are shown
 * side by side.
 */
export function fuelSeries(
  years: number[],
  yearDataFor: (year: number) => YearData | undefined
): { years: number[]; series: Record<Fuel, number[]> } {
  const present = years.filter((y) => yearDataFor(y) != null);
  const series = Object.fromEntries(FUEL_ORDER.map((f) => [f, [] as number[]])) as Record<
    Fuel,
    number[]
  >;

  for (const year of present) {
    const yd = yearDataFor(year)!;
    for (const { fuel, pct } of fuelShares(yd)) series[fuel].push(pct);
  }

  return { years: present, series };
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

/**
 * Seven-stop sequential scale for choropleths and tile grids keyed to a
 * continuous measure (clean %, per-capita kWh, independence score).
 *
 * Same ramp as the fuels, low to high. Using one ramp for both is the point:
 * the map and the mix chart stay in the same visual language, and the page
 * never becomes a fruit salad of competing hues.
 */
export const SCALE: readonly string[] = [
  'var(--scale-1)',
  'var(--scale-2)',
  'var(--scale-3)',
  'var(--scale-4)',
  'var(--scale-5)',
  'var(--scale-6)',
  'var(--scale-7)',
] as const;

/**
 * The ramp with its top stop removed.
 *
 * --scale-7 is the brand green, and green in this system means one of exactly
 * three things: clean energy, a live signal, or the one thing on screen you
 * want clicked. A choropleth of "total output" or "independence" topped by
 * green would say "big" or "self-sufficient" in the colour reserved for
 * "clean", to roughly thirty countries at once. Measures that are not about
 * cleanliness use this ramp instead.
 */
export const SCALE_NEUTRAL: readonly string[] = SCALE.slice(0, 6);

/** Colour for a value on a sequential ramp, clamped to [min, max]. */
export function scaleColor(
  value: number,
  min = 0,
  max = 100,
  stops: readonly string[] = SCALE
): string {
  if (!Number.isFinite(value) || max === min) return stops[0];
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return stops[Math.min(stops.length - 1, Math.floor(t * stops.length))];
}

/** Ink that clears 4.5:1 on a given scale stop. */
export const SCALE_ON_FILL: readonly string[] = [
  'var(--on-scale-1)',
  'var(--on-scale-2)',
  'var(--on-scale-3)',
  'var(--on-scale-4)',
  'var(--on-scale-5)',
  'var(--on-scale-6)',
  'var(--on-scale-7)',
] as const;
