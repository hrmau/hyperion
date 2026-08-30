import * as React from "react";

/** Small mono marker: rank numbers, year chips, data vintages, fuel counts. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  tone?: "neutral" | "accent" | "outline" | "inverse";
  /** false switches to the sans stack for word labels. */
  mono?: boolean;
}
export function Badge(props: BadgeProps): JSX.Element;
