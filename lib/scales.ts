import * as d3 from 'd3';
import { choroColors } from './colors';
import type { CountriesData } from './types';

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
