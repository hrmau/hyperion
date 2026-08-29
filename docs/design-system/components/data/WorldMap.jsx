import React from "react";
import { scaleColor, FUELS, onFill } from "./fuels.js";

/* ── WorldMap ────────────────────────────────────────────────────────────
   Choropleth over REAL Natural Earth geometry. Country outlines are never
   drawn by hand — the topology is fetched from the pinned world-atlas build
   and projected with d3-geo.

   The host page MUST include these exact pinned, hash-verified tags in
   <head> (they fail closed if tampered with — do not change the versions,
   URLs or hashes):

     <script src="https://unpkg.com/d3@7.9.0/dist/d3.min.js"
       integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i"
       crossorigin="anonymous"></script>
     <script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js"
       integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67"
       crossorigin="anonymous"></script>

   Projection is Natural Earth for the world (it keeps high-latitude grids —
   Iceland, Norway, Canada — at an honest size, which matters when they top
   the clean-energy table and Mercator would inflate them).
*/
const TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

let topoPromise = null;
function loadTopology() {
  if (!topoPromise) {
    topoPromise = fetch(TOPO_URL)
      .then((r) => r.json())
      .then((topology) => window.topojson.feature(topology, topology.objects.countries));
  }
  return topoPromise;
}

export function WorldMap({
  values = {}, mode = "scale", min = 0, max = 100,
  height = 460, projection = "naturalEarth", selected, onSelect, onHover,
  noDataFill = "var(--ink-700)", style, ...rest
}) {
  const ref = React.useRef(null);
  const [features, setFeatures] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [size, setSize] = React.useState({ w: 960, h: height });

  React.useEffect(() => {
    if (!window.d3 || !window.topojson) {
      setError("d3 and topojson-client must be loaded in the page <head> — see WorldMap.prompt.md.");
      return;
    }
    loadTopology().then(setFeatures).catch((e) => setError(e.message));
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  const paths = React.useMemo(() => {
    if (!features || !window.d3) return [];
    const d3 = window.d3;
    const proj = (projection === "mercator" ? d3.geoMercator() : d3.geoNaturalEarth1())
      .fitSize([size.w, size.h], features);
    const path = d3.geoPath(proj);
    return features.features.map((feat) => ({
      id: feat.id, name: feat.properties && feat.properties.name, d: path(feat),
    }));
  }, [features, size.w, size.h, projection]);

  const fillFor = (id) => {
    const v = values[id];
    if (v == null) return noDataFill;
    if (mode === "fuel") return (FUELS[v] && FUELS[v].color) || noDataFill;
    return scaleColor(v, min, max);
  };

  return (
    <div ref={ref} style={{ position: "relative", background: "var(--chart-well)", borderRadius: "var(--r-well)", ...style }} {...rest}>
      {error ? (
        <div style={{ padding: "var(--space-9)", fontSize: "var(--fs-body-sm)", color: "var(--clay)" }}>{error}</div>
      ) : !features ? (
        <div style={{ height, display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-quiet)" }}>
          Loading geometry…
        </div>
      ) : (
        <svg width={size.w} height={size.h} role="img" aria-label="World map of electricity generation">
          {paths.map((p) => {
            const on = selected === p.id;
            return (
              <path key={p.id} d={p.d} fill={fillFor(p.id)}
                stroke={on ? "var(--paper)" : "var(--chart-well)"}
                strokeWidth={on ? 1.4 : 0.5}
                style={{ cursor: onSelect ? "pointer" : "default", transition: "fill var(--dur-chart) var(--ease-out)" }}
                onClick={onSelect && (() => onSelect(p))}
                onMouseEnter={onHover && (() => onHover(p))}
                onMouseLeave={onHover && (() => onHover(null))}>
                <title>{p.name}</title>
              </path>
            );
          })}
        </svg>
      )}
    </div>
  );
}

/* Legend for the sequential scale — a continuous ramp with end labels, not
   seven discrete chips. */
export function MapLegend({ label, min = "0%", max = "100%", mode = "scale", noData = true, style, ...rest }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap", ...style }} {...rest}>
      {label && (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
          letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-label)",
        }}>{label}</span>
      )}
      {mode === "scale" ? (
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--text-tertiary)" }}>{min}</span>
          <span style={{
            width: 160, height: 10,
            background: "linear-gradient(90deg, var(--scale-1), var(--scale-2), var(--scale-3), var(--scale-4), var(--scale-5), var(--scale-6), var(--scale-7))",
          }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--text-tertiary)" }}>{max}</span>
        </span>
      ) : (
        <span style={{ display: "flex", gap: "var(--space-5)", flexWrap: "wrap" }}>
          {Object.entries(FUELS).reverse().map(([key, fuel]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>
              <span style={{ width: 10, height: 10, background: fuel.color, outline: key === "coal" || key === "oil" ? "1px solid var(--line-strong)" : undefined }} />
              {fuel.label}
            </span>
          ))}
        </span>
      )}
      {noData && (
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--text-quiet)", textTransform: "uppercase" }}>
          <span style={{ width: 10, height: 10, background: "var(--ink-700)", outline: "1px solid var(--line)" }} />
          No data
        </span>
      )}
    </div>
  );
}
