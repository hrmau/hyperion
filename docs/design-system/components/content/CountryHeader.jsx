import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Stat } from "../core/Stat.jsx";

/* Country profile header: eyebrow, name, and the standard three-stat row
   (wind/clean/per-capita, or whatever three matter for that grid). */
export function CountryHeader({ country, eyebrow = "Country profile", stats = [], children, style, ...rest }) {
  return (
    <div style={style} {...rest}>
      <Eyebrow tone="accent" style={{ marginBottom: "var(--space-8)" }}>{eyebrow}</Eyebrow>
      <h1 style={{
        margin: 0, fontSize: "var(--fs-h2)", fontWeight: "var(--fw-bold)",
        letterSpacing: "var(--ls-h2)", lineHeight: "var(--lh-h2)",
      }}>{country}</h1>
      {children && (
        <p style={{
          margin: "var(--space-6) 0 0", fontSize: "var(--fs-lead)", lineHeight: "var(--lh-lead)",
          color: "var(--text-secondary)", maxWidth: "var(--maxw-lead)", textWrap: "pretty",
        }}>{children}</p>
      )}
      {stats.length > 0 && (
        <div style={{
          display: "flex", gap: "var(--space-9)", flexWrap: "wrap",
          marginTop: "var(--space-10)", padding: "var(--space-8) 0",
          borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)",
        }}>
          {stats.map((s) => <Stat key={s.label} size="lg" {...s} />)}
        </div>
      )}
    </div>
  );
}
