import React from "react";
import { Card } from "../core/Card.jsx";
import { Badge } from "../core/Badge.jsx";

/* Story chapter entry. Number, title, one line. Used in the Story index and
   as "read next" at the foot of an article. */
export function ChapterCard({ number, title, children, year, tone = "card", style, ...rest }) {
  return (
    <Card tone={tone} padding="22px 24px" style={style} {...rest}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
        <Badge tone="outline">{String(number).padStart(2, "0")}</Badge>
        {year && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--text-quiet)" }}>{year}</span>}
      </div>
      <div style={{ fontSize: "var(--fs-h4)", fontWeight: "var(--fw-bold)", lineHeight: 1.2, letterSpacing: "var(--ls-h4)" }}>{title}</div>
      {children && <p style={{ margin: "var(--space-4) 0 0", fontSize: "var(--fs-body-sm)", lineHeight: "var(--lh-body-sm)", color: "var(--paper-a55)" }}>{children}</p>}
    </Card>
  );
}
