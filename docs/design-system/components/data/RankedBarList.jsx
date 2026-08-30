import React from "react";

/* Ranked horizontal bars. The workhorse of Rankings and any "watchlist"
   block: label, track, value. Bars are neutral by default; pass tone
   "accent" on the row the page is actually about. */
export function RankedBarList({ items, max, labelWidth = 78, barHeight = 9, showRank = false, style, ...rest }) {
  const top = max ?? Math.max(...items.map((i) => i.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", ...style }} {...rest}>
      {items.map((item, i) => {
        const color = item.tone === "accent" ? "var(--green)"
          : item.tone === "down" ? "var(--clay)"
          : item.tone === "sage" ? "var(--sage)" : "var(--paper-a55)";
        return (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", fontSize: "var(--fs-caption)" }}>
            {showRank && <span style={{ fontFamily: "var(--font-mono)", width: 22, color: "var(--text-quiet)" }}>{i + 1}</span>}
            <span style={{ width: labelWidth, flex: "none", color: "var(--text-primary)" }}>{item.label}</span>
            <div style={{ flex: 1, height: barHeight, background: "var(--chart-track)" }}>
              <div style={{
                width: `${Math.max(0.4, (item.value / top) * 100)}%`, height: "100%",
                background: color, transition: "width var(--dur-chart) var(--ease-out)",
              }} />
            </div>
            <span style={{
              width: 56, textAlign: "right", flex: "none",
              fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)",
              color: item.tone === "accent" ? "var(--green)" : "var(--text-secondary)",
            }}>{item.display ?? item.value.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
