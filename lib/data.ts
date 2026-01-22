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
