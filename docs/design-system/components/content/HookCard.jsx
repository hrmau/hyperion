import React from "react";
import { Card } from "../core/Card.jsx";
import { Eyebrow } from "../core/Eyebrow.jsx";

/* One of the three "how you compare" cards. Eyebrow, a 25px claim, and at
   most two lines of support. The claim is a sentence, never a label. */
export function HookCard({ eyebrow, title, children, tone = "card", footnote, style, ...rest }) {
  const onAccent = tone === "accent";
  return (
    <Card tone={tone} style={style} {...rest}>
      {eyebrow && (
        <Eyebrow style={{
          fontSize: "var(--fs-mono-xs)", letterSpacing: "var(--ls-label)",
          marginBottom: "var(--space-4)",
          color: onAccent ? "rgba(4,37,15,0.62)" : "var(--paper-a42)",
        }}>{eyebrow}</Eyebrow>
      )}
      <div style={{
        fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)",
        lineHeight: 1.15, letterSpacing: "var(--ls-h3)",
      }}>{title}</div>
      {children && (
        <p style={{
          margin: "var(--space-5) 0 0", fontSize: "var(--fs-body-sm)", lineHeight: "var(--lh-body-sm)",
          color: onAccent ? "rgba(4,37,15,0.78)" : "var(--paper-a55)",
        }}>{children}</p>
      )}
      {footnote && (
        <div style={{
          marginTop: "var(--space-5)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-medium)",
          color: onAccent ? "rgba(4,37,15,0.7)" : "var(--text-tertiary)",
        }}>{footnote}</div>
      )}
    </Card>
  );
}
