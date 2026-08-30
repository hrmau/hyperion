import * as React from "react";

/** Compact 100% stacked bar for one point in time. Use in table rows, country
 *  cards and compare strips. Values are single numbers, not arrays. */
export interface MixBarProps extends React.HTMLAttributes<HTMLDivElement> {
  series: Partial<Record<"wind" | "solar" | "other" | "hydro" | "nuclear" | "gas" | "oil" | "coal", number>>;
  height?: number;
  radius?: number;
  /** Gap in px between bands — keeps the tamed ramp legible. */
  gap?: number;
}
export function MixBar(props: MixBarProps): JSX.Element;
