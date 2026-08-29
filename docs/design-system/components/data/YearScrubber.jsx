import React from "react";

/* Timeline control for the hero chart. The handle is a 2px near-white line
   plus a mono year badge; ticks are the years the data actually has. */
export function YearScrubber({ years, value, onChange, style, ...rest }) {
  const i = years.indexOf(value);
  const pct = years.length > 1 ? (i / (years.length - 1)) * 100 : 0;
  return (
    <div style={{ ...style }} {...rest}>
      {/* .gg-range carries the 44px box and the drawn thumb — see
          tokens/controls.css. This is the product's signature control, so it
          must not be the smallest target in the system. */}
      <input
        type="range" className="gg-range" min={0} max={years.length - 1} step={1}
        value={i}
        onChange={(e) => onChange && onChange(years[Number(e.target.value)])}
        aria-label="Year" aria-valuetext={String(value)}
        style={{
          backgroundImage: `linear-gradient(to right, var(--paper) 0 ${pct}%, var(--chart-track) ${pct}% 100%)`,
        }} />
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)",
        color: "var(--chart-axis-text)", padding: "var(--space-5) 0",
        borderTop: "1px solid var(--border-default)",
      }}>
        {years.map((y) => <span key={y} style={{ color: y === value ? "var(--text-primary)" : undefined }}>{y}</span>)}
      </div>
    </div>
  );
}
