import React from "react";
import { FUELS, needsOutline } from "./fuels.js";

/* Legend chips use each band's EXACT fill; the label text stays neutral.
   Never tint the label to a lightened version of the band — adjacent fuels
   in this ramp are too close in value to survive it. */
export function FuelLegend({ shares, layout = "row", style, ...rest }) {
  return (
    <div style={{
      display: "flex", flexDirection: layout === "column" ? "column" : "row",
      flexWrap: "wrap", gap: layout === "column" ? "var(--space-3)" : "var(--space-6)",
      fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
      textTransform: "uppercase", ...style,
    }} {...rest}>
      {shares.map(({ fuel, value }) => (
        <span key={fuel} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--text-secondary)" }}>
          <span style={{
            width: 10, height: 10, flex: "none",
            background: FUELS[fuel].color,
            outline: needsOutline(fuel) ? "1px solid var(--line-strong)" : undefined,
          }} />
          {FUELS[fuel].label} {value}
        </span>
      ))}
    </div>
  );
}
