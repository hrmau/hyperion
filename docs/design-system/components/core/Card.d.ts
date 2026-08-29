import * as React from "react";

/** Surface container. Elevation in this system is a step up the ink ramp
 *  plus a hairline — there are NO drop shadows. In a row of three cards use
 *  `accent` once at most, then `card` and `strong` for the others. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  tone?: "raised" | "card" | "strong" | "accent" | "outline";
  padding?: string;
  radius?: string;
}
export function Card(props: CardProps): JSX.Element;
