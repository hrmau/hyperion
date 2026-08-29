import * as React from "react";

/** Label + big number + footnote. Use `tone="accent"` only for the metric
 *  the headline is actually about; `tone="down"` (clay) only for a metric
 *  moving the wrong way. */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: React.ReactNode;
  unit?: string;
  /** Rank or comparison line, e.g. "2nd of 214". */
  note?: string;
  tone?: "default" | "accent" | "sage" | "down";
  size?: "md" | "lg";
}
export function Stat(props: StatProps): JSX.Element;
