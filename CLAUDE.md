# Grid Gorilla (repo: hyperion)

> Interactive web app visualising global electricity production, energy independence,
> and the link between energy abundance and prosperity.

The app is built and deployed. This file is orientation for working on it, not a
build plan.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind 4 · D3 7 · TopoJSON.
Deployed on Vercel at `gridgorilla.app` (apex domain is canonical).

```bash
npm install
npm run dev              # http://localhost:3000
npm run build
npm run lint
npm run generate-questions   # rebuild the Higher/Lower question bank
```

## Layout

```
app/                  one directory per route; client pages pair page.tsx with
                      layout.tsx purely to export metadata
components/           shared UI; navItems.ts is the single source of nav truth
lib/                  data loading, types, colour scales, scoring, game logic
public/data/          shipped JSON the client fetches at runtime
data/                 raw + intermediate pipeline inputs (not served)
scripts/              build-time data pipeline
docs/                 specs and status notes
```

## Data

| File (in `public/data/`) | Contents |
|---|---|
| `countries-yearly.json` | 214 countries, yearly generation mix, demand, emissions |
| `fossil-fuel-independence.json` | 99 countries, coal/gas/oil production vs consumption |
| `socioeconomic.json` | 88 countries: population, GDP PPP, HDI, life expectancy |
| `blocs.json` | EU, NATO, BRICS+, G7, G20, OECD, ASEAN and custom blocs |
| `questions.json` | Curated Higher/Lower question bank |
| `world-110m.json` | TopoJSON world geometry |

Coverage is uneven: latest available year ranges from 2022 to 2025 depending on
the country. Anything that compares two countries must pin them to a **common
year** — see `scripts/generate-questions.js`. Rankings and the map use
latest-per-country, which is fine there and wrong for direct comparisons.

Pipeline: `scripts/transform-owid.py` turns `data/owid-energy-data.csv` into
`public/data/countries-yearly.json`. `scripts/validate-data.js` checks the output.

### Required attribution

Every page carries it via `components/Footer.tsx`: Ember and Our World in Data,
both CC BY 4.0. Do not remove it.

## Navigation

`components/navItems.ts` defines both tiers; `Header`, `Navigation` and `Footer`
all read from it. Primary nav is **Explore, Play, Compare, Rankings**. Correlations,
Story, Why, Methodology, Updates, Credits, Privacy and Terms live in the footer
"More" group and the mobile menu. All those routes are live — only their nav
placement is demoted.

## Higher/Lower game (`/play`)

Two countries, one metric, guess which is higher. Endless: a wrong answer resets
the streak but never ends the run. Best streak persists in `localStorage`
(`gg_best_streak`) — functional storage, deliberately outside the analytics
consent gate.

**Questions are generated at build time, never at runtime.** Random pairs from 214
countries produce rounds nobody can reason about. `scripts/generate-questions.js`
filters candidates (common year, noise floor, ratio between 1.15x and 5x, no
incomplete fossil data) and ranks them by whether the winner defies intuition.
`scripts/question-insights.json` is the hand-written editorial layer: each entry
pairs an insight line with the winner it was written about, and the generator
refuses to ship a question whose winner has since flipped.

**The insight line is a required field, not decoration.** Without it the game is
trivia rather than a teaching tool. Rule of thumb: if the sentence would still be
true and interesting to someone who never sees the numbers, it works.

To add questions: run `npm run generate-questions`, read
`scripts/question-candidates.json`, write insight lines into
`scripts/question-insights.json`, re-run. Ship no fewer than 40.

## Design system

All tokens live in `app/globals.css`; there is no `tailwind.config.js`. Dark mode
is class-based (`.dark` on `<html>`) with a pre-hydration script in the root layout
and `localStorage` persistence.

**Watch out:** `.card`, `.stat-card` and friends are *unlayered* CSS, so they beat
every Tailwind utility regardless of source order. Combining `.card` with
`bg-*`/`border-*` utilities silently does nothing. `.gg-play-card` exists precisely
because of this — it reproduces the card look without setting colours.

## Conventions

- Client pages are `'use client'` with a sibling `layout.tsx` that exports metadata.
- Country flags come from `components/FlagImg.tsx` (CDN with an ISO2 text fallback),
  never raw emoji.
- Analytics goes through `lib/analytics.ts`, which no-ops unless the visitor has
  consented to analytics cookies.
- `npm run lint` currently reports pre-existing errors in `WorldMap.tsx`,
  `CookieConsent.tsx` and a few content pages. Don't add new ones.
