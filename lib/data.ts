import type { CountriesData, BlocsData, Country, YearData, EnergySource, FossilFuelData, SocioeconomicData, CorrelationDataPoint } from './types';

let countriesCache: CountriesData | null = null;
let blocsCache: BlocsData | null = null;
let fossilFuelCache: FossilFuelData | null = null;
let socioeconomicCache: SocioeconomicData | null = null;

export async function loadCountries(): Promise<CountriesData> {
  if (countriesCache) return countriesCache;

  const res = await fetch('/data/countries-yearly.json');
  countriesCache = await res.json();
  return countriesCache!;
}

export async function loadBlocs(): Promise<BlocsData> {
  if (blocsCache) return blocsCache;

  const res = await fetch('/data/blocs.json');
  blocsCache = await res.json();
  return blocsCache!;
}

export async function loadFossilFuelData(): Promise<FossilFuelData> {
  if (fossilFuelCache) return fossilFuelCache;

  const res = await fetch('/data/fossil-fuel-independence.json');
  fossilFuelCache = await res.json();
  return fossilFuelCache!;
}

export async function loadSocioeconomicData(): Promise<SocioeconomicData> {
  if (socioeconomicCache) return socioeconomicCache;

  const res = await fetch('/data/socioeconomic.json');
  socioeconomicCache = await res.json();
  return socioeconomicCache!;
}

/**
 * Combine electricity and socioeconomic data for correlation analysis.
 * Returns data points with electricity per capita calculated from total TWh and population.
 */
export function getCorrelationData(
  countries: CountriesData,
  socioeconomic: SocioeconomicData,
  year: number
): CorrelationDataPoint[] {
  const yearStr = year.toString();
  const result: CorrelationDataPoint[] = [];

  for (const [iso3, country] of Object.entries(countries)) {
    const yearData = country.years[yearStr];
    const socioData = socioeconomic.countries[iso3];

    if (!yearData || !socioData) continue;

    // Calculate electricity per capita in kWh/person/year
    // total_generation_twh * 1,000,000 (to MWh) * 1,000 (to kWh) / (population_millions * 1,000,000)
    // Simplifies to: total_generation_twh * 1,000,000 / population_millions
    const electricity_per_capita_kwh =
      (yearData.total_generation_twh * 1_000_000) / socioData.population_millions;

    result.push({
      iso3,
      name: country.name,
      region: socioData.region,
      income_level: socioData.income_level,
      population_millions: socioData.population_millions,
      electricity_per_capita_kwh,
      gdp_per_capita_ppp: socioData.gdp_per_capita_ppp,
      hdi: socioData.hdi,
      life_expectancy: socioData.life_expectancy,
      manufacturing_per_capita: socioData.manufacturing_per_capita,
      clean_pct: yearData.aggregates.clean_pct,
    });
  }

  return result;
}

const emberBlocs = ['EU', 'OECD', 'G20', 'G7', 'ASEAN'];

export function getCountriesInBloc(
  bloc: string,
  countries: CountriesData,
  blocs: BlocsData
): Country[] {
  const countryList = Object.values(countries);

  if (bloc === 'ALL') {
    return countryList;
  }

  if (emberBlocs.includes(bloc)) {
    return countryList.filter(c => c.blocs.includes(bloc));
  }

  // Custom bloc - look up members
  const blocDef = blocs.custom.blocs[bloc];
  if (!blocDef?.members) return [];

  return countryList.filter(c => blocDef.members!.includes(c.iso3));
}

export function getAvailableYears(countries: CountriesData): number[] {
  const yearsSet = new Set<number>();

  for (const country of Object.values(countries)) {
    for (const year of Object.keys(country.years)) {
      yearsSet.add(parseInt(year));
    }
  }

  return Array.from(yearsSet).sort((a, b) => a - b);
}

export function getLatestYear(countries: CountriesData): number {
  const years = getAvailableYears(countries);
  return years[years.length - 1];
}

export interface BlocAggregates {
  total_generation_twh: number;
  total_demand_twh: number;
  total_emissions_mtco2: number;
  clean_pct: number;
  fossil_pct: number;
  renewables_pct: number;
  wind_solar_pct: number;
  country_count: number;
  /** Aggregated generation by source — compatible with EnergyMixChart via synthetic YearData */
  generation: Record<EnergySource, { twh: number; pct: number }>;
}

const ENERGY_SOURCES: EnergySource[] = [
  'coal', 'gas', 'other_fossil', 'nuclear', 'hydro', 'wind', 'solar', 'bioenergy',
];

export function aggregateBloc(
  members: Country[],
  year: number
): BlocAggregates | null {
  const yearStr = year.toString();
  let totalGen = 0;
  let totalDemand = 0;
  let totalEmissions = 0;
  let fossilTwh = 0;
  let renewablesTwh = 0;
  let windSolarTwh = 0;
  let count = 0;

  const genBySource: Record<string, number> = {};
  for (const s of ENERGY_SOURCES) genBySource[s] = 0;

  for (const c of members) {
    const yd = c.years[yearStr];
    if (!yd) continue;
    count++;
    totalGen += yd.total_generation_twh;
    totalDemand += yd.demand_twh;
    totalEmissions += yd.emissions.total_mtco2;

    const gen = yd.generation;
    for (const s of ENERGY_SOURCES) {
      genBySource[s] += gen[s]?.twh || 0;
    }

    fossilTwh += (gen.coal?.twh || 0) + (gen.gas?.twh || 0) + (gen.other_fossil?.twh || 0);
    renewablesTwh += (gen.hydro?.twh || 0) + (gen.wind?.twh || 0) + (gen.solar?.twh || 0) + (gen.bioenergy?.twh || 0);
    windSolarTwh += (gen.wind?.twh || 0) + (gen.solar?.twh || 0);
  }

  if (count === 0) return null;

  const cleanTwh = totalGen - fossilTwh;

  const generation = {} as Record<EnergySource, { twh: number; pct: number }>;
  for (const s of ENERGY_SOURCES) {
    generation[s] = {
      twh: genBySource[s],
      pct: totalGen > 0 ? (genBySource[s] / totalGen) * 100 : 0,
    };
  }

  return {
    total_generation_twh: totalGen,
    total_demand_twh: totalDemand,
    total_emissions_mtco2: totalEmissions,
    clean_pct: totalGen > 0 ? (cleanTwh / totalGen) * 100 : 0,
    fossil_pct: totalGen > 0 ? (fossilTwh / totalGen) * 100 : 0,
    renewables_pct: totalGen > 0 ? (renewablesTwh / totalGen) * 100 : 0,
    wind_solar_pct: totalGen > 0 ? (windSolarTwh / totalGen) * 100 : 0,
    country_count: count,
    generation,
  };
}

/** Create a synthetic YearData from BlocAggregates (for use with EnergyMixChart) */
export function blocAggToYearData(agg: BlocAggregates): YearData {
  return {
    demand_twh: agg.total_demand_twh,
    total_generation_twh: agg.total_generation_twh,
    generation: agg.generation,
    aggregates: {
      clean_pct: agg.clean_pct,
      fossil_pct: agg.fossil_pct,
      renewables_pct: agg.renewables_pct,
      wind_solar_pct: agg.wind_solar_pct,
    },
    emissions: { total_mtco2: agg.total_emissions_mtco2 },
  };
}
