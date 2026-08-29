import * as React from "react";

/** The product's only global navigation. Five destinations, wordmark left,
 *  data vintage or location pill right. Below 900px collapse `items` into a
 *  horizontal scroller; below 640px into a bottom bar.
 *
 * @startingPoint section="Navigation" subtitle="Global nav with location pill" viewport="700x90"
 */
export interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: string[];
  active?: string;
  onNavigate?: (item: string) => void;
  wordmark?: string;
  mark?: string;
  /** Mono right-hand meta, e.g. "214 countries · 1985 → 2026". */
  meta?: string;
  /** Detected country name — renders the geolocation pill. */
  location?: string;
  onChangeLocation?: () => void;
  bordered?: boolean;
}
export function TopNav(props: TopNavProps): JSX.Element;
