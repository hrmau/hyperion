import * as React from "react";

/** Ring gauge for a single percentage (clean share, fossil share). Two per
 *  view maximum — for anything more granular use `MixBar`. */
export interface DonutStatProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
}
export function DonutStat(props: DonutStatProps): JSX.Element;
