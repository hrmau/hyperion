# Website UI kit

Seven surfaces, all composed from `components/` — no styling is redefined here.
`index.html` mounts them as a click-through; the nav switches screens.

| File | Surface | What it demonstrates |
|---|---|---|
| `Home.jsx` | Geolocated homepage | The agreed direction: hook → their chart → three compare cards. |
| `Explore.jsx` | All grids | `WorldMap` (real geometry) with `TileGrid` as an equal-weight alternative, country search, measure select. |
| `Country.jsx` | One country | The most-visited page type: tabs, stat row, mix chart, trends, peers, and a `DataNote`. |
| `Rankings.jsx` | Rankings table | `DataTable` with inline `MixBar` and `Sparkline`; visitor's row tinted; `mobileOptional` columns. |
| `Compare.jsx` | Two grids | Mirrored charts, `DonutStat`, stat rows. |
| `Story.jsx` | Article | `Prose` + sticky TOC, `KeyTakeaways`, `Figure` with sources, `ScatterChart`, `DataNote`, next/prev. |
| `Play.jsx` | Higher or lower | The only stateful screen: question → reveal → ranked bars. |

`data.js` holds illustrative figures ONLY — every value is unverified. See the
DATA CAVEAT in the root readme before shipping any of it. Note that
`CLEAN_BY_ISO` is keyed by **numeric** ISO 3166-1 ids (what world-atlas geometry
uses), while `COUNTRY_LIST` uses two-letter codes.

## How index.html loads
Production code imports these modules normally. The preview file fetches the
sources, strips `import`/`export`, concatenates them in dependency order and
runs one Babel transform — because babel-standalone cannot resolve ESM imports
of `.jsx` in the browser. If you add a component, add it to the `FILES` list in
dependency order, and keep top-level `const` names unique across modules.
