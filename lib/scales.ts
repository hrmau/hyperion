import * as d3 from 'd3';
import { choroColors } from './colors';
import type { CountriesData } from './types';

export function createChoroplethScale(
  countries: CountriesData,
  year: number
): d3.ScaleQuantize<string, never> {
  const values: number[] = [];

  for (const country of Object.values(countries)) {
    const yearData = country.years[year.toString()];
    if (yearData) {
      values.push(yearData.total_generation_twh);
    }
  }

  const max = d3.max(values) || 1000;

  // Use quantize scale for discrete color bins
  return d3.scaleQuantize<string>()
    .domain([0, max])
    .range(choroColors);
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
