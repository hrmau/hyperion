import React from "react";

/* Geolocation affordance. Always states the detected country and always
   offers a way out — the product must work when detection fails or is wrong. */
export function LocationPill({ country, onChange, label = "Viewing as", style, ...rest }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "var(--space-3)",
      fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono)",
      textTransform: "uppercase", letterSpacing: "0.06em",
      color: "var(--text-tertiary)", border: "1px solid var(--line-strong)",
      borderRadius: "var(--r-pill)", padding: "6px 13px", ...style,
    }} {...rest}>
      <span style={{
        width: 6, height: 6, borderRadius: "var(--r-pill)", background: "var(--green)",
        animation: "gg-blink var(--dur-blink) steps(1) infinite",
      }} />
      {label} {country}
      <button onClick={onChange} style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        font: "inherit", color: "var(--text-primary)",
      }}>· change</button>
    </div>
  );
}
