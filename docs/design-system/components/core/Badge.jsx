import React from "react";

export function Badge({ children, tone = "neutral", mono = true, style, ...rest }) {
  const tones = {
    neutral: { background: "var(--ink-600)", color: "var(--text-secondary)" },
    accent: { background: "var(--green-wash)", color: "var(--green)" },
    outline: { background: "transparent", color: "var(--text-tertiary)", border: "1px solid var(--border-default)" },
    inverse: { background: "var(--bg-inverse)", color: "var(--text-on-inverse)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
      padding: "4px 9px", borderRadius: "var(--r-chip)",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      fontSize: "var(--fs-mono-xs)", fontWeight: "var(--fw-medium)",
      letterSpacing: mono ? "0.06em" : undefined, whiteSpace: "nowrap",
      ...tones[tone], ...style,
    }} {...rest}>{children}</span>
  );
}
