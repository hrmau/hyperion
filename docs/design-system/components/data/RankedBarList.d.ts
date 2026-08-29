import * as React from "react";

/** Ranked horizontal bars — Rankings pages, watchlists, per-capita spreads.
 *  Bars are neutral; tint at most one row.
 *
 * @startingPoint section="Charts" subtitle="Ranked bars with mono values" viewport="700x220"
 */
export interface RankedBarListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: Array<{
    label: string;
    value: number;
    /** Formatted value, e.g. "52,300" or "99.9%". Falls back to toLocaleString. */
    display?: string;
    tone?: "default" | "accent" | "sage" | "down";
  }>;
  /** Scale ceiling; defaults to the largest value. */
  max?: number;
  labelWidth?: number;
  barHeight?: number;
  showRank?: boolean;
}
export function RankedBarList(props: RankedBarListProps): JSX.Element;
