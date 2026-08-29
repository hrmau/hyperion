import * as React from "react";

/** Single-line mono footer. Sources are non-negotiable — every page states
 *  its provenance. Keep it to one line at desktop, two at mobile. */
export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  sources?: string;
  links?: string[];
  /** Right-aligned reassurance or byline. */
  note?: string;
}
export function Footer(props: FooterProps): JSX.Element;
