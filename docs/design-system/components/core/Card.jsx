import React from "react";

const tones = {
  /* Raised panel — chart wells, right rails. */
  raised: { background: "var(--bg-raised)", border: "1px solid transparent" },
  /* Standard card. */
  card: { background: "var(--bg-card)", border: "1px solid var(--border-default)" },
  /* One step up the ink ramp — for the third card in a row, so tiles are
     told apart by VALUE rather than by hue. */
  strong: { background: "var(--bg-card-strong)", border: "1px solid var(--border-default)" },
  /* The one green card. */
  accent: { background: "var(--bg-accent)", color: "var(--text-on-accent)", border: "1px solid transparent" },
  /* Hairline only, no fill. */
  outline: { background: "transparent", border: "1px solid var(--border-default)" },
};

export function Card({ children, tone = "card", padding = "24px 26px", radius = "var(--r-card)", style, ...rest }) {
  return (
    <div style={{ borderRadius: radius, padding, ...tones[tone], ...style }} {...rest}>
      {children}
    </div>
  );
}
