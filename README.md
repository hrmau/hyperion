# Grid Gorilla

An interactive web application visualizing global electricity production, energy independence, and geopolitical energy dynamics.

## About

Grid Gorilla provides honest, data-driven insights into global energy systems. We believe that **energy abundance is the foundation of economic prosperity** and that understanding energy independence is critical to evaluating national security and economic resilience.

### Features

- **Interactive World Map** - D3 choropleth visualization colored by generation, clean energy %, or independence score
- **Higher or Lower** - A guessing game at `/play`: two countries, one energy metric, build a streak. Every round ends with the story behind the number
- **Country Profiles** - Detailed energy mix breakdowns for 214 countries
- **Bloc Comparisons** - Compare EU, NATO, BRICS+, G7, G20, OECD, ASEAN, and more
- **Energy Independence Score** - Weighted metric accounting for fuel import dependencies
- **Historical Data** - Track changes from 1998-2025
- **Rankings** - Sort and filter countries by various energy metrics

### Energy Independence Score

Unlike simple production metrics, our independence score accounts for where fuel actually comes from:

- **Renewables** - 100% independent (domestic sun, wind, water)
- **Nuclear** - Weighted by domestic uranium production
- **Fossil fuels** - Weighted by production/consumption ratio

| Score | Band |
|-------|------|
| 95%+ | Energy Fortress |
| 80-94% | Strong Position |
| 60-79% | Moderate |
| 40-59% | Dependent |
| <40% | Critical Dependency |

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **D3.js** for visualizations
- **TopoJSON** for world map geometry

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Rebuild the Higher/Lower question bank
npm run generate-questions

# Pull the latest OWID data and regenerate everything derived from it
npm run refresh-data
```

Data refreshes run weekly in CI and open a pull request rather than deploying
straight to production — see `.github/workflows/refresh-data.yml`. The ~16MB OWID
source CSV is not committed; `npm run fetch-data` retrieves it.

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Data Sources

| Source | Data |
|--------|------|
| [Ember](https://ember-energy.org) | Electricity generation by source, demand, emissions |
| [Our World in Data](https://ourworldindata.org) | Fossil fuel production/consumption ratios |
| [World Nuclear Association](https://world-nuclear.org) | Uranium production by country |

## Attribution

Data provided by [Ember](https://ember-energy.org) and
[Our World in Data](https://ourworldindata.org), both under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Licence

Copyright (C) 2026 harimau and Grid Gorilla contributors.

Three parts, because the repository holds three kinds of thing:

| What | Licence |
|---|---|
| **Code** - everything not listed below | [GNU AGPL v3.0](LICENSE) |
| **Data and written analysis** - `public/data/`, `data/`, and the insight lines and fact copy in `scripts/*.json` | [CC BY 4.0](LICENSE-DATA) |
| **The Grid Gorilla name and logo** | Not licensed - see [TRADEMARKS.md](TRADEMARKS.md) |

**The AGPL covers running the code as a website**, not only distributing it: if
you deploy a modified copy where others can use it, you must offer those users
its source under the same licence.

**The data is CC BY 4.0 because its sources are.** Most of it is derived from
Ember and Our World in Data, both CC BY 4.0, so reusing it means crediting them
as well as Grid Gorilla. `socioeconomic.json` draws on the World Bank (CC BY 4.0)
and UNDP's Human Development Reports.

Third-party material keeps its own licence:

- `public/data/world-110m.json` and `world-50m.json` - [world-atlas](https://github.com/topojson/world-atlas) (ISC), from Natural Earth (public domain)
- `assets/fonts/` - SIL Open Font License 1.1, licence files alongside
- The gorilla artwork - "Gorilla tattoo" by Astima, The Noun Project, CC BY 3.0
- npm dependencies - their own licences, none of them vendored here
