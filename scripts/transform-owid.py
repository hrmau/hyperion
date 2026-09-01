#!/usr/bin/env python3
"""
Transform OWID energy data CSV to GridGorilla JSON format.

Input:  data/owid-energy-data.csv
Output: public/data/countries-yearly.json (compatible with existing frontend)
        public/data/owid-aggregates.json (bloc validation data)

Usage:
    python scripts/transform-owid.py
    python scripts/transform-owid.py --start-year 2000 --output public/data/countries-yearly.json
"""

import csv
import json
import argparse
from datetime import date
from pathlib import Path
from typing import Any

# Bloc membership definitions (ISO-3 codes)
# These replace the Ember bloc flags which are not in OWID
BLOC_MEMBERSHIPS = {
    'EU': [
        'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA',
        'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD',
        'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE'
    ],
    'G7': ['CAN', 'FRA', 'DEU', 'ITA', 'JPN', 'GBR', 'USA'],
    'G20': [
        'ARG', 'AUS', 'BRA', 'CAN', 'CHN', 'FRA', 'DEU', 'IND', 'IDN', 'ITA',
        'JPN', 'KOR', 'MEX', 'RUS', 'SAU', 'ZAF', 'TUR', 'GBR', 'USA'
    ],
    'OECD': [
        'AUS', 'AUT', 'BEL', 'CAN', 'CHL', 'COL', 'CRI', 'CZE', 'DNK', 'EST',
        'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ISR', 'ITA', 'JPN',
        'KOR', 'LVA', 'LTU', 'LUX', 'MEX', 'NLD', 'NZL', 'NOR', 'POL', 'PRT',
        'SVK', 'SVN', 'ESP', 'SWE', 'CHE', 'TUR', 'GBR', 'USA'
    ],
    'ASEAN': ['BRN', 'KHM', 'IDN', 'LAO', 'MYS', 'MMR', 'PHL', 'SGP', 'THA', 'VNM'],
}

# Column mappings from OWID to our internal structure.
# Nine sources: coal, gas, nuclear, hydro, wind, solar, bioenergy,
# other_renewables, other_fossil
#
# OWID has: coal, gas, oil, nuclear, hydro, wind, solar, biofuel, other_renewables
# Mapping:
#   - oil → other_fossil (Ember's "other_fossil" was primarily oil)
#
# other_renewables used to be folded into bioenergy "for backwards compat". It is
# a separate source now, because the two are not the same thing and the country
# pages state sources in sentences rather than drawing them as an unlabelled
# band. Folded together, Kenya reads as 48% bioenergy when it is overwhelmingly
# geothermal; so do Iceland (29%), New Zealand (23%) and the Philippines (9%).
#
# OWID publishes no geothermal column — other_renewable_exc_biofuel is
# geothermal plus wave/tidal — so this source is NOT named "geothermal". Calling
# it that would swap one false claim for another. Charts still draw the two as
# one "Other" band (see SOURCE_TO_FUEL in lib/fuels.ts), so no published figure
# moves; only the data gains the distinction.

# Generation TWh columns
GEN_TWH_COLS = {
    'coal': 'coal_electricity',
    'gas': 'gas_electricity',
    'nuclear': 'nuclear_electricity',
    'hydro': 'hydro_electricity',
    'wind': 'wind_electricity',
    'solar': 'solar_electricity',
    'bioenergy': 'biofuel_electricity',
    'other_renewables': 'other_renewable_exc_biofuel_electricity',
    'other_fossil': 'oil_electricity',  # Oil maps to other_fossil
}

# Share % columns
GEN_PCT_COLS = {
    'coal': 'coal_share_elec',
    'gas': 'gas_share_elec',
    'nuclear': 'nuclear_share_elec',
    'hydro': 'hydro_share_elec',
    'wind': 'wind_share_elec',
    'solar': 'solar_share_elec',
    'bioenergy': 'biofuel_share_elec',
    'other_renewables': 'other_renewables_share_elec_exc_biofuel',
    'other_fossil': 'oil_share_elec',
}

# OWID aggregate entities we want to extract for validation
OWID_AGGREGATES = [
    'G7 (Ember)',
    'G20 (Ember)',
    'EU (Ember)',
    'European Union (27)',
    'OECD (Ember)',
    'ASEAN (Ember)',
    'World',
]


def parse_float(value: str, decimals: int = 2) -> float | None:
    """Parse a string to float, returning None for empty values."""
    if value == '' or value is None:
        return None
    try:
        f = float(value)
        return round(f, decimals)
    except (ValueError, TypeError):
        return None


def parse_int(value: str) -> int | None:
    """Parse a string to int, returning None for empty values."""
    if value == '' or value is None:
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None


def get_blocs_for_country(iso_code: str) -> list[str]:
    """Return list of blocs this country belongs to."""
    blocs = []
    for bloc_name, members in BLOC_MEMBERSHIPS.items():
        if iso_code in members:
            blocs.append(bloc_name)
    return blocs


def get_source_date(input_path: Path) -> str:
    """Date the upstream dataset was last published, not the date we ran.

    Written by scripts/fetch-owid.js next to the CSV. Stamping generated files
    with today's date made every scheduled refresh look like a data change, so
    the workflow would have opened a pull request every week regardless of
    whether OWID had published anything. Falls back to today only when the
    sidecar is absent (a transform run against a hand-placed CSV).
    """
    sidecar = input_path.parent / 'owid-source.json'
    try:
        with open(sidecar, 'r', encoding='utf-8') as f:
            value = json.load(f).get('lastModifiedDate')
            if value:
                return str(value)
    except (OSError, ValueError):
        pass
    return date.today().isoformat()


def extract_fossil_row(row: dict) -> dict | None:
    """Pull coal/gas/oil production and consumption for the independence score.

    All six columns are already TWh-equivalent in the OWID dataset, so they map
    straight across. Returns None when the row carries no fossil figures at all —
    lib/independence.ts treats a missing country as 100% import-dependent, which
    is deliberately different from a country genuinely producing zero.
    """
    fuels = {}
    has_signal = False
    for fuel, prod_col, cons_col in (
        ('coal', 'coal_production', 'coal_consumption'),
        ('gas', 'gas_production', 'gas_consumption'),
        ('oil', 'oil_production', 'oil_consumption'),
    ):
        prod = parse_float(row.get(prod_col), decimals=1)
        cons = parse_float(row.get(cons_col), decimals=1)
        if prod or cons:
            has_signal = True
        # None is preserved rather than collapsed to 0. A blank in OWID means
        # "not tracked"; a literal 0 means "measured, and it is zero". Across the
        # shipped countries there are 300 of the former and 30 of the latter, and
        # lib/independence.ts needs to tell them apart: an unknown consumption
        # cannot be evidence of self-sufficiency.
        fuels[fuel] = {'production': prod, 'consumption': cons}

    return fuels if has_signal else None


def transform_row(row: dict) -> dict | None:
    """Transform a single CSV row into our year data structure.

    Output structure matches the existing frontend expectations:
    - generation: { coal, gas, nuclear, hydro, wind, solar, bioenergy,
                    other_renewables, other_fossil }
    - aggregates: { clean_pct, fossil_pct, renewables_pct, wind_solar_pct }
    - emissions: { total_mtco2 }
    """
    # Skip if no electricity generation data
    total_gen = parse_float(row.get('electricity_generation'))
    if total_gen is None:
        return None

    # Build generation dict
    generation = {}
    for source_key, twh_col in GEN_TWH_COLS.items():
        twh = parse_float(row.get(twh_col)) or 0.0
        pct_col = GEN_PCT_COLS[source_key]
        pct = parse_float(row.get(pct_col)) or 0.0
        generation[source_key] = {'twh': twh, 'pct': pct}

    # Get aggregate percentages from OWID (pre-calculated)
    fossil_pct = parse_float(row.get('fossil_share_elec')) or 0.0
    renewables_pct = parse_float(row.get('renewables_share_elec')) or 0.0
    low_carbon_pct = parse_float(row.get('low_carbon_share_elec')) or 0.0
    wind_solar_pct = round((generation['wind']['pct'] or 0) + (generation['solar']['pct'] or 0), 2)

    # Demand data
    demand_twh = parse_float(row.get('electricity_demand'))

    # Emissions
    ghg = parse_float(row.get('greenhouse_gas_emissions'))

    # Build backwards-compatible year data structure
    # Net electricity trade, from OWID's own columns rather than derived from
    # demand minus generation.
    #
    # There is no gross import/export split upstream: a country is a net importer
    # or a net exporter, never reported as both. `None` where OWID does not
    # report it, so a country with no interconnectors reads as unknown rather
    # than as perfectly balanced.
    net_imports_twh = parse_float(row.get('net_elec_imports'))
    net_imports_pct = parse_float(row.get('net_elec_imports_share_demand'))

    # Population, for per-capita facts and rankings.
    #
    # None, never 0. A missing population must not read as an empty country: it
    # would divide to infinity and rank that country first on every per-capita
    # measure. Same discipline as the null-vs-zero rule in the fossil fuel file.
    population = parse_float(row.get('population'))

    year_data = {
        'demand_twh': demand_twh if demand_twh is not None else total_gen,
        'total_generation_twh': total_gen,
        'population': population,
        'net_imports_twh': net_imports_twh,
        'net_imports_pct': net_imports_pct,
        'generation': generation,
        'aggregates': {
            'clean_pct': low_carbon_pct,
            'fossil_pct': fossil_pct,
            'renewables_pct': renewables_pct,
            'wind_solar_pct': wind_solar_pct,
        },
        'emissions': {
            'total_mtco2': ghg if ghg is not None else 0.0,
        },
    }

    return year_data


# ISO3 -> continent, covering every country in the dataset.
#
# This was keyed by country name and covered ~138 of 214, so 76 countries fell
# through to 'Unknown'/'Other' — Belarus, Bhutan, Uganda, Fiji, Mali and 71
# others. They are the long tail, and they are exactly the countries that need a
# regional comparison most: "3rd in East Africa" is a fact, "147th of 214" is
# not. Keyed by ISO3 now, because names drift and codes do not.
_CONTINENT_GROUPS = {
    'Africa': [
        'AGO', 'BDI', 'BEN', 'BFA', 'BWA', 'CAF', 'CIV', 'CMR', 'COD', 'COG',
        'COM', 'CPV', 'DJI', 'DZA', 'EGY', 'ERI', 'ESH', 'ETH', 'GAB', 'GHA',
        'GIN', 'GMB', 'GNB', 'GNQ', 'KEN', 'LBR', 'LBY', 'LSO', 'MAR', 'MDG',
        'MLI', 'MOZ', 'MRT', 'MUS', 'MWI', 'NAM', 'NER', 'NGA', 'REU', 'RWA',
        'SDN', 'SEN', 'SHN', 'SLE', 'SOM', 'SSD', 'STP', 'SWZ', 'SYC', 'TCD',
        'TGO', 'TUN', 'TZA', 'UGA', 'ZAF', 'ZMB', 'ZWE',
    ],
    'Asia': [
        'AFG', 'ARE', 'ARM', 'AZE', 'BGD', 'BHR', 'BRN', 'BTN', 'CHN', 'GEO',
        'HKG', 'IDN', 'IND', 'IRN', 'IRQ', 'ISR', 'JOR', 'JPN', 'KAZ', 'KGZ',
        'KHM', 'KOR', 'KWT', 'LAO', 'LBN', 'LKA', 'MAC', 'MDV', 'MMR', 'MNG',
        'MYS', 'NPL', 'OMN', 'PAK', 'PHL', 'PRK', 'PSE', 'QAT', 'RUS', 'SAU',
        'SGP', 'SYR', 'THA', 'TJK', 'TKM', 'TLS', 'TUR', 'TWN', 'UZB', 'VNM',
        'YEM',
    ],
    'Europe': [
        'ALB', 'AUT', 'BEL', 'BGR', 'BIH', 'BLR', 'CHE', 'CYP', 'CZE', 'DEU',
        'DNK', 'ESP', 'EST', 'FIN', 'FRA', 'FRO', 'GBR', 'GIB', 'GRC', 'HRV',
        'HUN', 'IRL', 'ISL', 'ITA', 'LTU', 'LUX', 'LVA', 'MDA', 'MKD', 'MLT',
        'MNE', 'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'SRB', 'SVK', 'SVN', 'SWE',
        'UKR',
    ],
    'North America': [
        'ABW', 'ATG', 'BHS', 'BLZ', 'BMU', 'BRB', 'CAN', 'CRI', 'CUB', 'CYM',
        'DMA', 'DOM', 'GLP', 'GRD', 'GRL', 'GTM', 'HND', 'HTI', 'JAM', 'KNA',
        'LCA', 'MEX', 'MSR', 'MTQ', 'NIC', 'PAN', 'PRI', 'SLV', 'SPM', 'TCA',
        'TTO', 'USA', 'VCT', 'VGB', 'VIR',
    ],
    'South America': [
        'ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'FLK', 'GUF', 'GUY', 'PER',
        'PRY', 'SUR', 'URY', 'VEN',
    ],
    'Oceania': [
        'ASM', 'AUS', 'COK', 'FJI', 'GUM', 'KIR', 'NCL', 'NIU', 'NRU', 'NZL',
        'PNG', 'PYF', 'SLB', 'TON', 'VUT', 'WSM',
    ],
}

CONTINENT_BY_ISO3 = {
    iso: continent
    for continent, isos in _CONTINENT_GROUPS.items()
    for iso in isos
}

# Ember region. Only the northern set stays "North America": a region named
# "Latin America and Caribbean" that contains neither Latin America nor the
# Caribbean is not a region, and ranking Cuba against the United States is how
# you generate a fact nobody believes.
_NORTH_AMERICA = {'USA', 'CAN', 'BMU', 'GRL', 'SPM'}


def get_continent(iso3: str) -> str:
    """Continent for an ISO3 code. 'Unknown' means the table needs updating."""
    return CONTINENT_BY_ISO3.get(iso3, 'Unknown')


def get_region(iso3: str) -> str:
    """Ember analytic region for an ISO3 code."""
    continent = get_continent(iso3)
    if continent == 'South America':
        return 'Latin America and Caribbean'
    if continent == 'North America':
        return 'North America' if iso3 in _NORTH_AMERICA else 'Latin America and Caribbean'
    return continent if continent != 'Unknown' else 'Other'


def main():
    parser = argparse.ArgumentParser(description='Transform OWID energy data to GridGorilla format')
    parser.add_argument('--input', default='data/owid-energy-data.csv', help='Input CSV file')
    parser.add_argument(
        '--fossil-start-year', type=int, default=2020,
        help=(
            'First year of fossil production/consumption data to emit. This also '
            'determines which countries appear in fossil-fuel-independence.json, '
            'and therefore which ones get a real independence score rather than '
            'being treated as fully import-dependent. Changing it moves published '
            'scores, so it is pinned rather than rolling.'
        ),
    )
    parser.add_argument('--output', default='public/data/countries-yearly.json', help='Output JSON file')
    parser.add_argument('--start-year', type=int, default=2000, help='Start year (default: 2000)')
    parser.add_argument('--end-year', type=int, default=2025, help='End year (default: 2025)')
    parser.add_argument('--compact', action='store_true', help='Output compact JSON (no indentation)')
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    source_date = get_source_date(input_path)
    print(f"Source published: {source_date}")

    countries: dict[str, Any] = {}
    aggregates: dict[str, Any] = {}
    fossil: dict[str, Any] = {}
    year_range = [9999, 0]

    print(f"Reading {input_path}...")

    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            country_name = row.get('country', '')
            iso_code = row.get('iso_code', '')
            year_str = row.get('year', '')

            if not year_str:
                continue

            year = int(year_str)

            # Filter by year range
            if year < args.start_year or year > args.end_year:
                continue

            # Handle aggregate entities (no ISO code)
            if not iso_code:
                if country_name in OWID_AGGREGATES:
                    if country_name not in aggregates:
                        aggregates[country_name] = {'name': country_name, 'years': {}}
                    year_data = transform_row(row)
                    if year_data:
                        aggregates[country_name]['years'][str(year)] = year_data
                continue

            # Fossil production/consumption is captured before the electricity
            # guard below: a country can report fuel output without reporting
            # electricity generation for that year.
            fossil_data = extract_fossil_row(row) if year >= args.fossil_start_year else None
            if fossil_data is not None:
                if iso_code not in fossil:
                    fossil[iso_code] = {'name': country_name, 'years': {}}
                fossil[iso_code]['years'][str(year)] = fossil_data

            # Transform country data
            year_data = transform_row(row)
            if year_data is None:
                continue

            # Track year range
            year_range[0] = min(year_range[0], year)
            year_range[1] = max(year_range[1], year)

            # Initialize country if needed
            if iso_code not in countries:
                countries[iso_code] = {
                    'name': country_name,
                    'iso3': iso_code,
                    'continent': get_continent(iso_code),
                    'emberRegion': get_region(iso_code),
                    'blocs': get_blocs_for_country(iso_code),  # Populate from our bloc definitions
                    'years': {},
                }

            # Store year data
            countries[iso_code]['years'][str(year)] = year_data

    # Sort countries by ISO code
    countries = dict(sorted(countries.items()))

    print(f"Processed {len(countries)} countries")
    print(f"Year range: {year_range[0]} - {year_range[1]}")

    # Write main output
    print(f"Writing {output_path}...")
    indent = None if args.compact else 2
    separators = (',', ':') if args.compact else None
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(countries, f, indent=indent, separators=separators, ensure_ascii=False)

    # Write aggregates for validation
    agg_path = output_path.parent / 'owid-aggregates.json'
    print(f"Writing {agg_path}...")
    with open(agg_path, 'w', encoding='utf-8') as f:
        json.dump({
            'metadata': {
                'source': 'Our World in Data (owid-energy-data)',
                'description': 'Pre-computed bloc aggregates for validation',
                'last_updated': source_date,
            },
            'aggregates': aggregates,
        }, f, indent=indent, separators=separators, ensure_ascii=False)

    # Write fossil fuel production/consumption for the independence score
    fossil = dict(sorted(fossil.items()))
    fossil_path = output_path.parent / 'fossil-fuel-independence.json'
    print(f"Writing {fossil_path}...")
    with open(fossil_path, 'w', encoding='utf-8') as f:
        json.dump({
            'description': 'Fossil fuel production and consumption data for calculating energy independence scores. Data from Our World in Data Energy Dataset.',
            'source': 'Our World in Data (owid-energy-data)',
            'license': 'CC BY 4.0',
            'lastUpdated': source_date,
            'countries': fossil,
        }, f, indent=indent, separators=separators, ensure_ascii=False)
    print(f"Fossil fuel countries: {len(fossil)}")

    # Small metadata file so the site can state its own data currency without
    # anyone remembering to update a page. Kept tiny and separate from
    # countries-yearly.json so a server component can read it cheaply.
    latest_counts: dict[str, int] = {}
    for c in countries.values():
        if not c['years']:
            continue
        newest = max(int(y) for y in c['years'])
        latest_counts[str(newest)] = latest_counts.get(str(newest), 0) + 1

    meta_path = output_path.parent / 'data-meta.json'
    print(f"Writing {meta_path}...")
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump({
            'source': 'Our World in Data (owid-energy-data)',
            'license': 'CC BY 4.0',
            'sourceUpdatedOn': source_date,
            'countryCount': len(countries),
            'earliestYear': year_range[0],
            'latestYear': year_range[1],
            'countriesByLatestYear': dict(sorted(latest_counts.items())),
        }, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # Print summary stats
    print("\n--- Summary ---")
    print(f"Countries: {len(countries)}")
    print(f"Year range: {year_range[0]} - {year_range[1]}")

    # Count countries with 2023/2024 data
    count_2023 = sum(1 for c in countries.values() if '2023' in c['years'])
    count_2024 = sum(1 for c in countries.values() if '2024' in c['years'])
    print(f"Countries with 2023 data: {count_2023}")
    print(f"Countries with 2024 data: {count_2024}")

    # Validate source sums
    print("\n--- Validation ---")
    errors = []
    for iso, country in list(countries.items())[:5]:  # Check first 5
        if '2023' in country['years']:
            yd = country['years']['2023']
            source_sum = sum(
                yd['generation'][s]['twh']
                for s in ['coal', 'gas', 'nuclear', 'hydro', 'wind', 'solar', 'bioenergy', 'other_renewables', 'other_fossil']
            )
            total = yd['total_generation_twh']
            diff_pct = abs(source_sum - total) / total * 100 if total > 0 else 0
            status = "OK" if diff_pct < 5 else "WARN"
            print(f"  {country['name']}: sources={source_sum:.1f} TWh, total={total:.1f} TWh, diff={diff_pct:.1f}% [{status}]")

    print("\nDone!")


if __name__ == '__main__':
    main()
