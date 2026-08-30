import type { MapColorMode } from './colors';
import { SCALE, SCALE_NEUTRAL, scaleColor } from './fuels';
import type { CountriesData, FossilFuelData } from './types';
import { calculateIndependenceScoreV2, getFossilDataForYear } from './independence';
import { getLatestYearData } from './data';

/**
 * Generation output ramp.
 *
 * Logarithmic, not quantile. A quantile ramp distributes countries evenly
 * across the stops by rank, which sounds fair and reads as a lie: it paints a
 * sixth of the world in the brightest stop regardless of how much electricity
 * that sixth actually makes, and on this ramp the bright end is the loudest
 * thing on a dark page. Output spans four orders of magnitude — China makes
 * roughly a thousand times what Malta does — so log is the encoding that says
 * something true, and it leaves the top stop to the handful of grids that
 * have genuinely earned it.
 *
 * Domain is clamped to 0.1–10,000 TWh: below the floor is a rounding error,
 * above the ceiling is China alone.
 */
const OUTPUT_LOG_MIN = Math.log10(0.1);
const OUTPUT_LOG_MAX = Math.log10(10_000);

function outputColor(value: number): string {
  if (!(value > 0)) return SCALE_NEUTRAL[0];
  return scaleColor(Math.log10(value), OUTPUT_LOG_MIN, OUTPUT_LOG_MAX, SCALE_NEUTRAL);
}

export function createChoroplethScale(): (value: number) => string {
  return outputColor;
}

/**
 * Create a color scale for clean energy percentage
 * Maps 0-100% clean energy to a red-to-green gradient
 */
export function createCleanEnergyScale(): (value: number) => string {
  // The one measure that earns the full ramp. Clean share is a 0-100
  // percentage and the top stop is brand green, whose first meaning in this
  // system is literally "clean energy" — so a green country here is the accent
  // being used for exactly what it is reserved for.
  return (value: number) => scaleColor(value, 0, 100, SCALE);
}

/**
 * Create a color scale for energy independence score
 * Maps 0-100 independence score to a red-to-green gradient
 */
export function createIndependenceScale(): (value: number) => string {
  // Independence is 0-100 but it is not cleanliness — Norway and Qatar can
  // both score high for opposite reasons — so it uses the ramp without the
  // green top stop. The band labels (fortress / strong / moderate / dependent
  // / critical) still exist in lib/independence.ts and still name the number.
  return (value: number) => scaleColor(value, 0, 100, SCALE_NEUTRAL);
}

/**
 * Get the value for a country based on the selected map mode
 */
export function getCountryValueForMode(
  iso3: string,
  countries: CountriesData,
  year: number,
  mode: MapColorMode,
  fossilFuelData: FossilFuelData | null
): number | null {
  const country = countries[iso3];
  if (!country) return null;

  const yearData = country.years[year.toString()];
  if (!yearData) return null;

  switch (mode) {
    case 'production':
      return yearData.total_generation_twh;

    case 'clean':
      return yearData.aggregates?.clean_pct ?? null;

    case 'independence': {
      const countryFossil = fossilFuelData?.countries?.[iso3];
      const { data: fossilData } = getFossilDataForYear(countryFossil, year);
      const score = calculateIndependenceScoreV2(yearData, fossilData, iso3);
      return score?.score ?? null;
    }

    default:
      return null;
  }
}

/**
 * Create a color scale based on the map mode
 */
export function createScaleForMode(
  countries: CountriesData,
  year: number,
  mode: MapColorMode
): (value: number) => string {
  switch (mode) {
    case 'production':
      return createChoroplethScale();
    case 'clean':
      return createCleanEnergyScale();
    case 'independence':
      return createIndependenceScale();
    default:
      return createChoroplethScale();
  }
}

export function formatTWh(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k TWh`;
  }
  return `${value.toFixed(1)} TWh`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatEmissions(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} Gt CO₂`;
  }
  return `${value.toFixed(1)} Mt CO₂`;
}

/** Same ramp, for the latest-per-country view. */
export function createChoroplethScaleLatest(): (value: number) => string {
  return outputColor;
}

/**
 * Get the value for a country using its latest available data
 * Returns both the value and the year it's from
 */
export function getCountryValueForModeLatest(
  iso3: string,
  countries: CountriesData,
  mode: MapColorMode,
  fossilFuelData: FossilFuelData | null
): { value: number; year: number } | null {
  const country = countries[iso3];
  if (!country) return null;

  const latest = getLatestYearData(country);
  if (!latest) return null;

  const { year, data: yearData } = latest;

  switch (mode) {
    case 'production':
      return { value: yearData.total_generation_twh, year };

    case 'clean':
      return yearData.aggregates?.clean_pct != null
        ? { value: yearData.aggregates.clean_pct, year }
        : null;

    case 'independence': {
      const countryFossil = fossilFuelData?.countries?.[iso3];
      const { data: fossilData } = getFossilDataForYear(countryFossil, year);
      const score = calculateIndependenceScoreV2(yearData, fossilData, iso3);
      return score?.score != null ? { value: score.score, year } : null;
    }

    default:
      return null;
  }
}

/**
 * Create a color scale based on the map mode using latest data per country
 */
export function createScaleForModeLatest(
  countries: CountriesData,
  mode: MapColorMode
): (value: number) => string {
  switch (mode) {
    case 'production':
      return createChoroplethScaleLatest();
    case 'clean':
      return createCleanEnergyScale();
    case 'independence':
      return createIndependenceScale();
    default:
      return createChoroplethScaleLatest();
  }
}
