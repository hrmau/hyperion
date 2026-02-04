import type { CountriesData, BlocsData, Country } from './types';

let countriesCache: CountriesData | null = null;
let blocsCache: BlocsData | null = null;

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
}

export function aggregateBloc(
  members: Country[],
  year: number
): BlocAggregates | null {
  const yearStr = year.toString();
  let totalGen = 0;
  let totalDemand = 0;
  let totalEmissions = 0;
  let cleanTwh = 0;
  let fossilTwh = 0;
  let renewablesTwh = 0;
  let windSolarTwh = 0;
  let count = 0;

  for (const c of members) {
    const yd = c.years[yearStr];
    if (!yd) continue;
    count++;
    totalGen += yd.total_generation_twh;
    totalDemand += yd.demand_twh;
    totalEmissions += yd.emissions.total_mtco2;

    const gen = yd.generation;
    const fossil = (gen.coal?.twh || 0) + (gen.gas?.twh || 0) + (gen.other_fossil?.twh || 0);
    const clean = totalGen > 0 ? yd.total_generation_twh - fossil : 0;
    cleanTwh += clean;
    fossilTwh += fossil;
    renewablesTwh += (gen.hydro?.twh || 0) + (gen.wind?.twh || 0) + (gen.solar?.twh || 0) + (gen.bioenergy?.twh || 0);
    windSolarTwh += (gen.wind?.twh || 0) + (gen.solar?.twh || 0);
  }

  if (count === 0) return null;

  return {
    total_generation_twh: totalGen,
    total_demand_twh: totalDemand,
    total_emissions_mtco2: totalEmissions,
    clean_pct: totalGen > 0 ? (cleanTwh / totalGen) * 100 : 0,
    fossil_pct: totalGen > 0 ? (fossilTwh / totalGen) * 100 : 0,
    renewables_pct: totalGen > 0 ? (renewablesTwh / totalGen) * 100 : 0,
    wind_solar_pct: totalGen > 0 ? (windSolarTwh / totalGen) * 100 : 0,
    country_count: count,
  };
}
