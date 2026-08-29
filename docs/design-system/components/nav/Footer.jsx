import React from "react";

export function Footer({
  sources = "Ember · IEA · World Bank",
  links = ["Methodology", "Credits"],
  note = "Location detected, never stored.",
  style, ...rest
}) {
  return (
    <footer style={{
      display: "flex", alignItems: "center", gap: "var(--space-8)",
      flexWrap: "wrap", padding: "14px var(--gutter)",
      borderTop: "1px solid var(--border-default)",
      fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)",
      color: "var(--paper-a32)", ...style,
    }} {...rest}>
      <span>{sources}</span>
      {links.map((l) => <a key={l} href="#" style={{ color: "inherit" }}>{l}</a>)}
      {note && <span style={{ marginLeft: "auto" }}>{note}</span>}
    </footer>
  );
}
