import * as React from "react";

/** The signature chart: 100% stacked fuel mix over time. Bands stack in
 *  canonical fuel order (renewables top, fossils bottom) and are separated by
 *  a 1.4px stroke in the well colour. Pass a `scrubYear` to draw the handle
 *  line. Full-bleed use: set `height` to 520 and let the hero scrim sit on top.
 *
 * @startingPoint section="Charts" subtitle="100% stacked fuel mix over time" viewport="700x260"
 */
export interface StackedAreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Percentage series keyed by fuel; each array is one value per year. */
  series: Partial<Record<"wind" | "solar" | "other" | "hydro" | "nuclear" | "gas" | "oil" | "coal", number[]>>;
  /** Axis tick labels — must be the same length as each series array. */
  years?: Array<string | number>;
  height?: number;
  width?: number;
  radius?: string;
  separators?: boolean;
  well?: string;
  scrubYear?: string | number;
}
export function StackedAreaChart(props: StackedAreaChartProps): JSX.Element;
