import React from "react";

const DEFAULT_COLUMNS = [
  { label: "Explore", links: ["All countries", "Compare two grids", "Rankings", "World mix"] },
  { label: "Learn", links: ["The energy story", "Why electricity matters", "Glossary", "Methodology"] },
  { label: "About", links: ["Who makes this", "Sources & licences", "Corrections", "Contact"] },
];

/* ── SiteFooter ──────────────────────────────────────────────────────────
   The real footer: link columns, the data-provenance block, and the licence
   line. This product's credibility rests on provenance, so sources are not a
   fine-print afterthought — they get their own labelled block with vintages.

   `Footer` (the one-line mono version) is still correct for app-like screens
   such as Play; use SiteFooter on every content and data page. */
export function SiteFooter({
  columns = DEFAULT_COLUMNS,
  sources = [
    { name: "Ember", detail: "Electricity generation, 2000–2026" },
    { name: "IEA", detail: "Historic series, 1985–1999" },
    { name: "World Bank", detail: "Population, GDP" },
  ],
  vintage = "Data through June 2026",
  licence = "Charts and figures are free to reuse with attribution (CC BY 4.0). Source data remains under its providers' terms.",
  note = "Location detected in your browser, never stored.",
  mark = "assets/gorilla-dark.svg",
  style, ...rest
}) {
  return (
    <footer style={{ borderTop: "1px solid var(--border-default)", background: "var(--bg-raised)", ...style }} {...rest}>
      <div className="gg-footer-grid" style={{
        display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)",
        gap: "var(--space-9)", padding: "var(--space-11) var(--gutter) var(--space-10)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <img src={mark} alt="" style={{ width: 26 }} />
            <span style={{ fontSize: 17, fontWeight: "var(--fw-bold)", letterSpacing: "-0.015em" }}>Grid Gorilla</span>
          </div>
          <p style={{
            margin: "var(--space-6) 0 0", maxWidth: "34ch",
            fontSize: "var(--fs-body-sm)", lineHeight: "var(--lh-body-sm)", color: "var(--text-tertiary)",
          }}>
            Where the world's electricity actually comes from — all 214 grids, free, no account, no tracking.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.label} aria-label={col.label}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
              letterSpacing: "var(--ls-label)", textTransform: "uppercase",
              color: "var(--text-label)", marginBottom: "var(--space-6)",
            }}>{col.label}</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" style={{ fontSize: "var(--fs-body-sm)", color: "var(--paper-a66)" }}>{link}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="gg-footer-sources" style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-9)",
        padding: "var(--space-8) var(--gutter)", borderTop: "1px solid var(--border-default)",
      }}>
        {sources.map((s) => (
          <div key={s.name}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
              letterSpacing: "0.06em", color: "var(--paper)", marginBottom: 4,
            }}>{s.name}</div>
            <div style={{ fontSize: "var(--fs-caption)", lineHeight: 1.45, color: "var(--text-quiet)" }}>{s.detail}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", alignItems: "flex-start", gap: "var(--space-8)", flexWrap: "wrap",
        padding: "var(--space-7) var(--gutter) var(--space-9)",
        borderTop: "1px solid var(--border-default)",
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
        lineHeight: 1.6, color: "var(--paper-a32)",
      }}>
        <span style={{ maxWidth: "62ch" }}>{licence}</span>
        <span style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 4, textAlign: "right" }}>
          <span>{vintage}</span>
          <span>{note}</span>
        </span>
      </div>
    </footer>
  );
}
