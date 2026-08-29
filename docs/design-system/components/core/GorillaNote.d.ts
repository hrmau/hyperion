import * as React from "react";

/** The gorilla's reading of a chart — one plain-English sentence telling the
 *  reader what to look at. Follows charts, never used as a generic caption.
 *  Exactly one per chart. */
export interface GorillaNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Green opening clause, e.g. "Watch the green band." */
  lead?: string;
  children?: React.ReactNode;
  /** Path to the gorilla mark; use the dark-ground variant on dark surfaces. */
  mark?: string;
  divider?: boolean;
}
export function GorillaNote(props: GorillaNoteProps): JSX.Element;
