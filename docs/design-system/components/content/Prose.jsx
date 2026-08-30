import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";

/* ── Prose ───────────────────────────────────────────────────────────────
   The wrapper for all long-form content. Styling lives in tokens/prose.css
   under .gg-prose and targets ELEMENTS, so an author writing markdown gets
   correct typography without adding a single class. */
export function Prose({ children, style, ...rest }) {
  return <div className="gg-prose" style={style} {...rest}>{children}</div>;
}

/* ── ArticleHeader ───────────────────────────────────────────────────────
   Opens a Story chapter, a Why page, a methodology note. Kicker, title,
   standfirst, then a mono byline strip with reading time and vintage. */
export function ArticleHeader({
  kicker, title, standfirst, byline, readingTime, updated, chapter, style, ...rest
}) {
  return (
    <header style={{ ...style }} {...rest}>
      {(kicker || chapter) && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", marginBottom: "var(--space-7)" }}>
          {chapter && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
              padding: "3px 8px", borderRadius: "var(--r-chip)",
              background: "var(--ink-600)", color: "var(--text-secondary)",
            }}>{chapter}</span>
          )}
          {kicker && <Eyebrow tone="accent">{kicker}</Eyebrow>}
        </div>
      )}
      <h1 style={{
        margin: 0, fontSize: "var(--fs-h1)", fontWeight: "var(--fw-bold)",
        letterSpacing: "var(--ls-h1)", lineHeight: "var(--lh-h1)",
        maxWidth: "20ch", textWrap: "pretty", color: "var(--paper)",
      }}>{title}</h1>
      {standfirst && (
        <p style={{
          margin: "var(--space-8) 0 0", maxWidth: "52ch",
          fontSize: "var(--fs-lead)", lineHeight: "var(--lh-lead)",
          color: "var(--text-secondary)", textWrap: "pretty",
        }}>{standfirst}</p>
      )}
      {(byline || readingTime || updated) && (
        <div style={{
          display: "flex", gap: "var(--space-8)", flexWrap: "wrap",
          marginTop: "var(--space-9)", paddingTop: "var(--space-6)",
          borderTop: "1px solid var(--border-default)",
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
          letterSpacing: "0.06em", color: "var(--text-quiet)",
        }}>
          {byline && <span>{byline}</span>}
          {readingTime && <span>{readingTime}</span>}
          {updated && <span>Updated {updated}</span>}
        </div>
      )}
    </header>
  );
}

/* ── PullQuote ───────────────────────────────────────────────────────────
   A claim lifted out of the flow. No quotation marks, no italics — the size
   change is the emphasis. Breaks the text measure deliberately. */
export function PullQuote({ children, attribution, style, ...rest }) {
  return (
    <figure className="bleed" style={{
      margin: "2.4em 0", padding: "var(--space-9) 0",
      borderTop: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)", ...style,
    }} {...rest}>
      <blockquote style={{
        margin: 0, padding: 0, border: "none", maxWidth: "24ch",
        fontSize: "var(--fs-h2)", fontWeight: "var(--fw-bold)",
        letterSpacing: "var(--ls-h2)", lineHeight: 1.14, color: "var(--paper)",
      }}>{children}</blockquote>
      {attribution && (
        <figcaption style={{
          marginTop: "var(--space-6)", fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono-xs)", letterSpacing: "0.06em", color: "var(--text-quiet)",
        }}>{attribution}</figcaption>
      )}
    </figure>
  );
}

/* ── Figure ──────────────────────────────────────────────────────────────
   Wraps a chart or image inside prose. The caption carries the source; a
   chart in an article without a source line is not publishable. */
export function Figure({ children, caption, source, bleed = true, style, ...rest }) {
  return (
    <figure className={bleed ? "bleed" : undefined} style={{ margin: "2.2em 0", ...style }} {...rest}>
      {children}
      {(caption || source) && (
        <figcaption style={{
          marginTop: "var(--space-5)", display: "flex", gap: "var(--space-6)",
          flexWrap: "wrap", alignItems: "baseline",
        }}>
          {caption && (
            <span style={{ flex: 1, minWidth: "20ch", fontSize: "var(--fs-caption)", lineHeight: 1.5, color: "var(--text-tertiary)" }}>{caption}</span>
          )}
          {source && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
              letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-quiet)",
            }}>{source}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Callout ─────────────────────────────────────────────────────────────
   An aside inside prose: a definition, a caveat, a "how we calculated this".
   Hairline box, mono label. Never green unless it is genuinely the point. */
export function Callout({ label = "Note", children, tone = "default", style, ...rest }) {
  const accent = tone === "accent" ? "var(--green)" : tone === "caution" ? "var(--clay)" : "var(--text-label)";
  return (
    <aside style={{
      margin: "1.9em 0", padding: "var(--space-7) var(--space-8)",
      border: "1px solid var(--line)", borderRadius: "var(--r-button)",
      background: "var(--ink-800)", ...style,
    }} {...rest}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
        letterSpacing: "var(--ls-label)", textTransform: "uppercase",
        color: accent, marginBottom: "var(--space-4)",
      }}>{label}</div>
      <div style={{ fontSize: "var(--fs-body-sm)", lineHeight: 1.6, color: "var(--paper-a76)" }}>{children}</div>
    </aside>
  );
}

/* ── KeyTakeaways ────────────────────────────────────────────────────────
   Three to five one-line findings at the top of a long read. Journalists
   lift these verbatim, so write them as standalone sentences. */
export function KeyTakeaways({ items = [], label = "The short version", style, ...rest }) {
  return (
    <div className="bleed" style={{
      margin: "2.2em 0", padding: "var(--space-9)",
      border: "1px solid var(--line-strong)", borderRadius: "var(--r-card)", ...style,
    }} {...rest}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
        letterSpacing: "var(--ls-label)", textTransform: "uppercase",
        color: "var(--text-label)", marginBottom: "var(--space-7)",
      }}>{label}</div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: "var(--space-6)" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
              color: "var(--green)", flex: "none", paddingTop: 3,
            }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--paper)" }}>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── DataNote ────────────────────────────────────────────────────────────
   The provenance block that closes any page carrying figures. Mandatory on
   article and country pages — this is where the product earns trust. */
export function DataNote({
  sources = [], method, caveat, updated, label = "About these figures", style, ...rest
}) {
  return (
    <section className="bleed" style={{
      margin: "2.6em 0 0", padding: "var(--space-9) 0",
      borderTop: "1px solid var(--line-strong)", ...style,
    }} {...rest}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
        letterSpacing: "var(--ls-label)", textTransform: "uppercase",
        color: "var(--text-label)", marginBottom: "var(--space-7)",
      }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-8)" }}>
        {sources.length > 0 && (
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-quiet)", marginBottom: "var(--space-3)" }}>Sources</div>
            {sources.map((s) => (
              <div key={s} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--paper)", lineHeight: 1.8 }}>{s}</div>
            ))}
          </div>
        )}
        {method && (
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-quiet)", marginBottom: "var(--space-3)" }}>Method</div>
            <div style={{ fontSize: "var(--fs-body-sm)", lineHeight: 1.55, color: "var(--paper-a76)" }}>{method}</div>
          </div>
        )}
        {caveat && (
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-quiet)", marginBottom: "var(--space-3)" }}>Known limits</div>
            <div style={{ fontSize: "var(--fs-body-sm)", lineHeight: 1.55, color: "var(--paper-a76)" }}>{caveat}</div>
          </div>
        )}
        {updated && (
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-quiet)", marginBottom: "var(--space-3)" }}>Vintage</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--paper)" }}>{updated}</div>
          </div>
        )}
      </div>
    </section>
  );
}
