import React from "react";
import { Eyebrow } from "../core/Eyebrow.jsx";

/* Scrim: a flat ink wash, never a backdrop blur. Blur is banned system-wide
   because it makes chart colours unreadable behind the panel. */
function Scrim({ onClose }) {
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(6,9,10,0.72)" }} />;
}

function useEscape(open, onClose) {
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
}

/* ── Modal ───────────────────────────────────────────────────────────────
   Centred panel for a focused task: country picker, share, methodology note.
   Never for content the reader might want to keep beside a chart — that is a
   Drawer or a page. */
export function Modal({ open, onClose, title, eyebrow, children, footer, width = 520, style, ...rest }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <>
      <Scrim onClose={onClose} />
      <div role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}
        style={{
          position: "fixed", zIndex: 51, top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: `min(${width}px, calc(100vw - 32px))`, maxHeight: "calc(100vh - 64px)",
          overflow: "auto", background: "var(--ink-700)",
          border: "1px solid var(--line-strong)", borderRadius: "var(--r-card)", ...style,
        }} {...rest}>
        <div style={{ padding: "var(--space-9) var(--space-9) var(--space-7)" }}>
          {eyebrow && <Eyebrow style={{ marginBottom: "var(--space-5)" }}>{eyebrow}</Eyebrow>}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-6)" }}>
            {title && <h2 style={{
              margin: 0, flex: 1, fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)",
              letterSpacing: "var(--ls-h3)", lineHeight: 1.15, color: "var(--paper)",
            }}>{title}</h2>}
            <button onClick={onClose} aria-label="Close" style={{
              background: "none", border: "none", cursor: "pointer", padding: 4, marginTop: -2,
              fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--text-tertiary)",
            }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "0 var(--space-9) var(--space-9)" }}>{children}</div>
        {footer && (
          <div style={{
            padding: "var(--space-7) var(--space-9)", borderTop: "1px solid var(--border-default)",
            display: "flex", gap: "var(--space-4)", justifyContent: "flex-end",
          }}>{footer}</div>
        )}
      </div>
    </>
  );
}

/* ── Drawer ──────────────────────────────────────────────────────────────
   Edge panel. Right on desktop for detail beside a chart; bottom on mobile,
   where it is also the pattern for filters. */
export function Drawer({ open, onClose, title, side = "right", children, width = 420, style, ...rest }) {
  useEscape(open, onClose);
  if (!open) return null;
  const edge = side === "bottom"
    ? { left: 0, right: 0, bottom: 0, maxHeight: "82vh", borderTop: "1px solid var(--line-strong)", borderRadius: "var(--r-card) var(--r-card) 0 0" }
    : { top: 0, bottom: 0, right: 0, width: `min(${width}px, 92vw)`, borderLeft: "1px solid var(--line-strong)" };
  return (
    <>
      <Scrim onClose={onClose} />
      <div role="dialog" aria-modal="true" style={{
        position: "fixed", zIndex: 51, background: "var(--ink-800)", overflow: "auto", ...edge, ...style,
      }} {...rest}>
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--space-6)",
          padding: "var(--space-7) var(--space-9)", borderBottom: "1px solid var(--border-default)",
          position: "sticky", top: 0, background: "var(--ink-800)",
        }}>
          <h2 style={{ margin: 0, flex: 1, fontSize: "var(--fs-h4)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-h4)" }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--text-tertiary)",
          }}>✕</button>
        </div>
        <div style={{ padding: "var(--space-9)" }}>{children}</div>
      </div>
    </>
  );
}

/* ── Popover / menu ──────────────────────────────────────────────────────
   Anchored panel for a short list of choices. Not a nav pattern — the nav is
   five flat destinations by design. */
export function Popover({ open, onClose, children, align = "left", width = 240, style, ...rest }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div style={{
      position: "absolute", zIndex: 45, top: "calc(100% + 8px)",
      [align]: 0, width, background: "var(--ink-700)",
      border: "1px solid var(--line-strong)", borderRadius: "var(--r-button)",
      overflow: "hidden", ...style,
    }} {...rest}>{children}</div>
  );
}

export function MenuItem({ children, selected, onClick, meta, style, ...rest }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "var(--space-5)", width: "100%",
      padding: "11px 14px", minHeight: 44, border: "none", cursor: "pointer", textAlign: "left",
      fontFamily: "var(--font-sans)", fontSize: "var(--fs-body-sm)",
      color: selected ? "var(--green)" : "var(--paper)",
      background: "transparent",
      transition: "background var(--dur-instant) var(--ease-out)",
      ...style,
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ink-600)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      {...rest}>
      <span style={{ flex: 1 }}>{children}</span>
      {meta && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--text-quiet)" }}>{meta}</span>}
    </button>
  );
}
