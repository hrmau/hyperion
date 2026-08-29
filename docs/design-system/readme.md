# Grid Gorilla — Design System

The visual and editorial system behind [gridgorilla.app](https://gridgorilla.app):
a free, no-account explorer for the electricity mix of all 214 countries and
territories, aimed at energy nerds, journalists and curious non-specialists.

This system was authored from the **"Your grid first, quiet"** direction agreed
in the redesign concepts (option `5a` in *Grid Gorilla Homepage Directions*):
data-first, dark, one accent colour, and a geolocated hook as the front door.
It deliberately replaces the previous Geist + Tailwind-default look, which is
the main reason the old site read as generic.

## Sources this was built from

| Source | What was used |
|---|---|
| `gridgorilla.app` (live site, Next.js) | Page inventory and route structure: Explore, Play, Compare, Rankings, Story, Why. Copy and figures read from the live pages. |
| `gridgorilla_logo.svg` / `gridgorilla_logo_dark.svg` | Supplied by the owner. The only brand assets — see ICONOGRAPHY. |
| *Grid Gorilla Homepage Directions* (this project) | The six explored directions; `5a` is the one this system encodes. |

No codebase or Figma file was provided. Component structure here was authored
from scratch against the agreed direction, not lifted from an existing library —
so treat the inventory as a proposal, not a recreation.

---

## ⚠ DATA CAVEAT — read this first

**Every figure in this design system is illustrative and unverified.** The
country tile colours, fuel percentages, rankings, per-capita numbers and
"% get this wrong" stats in `ui_kits/web/data.js` and the guideline cards were
written from general knowledge to make the layouts legible. They are placeholders.

Before anything ships, replace all of them with queries against the real
dataset. The specific ones most likely to be wrong: marginal dominant-fuel
calls (Germany, Turkey, Romania, Ghana, Mauritania, El Salvador), the per-fuel
country counts in the Explore key, and Ireland's exact gas/clean shares.

---

## CONTENT FUNDAMENTALS

**The voice is a well-read friend who has already done the reading.** Direct,
numerate, a little dry, never cute. The gorilla is a *motif and a voice*, not a
mascot with a personality — it never speaks in first person plural, never jokes,
never uses an exclamation mark.

- **Second person, sparingly.** "Your grid, right now." "Only Denmark gets a
  bigger share than you do." Address the *reader*, never the country — a reader
  lives in Ireland, they are not Ireland.
- **Sentence case everywhere** except mono labels, which are UPPERCASE with wide
  tracking. Never title case.
- **Claims, not labels.** Card titles are sentences with a verb: "The UK cut coal
  to zero. Ireland still has 6%." — never "Coal comparison".
- **Every number carries a comparison.** "34%" alone is noise; "34% — 2nd of 214"
  is information. Rank, world average, or a multiple. Always.
- **Tension beats superlative.** The strongest copy holds two true facts against
  each other: gas dependence *and* a world-class wind rank.
- **Name the uncertainty.** "Ranked on the most recent full year." "Location
  detected, never stored." Provenance in the footer of every page.
- **No emoji, ever.** No exclamation marks. No "dive in", "unlock", "supercharge",
  "game-changer". No rhetorical questions in headlines — except in the quiz,
  where the question *is* the product.
- **Numbers are written as numerals** in UI and data contexts. Spell them out only
  when the sentence is doing rhetorical work about scale.

Worked examples:

> ✅ "Ireland burns gas for 42% of its power — and is second in the world for wind."
> ✅ "Watch the green band. In 1990 it didn't exist."
> ✅ "58% of Irish visitors get this wrong."
> ❌ "Discover Ireland's amazing energy transition! 🌱"
> ❌ "Renewable energy overview"

---

## VISUAL FOUNDATIONS

### The one-hue rule
The entire interface is built from **one cold slate hue stepped by value**, plus
**one saturated green**. Purple, red, gold and blue were all removed from earlier
explorations on purpose: with seven fuels to colour, any additional hue turns the
page into a fruit salad and destroys the chart's legibility. If you find yourself
needing a new colour, you need a new *value* of an existing one.

Green (`--green`, #00C758) means exactly three things: **clean energy**, **a live
signal**, or **the one thing on the page you want clicked**. It appears three to
four times per screen, never more. Clay (`--clay`) is the only warm colour and
appears only on a metric moving the wrong way.

### Ground & elevation
Four ink steps: page `#0F1416` → raised `#121A1C` → card `#1B2528` → strong
`#2E3639`. **There are no drop shadows in this system.** Elevation is one step up
the ink ramp plus a 1px hairline at 11% white. Three cards in a row are told apart
by ink value, not by hue.

### Type
**Space Grotesk** for everything the reader reads; **IBM Plex Mono** for
everything the reader *measures*. Every number that is data lives in the mono
stack; big display numbers (stat values) are the exception — they are sans,
700 weight, tracked to −0.03em.

Display tracking tightens as size grows: −0.038em at 60px, −0.03em at 34px,
−0.022em at 25px. Mono labels go the other way — wide, uppercase, 0.18–0.22em.
Hero measure is 17ch, lead 46ch, prose 56ch. `text-wrap: pretty` on all prose.

### Backgrounds
Flat ink. **No gradients as decoration** — the only gradient permitted is a
directional scrim over a full-bleed chart so headline text stays legible
(`linear-gradient(100deg, page 0%, page 84% 26%, transparent 68%)`). No photography,
no illustration, no texture, no noise. The gorilla mark at 4.5–5.5% opacity,
cropped by its container and rotated 8–9°, is the only ornament in the system.

### Charts as the primary surface
Charts are not illustrations of the content — they *are* the content. The
signature form is the 100% stacked area chart of fuel mix over time, which can
run full-bleed as a page background or sit in a raised well. Rules:

- Stack in canonical fuel order always (renewables top, fossils bottom) so the
  transition reads as a rising band. Never re-sort per country.
- Separate bands with a **1.4px stroke in the well colour** — a gap, not a stroke.
  Without it, adjacent tones in the tamed ramp bleed together.
- Legend swatches carry the band's **exact fill**; labels stay neutral grey.
  Lightened coloured labels collapse into one grey and are a correctness bug.
- Coal and oil chips get a hairline outline — they are near-black on a near-black page.
- Text that names a fuel uses the `*-ink` tint, never the fill.
- Every chart is followed by exactly one `GorillaNote` saying what to look at.

### Borders, radii, corners
Hairlines do all the structural work: 22% white for emphasis, 11% default, 7% soft.
Radii: 6 chip · 8 well · 10 button · 16 card · 99 pill. Full-bleed bands are
separated by hairlines, not gaps — the layout is a grid of ruled panels.

### Motion
Restrained and functional. 90ms for hover/press, 160ms for pill state, 240ms for
panels, **520ms for a chart redraw** (the one place motion is expressive — the
shape morphing when you change country is the product's best moment). Easing is
`cubic-bezier(0.22, 0.61, 0.36, 1)`. The live status dot blinks on a 2s step. All
of it collapses to 0ms under `prefers-reduced-motion`.

### States
- **Hover:** background steps up one ink value, or a hairline brightens to 22%.
  Tiles get a white 2px inset outline. Never a colour change, never a scale.
- **Press:** no transform. Opacity to 0.9 at most.
- **Focus:** 2px green outline, 2px offset. Never removed.
- **Disabled:** opacity 0.45, pointer-events none.
- **Selected:** inverse fill (near-white on dark). Selection is *not* green —
  green is the accent, not a state.

### Transparency & blur
Alpha is used for text steps and hairlines only. **No backdrop blur anywhere.**
A translucent panel over a chart is always a solid scrim gradient, not a blur.

### Layout
Ruled panels, asymmetric hero split (1.12fr / 1fr), full-width bands stacked
vertically, each separated by a hairline and introduced by a mono eyebrow.

**Responsiveness is a system layer, not a per-screen concern.** Two mechanisms,
and no screen should need anything else:

1. **Fluid tokens.** Display type and the page gutter are `clamp()` values —
   hero 34→60px, H2 26→34px, gutter 18→34px. They scale continuously, so no
   breakpoint ever overrides a font size.
2. **Class hooks + `tokens/responsive.css`.** Layout components carry a `gg-*`
   class (`gg-hero-split`, `gg-card-row`, `gg-explore-split`, `gg-compare-split`,
   `gg-stat-row`, `gg-action-row`, `gg-scroll-row`, `gg-tiles`, `gg-nav-items`,
   `gg-col-optional`) and that one file owns what each does at 1279 / 1023 / 767.
   It is the only file in the system permitted to use `!important` — components
   are inline-styled, so stylesheet rules need it to win. Every rule is written
   twice, against the viewport *and* against the `.gg-page` container, so an
   embedded page reflows to its own width. The one exception is the bottom-bar
   conversion, which stays viewport-only: `position: fixed` resolves against
   the viewport regardless of container, so it is a device concern by nature.

Below 768px: everything is one column, the nav becomes a fixed bottom bar,
buttons stack full-width, tables drop their `mobileOptional` columns rather than
side-scrolling, and 44px is the hard floor for tiles and every touch target.

---

## ICONOGRAPHY

**There is no icon set in this system yet, and none was provided.** The interface
gets by on typography, hairlines and mono glyphs — which is deliberate, and worth
preserving as far as it goes:

- `◉` prefixes a live/geolocated eyebrow.
- `▲ ▼` mark direction on a metric. `→` for forward navigation. `·` as separator.
- `■` is *not* used for legend swatches — legends use real coloured divs, so the
  swatch can carry the band's exact fill.
- Country identity is carried by **ISO 3166 two-letter codes in mono**, never flags.
  Flags are politically loaded, illegible at 12px, and 214 of them is a payload.
- **No emoji.** Ever.

If a genuine icon set becomes necessary (search, close, external link, share),
use **Lucide** at 1.5px stroke — it matches the hairline weight of this system —
and add it as a documented dependency. That would be a *substitution*, not a
brand asset: flagged here so nobody mistakes it for one.

### Brand assets
`assets/gorilla.svg` (light grounds) and `assets/gorilla-dark.svg` (dark grounds)
are the supplied marks, used at 19–34px in product and as a 4.5–5.5% watermark.
**Do not redraw, reconstruct or recolour the mark.** No lockup file was supplied —
the wordmark is set in Space Grotesk 700 at −0.015em beside the mark.

---

## Index

| Path | What's in it |
|---|---|
| `styles.css` | The single entry point. Consumers link this. Imports only. |
| `tokens/` | `fonts` · `colors` · `typography` · `spacing` · `shape` · `motion` · `charts` · `semantic` · `responsive` · `controls` · `prose` |
| `components/core/` | Button · Pill · Eyebrow · Card · Stat · Badge · GorillaNote |
| `components/forms/` | Field · Input · Textarea · Select · Checkbox · Radio · Switch · RangeSlider · Fieldset · CountrySearch |
| `components/nav/` | TopNav · LocationPill · Tabs · SegmentedControl · Breadcrumbs · BackLink · Pagination · TableOfContents · NextPrev · SkipLink · Footer · SiteFooter |
| `components/feedback/` | Banner · Toast · Tooltip · DefinedTerm · EmptyState · ErrorState · Skeleton · ChartSkeleton · Spinner · ProgressBar |
| `components/overlay/` | Modal · Drawer · Popover · MenuItem |
| `components/data/` | StackedAreaChart · MixBar · FuelLegend · RankedBarList · DonutStat · TileGrid · DataTable · YearScrubber · Sparkline · LineChart · BarChart · ScatterChart · DiffBar · WorldMap · MapLegend · `fuels.js` (order, tokens, `scaleColor`, `onFill`) |
| `components/content/` | HookHeadline · HookCard · QuizCard · CountryHeader · ChapterCard · Prose · ArticleHeader · PullQuote · Figure · Callout · KeyTakeaways · DataNote |
| `ui_kits/web/` | Click-through: Home · Explore · Country · Rankings · Compare · Story · Play |
| `guidelines/` | 26 specimen cards (Colors, Type, Spacing, Charts, Content, Brand) |
| `assets/` | The two supplied gorilla marks |

Every component ships three files: the `.jsx`, a `.d.ts` carrying the prop
contract and the rules, and a `.prompt.md` with worked examples. Read the
`.prompt.md` before using anything — the constraints are the design.

### The specimen cards
Each component group ships a `*.card.html` next to it. Those cards load
`_ds_bundle.js` (project root), which exposes every component on
`window.GridGorilla` so a card renders with no build step. Card demos are
marked `type="text/gg-babel"` so babel-standalone's own DOMContentLoaded pass
skips them — the bundle transforms and runs them itself, after the namespace
exists, with the same classic-runtime preset as the components. Both details
are deliberate: Babel's automatic pass races the bundle and its default JSX
runtime injects an `import` that cannot be evaluated in the browser.

Card `viewport="WxH"` values are **measured, not estimated** — render the card at
the declared width and read `document.documentElement.scrollHeight`. Content is
denser at a card's declared width than in a wide preview, so an eyeballed height
clips exactly the specimens at the bottom of the card.

**The bundle is a documentation device only.** Production code imports the
modules directly (`import { Button } from ".../core/Button.jsx"`) — do not ship
`_ds_bundle.js` or its synchronous-XHR loading strategy into the product.

### Intentional additions
Nothing in `components/` existed in a provided source — the whole inventory is
authored. Two entries are worth calling out as judgement calls rather than
obvious primitives:

- **`GorillaNote`** — encodes the editorial rule that every chart gets one
  plain-English reading. It is a content contract as much as a component.
- **`HookHeadline`** — exists so the geolocated headline templates live in one
  place with their rules attached, rather than being re-invented per page.

### Maps
`WorldMap` renders **real Natural Earth geometry** — outlines are never drawn by
hand. It requires two pinned, hash-verified script tags in the page `<head>`
(listed in `WorldMap.d.ts`); do not change their versions, URLs or hashes.
Natural Earth is the default projection because Mercator inflates exactly the
high-latitude grids that top the clean rankings. `TileGrid` is the equal-weight
alternative for when small grids matter more than land area.

### Not built
- **Light theme.** Dark-only by design. A light ground needs a second fuel ramp;
  the tamed slate ramp does not invert cleanly.
- **Auth, accounts, saved views.** The product's promise is no login. If that
  changes, the account surfaces are a genuine design project, not a component.
- **Data tables with inline editing, multi-select, or bulk actions.** Not a tool,
  a reference — do not add spreadsheet affordances without a real use case.
- **Embeds.** Charts will get shared. An embed frame (attribution, source line,
  fixed sizing) is the most likely next component.

---

## Handoff notes for implementation

1. **Link `styles.css` once**, globally. Do not import token files individually.
2. **Never write a media query in a screen.** Add the `gg-*` hook and, if the
   behaviour is genuinely new, a rule in `tokens/responsive.css`. Sizes that
   should scale get a `clamp()` token instead.
3. **Use semantic aliases** (`--text-secondary`, `--bg-card`) in product code;
   base values (`--paper-a66`, `--ink-700`) are for the token layer.
4. **Never guess a token name** — every `--*` in this system is declared in `tokens/`.
5. **Copy exact numeric values.** Where a component says `13px` or `1.4px`, it means
   it; do not snap to a 4/8 grid.
6. **The fuel order in `fuels.js` is canonical.** Charts that re-sort per country
   destroy comparability across pages.
7. **Geolocation must always be escapable.** `LocationPill` is mandatory wherever
   content is personalised, and the world view is the fallback when detection
   fails — never an empty state.
8. **The scrubber and the readouts must stay in sync.** A stale stat beside a moved
   year handle is the most damaging bug this product can ship.
9. Components are dependency-free React + CSS custom properties. No CSS-in-JS, no
   chart library — the charts are hand-rolled SVG on purpose, and small enough to
   read.
