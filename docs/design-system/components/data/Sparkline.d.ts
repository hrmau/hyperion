import * as React from "react";

/** Bare trend line for a table cell or stat block. No axes, no fill, no dots.
 *  Use `var(--green)` only when the trend is the point of the row. */
export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}
export function Sparkline(props: SparklineProps): JSX.Element;
