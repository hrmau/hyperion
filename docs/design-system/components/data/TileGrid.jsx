import React from "react";
import { onFill } from "./fuels.js";

/* The periodic-table view: one tile per country, coloured by a categorical
   fuel or a sequential measure. Grouped by continent. Tiles are 58px on
   desktop, 44px minimum on touch. */
export function TileGrid({ groups, tileSize = 58, gap = 4, onSelect, style, ...rest }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)", ...style }} {...rest}>
      {groups.map((group) => (
        <div key={group.label}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
            letterSpacing: "var(--ls-eyebrow)", color: "var(--text-label)",
            textTransform: "uppercase", marginBottom: "var(--space-4)",
          }}>{group.label}</div>
          <div className="gg-tiles" style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${tileSize}px)`, gap }}>
            {group.tiles.map((t) => (
              <button key={t.code} onClick={onSelect && (() => onSelect(t))}
                title={t.title ?? t.code}
                style={{
                  padding: "11px 0", border: "none", cursor: onSelect ? "pointer" : "default",
                  background: t.color, color: t.ink || onFill(t.color),
                  fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono)",
                  fontWeight: "var(--fw-semibold)", letterSpacing: "0.02em",
                  transition: "outline-color var(--dur-instant) var(--ease-out)",
                  outline: "2px solid transparent", outlineOffset: -2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.outlineColor = "var(--paper)")}
                onMouseLeave={(e) => (e.currentTarget.style.outlineColor = "transparent")}
              >{t.code}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
