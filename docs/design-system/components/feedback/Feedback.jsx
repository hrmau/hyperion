import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Button } from "../core/Button.jsx";

/* ── Banner ──────────────────────────────────────────────────────────────
   Page-level notice. In this product it is usually about DATA, not the app:
   a stale vintage, a country with a known gap, a methodology change. */
const BANNER_TONES = {
  info: { border: "var(--line-strong)", bg: "var(--ink-700)", accent: "var(--paper-a55)" },
  accent: { border: "rgba(0,199,88,0.35)", bg: "var(--green-wash)", accent: "var(--green)" },
  caution: { border: "rgba(191,139,111,0.4)", bg: "rgba(191,139,111,0.09)", accent: "var(--clay)" },
};

export function Banner({ tone = "info", label, children, action, onDismiss, style, ...rest }) {
  const t = BANNER_TONES[tone];
  return (
    <div role="status" style={{
      display: "flex", alignItems: "flex-start", gap: "var(--space-5)",
      padding: "14px 16px", borderRadius: "var(--r-button)",
      border: `1px solid ${t.border}`, background: t.bg, ...style,
    }} {...rest}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
            letterSpacing: "var(--ls-label)", textTransform: "uppercase",
            color: t.accent, marginBottom: "var(--space-2)",
          }}>{label}</div>
        )}
        <div style={{ fontSize: "var(--fs-body-sm)", lineHeight: "var(--lh-body-sm)", color: "var(--paper-a76)" }}>{children}</div>
      </div>
      {action}
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" style={{
          background: "none", border: "none", cursor: "pointer", padding: 4,
          fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-tertiary)",
        }}>✕</button>
      )}
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────────────────
   Transient confirmation, bottom-left so it never covers the nav or a chart
   legend. Never used for errors that need a decision — those are Banners. */
export function Toast({ children, tone = "info", style, ...rest }) {
  return (
    <div role="status" aria-live="polite" style={{
      display: "inline-flex", alignItems: "center", gap: "var(--space-4)",
      padding: "11px 15px", borderRadius: "var(--r-button)",
      background: "var(--ink-600)", border: "1px solid var(--line-strong)",
      fontSize: "var(--fs-body-sm)", color: "var(--paper)", ...style,
    }} {...rest}>
      {tone === "accent" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flex: "none" }} />}
      {children}
    </div>
  );
}

/* ── Tooltip ─────────────────────────────────────────────────────────────
   Hover/focus explanation. In a data product this is mostly used to define a
   term or expose an exact figure — so the body is mono when it carries a
   number. Never put an action inside a tooltip. */
export function Tooltip({ label, children, side = "top", style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
  }[side];
  return (
    <span style={{ position: "relative", display: "inline-flex", ...style }} {...rest}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      {open && (
        <span role="tooltip" style={{
          position: "absolute", ...pos, zIndex: 40, whiteSpace: "nowrap",
          padding: "7px 10px", borderRadius: "var(--r-chip)",
          background: "var(--paper)", color: "var(--ink-900)",
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
          letterSpacing: "0.04em", pointerEvents: "none",
        }}>{label}</span>
      )}
    </span>
  );
}

/* Dotted-underline term that reveals a definition. The glossary affordance
   for a product full of jargon (capacity factor, load, TWh). */
export function DefinedTerm({ term, definition }) {
  return (
    <Tooltip label={definition}>
      <span tabIndex={0} style={{
        borderBottom: "1px dotted var(--paper-a55)", cursor: "help", outlineOffset: 3,
      }}>{term}</span>
    </Tooltip>
  );
}

/* ── Empty / error / loading ─────────────────────────────────────────────
   All three say what happened, in a sentence, and offer the way out. Never a
   shrug icon, never "Oops". */
export function EmptyState({ label = "Nothing here", title, children, action, style, ...rest }) {
  return (
    <div style={{
      padding: "var(--space-11) var(--space-9)", textAlign: "center",
      border: "1px dashed var(--line-strong)", borderRadius: "var(--r-card)", ...style,
    }} {...rest}>
      <Eyebrow style={{ justifyContent: "center", marginBottom: "var(--space-5)" }}>{label}</Eyebrow>
      <div style={{
        fontSize: "var(--fs-h4)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-h4)",
        color: "var(--paper)", maxWidth: "34ch", margin: "0 auto",
      }}>{title}</div>
      {children && (
        <p style={{
          margin: "var(--space-5) auto 0", maxWidth: "44ch",
          fontSize: "var(--fs-body-sm)", lineHeight: "var(--lh-body-sm)", color: "var(--text-tertiary)",
        }}>{children}</p>
      )}
      {action && <div style={{ marginTop: "var(--space-8)" }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "That didn't load", children, onRetry, style, ...rest }) {
  return (
    <EmptyState
      label="Something broke" title={title} style={{ borderColor: "rgba(191,139,111,0.4)", ...style }}
      action={onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
      {...rest}
    >{children}</EmptyState>
  );
}

/* Skeleton: a flat ink block, no shimmer. Shimmer implies progress the app
   cannot promise, and this system has no decorative animation. */
export function Skeleton({ width = "100%", height = 14, radius = 4, style, ...rest }) {
  return <div aria-hidden="true" style={{ width, height, borderRadius: radius, background: "var(--ink-700)", ...style }} {...rest} />;
}

/* Chart-shaped skeleton, so a loading chart occupies its final height and the
   page does not jump when data arrives. */
export function ChartSkeleton({ height = 210, style, ...rest }) {
  return (
    <div aria-hidden="true" style={{
      height, borderRadius: "var(--r-well)", background: "var(--chart-well)",
      display: "flex", alignItems: "flex-end", gap: 6, padding: 14, boxSizing: "border-box", ...style,
    }} {...rest}>
      {[0.4, 0.62, 0.5, 0.78, 0.68, 0.9, 0.82].map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h * 100}%`, background: "var(--ink-700)", borderRadius: 2 }} />
      ))}
    </div>
  );
}

export function Spinner({ size = 16, style, ...rest }) {
  return (
    <span role="status" aria-label="Loading" style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      border: "2px solid var(--line-strong)", borderTopColor: "var(--green)",
      animation: "gg-spin 700ms linear infinite", ...style,
    }} {...rest} />
  );
}

/* Determinate progress, used by the quiz. */
export function ProgressBar({ value, max = 100, label, style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={style} {...rest}>
      {label && (
        <div style={{
          display: "flex", justifyContent: "space-between", marginBottom: "var(--space-3)",
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
          letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-label)",
        }}>
          <span>{label}</span><span>{value} / {max}</span>
        </div>
      )}
      <div role="progressbar" aria-valuenow={value} aria-valuemax={max} style={{ height: 3, background: "var(--chart-track)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--green)", transition: "width var(--dur-base) var(--ease-out)" }} />
      </div>
    </div>
  );
}
