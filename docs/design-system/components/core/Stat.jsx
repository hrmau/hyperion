import React from "react";
import { Eyebrow } from "./Eyebrow.jsx";

/* Label / big number / footnote. The unit of every readout row in the
   product: hero stats, chart summaries, country profiles. */
export function Stat({ label, value, unit, note, tone = "default", size = "md", style, ...rest }) {
  const color =
    tone === "accent" ? "var(--green)" :
    tone === "down" ? "var(--clay)" :
    tone === "sage" ? "var(--sage)" : "var(--text-primary)";
  return (
    <div style={style} {...rest}>
      {label && <Eyebrow style={{ fontSize: "var(--fs-mono-xxs)", letterSpacing: "var(--ls-label)", marginBottom: "var(--space-3)" }}>{label}</Eyebrow>}
      <div style={{
        fontSize: size === "lg" ? "var(--fs-stat)" : "var(--fs-stat-sm)",
        fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-stat)",
        lineHeight: "var(--lh-stat)", color,
      }}>
        {value}
        {unit && <span style={{ fontSize: 15, fontWeight: "var(--fw-medium)", color: "var(--text-tertiary)", marginLeft: "var(--space-2)" }}>{unit}</span>}
      </div>
      {note && <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>{note}</div>}
    </div>
  );
}
