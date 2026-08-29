import React from "react";
import { orderedSeries } from "./fuels.js";

/* Single-row 100% stacked bar — the compact form of the mix, for table rows,
   country cards and comparison strips. */
export function MixBar({ series, height = 16, radius = 0, gap = 1, style, ...rest }) {
  const bands = orderedSeries(series);
  return (
    <div style={{ display: "flex", height, borderRadius: radius, overflow: "hidden", ...style }} {...rest}>
      {bands.map((b, i) => (
        <div key={b.key} title={`${b.label} ${b.values}%`}
          style={{
            flex: b.values, background: b.color,
            marginLeft: i === 0 ? 0 : gap,
            outline: b.key === "coal" ? "1px solid var(--line-soft)" : undefined,
          }} />
      ))}
    </div>
  );
}
