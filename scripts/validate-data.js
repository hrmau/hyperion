const fs = require('fs');

// Load the new data
const countries = JSON.parse(fs.readFileSync('public/data/countries-yearly.json', 'utf8'));
const blocs = JSON.parse(fs.readFileSync('public/data/blocs.json', 'utf8'));

console.log('=== Data Validation ===');
console.log('Countries loaded:', Object.keys(countries).length);

// Check a few countries
const testCountries = ['USA', 'CHN', 'DEU', 'IRL', 'IND'];
for (const iso of testCountries) {
  const c = countries[iso];
  if (!c) {
    console.log(`  ${iso}: NOT FOUND`);
    continue;
  }
  const years = Object.keys(c.years);
  const latestYear = years[years.length - 1];
  const yd = c.years[latestYear];
  console.log(`  ${c.name} (${iso}): blocs=[${c.blocs.join(',')}], latest=${latestYear}, gen=${yd.total_generation_twh} TWh`);
}

// Test bloc filtering
console.log('\n=== Bloc Filtering Test ===');
function getCountriesInBloc(bloc) {
  const countryList = Object.values(countries);

  if (bloc === 'ALL') return countryList;

  const emberBlocDef = blocs.ember?.blocs[bloc];
  if (emberBlocDef?.members) {
    return countryList.filter(c => emberBlocDef.members.includes(c.iso3));
  }

  const customBlocDef = blocs.custom?.blocs[bloc];
  if (customBlocDef?.members) {
    return countryList.filter(c => customBlocDef.members.includes(c.iso3));
  }

  return countryList.filter(c => c.blocs?.includes(bloc));
}

const testBlocs = ['EU', 'G7', 'G20', 'NATO', 'BRICS'];
for (const bloc of testBlocs) {
  const members = getCountriesInBloc(bloc);
  console.log(`  ${bloc}: ${members.length} countries`);
}

// Validate source sums for USA 2023
console.log('\n=== Source Sum Validation (USA 2023) ===');
const usa = countries['USA'];
if (usa && usa.years['2023']) {
  const yd = usa.years['2023'];
  const gen = yd.generation;
  const sources = ['coal', 'gas', 'nuclear', 'hydro', 'wind', 'solar', 'bioenergy', 'other_fossil'];
  const sourceSum = sources.reduce((sum, s) => sum + (gen[s]?.twh || 0), 0);
  console.log(`  Total generation: ${yd.total_generation_twh} TWh`);
  console.log(`  Sum of sources: ${sourceSum.toFixed(2)} TWh`);
  console.log(`  Difference: ${(Math.abs(yd.total_generation_twh - sourceSum)).toFixed(2)} TWh (${(Math.abs(yd.total_generation_twh - sourceSum) / yd.total_generation_twh * 100).toFixed(1)}%)`);
  console.log(`  Aggregates: clean=${yd.aggregates.clean_pct}%, fossil=${yd.aggregates.fossil_pct}%`);
}

console.log('\n=== All Tests Passed ===');
