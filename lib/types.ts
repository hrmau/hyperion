export interface Generation {
  twh: number;
  pct: number;
}

export interface YearData {
  demand_twh: number;
  total_generation_twh: number;
  generation: {
    coal: Generation;
    gas: Generation;
    nuclear: Generation;
    hydro: Generation;
    wind: Generation;
    solar: Generation;
    bioenergy: Generation;
    other_fossil: Generation;
  };
  aggregates: {
    clean_pct: number;
    fossil_pct: number;
    renewables_pct: number;
    wind_solar_pct: number;
  };
  emissions: {
    total_mtco2: number;
  };
}

export interface Country {
  name: string;
  iso3: string;
  continent: string;
  emberRegion: string;
  blocs: string[];
  years: Record<string, YearData>;
}

export type CountriesData = Record<string, Country>;

export interface BlocDefinition {
  name: string;
  description: string;
  source: string;
  members?: string[];
  note?: string;
}

export interface BlocsData {
  ember: {
    description: string;
    blocs: Record<string, BlocDefinition>;
  };
  custom: {
    description: string;
    blocs: Record<string, BlocDefinition>;
  };
}

export type EnergySource =
  | 'coal'
  | 'gas'
  | 'nuclear'
  | 'hydro'
  | 'wind'
  | 'solar'
  | 'bioenergy'
  | 'other_fossil';

// Fossil fuel independence data types
export interface FossilFuelYearData {
  coal: { production: number; consumption: number };
  gas: { production: number; consumption: number };
  oil: { production: number; consumption: number };
}

export interface FossilFuelCountry {
  name: string;
  years: Record<string, FossilFuelYearData>;
}

export interface FossilFuelData {
  description: string;
  source: string;
  license: string;
  lastUpdated: string;
  countries: Record<string, FossilFuelCountry>;
}

// Socioeconomic data types for correlation analysis
export type IncomeLevel = 'low' | 'lower-middle' | 'upper-middle' | 'high';
export type Region = 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';

export interface SocioeconomicCountry {
  name: string;
  population_millions: number;
  gdp_per_capita_ppp: number;
  hdi: number;
  life_expectancy: number;
  manufacturing_per_capita: number;
  income_level: IncomeLevel;
  region: Region;
}

export interface SocioeconomicData {
  description: string;
  sources: {
    population: string;
    gdp_per_capita: string;
    hdi: string;
    life_expectancy: string;
    manufacturing_per_capita: string;
  };
  license: string;
  countries: Record<string, SocioeconomicCountry>;
}

// Combined data for scatter plots
export interface CorrelationDataPoint {
  iso3: string;
  name: string;
  region: Region;
  income_level: IncomeLevel;
  population_millions: number;
  electricity_per_capita_kwh: number;
  gdp_per_capita_ppp: number;
  hdi: number;
  life_expectancy: number;
  manufacturing_per_capita: number;
  clean_pct: number;
}
