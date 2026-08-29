import React from "react";
import { orderedSeries } from "./fuels.js";

/* 100% stacked area — the signature chart of the product. Bands are
   separated by a 1.4px stroke in the WELL colour so boundaries read as gaps.
   Renders as a plain SVG with no library. */
export function StackedAreaChart({
  series, years, height = 210, width = 480, radius = "var(--r-well)",
  separators = true, well = "var(--chart-well)", scrubYear, style, ...rest
}) {
  const bands = orderedSeries(series);
  const n = bands[0]?.values.length || 0;
  const x = (i) => (i / (n - 1)) * width;

  /* cumulative tops, band by band, from the top of the chart down */
  let cum = new Array(n).fill(0);
  const paths = [];
  for (const band of bands) {
    const top = [...cum];
    cum = cum.map((v, i) => v + band.values[i]);
    const bottom = [...cum];
    const pts = [
      ...top.map((v, i) => `${x(i)},${(v / 100) * height}`),
      ...bottom.map((v, i) => `${x(i)},${(v / 100) * height}`).reverse(),
    ].join(" ");
    paths.push({
      key: band.key, color: band.color, points: pts,
      edge: bottom.map((v, i) => `${x(i)},${(v / 100) * height}`).join(" "),
    });
  }

  const scrubX = scrubYear && years ? x(years.indexOf(scrubYear)) : null;

  return (
    <div style={{ position: "relative", ...style }} {...rest}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"
        style={{ width: "100%", height, borderRadius: radius, overflow: "hidden", background: well }}>
        {paths.map((p) => <polygon key={p.key} points={p.points} fill={p.color} />)}
        {separators && paths.slice(0, -1).map((p) => (
          <polyline key={p.key + "-sep"} points={p.edge} fill="none"
            stroke="var(--chart-sep)" strokeWidth="var(--chart-sep-width)" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {scrubX != null && (
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: `${(scrubX / width) * 100}%`,
          width: 2, background: "var(--chart-scrub)", pointerEvents: "none",
        }} />
      )}
      {years && (
        <div style={{
          display: "flex", justifyContent: "space-between", marginTop: "var(--space-3)",
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)", color: "var(--chart-axis-text)",
        }}>
          {years.map((y) => <span key={y} style={{ color: y === scrubYear ? "var(--text-primary)" : undefined }}>{y}</span>)}
        </div>
      )}
    </div>
  );
}
