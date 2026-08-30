import * as React from "react";

/** Mono uppercase section label. Introduces every band, stat and chart.
 *  `tone="accent"` turns it green — use only when the section is the hook. */
export interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  tone?: "quiet" | "accent";
  /** Blinking green dot for live/geolocated content. */
  dot?: boolean;
}
export function Eyebrow(props: EyebrowProps): JSX.Element;
