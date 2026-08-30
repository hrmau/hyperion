import * as React from "react";

/** Single-select filter pill — the "redraw for" row. Selected state is an
 *  inverse fill, never a green fill (green is the accent, not a state). */
export interface PillProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  selected?: boolean;
  /** Dashed outline for an "escape hatch" pill, e.g. "+ any of 214". */
  dashed?: boolean;
}
export function Pill(props: PillProps): JSX.Element;
