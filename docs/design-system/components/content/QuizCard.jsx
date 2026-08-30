import React from "react";
import { Card } from "../core/Card.jsx";
import { Eyebrow } from "../core/Eyebrow.jsx";
import { Button } from "../core/Button.jsx";

/* Higher-or-lower prompt. Always green, always two answers, always a
   percentage telling the visitor how often people get it wrong — that stat
   is the actual hook. */
export function QuizCard({ question, options = [], onAnswer, footnote, eyebrow = "Higher or lower", style, ...rest }) {
  return (
    <Card tone="accent" style={style} {...rest}>
      <Eyebrow style={{ fontSize: "var(--fs-mono-xs)", letterSpacing: "var(--ls-label)", color: "rgba(4,37,15,0.62)", marginBottom: "var(--space-4)" }}>
        {eyebrow}
      </Eyebrow>
      <div style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)", lineHeight: 1.15, letterSpacing: "var(--ls-h3)" }}>
        {question}
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-7)" }}>
        {options.map((o) => (
          <Button key={o} variant="onAccent" onClick={onAnswer && (() => onAnswer(o))} style={{ flex: 1 }}>{o}</Button>
        ))}
      </div>
      {footnote && (
        <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-medium)", marginTop: "var(--space-5)", color: "rgba(4,37,15,0.7)" }}>
          {footnote}
        </div>
      )}
    </Card>
  );
}
