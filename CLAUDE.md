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
`fossil-fuel-independence.json` at all. It is pinned rather than rolling because
widening it admits countries whose fuel *consumption* OWID does not track, and
`lib/independence.ts` reads "consumption == 0" as "doesn't use this fuel,
therefore 100% independent of it" — which would score places running on imported
diesel as energy fortresses. Leave it alone unless you are also fixing that.

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

Mid-migration. Two token sets coexist on purpose — see `docs/redesign-plan.md`
for the stage list.

**New (`app/ds/tokens.css`).** The Grid Gorilla design system, copied from
`docs/design-system/tokens/`. One cold-slate hue stepped by value plus one accent
(`--green`, three to four appearances per screen). No shadows — elevation is a
step up the ink ramp plus a hairline. Space Grotesk for reading, IBM Plex Mono
for measuring, both via `next/font`.

**Its tokens are scoped to `.gg-page`, not `:root`.** The old set declares 11 of
the same names with different values (`--space-3` is 12px there, 8px here), so at
`:root` the later block would silently win and break every DS component's spacing.
A surface opts in by being wrapped in `.gg-page`. Stage 8 deletes the old set and
this goes back to `:root`.

**Old (`app/globals.css` `:root`).** Pre-redesign tokens, still driving every
surface not yet rebuilt.

The site is **dark only**. The design system declines to specify a light theme —
its fuel ramp does not invert cleanly. `dark` is on `<html>` unconditionally;
there is no toggle, no probe and no `localStorage` key.

Components live in `components/ds/`, ported from `docs/design-system/components/`
with types from the supplied `.d.ts` files. Read the matching `.prompt.md` before
using one — the constraints are the design. `lib/fuels.ts` owns the canonical fuel
order and the mapping from our data sources; never re-sort it per country.

**Watch out:** `.card`, `.stat-card` and friends are *unlayered* CSS, so they beat
every Tailwind utility regardless of source order. Combining `.card` with
`bg-*`/`border-*` utilities silently does nothing. `.gg-play-card` exists precisely
because of this. All three go in stage 8.

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
