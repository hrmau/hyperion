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

### Refreshing the data

`.github/workflows/refresh-data.yml` runs weekly, and opens a PR when OWID has
published something new. It never pushes to main: a refresh moves figures that
are published on the site and can invalidate hand-written insight lines, so the
last step is a person clicking merge. Vercel deploys from main.

Run the same thing locally with `npm run refresh-data`, which is:

| Step | Script | Produces |
|---|---|---|
| fetch | `scripts/fetch-owid.js` | `data/owid-energy-data.csv` (untracked) |
| transform | `scripts/transform-owid.py` | `countries-yearly.json`, `owid-aggregates.json`, `fossil-fuel-independence.json` |
| generate | `scripts/generate-questions.js` | `questions.json` |
| check | `scripts/check-data.js` | pass/fail + a diff summary for the PR body |

**The source CSV is not committed.** It is ~16MB and fully regenerable; committing
it would add 16MB of churn per refresh. `npm run fetch-data` gets it.

`scripts/check-data.js` is a gate, not a report — it exits non-zero if countries
disappear, a country's latest year goes *backwards*, source figures stop summing
to reported totals, or the question bank falls below its floor. It is the only
thing between a bad upstream release and the live site.

Two things it deliberately only *warns* about, because they need judgement:
- **The fossil-fuel country set changing.** A country absent from
  `fossil-fuel-independence.json` is scored as fully import-dependent, so adding
  or removing one silently moves published independence scores.
- **Insight lines going stale.** See below.

`--fossil-start-year` (default 2020) decides which countries appear in
`fossil-fuel-independence.json` at all, and is pinned rather than rolling so a
refresh cannot quietly move published scores by admitting new countries.

**`null` and `0` mean different things in that file.** `null` is "OWID does not
track this"; `0` is "tracked, and it is zero". `lib/independence.ts` treats an
unknown consumption as imported and flags the score with an asterisk — it used
to treat it as 100% independent, which scored grids running on imported diesel
as energy fortresses. Never collapse `null` to `0` in the transform.

Region assignment is keyed by **ISO3**, not country name, in
`scripts/transform-owid.py`. The name-keyed version covered 138 of 214 and left
76 countries as `Unknown`/`Other` — the long tail, and the countries that need a
regional comparison most, since they are too small to place in a world ranking.

`emberRegion` splits the Americas the way its own labels imply: only USA,
Canada, Bermuda, Greenland and Saint Pierre stay in `North America`; Mexico,
Central America and the Caribbean are `Latin America and Caribbean`. That leaves
North America with 5 members, below the 8-country floor for a regional ranking,
which is correct — ranking Cuba against the United States produced exactly the
kind of fact nobody believes.

Every country-year carries `population` from OWID. It is `null`, never `0`, for
the same reason the fossil file is: a zero divides to infinity and puts the
country top of every per-capita ranking.

**Every per-capita figure divides by that field**, so the numerator and the
denominator share a source and a year. `socioeconomic.json` still has a
`population_millions` column and nothing reads it — it is rounded to 0.1m, which
is a ±9% error for Malta on its own, and it is a 2023 snapshot. That file is
still the source for GDP PPP, HDI and life expectancy. See docs/backlog.md.

**`bioenergy` and `other_renewables` are separate sources, and must stay that
way.** The transform used to fold OWID's `other_renewable_exc_biofuel` into
`bioenergy` "for backwards compat". Harmless while it was one unlabelled band in
a chart; wrong the moment anything states a source in a sentence, because Kenya
is 46% geothermal and 2% biomass, and the folded version called all 48%
bioenergy. Iceland, New Zealand and the Philippines are the same story.

OWID publishes no geothermal column — `other_renewable_exc_biofuel` is
geothermal plus wave/tidal — so the source is deliberately **not** named
`geothermal`. Charts still draw both as one "Other" band via `SOURCE_TO_FUEL` in
`lib/fuels.ts`, so no published figure moved when they were split.

Anything that iterates sources must handle two of them mapping to one fuel.
`energyOrder` in `lib/colors.ts` originally used `find` and silently dropped
`other_renewables`; `EnergyMixChart` now renders from `fuelShares()` rather than
raw sources for the same reason.

`scripts/generate-questions.js` carries a **port** of that scoring model. If you
change `lib/independence.ts`, mirror it there and re-run — the file says so, and
that comment has already caught one drift.

Not automated, on purpose: `socioeconomic.json` (World Bank + UNDP, annual, and
HDI has no clean API), `blocs.json` (who counts as BRICS is editorial), and
`world-110m.json` (geometry does not change).

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

A data refresh can invalidate a line — the first live test of this dropped
`solar-NLD-PAK`, because Pakistan overtook the Netherlands on solar and the line
said the opposite. That is why the refresh opens a PR: the generator quotes any
newly-false line in the PR body so it gets rewritten rather than silently shipped.
Dropped pairs stay in `question-insights.json` and return on their own if a later
refresh brings them back into range.

## Design system

`docs/design-system/` is the source of truth — guideline cards, `.prompt.md`
constraint docs and `.d.ts` contracts. Read the matching `.prompt.md` before
using a component; the constraints are the design.

**Tokens** live in `app/ds/tokens/` (copied from `docs/design-system/tokens/`)
and are imported by `app/globals.css`. One cold-slate hue stepped by value plus
one accent — `--green`, which means clean energy, a live signal, or the one
thing on screen you want clicked, and appears three or four times a screen.
No shadows: elevation is a step up the ink ramp plus a hairline. Space Grotesk
for reading, IBM Plex Mono for measuring, both via `next/font`.

**Components** are in `components/ds/`, ported to TSX from the system's `.jsx`.

`lib/fuels.ts` owns the canonical fuel order, the fill and ink tokens, the
sequential ramp and the mapping from our data sources. Never re-sort the order
per country — charts that do lose comparability across pages. `SCALE_NEUTRAL`
is the ramp minus its green top stop, for measures that are not about
cleanliness: only clean share earns the accent on a map.

The site is **dark only**. The system declines to specify a light theme because
its fuel ramp does not invert cleanly. `dark` is on `<html>` unconditionally.

**No emoji, no icon set.** These are system rules, not preferences — see the
iconography section of the design system readme.

**Flags are a deliberate deviation.** The design system says country identity is
an ISO 3166 two-letter code in mono and never a flag. That was followed through
the redesign and then overruled by the product owner: people recognise a flag
instantly and have to decode a code. `components/FlagImg.tsx` renders from
flagcdn.com and falls back to an ISO2 chip when the image fails — which it will
for a meaningful share of visitors, because Brave and uBlock Origin block
flagcdn by default. Never render one below 16px. Do not "fix" this back to
codes; see docs/backlog.md.

The legacy classes (`.card`, `.stat-card`, `.callout`, `.comparison-table`)
still exist for the content pages but now sit in `@layer components` and are
built from design-system tokens, so a Tailwind utility beats them. That was the
old defect: as unlayered CSS they outranked every utility regardless of source
order.

## Known issues

`docs/backlog.md` tracks deferred decisions and known defects, with the reasoning
for why each was left alone. Two of them are visible on the site and are marked
as blocking on the redesign. Read it before "fixing" something that looks broken
— several entries are deliberate, and one (the independence score's treatment of
missing fuel data) has a guard in CI that should not be dismissed without it.

## Conventions

- Client pages are `'use client'` with a sibling `layout.tsx` that exports metadata.
- Country flags come from `components/FlagImg.tsx` (CDN with an ISO2 text fallback),
  never raw emoji.
- Analytics goes through `lib/analytics.ts`, which no-ops unless the visitor has
  consented to analytics cookies.
- `npm run lint` currently reports pre-existing errors in `WorldMap.tsx`,
  `CookieConsent.tsx` and a few content pages. Don't add new ones.
