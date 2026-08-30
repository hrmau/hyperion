import React from "react";

/* ── shared field chrome ─────────────────────────────────────────────────
   Every text-entry control in this system is a dark well with a hairline
   that brightens on focus. No filled-grey inputs, no floating labels — the
   label sits above in mono, like every other label in the system. */
const wellStyle = (invalid, disabled) => ({
  width: "100%", boxSizing: "border-box",
  background: "var(--ink-800)",
  border: `1px solid ${invalid ? "var(--clay)" : "var(--line)"}`,
  borderRadius: "var(--r-button)",
  color: "var(--paper)",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--fs-body)",
  padding: "12px 14px",
  minHeight: 44,
  outline: "none",
  opacity: disabled ? 0.45 : 1,
  transition: "border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
});

export function Field({ label, hint, error, htmlFor, children, style, ...rest }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", ...style }} {...rest}>
      {label && (
        <label htmlFor={htmlFor} style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
          letterSpacing: "var(--ls-label)", textTransform: "uppercase",
          color: "var(--text-label)",
        }}>{label}</label>
      )}
      {children}
      {(error || hint) && (
        <div style={{
          fontSize: "var(--fs-caption)", lineHeight: 1.4,
          color: error ? "var(--clay)" : "var(--text-tertiary)",
        }}>{error || hint}</div>
      )}
    </div>
  );
}

export function Input({ invalid, disabled, iconLeft, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {iconLeft && (
        <span style={{
          position: "absolute", left: 13, display: "flex",
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)",
          color: "var(--text-quiet)", pointerEvents: "none",
        }}>{iconLeft}</span>
      )}
      <input
        disabled={disabled} aria-invalid={invalid || undefined}
        onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
        {...rest}
        style={{
          ...wellStyle(invalid, disabled),
          paddingLeft: iconLeft ? 38 : undefined,
          borderColor: invalid ? "var(--clay)" : focus ? "var(--green)" : "var(--line)",
          background: focus ? "var(--ink-700)" : "var(--ink-800)",
          ...style,
        }}
      />
    </div>
  );
}

export function Textarea({ invalid, disabled, rows = 4, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea
      rows={rows} disabled={disabled} aria-invalid={invalid || undefined}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      {...rest}
      style={{
        ...wellStyle(invalid, disabled),
        lineHeight: 1.55, resize: "vertical",
        borderColor: invalid ? "var(--clay)" : focus ? "var(--green)" : "var(--line)",
        ...style,
      }}
    />
  );
}

/* Native select, restyled. The caret is a mono glyph so it matches the
   system's other affordances rather than an OS arrow. */
export function Select({ options = [], invalid, disabled, style, ...rest }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        disabled={disabled} aria-invalid={invalid || undefined} {...rest}
        style={{
          ...wellStyle(invalid, disabled),
          appearance: "none", paddingRight: 38, cursor: "pointer", ...style,
        }}
      >
        {options.map((o) => {
          const value = typeof o === "string" ? o : o.value;
          const label = typeof o === "string" ? o : o.label;
          return <option key={value} value={value} style={{ background: "var(--ink-800)" }}>{label}</option>;
        })}
      </select>
      <span style={{
        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)",
        pointerEvents: "none",
      }}>▼</span>
    </div>
  );
}

/* Checkbox and radio share one square/round box. Checked state is green —
   this is the one place a form control uses the accent, because "on" and
   "clean energy" are the same idea in this product. */
function Control({ type, checked, label, hint, disabled, onChange, ...rest }) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: "var(--space-4)",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
      minHeight: 44, padding: "10px 0",
    }}>
      <input type={type} checked={checked} disabled={disabled} onChange={onChange} {...rest}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
      <span aria-hidden="true" style={{
        width: 18, height: 18, flex: "none", marginTop: 2,
        borderRadius: type === "radio" ? "50%" : 4,
        border: `1px solid ${checked ? "var(--green)" : "var(--line-strong)"}`,
        background: checked ? "var(--green)" : "transparent",
        display: "grid", placeItems: "center",
        transition: "all var(--dur-fast) var(--ease-out)",
      }}>
        {checked && (type === "radio"
          ? <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green-ink)" }} />
          : <span style={{ fontSize: 11, lineHeight: 1, color: "var(--green-ink)", fontWeight: 700 }}>✓</span>)}
      </span>
      <span>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--paper)" }}>{label}</span>
        {hint && <span style={{ display: "block", fontSize: "var(--fs-caption)", color: "var(--text-tertiary)", marginTop: 2 }}>{hint}</span>}
      </span>
    </label>
  );
}
export const Checkbox = (p) => <Control type="checkbox" {...p} />;
export const Radio = (p) => <Control type="radio" {...p} />;

export function Switch({ checked, onChange, label, disabled, style, ...rest }) {
  /* One element, one hit target. The whole row IS the button — a <label>
     cannot drive a <button> (buttons are not labelable), so wrapping a 22px
     track in a 44px <label> looks compliant and is not: only the track
     responds. Keeping the text inside the button gives a real 44px target
     and one focus stop. */
  return (
    <button
      type="button" role="switch" aria-checked={!!checked} disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      {...rest}
      style={{
        display: "flex", alignItems: "center", gap: "var(--space-5)",
        minHeight: 44, padding: "6px 0", width: "100%",
        background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1, textAlign: "left",
        fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)", color: "var(--paper)",
        ...style,
      }}>
      <span aria-hidden="true" style={{
        width: 40, height: 22, flex: "none", padding: 2, borderRadius: "var(--r-pill)",
        background: checked ? "var(--green)" : "var(--ink-600)",
        display: "flex", justifyContent: checked ? "flex-end" : "flex-start",
        transition: "background var(--dur-fast) var(--ease-out)",
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          background: checked ? "var(--green-ink)" : "var(--paper-a55)",
          transition: "background var(--dur-fast) var(--ease-out)",
        }} />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

/* Range input, restyled to the system's track/fill vocabulary. Used for the
   year scrubber and any single-value continuous filter. */
export function RangeSlider({ min = 0, max = 100, step = 1, value, onChange, showValue = false, format, style, ...rest }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", ...style }}>
      {/* Box, track and thumb come from .gg-range in tokens/controls.css —
          vendor pseudo-elements cannot be set from a style object, and the
          44px hit target lives there too. Only the fill split is inline,
          because it is a live value. */}
      <input
        type="range" className="gg-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange && onChange(Number(e.target.value))} {...rest}
        style={{
          flex: 1,
          backgroundImage: `linear-gradient(to right, var(--paper) 0 ${pct}%, var(--chart-track) ${pct}% 100%)`,
        }} />
      {showValue && (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)",
          fontVariantNumeric: "tabular-nums", color: "var(--paper)", minWidth: 48, textAlign: "right",
        }}>{format ? format(value) : value}</span>
      )}
    </div>
  );
}

export function Fieldset({ legend, children, style, ...rest }) {
  return (
    <fieldset style={{ border: "none", margin: 0, padding: 0, ...style }} {...rest}>
      {legend && (
        <legend style={{
          padding: 0, marginBottom: "var(--space-5)",
          fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
          letterSpacing: "var(--ls-label)", textTransform: "uppercase",
          color: "var(--text-label)",
        }}>{legend}</legend>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>{children}</div>
    </fieldset>
  );
}
