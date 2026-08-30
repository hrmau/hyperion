/* Canonical fuel order + tokens. ALWAYS stack in this order (top of chart to
   bottom): renewables at the top so the transition reads as a rising band,
   fossils at the bottom. Never re-order per country. */
export const FUEL_ORDER = ["wind", "solar", "other", "hydro", "nuclear", "gas", "oil", "coal"];

export const FUELS = {
  wind:    { label: "Wind",    color: "var(--fuel-wind)",    ink: "var(--on-fuel-wind)" },
  solar:   { label: "Solar",   color: "var(--fuel-solar)",   ink: "var(--on-fuel-solar)" },
  other:   { label: "Other",   color: "var(--fuel-other)",   ink: "var(--on-fuel-other)" },
  hydro:   { label: "Hydro",   color: "var(--fuel-hydro)",   ink: "var(--on-fuel-hydro)" },
  nuclear: { label: "Nuclear", color: "var(--fuel-nuclear)", ink: "var(--on-fuel-nuclear)" },
  gas:     { label: "Gas",     color: "var(--fuel-gas)",     ink: "var(--on-fuel-gas)" },
  oil:     { label: "Oil",     color: "var(--fuel-oil)",     ink: "var(--on-fuel-oil)" },
  coal:    { label: "Coal",    color: "var(--fuel-coal)",    ink: "var(--on-fuel-coal)" },
};

/* Text ON a fill. The ramp crosses from dark slate to light sage, so the
   light half needs dark ink — never hardcode --paper on a fuel fill. Pass
   the fill token you used; unknown fills fall back to --paper. */
const ON_FILL = {
  "var(--fuel-coal)": "var(--on-fuel-coal)", "var(--fuel-oil)": "var(--on-fuel-oil)",
  "var(--fuel-gas)": "var(--on-fuel-gas)", "var(--fuel-nuclear)": "var(--on-fuel-nuclear)",
  "var(--fuel-hydro)": "var(--on-fuel-hydro)", "var(--fuel-other)": "var(--on-fuel-other)",
  "var(--fuel-solar)": "var(--on-fuel-solar)", "var(--fuel-wind)": "var(--on-fuel-wind)",
  "var(--scale-1)": "var(--on-scale-1)", "var(--scale-2)": "var(--on-scale-2)",
  "var(--scale-3)": "var(--on-scale-3)", "var(--scale-4)": "var(--on-scale-4)",
  "var(--scale-5)": "var(--on-scale-5)", "var(--scale-6)": "var(--on-scale-6)",
  "var(--scale-7)": "var(--on-scale-7)",
};
export function onFill(fill) {
  return ON_FILL[fill] || "var(--paper)";
}

/* Coal is near-black on a near-black page: its legend chip needs an outline
   so the swatch is visible. Everything else does not. */
export const needsOutline = (fuel) => fuel === "coal" || fuel === "oil";

/* 7-stop sequential scale for tile grids / choropleths keyed to a measure. */
export const SCALE = [
  "var(--scale-1)", "var(--scale-2)", "var(--scale-3)", "var(--scale-4)",
  "var(--scale-5)", "var(--scale-6)", "var(--scale-7)",
];
export function scaleColor(value, min = 0, max = 100) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return SCALE[Math.min(SCALE.length - 1, Math.floor(t * SCALE.length))];
}

/* Order a series object by canonical fuel order, dropping empty fuels. */
export function orderedSeries(series) {
  return FUEL_ORDER.filter((k) => series[k] != null && series[k] !== 0)
    .map((k) => ({ key: k, ...FUELS[k], values: series[k] }));
}
