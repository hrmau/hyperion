export interface Generation {
  twh: number;
  pct: number;
}

export interface YearData {
  demand_twh: number;
  total_generation_twh: number;
  /**
   * Population for this country-year, from OWID. `null` where OWID does not
   * report it — never 0, which would divide to infinity and put the country
   * top of every per-capita ranking.
   */
  population: number | null;
  /**
   * Net electricity trade as a share of demand: positive means a net importer,
   * negative a net exporter, `null` where OWID does not report it. There is no
   * gross split upstream - a country is one or the other, never both.
   */
  net_imports_pct: number | null;
  net_imports_twh: number | null;
  generation: {
    coal: Generation;
    gas: Generation;
    nuclear: Generation;
    hydro: Generation;
    wind: Generation;
    solar: Generation;
    bioenergy: Generation;
    other_renewables: Generation;
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
  | 'other_renewables'
  | 'other_fossil';

// Fossil fuel independence data types
/**
 * Fossil production and consumption, in TWh-equivalent.
 *
 * `null` means OWID does not track the figure; `0` means it tracks it and the
 * value is zero. The distinction is load-bearing — see calculateIndependenceScoreV2,
 * where an unknown consumption cannot count as evidence of self-sufficiency.
 */
export interface FossilFuelValue {
  production: number | null;
  consumption: number | null;
}

export interface FossilFuelYearData {
  coal: FossilFuelValue;
  gas: FossilFuelValue;
  oil: FossilFuelValue;
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

// Higher/Lower game — question bank types.
// Values are frozen at build time by scripts/generate-questions.js; a question
// and its insight line are a curated unit and must never be recomputed at runtime.
export type MetricKey =
  | 'total_generation'
  | 'generation_per_capita'
  | 'solar'
  | 'wind'
  | 'emissions'
  | 'nuclear_pct'
  | 'coal_pct'
  | 'clean_pct'
  | 'independence';

export interface QuestionSide {
  iso3: string;
  name: string;
  value: number;
}

export interface Question {
  /** Stable id, e.g. "solar-DEU-FRA-2025" */
  id: string;
  metric: MetricKey;
  metricLabel: string;
  /** The question shown to the player, e.g. "Which generates more solar power?" */
  prompt: string;
  /** The common year both values are drawn from. */
  year: number;
  unit: string;
  a: QuestionSide;
  b: QuestionSide;
  /** Required. Teaches something the numbers alone don't. */
  insight: string;
  /** True when the winner is not the country intuition points at. */
  surprising: boolean;
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
  year?: number; // The year of the electricity data
}
