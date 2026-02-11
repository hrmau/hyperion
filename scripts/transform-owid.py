#!/usr/bin/env python3
"""
Transform OWID energy data CSV to GridGorilla JSON format.

Input:  owid-energy-data.csv
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

# Column mappings from OWID to our internal structure
# For backwards compatibility, we map to the 8 sources the frontend expects:
# coal, gas, nuclear, hydro, wind, solar, bioenergy, other_fossil
#
# OWID has: coal, gas, oil, nuclear, hydro, wind, solar, biofuel, other_renewables
# Mapping:
#   - oil → other_fossil (Ember's "other_fossil" was primarily oil)
#   - other_renewables (geothermal, etc.) → added to bioenergy for backwards compat

# Generation TWh columns
GEN_TWH_COLS = {
    'coal': 'coal_electricity',
    'gas': 'gas_electricity',
    'nuclear': 'nuclear_electricity',
    'hydro': 'hydro_electricity',
    'wind': 'wind_electricity',
    'solar': 'solar_electricity',
    'bioenergy': 'biofuel_electricity',
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


def transform_row(row: dict) -> dict | None:
    """Transform a single CSV row into our year data structure.

    Output structure matches the existing frontend expectations:
    - generation: { coal, gas, nuclear, hydro, wind, solar, bioenergy, other_fossil }
    - aggregates: { clean_pct, fossil_pct, renewables_pct, wind_solar_pct }
    - emissions: { total_mtco2 }
    """
    # Skip if no electricity generation data
    total_gen = parse_float(row.get('electricity_generation'))
    if total_gen is None:
        return None

    # Build generation dict with 8 sources for backwards compat
    generation = {}
    for source_key, twh_col in GEN_TWH_COLS.items():
        twh = parse_float(row.get(twh_col)) or 0.0
        pct_col = GEN_PCT_COLS[source_key]
        pct = parse_float(row.get(pct_col)) or 0.0
        generation[source_key] = {'twh': twh, 'pct': pct}

    # Add other_renewables (geothermal etc) to bioenergy for backwards compat
    other_ren_twh = parse_float(row.get('other_renewable_exc_biofuel_electricity')) or 0.0
    other_ren_pct = parse_float(row.get('other_renewables_share_elec_exc_biofuel')) or 0.0
    generation['bioenergy']['twh'] = round(generation['bioenergy']['twh'] + other_ren_twh, 2)
    generation['bioenergy']['pct'] = round(generation['bioenergy']['pct'] + other_ren_pct, 2)

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
    year_data = {
        'demand_twh': demand_twh if demand_twh is not None else total_gen,
        'total_generation_twh': total_gen,
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


def get_continent(country_name: str) -> str:
    """Map country to continent (simplified mapping)."""
    # This is a simplified mapping - in production, use a proper library
    CONTINENT_MAP = {
        # Europe
        'Albania': 'Europe', 'Austria': 'Europe', 'Belgium': 'Europe', 'Bosnia and Herzegovina': 'Europe',
        'Bulgaria': 'Europe', 'Croatia': 'Europe', 'Cyprus': 'Europe', 'Czechia': 'Europe',
        'Denmark': 'Europe', 'Estonia': 'Europe', 'Finland': 'Europe', 'France': 'Europe',
        'Germany': 'Europe', 'Greece': 'Europe', 'Hungary': 'Europe', 'Iceland': 'Europe',
        'Ireland': 'Europe', 'Italy': 'Europe', 'Kosovo': 'Europe', 'Latvia': 'Europe',
        'Lithuania': 'Europe', 'Luxembourg': 'Europe', 'Malta': 'Europe', 'Moldova': 'Europe',
        'Montenegro': 'Europe', 'Netherlands': 'Europe', 'North Macedonia': 'Europe', 'Norway': 'Europe',
        'Poland': 'Europe', 'Portugal': 'Europe', 'Romania': 'Europe', 'Serbia': 'Europe',
        'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Spain': 'Europe', 'Sweden': 'Europe',
        'Switzerland': 'Europe', 'Ukraine': 'Europe', 'United Kingdom': 'Europe',
        # Asia
        'Armenia': 'Asia', 'Azerbaijan': 'Asia', 'Bahrain': 'Asia', 'Bangladesh': 'Asia',
        'Brunei': 'Asia', 'Cambodia': 'Asia', 'China': 'Asia', 'Georgia': 'Asia',
        'Hong Kong': 'Asia', 'India': 'Asia', 'Indonesia': 'Asia', 'Iran': 'Asia',
        'Iraq': 'Asia', 'Israel': 'Asia', 'Japan': 'Asia', 'Jordan': 'Asia',
        'Kazakhstan': 'Asia', 'Kuwait': 'Asia', 'Kyrgyzstan': 'Asia', 'Laos': 'Asia',
        'Lebanon': 'Asia', 'Malaysia': 'Asia', 'Mongolia': 'Asia', 'Myanmar': 'Asia',
        'Nepal': 'Asia', 'North Korea': 'Asia', 'Oman': 'Asia', 'Pakistan': 'Asia',
        'Palestine': 'Asia', 'Philippines': 'Asia', 'Qatar': 'Asia', 'Russia': 'Asia',
        'Saudi Arabia': 'Asia', 'Singapore': 'Asia', 'South Korea': 'Asia', 'Sri Lanka': 'Asia',
        'Syria': 'Asia', 'Taiwan': 'Asia', 'Tajikistan': 'Asia', 'Thailand': 'Asia',
        'Timor': 'Asia', 'Turkey': 'Asia', 'Turkmenistan': 'Asia', 'United Arab Emirates': 'Asia',
        'Uzbekistan': 'Asia', 'Vietnam': 'Asia', 'Yemen': 'Asia',
        # Africa
        'Algeria': 'Africa', 'Angola': 'Africa', 'Benin': 'Africa', 'Botswana': 'Africa',
        'Cameroon': 'Africa', 'Democratic Republic of Congo': 'Africa', 'Egypt': 'Africa',
        'Eritrea': 'Africa', 'Ethiopia': 'Africa', 'Gabon': 'Africa', 'Ghana': 'Africa',
        'Kenya': 'Africa', 'Libya': 'Africa', 'Mauritius': 'Africa', 'Morocco': 'Africa',
        'Mozambique': 'Africa', 'Namibia': 'Africa', 'Niger': 'Africa', 'Nigeria': 'Africa',
        'Republic of Congo': 'Africa', 'Senegal': 'Africa', 'South Africa': 'Africa',
        'Sudan': 'Africa', 'Tanzania': 'Africa', 'Togo': 'Africa', 'Tunisia': 'Africa',
        'Zambia': 'Africa', 'Zimbabwe': 'Africa', 'Cote d\'Ivoire': 'Africa',
        # North America
        'Canada': 'North America', 'Costa Rica': 'North America', 'Cuba': 'North America',
        'Dominican Republic': 'North America', 'El Salvador': 'North America', 'Guatemala': 'North America',
        'Haiti': 'North America', 'Honduras': 'North America', 'Jamaica': 'North America',
        'Mexico': 'North America', 'Nicaragua': 'North America', 'Panama': 'North America',
        'Trinidad and Tobago': 'North America', 'United States': 'North America',
        # South America
        'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America',
        'Chile': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
        'Paraguay': 'South America', 'Peru': 'South America', 'Uruguay': 'South America',
        'Venezuela': 'South America',
        # Oceania
        'Australia': 'Oceania', 'New Zealand': 'Oceania',
    }
    return CONTINENT_MAP.get(country_name, 'Unknown')


def get_region(country_name: str) -> str:
    """Map country to Ember region (simplified)."""
    continent = get_continent(country_name)
    REGION_MAP = {
        'Europe': 'Europe',
        'Asia': 'Asia',
        'Africa': 'Africa',
        'North America': 'North America',
        'South America': 'Latin America and Caribbean',
        'Oceania': 'Oceania',
    }
    return REGION_MAP.get(continent, 'Other')


def main():
    parser = argparse.ArgumentParser(description='Transform OWID energy data to GridGorilla format')
    parser.add_argument('--input', default='owid-energy-data.csv', help='Input CSV file')
    parser.add_argument('--output', default='public/data/countries-yearly.json', help='Output JSON file')
    parser.add_argument('--start-year', type=int, default=2000, help='Start year (default: 2000)')
    parser.add_argument('--end-year', type=int, default=2025, help='End year (default: 2025)')
    parser.add_argument('--compact', action='store_true', help='Output compact JSON (no indentation)')
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    countries: dict[str, Any] = {}
    aggregates: dict[str, Any] = {}
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
                    'continent': get_continent(country_name),
                    'emberRegion': get_region(country_name),
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
                'last_updated': date.today().isoformat(),
            },
            'aggregates': aggregates,
        }, f, indent=indent, separators=separators, ensure_ascii=False)

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
                for s in ['coal', 'gas', 'nuclear', 'hydro', 'wind', 'solar', 'bioenergy', 'other_fossil']
            )
            total = yd['total_generation_twh']
            diff_pct = abs(source_sum - total) / total * 100 if total > 0 else 0
            status = "OK" if diff_pct < 5 else "WARN"
            print(f"  {country['name']}: sources={source_sum:.1f} TWh, total={total:.1f} TWh, diff={diff_pct:.1f}% [{status}]")

    print("\nDone!")


if __name__ == '__main__':
    main()
