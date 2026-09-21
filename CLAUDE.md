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
app/                  one directory per route
  page.tsx            never rendered directly — middleware rewrites / here
  home/[iso3]/        201 prerendered homepage variants (200 countries + world)
  countries/          the hub that lists all 200; r/[region]/ are its 6 variants
  country/[iso3]/     200 prerendered country profiles
  explore/            the world map, which used to live at /
components/           shared UI; navItems.ts is the single source of primary-nav truth
lib/                  data loading, types, colour scales, scoring, game logic
                      facts.ts is server-only — it reads the filesystem
middleware.ts         picks the homepage variant from cookie, then IP country;
                      on every page, classifies the visitor for analytics consent
public/data/          shipped JSON the client fetches at runtime
data/                 raw + intermediate pipeline inputs (not served)
scripts/              build-time data pipeline
docs/                 specs and status notes
```

**Two rendering models now coexist.** The older pages are `'use client'` with a
sibling `layout.tsx` that exists only to export metadata. `/home/[iso3]` and
`/country/[iso3]` are server components that read JSON from the filesystem at
build time via `lib/facts.ts`, so the fact and the chart are both in the HTML.
That is deliberate and load-bearing: it is what makes 200 country pages worth
publishing. Do not convert them to client components — almost everything in
`components/ds/` is already a server component, and `StackedAreaChart` is
hand-rolled SVG with no library, so they do not need to be.

## Data

| File (in `public/data/`) | Contents |
|---|---|
| `countries-yearly.json` | 214 countries, yearly generation mix, demand, emissions |
| `fossil-fuel-independence.json` | 99 countries, coal/gas/oil production vs consumption |
| `socioeconomic.json` | 88 countries: population, GDP PPP, HDI, life expectancy |
| `blocs.json` | EU, NATO, BRICS+, G7, G20, OECD, ASEAN and custom blocs |
| `country-regions.json` | ISO3 -> Ember region, for the 200 with a page. 4KB, so middleware can resolve a region without the 6MB dataset |
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

`data/geothermal-grids.json` is the editorial list of the 18 grids where that
bucket **is** geothermal and the copy says so — together 97.6% of world
generation in the series. Curated, in the spirit of `blocs.json`, not inferred:
Switzerland has 1.04 TWh in the series and no geothermal industry, and France's
is a tidal barrage. Japan and Mexico are real geothermal producers and are absent
because OWID reports no non-biofuel share for either. Both `lib/fuels.ts`
(`sourceLabel`) and `scripts/generate-facts.js` read that one file.

Anything that iterates sources must handle two of them mapping to one fuel.
`energyOrder` in `lib/colors.ts` originally used `find` and silently dropped
`other_renewables`; `EnergyMixChart` now renders from `fuelShares()` rather than
raw sources for the same reason.

## Country facts

`scripts/generate-facts.js` writes `public/data/country-facts.json` — one hero
fact plus up to four supporting ones for 200 countries — and
`scripts/fact-candidates.json`, a **worst-first** review file meant to be skimmed
in one sitting. Facts are read at build time; the JSON never reaches the client.

Seven families (rank, crossover, trajectory, contradiction, concentration,
absence, peer) exist so that each country leads with a different *kind* of claim.
That is not decoration: 214 pages of "X generated Y TWh" is a doorway-page farm,
and the variety is what makes the pages worth publishing at all. If a change
makes one family win most of the hero slots, that is a regression — `peer` once
took 137 of 198 and had to be pulled out of the hero-preference set.

**Every numeral printed in a fact must appear in its `values`.** The build fails
otherwise. This is what makes the copy auditable, and it is the same guarantee
`question-insights.json` gives the game. It has already caught three real bugs,
including a headline that printed `rank - 1`.

Family scores are normalised against each family's own distribution across all
countries, against the 95th percentile rather than the max, before they compete.

Four of the eleven families are about **consumption and trade rather than the
generation mix**, and were added because 66 of 200 pages had an empty "Also true
of" section: a small grid running on one fuel has no crossover, no absence and no
trajectory. `net_imports_pct` and `emissions` were on every country-year and read
by nothing in this file.

| family | source | what it needs |
|---|---|---|
| `trade` | `net_imports_pct` | 8% of demand either way |
| `intensity` | `emissions` vs the World aggregate | fires for every country |
| `intensityTrend` | the same over 10 years | +10% dirtier, or -25% cleaner |
| `peerIncome` | `socioeconomic.json` income band | 25% off the band median |

Three things about them worth keeping:

- **`intensity` is barred from the hero slot** via `SUPPORTING_ONLY`, unless a
  country has nothing else. It fires for all 200 by design, and that same
  universality makes it a bad lead - competing freely it took 27 heroes, which is
  27 pages opening on one sentence with the numbers swapped. Switzerland led on
  "cleaner than the world average" while first in the world for hydro sat below
  it.
- **Its score base clears `MIN_SCORE` deliberately.** Mexico at 3% above the
  world figure and Bolivia at 5% scored under the floor and were dropped,
  leaving two of the emptiest pages empty - the family failing at exactly the
  countries it exists for. "About the same as the world" is the least
  interesting version of the fact, not an unpublishable one.
- **`peerIncome` names its comparison set.** The World Bank classifies roughly
  fifty lower-middle-income countries and `socioeconomic.json` holds eighteen, so
  the copy says "the 18 lower-middle-income countries here" rather than "the
  typical" one. It shares the `percap` metric with `rank` on purpose, because the
  selection step bars two facts on one metric and "third in the world per person"
  beside "more than its income peers" is one fact told twice.

Empty sections went from 66 to 11, and those eleven have no runners-up at all -
nothing is being suppressed, they simply have two publishable facts each.

Suppression rules mostly exist because a prototype produced the exact fact they
kill, and each is commented with it. The two worth knowing: a bottom-end rank is
only publishable for clean share and per-capita (being last for wind when you run
on hydro is not a finding — that was Iceland), and a crossover is suppressed once
it has been reversed (Israel's oil passed gas in 2012 and gas took it back while
oil was under the noise floor).

`scripts/generate-questions.js` carries a **port** of that scoring model. If you
change `lib/independence.ts`, mirror it there and re-run — the file says so, and
that comment has already caught one drift.

Not automated, on purpose: `socioeconomic.json` (World Bank + UNDP, annual, and
HDI has no clean API), `blocs.json` (who counts as BRICS is editorial),
`data/country-picks.json` (see `/countries` below), and `world-110m.json`
(geometry does not change).

### Required attribution

Every page carries it via `components/ds/nav/SiteFooter.tsx`: Ember and Our World
in Data, both CC BY 4.0. Do not remove it.

## Navigation

`components/navItems.ts` holds the primary tier and `components/ds/nav/TopNav.tsx`
is its only reader. Primary nav is **Explore, Play, Compare, Rankings**.
Correlations, Story, Why, Methodology, Updates, Credits, Privacy and Terms are
demoted to `SiteFooter`, which keeps its own three labelled columns — Explore,
Learn, About — rather than one flat "More" list. All those routes are live; only
their nav placement is demoted.

**There is no hamburger and no mobile menu.** Below 768px `responsive.css` turns
the primary nav into a fixed bottom bar with 44px targets, and the footer is how
the demoted routes are reached. That is the design system's answer to small
screens and it is deliberate — but it means **the primary tier is capped at
four**. At 375px four items leave about 58px for a label, which "Rankings"
already fills, and the items are `nowrap`, so a fifth overflows rather than
wraps. Anything that must be reachable from every page goes in the top bar next
to the wordmark, which is empty at that width, or into the footer.

`CountryFinder` sits in the top bar on every page rather than in either tier.
See "Finding a country" below for why, and `navItems.ts` for the four-item cap
it exists to work around.

**Explore is `/explore`, not `/`.** The map moved there when the homepage became
the personalised hook. The logo links to `/`; anything meaning "the map" links to
`/explore`. Nine links had to be sorted into those two groups when it moved, so
check which one you mean.

## The argument (`/why`)

A **server component**, and deliberately so. It used to hard-code six per-capita
figures in JSX; four had drifted, China's was out by 24%, and China had overtaken
Germany, which inverted the ladder the section was built on. Every figure on the
page is now read from `countries-yearly.json` at build time and moves on its own
at the next refresh - the page that argues for following the numbers cannot be
the one page that types them in.

It is also the only content page besides `/story` that does **not** use
`ArticleShell`. The body is full-bleed bands - hairline, mono eyebrow, one idea,
one piece of evidence, one link into the data - which is the system's own layout
language. `ArticleHeader` stays, so it still opens like the rest of the
publication.

Two things to keep if you edit it. Every band ends in a link, because the
previous version ran 11,600px and linked out exactly once. And the conclusions
ride on `GorillaNote` under a chart rather than in boxed callouts: there were 13
of those, three of them labelled "The Lesson", which is what made it read as a
lecture.

## The homepage (`/`)

`/` is never rendered by `app/page.tsx` directly. `middleware.ts` rewrites it to
a prerendered `/home/<iso3>`, choosing by:

1. the `gg_country` cookie — an explicit choice from the country switcher
2. `x-vercel-ip-country` — where the connection appears to be
3. the world view — no header, an uncovered country, or one with no hook

A rewrite rather than a redirect, so the URL stays `/` while the response is a
page built at compile time. Every variant canonicalises to `/` and none appear in
the sitemap, so `/home/*` cannot be indexed alongside the homepage it renders.
Their metadata is identical on purpose: `/` must not describe itself differently
depending on where the reader is sitting.

The choice is a **cookie, not localStorage**, because middleware has to read it
before any JavaScript runs. It holds one ISO3 code, it is a display preference
like `gg_best_streak`, and it sits outside the analytics consent gate. `/privacy`
documents it.

Next's dev overlay reports a hydration mismatch on `/`. It is an artefact of the
rewrite — server renders `/home/irl`, client router initialises at `/` — and the
production build has no console output at all. `npm run build && npm start` via
the `hyperion-prod` preview config is how to confirm that rather than chasing it.

## Country pages (`/country/[iso3]`)

200 prerendered profiles, and the site's SEO surface. The homepage varies by IP,
so a crawler only ever sees one version of it; indexable content lives here.

What makes 200 same-shaped pages legitimate rather than a doorway farm is that
each leads with a different **kind** of claim, and that the page composes itself
around that claim: the hero fact's family picks which chart sits beside it — two
bars for a peer comparison, the forty-year mix for everything else. Keep that
indirection. A fixed template with variable numbers is the failure mode.

14 countries generate too little to say anything about and deliberately have no
page. They render a `noindex` view offering the nearest grids in their region
instead of a 404. `public/data/country-pages.json` is the 1.2KB index of which
countries have one — every surface that offers a profile link checks it through
`countryPagePath()` in `lib/data.ts` rather than linking blindly.

## Finding a country (`/countries`)

Until this existed there was no page that listed the country profiles. You
reached one from the homepage's "viewing as", from a position in the rankings
(Luxembourg is 150th), from the map, or from the five regional peers on another
profile. Nothing linked the set, which is a strange thing to be true of the
pages the site exists for.

Two surfaces, doing two different jobs:

- **`CountryFinder`** in the top bar of every page - a dropdown for "I know
  which country I want". It imports `country-names.json` and
  `country-pages.json` (5KB together) rather than fetching, because a search box
  that waits for a round trip is not a search box.
- **`/countries`** - the browse page. Its A-Z index renders all 200 links into
  the HTML, which is what finally gives the profiles an internal-link hub.

**The finder is in the top bar, not the primary nav**, because the primary nav
is capped at four - see the Navigation section. At mobile width the top bar is
otherwise just the wordmark, so search gets an empty row to itself.

**`/countries` is region-personalised the same way `/` is**: middleware rewrites
it to a prerendered `/countries/r/<slug>`, which canonicalises back to
`/countries` and stays out of the sitemap. Six variants, not 200 - the only
thing that varies is which cards sit under "Worth a look", and the index below
them is identical. North America has no variant on purpose: 4 of its countries
have a page, the same reason it has no regional ranking, so those visitors get
the world set.

`data/country-picks.json` is the curated selection. It is **selection only, no
copy** - each card renders that country's own hero headline, which is already
numeral-audited and regenerates on a refresh. The obvious alternative was to
rank countries by the fact engine's own score; that does not work, because the
score is normalised within each family against its 95th percentile, so 82 of 200
sit at exactly 1.0 and the ties fall out alphabetically. The file says so at
length. `check-data.js` fails the build if a pick names a country with no page.

## Head to head (`/compare`)

`components/ds/data/CompareRow.tsx` renders one metric for two selections, and
`lib/compareDistribution.ts` supplies the world median behind it. Both replaced a
100%-stacked bar that split the track by `a / (a + b)`, which for two percentages
is arithmetic on incompatible denominators - clean share 31.7% against 37.3% drew
as 46/54 - and which flattened real gaps, because independence 68 against 3, a
23x difference, drew as 96/4.

**Two encodings, chosen by unit, never mixed in a block.** Shares and scores are
a dumbbell on a shared 0-100 axis, so both marks sit on the scale the number
actually lives on. Absolutes are paired bars normalised per row, because a
linear axis spanning the generation range puts most countries in the first pixel.

**Green is the first selection, paper the second, clay the world median.** An
earlier pass gave neither a hue - a filled mark against a ring - on the grounds
that the fuel ramp owns the whole cold-slate-to-green space and anything picked
would collide with a fuel in the mix bars below. That was true and it was still
wrong: two near-identical marks made the reader work out which country was which
on every row, which is a worse failure than a colour that rhymes with a fuel two
sections away. Green and paper are as far apart as this palette goes.

Colour is never the only signal, which is what makes the collision survivable: a
`CompareLegend` names both countries and the tick above the block, the value
cells carry the mark's colour, and the ISO code sits in text beside every number.
The chips are outlines rather than fills - a filled green chip would be the
loudest thing on a page that spends green three times.

**The chip is computed from the printed figures, not the raw ones.** Carbon
intensity prints whole grams, and unrounded it read "14.2x" beside 41 g and
589 g, which divide to 14.4. The extra precision was real and the inconsistency
was still the reader's problem. `dp` on the row spec is what keeps them agreeing.

**The whole row is the button, and opens below itself rather than floating.**
The track alone put the target most of the row's width away from where a reader
looks first, and nothing about a bare chart says it opens - so the label, chip,
marks and values are one control, carrying the `+`/`-` marker `.gg-disclosure`
already uses. `.gg-row-toggle` in globals.css supplies the hover step and the
focus ring, because inline styles cannot express `:hover`.

**One section, three blocks.** "Head to head" is the only `h2` below the country
cards, at `--fs-h4` matching "Also true of X" on a country page; the cards above
are `--fs-h3`; and shares, totals and mix are `Eyebrow` blocks inside it. The
mix was its own `h2` for a while, which gave the page a heading outline whose
second section held exactly one item, and put a break between three things that
compare the same two selections.

All of them were eyebrows before that, which was the opposite failure - a
section and a sub-block at identical weight, and no way to tell what contained
what. The mix captions carry the section's colours too, so "green is Turkey"
holds across all three blocks and not only the two that use marks.

**Opening below the row rather than floating.** Click or
focus reveals both ranks, the median and a derived note; keyboard and touch get
exactly what a pointer gets, there is no positioning to clamp, and nothing
overlays the thing it describes. The note is derived, not written per pair -
the pairs are user-chosen and unbounded - and the case worth naming is a country
that **leads the row and is still the wrong side of the world median**, which
happens more often than it sounds. Where no rule fires it shows the rank alone
rather than padding.

**The topline sentence is derived, and picks across both blocks.** Rows are
compared there by *relative* difference, not the per-block gap used for
ordering - a point gap and a ratio cannot be sorted against each other. What
makes it worth having is that the two clauses usually pull against each other:
"France carries less carbon in every kilowatt-hour and Poland is the more
self-sufficient" is the finding the seven rows underneath spend their length
making.

One suppression rule, and it is the fact engine's Iceland problem again. Wind
and solar sit inside renewables, which sit inside clean, so a country losing
clean share badly can still "win" wind and solar - and Iceland, which runs on
hydro and geothermal, read as though **Nigeria** had out-built it. A win on a
subset metric is not a counterpoint when the other side took the superset
decisively.

Both name forms are needed: `subjectName` capitalises for the opening clause and
`theName` does not, or the sentence reads "and The United States emits less".

**Rows are ordered by gap, widest first, within each block** - a point gap and a
ratio are not comparable quantities, so they are never sorted against each other.

**Bloc mode keeps the encoding and drops the median.** A bloc has no rank among
countries because it contains them, but "the EU is 45% clean" is still a real
number on a real axis. Switching blocs to a second encoding would mean two visual
languages for one section.

The independence median **excludes countries flagged `missingFossilData`** - half
of those reporting in 2024. Their scores are deliberately conservative rather
than inflated (that was the old behaviour, and it is fixed), so leaving them in
drags the median down rather than up. Either way it is not a world median.

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

**A run continues from the homepage card, it does not restart.** Each answer on
that card links to `/play?q=<id>&pick=<iso3>&from=<iso3>`: the run opens on the
question the reader was looking at, resolves the answer they already gave, and
then leads with other questions their own country appears in. It used to point
at a bare `/play`, which threw the answer away and dealt something unrelated -
asked about Austria and Switzerland, you arrived at Germany and France.

Leading is not a quota. 86 of the 200 countries appear in the bank at all, and
60 of those in only one or two questions, so "about you" is a round or two and
then the world. Forcing a higher share would mean repeating the same pair.

**The homepage card is keyed off the country code, not taken from the front of
the list.** `/home/[iso3]` is prerendered so the card cannot vary per visit, but
it must vary per country: picking `pool[0]` showed all 114 countries with no
question of their own the same card, to everyone, forever. Hashing the code
spreads them over 60 different cards instead.

To add questions: run `npm run generate-questions`, read
`scripts/question-candidates.json`, write insight lines into
`scripts/question-insights.json`, re-run. Ship no fewer than 40.

**Every new line records its `sources`.** A line asserts a cause - a policy, a
dam, a closure date - and a claim whose provenance is only in the author's head
cannot be re-checked later. Two kinds of entry: a `dataset:` note points at
figures in `countries-yearly.json`, which ship with the site and stay checkable
forever, and a URL covers the causal half the data cannot supply. About a third
of the lines need no URL at all - Luxembourg's 77% import share was already in
the file. The generator prints `Insight lines with sources: n/m` on every run.
It is a count, not a gate: an unsourced line is not wrong, only unverifiable.

Sources live on the entry rather than in a separate document, so they are
dropped and restored along with the claim they support, and none of it reaches
the browser - `generate-questions.js` builds each shipped question field by
field. The 65 lines predating the convention are deliberately left unsourced
rather than retrofitted with plausible-looking citations.

A data refresh can invalidate a line — the first live test of this dropped
`solar-NLD-PAK`, because Pakistan overtook the Netherlands on solar and the line
said the opposite. That is why the refresh opens a PR: the generator quotes any
newly-false line in the PR body so it gets rewritten rather than silently shipped.
Dropped pairs stay in `question-insights.json` and return on their own if a later
refresh brings them back into range.

## Search and machine readers

`app/sitemap.ts`, `app/robots.ts` and `app/llms.txt/route.ts` are the three
generated surfaces. All three read the shipped data rather than listing routes by
hand, so a country losing its page cannot leave a 404 in the sitemap.

`/llms.txt` follows llmstxt.org and its counts and coverage years are computed at
build time. Its "what to be careful about when quoting this site" section is the
part that matters - independence is not security, comparisons need a common year,
emissions are lifecycle CO2e, `null` is not `0`. Those are the mistakes the code
guards against internally and had no other way to warn anyone about.

`lib/structuredData.ts` builds the JSON-LD, `components/JsonLd.tsx` renders it.
Country pages carry `Dataset` plus a breadcrumb, `/countries` the breadcrumb, and
`/` a `WebSite`. Two omissions are deliberate and commented: no `SearchAction`,
because `CountryFinder` is a client-side dropdown and there is no URL a query can
be appended to; and no `FAQPage` on `/methodology`, because Google restricted that
result to government and health sites in 2023.

**Every value in the JSON-LD comes from the same variables the page renders** -
the hook, the chart's own year span, the shares already computed. Structured data
that disagrees with its own page is worse than none.

**`/home/*` and `/countries/r/*` carry a canonical and must never carry a
`noindex`.** Middleware rewrites rather than redirects, so their metadata is
served *at* `/` and `/countries`: a noindex on the variant de-indexes the page it
renders. Nothing links to them and they are not in the sitemap, which is what
keeps the canonical sufficient.

Social cards default from the root layout, which sets `siteName`, `locale`,
`type`, the card format and the image. It must not set `og:title` or `og:url`: a
route that declares no `openGraph` inherits the parent block whole, and those two
made every page share as the homepage. Left out, Next fills them per page.

That same replace-rather-than-merge behaviour is why `lib/seo.ts` exists.
`/compare` declares an `openGraph` of its own for the dynamic title, so it does
**not** inherit the image and spreads `OG_IMAGE` in explicitly. Any future route
that declares its own block has to do the same, or it ships a card with no
picture.

`/country/[iso3]` is the exception, and deliberately names no image at all:
`opengraph-image.tsx` beside it generates one card per country, and Next only
falls back to that file when the metadata does not name an image itself. An
explicit `images` there silently wins - which is how 200 generated cards were
built once and never referenced.

That route composites text over `public/og_country.png`, the artwork with its
copy removed. `public/og.png` keeps its own copy and stays the default
everywhere else; the two must not be swapped. Satori reads TTF and OTF and
**cannot read WOFF2**, which is all `next/font` produces, so both families are
committed under `assets/fonts` - outside `public`, because nothing should serve
them to a browser. Both are SIL OFL 1.1.

## Deployment storage

Vercel keeps the build output of every deployment, and this project stores
roughly **160MB per build**: 401 prerendered pages (200 `/country/*` and 201
`/home/*`), their RSC payloads, and 200 generated share cards. Both prerendered
sets landed on 2026-08-31, which is where the storage curve bends.

Measured, so a change can be argued about rather than guessed:

| | |
|---|---|
| `.rsc` payloads | 68.9 MB |
| `/country/[iso3]` | 81 MB, of which 16.8 MB is share cards |
| `/home/[iso3]` | 51 MB for 201 variants |
| HTML | 41.6 MB |
| `public/` | 8.5 MB, mostly the 6.2MB `countries-yearly.json` |

`npm run prune-deployments` deletes preview builds older than `--days` (14 by
default). Dry run unless `--yes` is passed, and it never touches the production
deployment or anything with an alias - those are skipped by inspection, not by
trusting the API to refuse. Needs a `VERCEL_TOKEN`.

**Scope is explicit and has no default.** With no arguments it prints the
account's projects and stops; `--project <name>` takes one and `--all` takes
every one of them. The Vercel storage figure is account-wide, so `--all` is
usually what is wanted. An unrecognised `--project` fails rather than returning
an empty list, which would read exactly like "nothing to prune".

**`aliasAssigned` does not mean what it sounds like.** Vercel gives every
deployment a `<project>-<hash>.vercel.app` and a `<project>-git-<branch>.vercel.app`
URL, so that field is true for effectively all of them - trusting it protected
370 of 370 deployments across 13 projects and reported nothing to delete. Only a
hostname that is not `*.vercel.app` counts as somebody pointing at a build on
purpose. `--why` prints the reason each protected deployment was kept, which is
how that was caught and how to check it again.

**The live deployment is read from the project, not inferred.** "The newest
production build" and "the one answering the domain" are the same thing until
somebody rolls back, and then they are not - the newest few would be builds
nobody is serving while the live one sits outside the window and gets deleted.
`targets.production.id` is looked up per project and always protected, labelled
`LIVE production` by `--why`. It is the only failure in this script that takes a
site down.

**The absence of a `LIVE production` line used to be ambiguous** - it read the
same whether the live build was simply newer than the cutoff, which is safe, or
whether `targets.production` was missing and nothing was protecting it, which is
not. Every project now reports its live deployment and age on its own row, and a
project whose live build cannot be resolved is **skipped rather than pruned**.
The safe reading is never assumed.

**"Keep the newest build" is not the same guarantee** and is not what protects
the live one. After a rollback the newest deployment is precisely the build
nobody is serving, and the newest may be a preview rather than a production
build at all. It is kept anyway, labelled `newest deployment`, as a second line
of defence costing one deployment per project - but the lookup is what does the
work.

The live id is also **confirmed to resolve**, with a direct fetch when it is not
among the forty deployments already pulled. A project dormant for a year has its
live build well outside that window, and "not in the list" and "does not exist"
otherwise look identical - a stale `targets.production` would have protected an
id matching nothing while the build actually serving the site sat in the
deletable pile.

Deleting is the only thing that reduces storage already used. If the per-build
figure needs to come down instead, the biggest single item is `/home/*` at a
third of every build - and `/countries` already shows the shape of that fix,
shipping 6 region variants rather than 200 country ones.

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

`MixBar` reserves a 38px lane above every interactive bar for its hover readout,
which is also where a `caption` goes if one is passed. A caller that renders its
own label above the bar instead leaves that lane empty and puts 38px between a
name and the thing it names - on /compare, against 16px to the next bar down, so
each name read as belonging to the bar above it. The caption gives way to the
readout rather than sharing the lane with it: while the pointer is on a band the
chip says which fuel and the pointer says which bar.

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

## Analytics

`lib/analytics.ts` is the only writer, and it no-ops unless analytics is
allowed for the visitor. **Whether it is allowed depends on where they are**, so
figures are not uniformly floors:

- **EU, EEA, UK, Switzerland, and anywhere unknown**: opt-in. Analytics waits for
  a yes in the banner, so these figures are a floor - whoever declines is missing.
- **Everywhere else**: on by default, no banner, switched off from "Cookie
  settings" in the footer. Close to a count.

A saved choice always wins, in either direction. **Do not compare regions by raw
volume** - part of the gap is the banner. Ireland and the UK, the launch
audience, are on the opt-in side.

`middleware.ts` runs on every page to make this work: pages are prerendered, so
the browser has no other way to learn where it is. It writes
`gg_consent_region` (`required` or `implied`, a session cookie, set only when it
changes) and `lib/cookies.ts` reads it. The country list and why it is broader
than "the EU" are in `lib/consentRegion.ts`. **A missing cookie reads as
`required`** - the failure mode is a banner, never an unasked-for tag. Keep it
that way.

| Event | Parameters | Answers |
|---|---|---|
| `country_profile_open` | `source`, `country` | which surface drives traffic to the 200 profiles |
| `share` | `content_type`, `method`, `item_id` | how much sharing happens, and of what |
| `play_round_start` | `question_id`, `metric`, `round_index` | how far into a run people get before leaving |
| `play_answer` | `question_id`, `metric`, `correct`, `streak_after` | which questions everyone gets wrong |
| `play_streak_end` | `streak_length` | |
| `play_best_streak` | `streak_length` | |

**Parameters are typed unions, not free strings.** A misspelled `source` does not
fail loudly — it quietly becomes a new row in a report nobody reconciles — so it
fails at build time instead. `ProfileSource` in `lib/analytics.ts` is the closed
list of every internal route to a profile, and adding a new one means adding it
there first.

**Referrers cannot answer the first question**, which is why the click is
tracked instead. App Router navigations are client-side, and a referrer names
the page a reader came from, not which of the several links on it they took —
`/countries` alone has two. External and search traffic is deliberately not in
this event: session source/medium and the landing-page report already cover it.

`components/CountryProfileLink.tsx` carries the click handler so the pages that
link to profiles can stay server components — the homepage, the country pages
and the `/countries` hub all are, and an `onClick` cannot live in one.

**Custom parameters are invisible in GA4 reports until they are registered as
custom dimensions** (Admin -> Custom definitions -> Create custom dimension,
scope Event). Until then they exist only in DebugView and the BigQuery export.
The ones that need registering: `source`, `country`, `content_type`, `method`,
`item_id`, `question_id`, `metric`, `correct`, `streak_after`, `streak_length`,
`round_index`.

## Security

Headers are set in `next.config.ts` for every route. Three things about them are
worth knowing before changing anything:

- **`Content-Security-Policy` allows exactly two external origins** —
  googletagmanager for the analytics tag, flagcdn for country flags. Adding a
  third means adding it here, and a resource that silently fails to load is the
  first thing to check.
- **`script-src` carries `unsafe-inline`**, which is a real weakening and is
  commented as such. Next inlines bootstrap scripts and the alternative is a
  per-request nonce, which would stop every page being prerendered. The
  site takes no user input, so there is nothing to inject; revisit if that
  changes. `unsafe-eval` is development-only, for Turbopack's HMR.
- **`Strict-Transport-Security` is deliberately absent.** Vercel already serves
  it at `max-age=63072000`; a second, weaker header here would be the one that
  wins.

**Every host but `gridgorilla.app` returns `X-Robots-Tag: noindex`.** The
project's `*.vercel.app` alias and every preview deployment serve a complete,
crawlable copy of all 419 pages, and a canonical tag is a hint rather than a
directive. It is `noindex` and not a robots.txt disallow on purpose: a disallow
stops the crawl before the directive is read, which can leave a URL indexed with
no way to remove it.

`package.json` pins `sharp` via `overrides`. It is an optional dependency of
Next, it had four high-severity libvips advisories, and overriding it was a
smaller change than moving Next for that alone.

The `gg_country` cookie is `samesite=lax`, `secure` on https, and deliberately
not `HttpOnly` — the switcher writes it from the page. It holds a country code.

`middleware.ts` builds a path from that cookie, so **the value is checked
against the 200-code allowlist before it is used**. Keep that check: it is the
only thing between a cookie and the routing table.

## Conventions

- Client pages are `'use client'` with a sibling `layout.tsx` that exports metadata.
- Country flags come from `components/FlagImg.tsx` (CDN with an ISO2 text fallback),
  never raw emoji.
- Analytics goes through `lib/analytics.ts`, which no-ops unless analytics is
  allowed for the visitor (opt-in in Europe, opt-out elsewhere). See the Analytics section for the event
  vocabulary; never call `trackEvent` with an ad-hoc name from a component.
- `npm run lint` is clean, and `npm audit` reports zero vulnerabilities. Both
  were not true before; keep them that way rather than re-establishing a
  tolerated baseline.
