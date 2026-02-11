import * as d3 from 'd3';
import { choroColors, independenceColors, cleanEnergyColors, type MapColorMode } from './colors';
import type { CountriesData, FossilFuelData } from './types';
import { calculateIndependenceScoreV2, getFossilDataForYear } from './independence';
import { getLatestYearData, getLatestYearForCountry } from './data';

export function createChoroplethScale(
  countries: CountriesData,
  year: number
): (value: number) => string {
  const values: number[] = [];

  for (const country of Object.values(countries)) {
    const yearData = country.years[year.toString()];
    if (yearData && yearData.total_generation_twh > 0) {
      values.push(yearData.total_generation_twh);
    }
  }

  if (values.length === 0) {
    return () => choroColors[0];
  }

  // Use quantile scale: distributes data evenly across color bins
  // This handles the huge skew (China 10k TWh vs median 50 TWh)
  const scale = d3.scaleQuantile<string>()
    .domain(values.sort((a, b) => a - b))
    .range(choroColors);

  return (value: number) => scale(value);
}

/**
 * Create a color scale for clean energy percentage
 * Maps 0-100% clean energy to a red-to-green gradient
 */
export function createCleanEnergyScale(): (value: number) => string {
  // Fixed thresholds for clean energy percentage
  const scale = d3.scaleThreshold<number, string>()
    .domain([20, 40, 60, 80, 90])
    .range(cleanEnergyColors);

  return (value: number) => scale(value);
}

/**
 * Create a color scale for energy independence score
 * Maps 0-100 independence score to a red-to-green gradient
 */
export function createIndependenceScale(): (value: number) => string {
  // Fixed thresholds matching the independence bands
  // critical (<30), dependent (30-50), moderate (50-70), strong (70-90), fortress (90+)
  const scale = d3.scaleThreshold<number, string>()
    .domain([30, 50, 70, 85, 95])
    .range(independenceColors);

  return (value: number) => scale(value);
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
      return createChoroplethScale(countries, year);
    case 'clean':
      return createCleanEnergyScale();
    case 'independence':
      return createIndependenceScale();
    default:
      return createChoroplethScale(countries, year);
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

/**
 * Create a choropleth scale using each country's latest available data
 */
export function createChoroplethScaleLatest(
  countries: CountriesData
): (value: number) => string {
  const values: number[] = [];

  for (const country of Object.values(countries)) {
    const latest = getLatestYearData(country);
    if (latest && latest.data.total_generation_twh > 0) {
      values.push(latest.data.total_generation_twh);
    }
  }

  if (values.length === 0) {
    return () => choroColors[0];
  }

  const scale = d3.scaleQuantile<string>()
    .domain(values.sort((a, b) => a - b))
    .range(choroColors);

  return (value: number) => scale(value);
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
      return createChoroplethScaleLatest(countries);
    case 'clean':
      return createCleanEnergyScale();
    case 'independence':
      return createIndependenceScale();
    default:
      return createChoroplethScaleLatest(countries);
  }
}
