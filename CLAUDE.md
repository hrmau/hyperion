# Project Hyperion - Claude Code Handover

> An interactive web app visualizing global electricity production by country and geopolitical bloc.

## Quick Start

**Data is ready.** Start building the UI.

```bash
# 1. Clone Vercel Supabase starter
npx create-next-app -e https://github.com/vercel/nextjs-subscription-payments hyperion

# 2. Copy data files to /public/data/
cp data/countries-yearly.json public/data/
cp data/blocs.json public/data/

# 3. Get world map TopoJSON
curl -o public/data/world-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
```

---

## What to Build (MVP)

### Core Components

1. **WorldMap** - D3 choropleth, colored by total generation
2. **CountryTooltip** - Hover state showing country name + key stats
3. **CountryPanel** - Sidebar with energy mix breakdown (click to open)
4. **BlocSelector** - Pill tabs to filter: All, EU, NATO, BRICS+, G7, G20, etc.
5. **YearSlider** - Select year (1998–2025)

### User Flow

```
Homepage → World map (latest year, all countries)
         → Hover country → Tooltip with stats
         → Click country → Panel slides in with details
         → Select bloc → Map highlights/dims countries
         → Change year → Map recolors
```

---

## Data Files

| File | Size | Use |
|------|------|-----|
| `data/countries-yearly.json` | 796KB | **Primary data** - load this |
| `data/countries.json` | 14MB | Full monthly data (premium feature) |
| `data/blocs.json` | 3KB | Bloc definitions + custom memberships |

### Data Shape

```typescript
interface Country {
  name: string;           // "Germany"
  iso3: string;           // "DEU"
  continent: string;      // "Europe"
  emberRegion: string;    // "Europe"
  blocs: string[];        // ["EU", "OECD", "G20", "G7"]
  years: {
    [year: number]: {
      demand_twh: number;
      total_generation_twh: number;
      generation: {
        coal: { twh: number; pct: number };
        gas: { twh: number; pct: number };
        nuclear: { twh: number; pct: number };
        hydro: { twh: number; pct: number };
        wind: { twh: number; pct: number };
        solar: { twh: number; pct: number };
        bioenergy: { twh: number; pct: number };
        other_fossil: { twh: number; pct: number };
      };
      aggregates: {
        clean_pct: number;
        fossil_pct: number;
        renewables_pct: number;
        wind_solar_pct: number;
      };
      emissions: { total_mtco2: number };
    }
  }
}
```

---

## Design System

**Inspiration:** [sundial.ai](https://sundial.ai) — warm, tactile, skeuomorphic

### Colors

```typescript
// tailwind.config.js
const colors = {
  // Background
  canvas: '#FAFAF8',      // Warm off-white page bg
  card: '#FFFFFF',        // Card backgrounds
  inset: '#F8F7F5',       // Nested areas

  // Text
  primary: '#1A1A1A',
  secondary: '#6B7280',
  muted: '#9CA3AF',

  // Energy sources (for charts)
  coal: '#374151',
  gas: '#F59E0B',
  otherFossil: '#D97706',
  nuclear: '#8B5CF6',
  hydro: '#3B82F6',
  wind: '#14B8A6',
  solar: '#FCD34D',
  bioenergy: '#22C55E',

  // Semantic
  positive: '#22C55E',
  negative: '#EF4444',
};
```

### Card Style (Key to the Look)

```css
.card {
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.02);
}
```

### Choropleth Scale

```
Low generation → High generation
#F3F4F6 → #DBEAFE → #93C5FD → #3B82F6 → #1D4ED8 → #1E3A8A
```

---

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui** (customize to match design)
- **D3.js** for map + charts
- **TopoJSON** for world geometry

---

## Implementation Notes

1. **Start with the map** — Get D3 rendering before adding interactivity
2. **Use `countries-yearly.json`** — Don't load the 14MB file initially
3. **TopoJSON over GeoJSON** — Smaller file, same result
4. **Mobile: stack layout** — Map above, panel below
5. **Desktop: 70/30 split** — Map left, fixed panel right

### Required Attribution

Display on every page with data:
```
Data: Ember (ember-energy.org), CC BY 4.0
```

---

## Bloc Filtering Logic

```typescript
// Ember blocs (from data)
const emberBlocs = ['EU', 'OECD', 'G20', 'G7', 'ASEAN'];

// Custom blocs (from blocs.json)
const customBlocs = ['NATO', 'BRICS', 'OPEC_PLUS', 'THE_WEST', 'GLOBAL_SOUTH'];

function getCountriesInBloc(bloc: string, countries: Country[]): Country[] {
  if (emberBlocs.includes(bloc)) {
    // Use the blocs array on each country
    return countries.filter(c => c.blocs.includes(bloc));
  } else {
    // Look up members from blocs.json
    const members = blocsJson.custom.blocs[bloc].members;
    return countries.filter(c => members.includes(c.iso3));
  }
}
```

---

## File Structure

```
/hyperion
├── app/
│   └── page.tsx              # Main page with map
├── components/
│   ├── WorldMap.tsx          # D3 choropleth
│   ├── CountryTooltip.tsx
│   ├── CountryPanel.tsx      # Detail sidebar
│   ├── BlocSelector.tsx      # Filter pills
│   ├── YearSlider.tsx
│   └── EnergyMixChart.tsx    # Stacked bar
├── lib/
│   ├── data.ts               # Load JSON helpers
│   ├── colors.ts             # Energy source colors
│   └── scales.ts             # D3 color scales
├── public/data/
│   ├── countries-yearly.json
│   ├── blocs.json
│   └── world-110m.json
└── scripts/
    └── transform-ember.py    # Data pipeline (already done)
```

---

## What's Done

- [x] Data transformation script
- [x] `countries.json` (full monthly, 14MB)
- [x] `countries-yearly.json` (yearly only, 796KB)
- [x] `blocs.json` (Ember + custom blocs)
- [x] Design system defined

## What's Next

- [ ] Scaffold Next.js project
- [ ] Configure Tailwind theme
- [ ] Build WorldMap component with D3
- [ ] Add country hover/click interactions
- [ ] Build CountryPanel sidebar
- [ ] Add BlocSelector filtering
- [ ] Add YearSlider
- [ ] Responsive layout
- [ ] Deploy to Vercel

---

*88 countries • 1998–2025 • Monthly granularity available*
