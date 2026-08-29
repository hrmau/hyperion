import React from "react";

/* ── Tabs ────────────────────────────────────────────────────────────────
   In-page section switching. Underline, not a pill — pills are reserved for
   changing a chart's DATASET, tabs change the VIEW. Keeping those two
   affordances distinct is the whole reason both exist. */
export function Tabs({ items = [], active, onChange, style, ...rest }) {
  return (
    <div role="tablist" className="gg-scroll-row" style={{
      display: "flex", gap: "var(--space-9)", borderBottom: "1px solid var(--border-default)", ...style,
    }} {...rest}>
      {items.map((item) => {
        const value = typeof item === "string" ? item : item.value;
        const label = typeof item === "string" ? item : item.label;
        const count = typeof item === "object" ? item.count : undefined;
        const on = value === active;
        return (
          <button key={value} role="tab" aria-selected={on} onClick={() => onChange && onChange(value)}
            style={{
              display: "flex", alignItems: "center", gap: "var(--space-3)",
              background: "none", border: "none", cursor: "pointer",
              padding: "0 0 var(--space-5)", marginBottom: -1, minHeight: 44,
              fontFamily: "var(--font-sans)", fontSize: "var(--fs-ui)", fontWeight: "var(--fw-medium)",
              color: on ? "var(--paper)" : "var(--text-secondary)",
              borderBottom: `2px solid ${on ? "var(--paper)" : "transparent"}`,
              whiteSpace: "nowrap", transition: "color var(--dur-fast) var(--ease-out)",
            }}>
            {label}
            {count != null && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--text-quiet)" }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Compact 2–4 option switch, used inside a card or above a small chart where
   a full tab row would be too heavy. */
export function SegmentedControl({ options = [], value, onChange, style, ...rest }) {
  return (
    <div role="radiogroup" style={{
      display: "inline-flex", padding: 2, borderRadius: "var(--r-pill)",
      background: "var(--ink-800)", border: "1px solid var(--line)", ...style,
    }} {...rest}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button key={o} role="radio" aria-checked={on} onClick={() => onChange && onChange(o)}
            style={{
              padding: "7px 14px", minHeight: 36, border: "none", borderRadius: "var(--r-pill)",
              cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--fs-caption)",
              fontWeight: "var(--fw-medium)", whiteSpace: "nowrap",
              background: on ? "var(--bg-inverse)" : "transparent",
              color: on ? "var(--text-on-inverse)" : "var(--text-secondary)",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}>{o}</button>
        );
      })}
    </div>
  );
}

/* ── Breadcrumbs ─────────────────────────────────────────────────────────
   Mono, middot-separated. Needed once the product has country pages nested
   under continents and chapters nested under Story. */
export function Breadcrumbs({ items = [], style, ...rest }) {
  return (
    <nav aria-label="Breadcrumb" style={{
      display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap",
      fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
      letterSpacing: "0.06em", textTransform: "uppercase", ...style,
    }} {...rest}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {last
              ? <span aria-current="page" style={{ color: "var(--paper)" }}>{item.label}</span>
              : <a href={item.href || "#"} style={{ color: "var(--text-quiet)" }}>{item.label}</a>}
            {!last && <span style={{ color: "var(--paper-a32)" }}>·</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function BackLink({ children = "Back", href = "#", onClick, style, ...rest }) {
  return (
    <a href={href} onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: "var(--space-3)", minHeight: 44,
      fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
      letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", ...style,
    }} {...rest}><span aria-hidden="true">←</span>{children}</a>
  );
}

/* ── Pagination ──────────────────────────────────────────────────────────
   For the rankings table beyond ~50 rows. Mono numerals; the current page is
   an inverse fill, matching every other "selected" state in the system. */
export function Pagination({ page = 1, pages = 1, onChange, style, ...rest }) {
  const nums = [];
  const push = (n) => nums.push(n);
  push(1);
  for (let n = page - 1; n <= page + 1; n++) if (n > 1 && n < pages) push(n);
  if (pages > 1) push(pages);
  const unique = [...new Set(nums)].sort((a, b) => a - b);

  const btn = (label, disabled, onClickBtn, on) => (
    <button key={label} disabled={disabled} onClick={onClickBtn} aria-current={on ? "page" : undefined}
      style={{
        minWidth: 40, minHeight: 40, padding: "0 10px", cursor: disabled ? "default" : "pointer",
        borderRadius: "var(--r-chip)", border: "1px solid " + (on ? "transparent" : "var(--line)"),
        background: on ? "var(--bg-inverse)" : "transparent",
        color: on ? "var(--text-on-inverse)" : disabled ? "var(--paper-a32)" : "var(--text-secondary)",
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)", fontVariantNumeric: "tabular-nums",
      }}>{label}</button>
  );

  return (
    <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", ...style }} {...rest}>
      {btn("←", page <= 1, () => onChange && onChange(page - 1))}
      {unique.map((n, i) => (
        <React.Fragment key={n}>
          {i > 0 && n - unique[i - 1] > 1 && <span style={{ color: "var(--paper-a32)", fontFamily: "var(--font-mono)", padding: "0 2px" }}>…</span>}
          {btn(n, false, () => onChange && onChange(n), n === page)}
        </React.Fragment>
      ))}
      {btn("→", page >= pages, () => onChange && onChange(page + 1))}
    </nav>
  );
}

/* ── Table of contents ───────────────────────────────────────────────────
   Sticky sidebar for Story chapters and long methodology pages. The active
   marker is a green bar — the accent earns its place because it is the only
   moving element on a long read. */
export function TableOfContents({ items = [], active, onSelect, label = "On this page", style, ...rest }) {
  return (
    <nav aria-label={label} style={{ ...style }} {...rest}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
        letterSpacing: "var(--ls-label)", textTransform: "uppercase",
        color: "var(--text-label)", marginBottom: "var(--space-5)",
      }}>{label}</div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={onSelect && ((e) => { e.preventDefault(); onSelect(item.id); })}
                style={{
                  display: "block", padding: "8px 0 8px 14px",
                  borderLeft: `2px solid ${on ? "var(--green)" : "var(--line)"}`,
                  fontSize: "var(--fs-body-sm)", lineHeight: 1.4,
                  color: on ? "var(--paper)" : "var(--text-tertiary)",
                  transition: "all var(--dur-fast) var(--ease-out)",
                }}>{item.label}</a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* Previous/next chapter pair for the foot of a long read. */
export function NextPrev({ prev, next, style, ...rest }) {
  const cell = (item, dir) => (
    <a href={item ? item.href || "#" : undefined} style={{
      flex: 1, display: "block", padding: "var(--space-8) var(--space-7)",
      textAlign: dir === "next" ? "right" : "left",
      opacity: item ? 1 : 0.3, pointerEvents: item ? undefined : "none",
      color: "var(--paper)",
    }}>
      <span style={{
        display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
        letterSpacing: "var(--ls-label)", textTransform: "uppercase",
        color: "var(--text-label)", marginBottom: "var(--space-4)",
      }}>{dir === "next" ? "Next →" : "← Previous"}</span>
      <span style={{ fontSize: "var(--fs-h4)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-h4)", lineHeight: 1.2 }}>
        {item ? item.label : "—"}
      </span>
    </a>
  );
  return (
    <div className="gg-card-row" style={{
      display: "flex", borderTop: "1px solid var(--border-default)",
      borderBottom: "1px solid var(--border-default)", ...style,
    }} {...rest}>
      {cell(prev, "prev")}
      <div style={{ width: 1, background: "var(--line)" }} />
      {cell(next, "next")}
    </div>
  );
}

/* Accessibility floor: every page starts with one of these. */
export function SkipLink({ href = "#main", children = "Skip to content" }) {
  return (
    <a href={href} style={{
      position: "absolute", left: -9999, top: 8, zIndex: 100,
      padding: "10px 14px", borderRadius: "var(--r-button)",
      background: "var(--paper)", color: "var(--ink-900)",
      fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)",
    }}
      onFocus={(e) => (e.currentTarget.style.left = "8px")}
      onBlur={(e) => (e.currentTarget.style.left = "-9999px")}
    >{children}</a>
  );
}
