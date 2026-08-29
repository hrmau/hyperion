/* Illustrative figures only — NOT verified. Replace every value here with a
   query against the real Grid Gorilla dataset before shipping. See
   readme.md → DATA CAVEAT. */
export const WORLD = {
  totalTWh: "30,856", cleanShare: 40.9, growth: "3.2× larger than 1985",
  series: { wind:[0,1,2,4,6,8.1], solar:[0,0,0,0.5,3,6.9], other:[5,5,5,5.1,5.2,5.2],
            hydro:[19,18,17,16,15,14.3], nuclear:[15,17,16,13,10,9.1],
            gas:[12,14,18,21,22,22], coal:[38,37,38,36,35,34.4], oil:[11,8,4,4.4,3.6,4] },
  years: [1985,1995,2005,2015,2020,2026],
  ticks: [1985,1990,1995,2000,2005,2010,2015,2020,2026],
};

export const IRELAND = {
  name: "Ireland", code: "IE",
  hook: { lead: "Ireland burns gas for", highlight: "42%", tone: "var(--fuel-gas-ink)",
          tail: "of its power — and is second in the world for wind." },
  lead: "Both of those things are true at once, and that tension is basically the whole story of the energy transition. Only Denmark gets a bigger share of its electricity from wind than you do.",
  stats: [
    { label: "Wind share", value: "34%", note: "2nd of 214", tone: "accent" },
    { label: "Clean share", value: "41%", note: "exactly the world average" },
    { label: "Per person", value: "6,100", note: "kWh · 42nd of 214" },
  ],
  series: { wind:[0,2,12,34], solar:[0,0,1,4], gas:[8,22,38,42], coal:[62,44,22,6], other:[30,32,27,14] },
  years: [1990,2000,2010,2026],
  shares: [{fuel:"wind",value:34},{fuel:"solar",value:4},{fuel:"gas",value:42},{fuel:"coal",value:6},{fuel:"other",value:14}],
  note: { lead: "Watch the green band.", body: "In 1990 it didn't exist. Ireland went from zero to second in the world inside one working career — and gas is what covers the days the wind doesn't blow." },
};

export const RANKINGS = [
  { id:"IS", rank:1, country:"Iceland", clean:"99.9", perCap:"52,300", trend:[96,98,99,99.9], series:{hydro:70,other:29.9,gas:0.1} },
  { id:"NO", rank:2, country:"Norway",  clean:"98.6", perCap:"23,000", trend:[97,98,98,98.6], series:{hydro:88,wind:10.6,gas:1.4} },
  { id:"SE", rank:3, country:"Sweden",  clean:"98.1", perCap:"13,400", trend:[92,95,97,98.1], series:{hydro:40,nuclear:30,wind:26,other:4} },
  { id:"FR", rank:4, country:"France",  clean:"92.4", perCap:"7,100",  trend:[91,90,91,92.4], series:{nuclear:65,hydro:12,wind:9,solar:4,gas:8,other:2} },
  { id:"BR", rank:5, country:"Brazil",  clean:"88.7", perCap:"2,900",  trend:[84,82,86,88.7], series:{hydro:58,wind:14,solar:8,other:8.7,gas:9,coal:2.3} },
  { id:"IE", rank:29, country:"Ireland", clean:"41.0", perCap:"6,100",  trend:[12,22,34,41], series:{wind:34,solar:4,gas:42,coal:6,other:14} },
  { id:"DE", rank:34, country:"Germany", clean:"38.0", perCap:"6,500",  trend:[18,26,34,38], series:{wind:26,solar:12,coal:24,gas:16,nuclear:0,other:22} },
  { id:"NG", rank:96, country:"Nigeria", clean:"18.0", perCap:"160",    trend:[22,20,19,18], series:{gas:78,hydro:18,other:4} },
];

/* ── Country search list ─────────────────────────────────────────────────
   Illustrative subset. In production this is the full 214, loaded once. */
export const COUNTRY_LIST = [
  { code: "IE", name: "Ireland",        fuel: "Gas",     color: "var(--fuel-gas)" },
  { code: "IS", name: "Iceland",        fuel: "Hydro",   color: "var(--fuel-hydro)" },
  { code: "IN", name: "India",          fuel: "Coal",    color: "var(--fuel-coal)" },
  { code: "IT", name: "Italy",          fuel: "Gas",     color: "var(--fuel-gas)" },
  { code: "IL", name: "Israel",         fuel: "Gas",     color: "var(--fuel-gas)" },
  { code: "GB", name: "United Kingdom", fuel: "Wind",    color: "var(--fuel-wind)" },
  { code: "FR", name: "France",         fuel: "Nuclear", color: "var(--fuel-nuclear)" },
  { code: "DE", name: "Germany",        fuel: "Wind",    color: "var(--fuel-wind)" },
  { code: "DK", name: "Denmark",        fuel: "Wind",    color: "var(--fuel-wind)" },
  { code: "NO", name: "Norway",         fuel: "Hydro",   color: "var(--fuel-hydro)" },
  { code: "NG", name: "Nigeria",        fuel: "Gas",     color: "var(--fuel-gas)" },
  { code: "NZ", name: "New Zealand",    fuel: "Hydro",   color: "var(--fuel-hydro)" },
  { code: "BR", name: "Brazil",         fuel: "Hydro",   color: "var(--fuel-hydro)" },
  { code: "CN", name: "China",          fuel: "Coal",    color: "var(--fuel-coal)" },
  { code: "US", name: "United States",  fuel: "Gas",     color: "var(--fuel-gas)" },
  { code: "ZA", name: "South Africa",   fuel: "Coal",    color: "var(--fuel-coal)" },
  { code: "ES", name: "Spain",          fuel: "Wind",    color: "var(--fuel-wind)" },
  { code: "SE", name: "Sweden",         fuel: "Nuclear", color: "var(--fuel-nuclear)" },
];

/* ── Choropleth values ───────────────────────────────────────────────────
   Keyed by NUMERIC ISO 3166-1 id, which is what world-atlas geometry uses —
   not the two-letter codes above. Map your real data the same way. */
export const CLEAN_BY_ISO = {
  "372": 41,  // Ireland
  "352": 99.9,// Iceland
  "578": 98.6,// Norway
  "752": 98.1,// Sweden
  "250": 92.4,// France
  "076": 88.7,// Brazil
  "124": 81.5,// Canada
  "554": 82,  // New Zealand
  "620": 71,  // Portugal
  "208": 68,  // Denmark
  "724": 62,  // Spain
  "826": 56,  // United Kingdom
  "276": 38,  // Germany
  "380": 42,  // Italy
  "840": 41,  // United States
  "156": 34,  // China
  "356": 22,  // India
  "710": 16,  // South Africa
  "566": 18,  // Nigeria
  "616": 21,  // Poland
  "643": 38,  // Russia
  "392": 31,  // Japan
  "036": 39,  // Australia
  "484": 24,  // Mexico
  "032": 34,  // Argentina
  "818": 10,  // Egypt
  "364": 8,   // Iran
  "682": 1,   // Saudi Arabia
  "360": 20,  // Indonesia
  "704": 42,  // Vietnam
  "410": 9,   // South Korea
  "792": 44,  // Turkey
  "231": 90,  // Ethiopia
  "404": 88,  // Kenya
  "180": 96,  // DR Congo
  "586": 32,  // Pakistan
  "050": 24,  // Bangladesh
  "604": 60,  // Peru
  "170": 72,  // Colombia
  "152": 55,  // Chile
};

/* ── Tile grid groups (the equal-weight alternative to the map) ─────────── */
const t = (code, fuel) => ({ code, fuel });
export const TILE_GROUPS_RAW = [
  { label: "Europe", tiles: [t("NO","hydro"),t("IS","hydro"),t("SE","nuclear"),t("FR","nuclear"),t("CH","hydro"),t("AT","hydro"),t("DK","wind"),t("IE","wind"),t("GB","wind"),t("ES","wind"),t("PT","wind"),t("DE","wind"),t("FI","nuclear"),t("BE","nuclear"),t("NL","gas"),t("IT","gas"),t("GR","gas"),t("PL","coal"),t("CZ","coal"),t("RS","coal"),t("EE","coal"),t("BG","nuclear"),t("SK","nuclear"),t("HU","nuclear"),t("UA","nuclear"),t("RO","hydro"),t("HR","hydro"),t("LV","hydro"),t("LT","gas"),t("RU","gas"),t("TR","gas")] },
  { label: "Asia & Middle East", tiles: [t("CN","coal"),t("IN","coal"),t("ID","coal"),t("VN","coal"),t("KR","coal"),t("PH","coal"),t("TW","coal"),t("KZ","coal"),t("JP","gas"),t("TH","gas"),t("MY","gas"),t("PK","gas"),t("BD","gas"),t("IR","gas"),t("SA","gas"),t("AE","gas"),t("IQ","gas"),t("QA","gas"),t("SG","gas"),t("IL","gas"),t("NP","hydro"),t("BT","hydro"),t("LA","hydro"),t("TJ","hydro"),t("GE","hydro")] },
  { label: "Americas", tiles: [t("US","gas"),t("MX","gas"),t("AR","gas"),t("TT","gas"),t("DO","gas"),t("CA","hydro"),t("BR","hydro"),t("CO","hydro"),t("VE","hydro"),t("PY","hydro"),t("EC","hydro"),t("CR","hydro"),t("PA","hydro"),t("PE","hydro"),t("CL","solar"),t("UY","wind"),t("NI","wind"),t("SV","other")] },
  { label: "Africa & Oceania", tiles: [t("ZA","coal"),t("MA","coal"),t("BW","coal"),t("AU","coal"),t("EG","gas"),t("NG","gas"),t("DZ","gas"),t("LY","gas"),t("TN","gas"),t("GH","gas"),t("TZ","gas"),t("CI","gas"),t("PG","gas"),t("ET","hydro"),t("MZ","hydro"),t("ZM","hydro"),t("AO","hydro"),t("CD","hydro"),t("UG","hydro"),t("NZ","hydro"),t("FJ","hydro"),t("KE","other"),t("MR","wind")] },
];
export const TILE_GROUPS = TILE_GROUPS_RAW.map((g) => ({
  label: g.label,
  tiles: g.tiles.map((x) => ({ code: x.code, color: `var(--fuel-${x.fuel})`, title: x.code })),
}));

export const FUEL_COUNTS = [
  { fuel: "coal", value: 61 }, { fuel: "gas", value: 58 }, { fuel: "hydro", value: 54 },
  { fuel: "nuclear", value: 12 }, { fuel: "wind", value: 14 }, { fuel: "solar", value: 1 },
  { fuel: "other", value: 14 },
];

/* ── Story assets ────────────────────────────────────────────────────────── */
export const GERMANY = {
  wind: [1, 6, 18, 26], solar: [0, 0, 3, 12], gas: [8, 9, 14, 16],
  coal: [58, 52, 43, 24], nuclear: [28, 29, 22, 0], other: [5, 4, 0, 22],
};

export const CHAPTERS = [
  { id: "embargo", label: "1973: the embargo" },
  { id: "chernobyl", label: "Chernobyl and the fleet that never was" },
  { id: "money", label: "Germany's €500bn bet" },
  { id: "fracking", label: "The fracking decade" },
  { id: "solar", label: "The solar learning curve" },
  { id: "china", label: "China builds everything" },
  { id: "grids", label: "The grid becomes the constraint" },
  { id: "next", label: "What happens next" },
];

/* kWh per person vs HDI. Illustrative — replace with the real join. */
export const SCATTER = [
  { label: "Iceland", x: 52300, y: 0.96 }, { label: "Norway", x: 23000, y: 0.97 },
  { label: "Canada", x: 14500, y: 0.94 }, { label: "United States", x: 12700, y: 0.93 },
  { label: "Sweden", x: 13400, y: 0.95 }, { label: "Australia", x: 10000, y: 0.95 },
  { label: "France", x: 7100, y: 0.91 }, { label: "Japan", x: 7800, y: 0.92 },
  { label: "Germany", x: 6500, y: 0.95 }, { label: "Ireland", x: 6100, y: 0.95 },
  { label: "Spain", x: 5500, y: 0.91 }, { label: "China", x: 5900, y: 0.79 },
  { label: "Poland", x: 4400, y: 0.88 }, { label: "Turkey", x: 3600, y: 0.85 },
  { label: "Brazil", x: 2900, y: 0.76 }, { label: "South Africa", x: 3400, y: 0.72 },
  { label: "Mexico", x: 2400, y: 0.78 }, { label: "Egypt", x: 1800, y: 0.73 },
  { label: "Indonesia", x: 1200, y: 0.71 }, { label: "India", x: 1300, y: 0.64 },
  { label: "Pakistan", x: 640, y: 0.54 }, { label: "Bangladesh", x: 560, y: 0.67 },
  { label: "Kenya", x: 220, y: 0.60 }, { label: "Ethiopia", x: 150, y: 0.50 },
  { label: "Nigeria", x: 160, y: 0.55 }, { label: "DR Congo", x: 110, y: 0.48 },
];
