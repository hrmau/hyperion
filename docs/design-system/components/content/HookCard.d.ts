import * as React from "react";

/** One of the three-across "how you compare" cards. In a row of three use
 *  `accent` once — that card is the thing you want clicked — and `card` +
 *  `strong` for the others so they separate by ink value, not hue. */
export interface HookCardProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  /** A claim, written as a sentence. */
  title: React.ReactNode;
  children?: React.ReactNode;
  tone?: "card" | "strong" | "accent" | "outline";
  footnote?: string;
}
export function HookCard(props: HookCardProps): JSX.Element;
