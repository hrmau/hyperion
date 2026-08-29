import * as React from "react";

/**
 * The full site footer: link columns, a labelled data-provenance block with
 * per-source vintages, and the licence line.
 *
 * This product's credibility rests on provenance, so sources are NOT fine
 * print — they get their own block, each with the years it covers. Never ship
 * a Grid Gorilla content page whose footer does not name its sources.
 *
 * Use the one-line `Footer` instead only on app-like screens (Play, embeds).
 *
 * @startingPoint section="Navigation" subtitle="Full site footer with provenance" viewport="1280x420"
 */
export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  columns?: Array<{ label: string; links: string[] }>;
  /** Each source with the range it actually covers. */
  sources?: Array<{ name: string; detail: string }>;
  vintage?: string;
  licence?: string;
  note?: string;
  mark?: string;
}
export function SiteFooter(props: SiteFooterProps): JSX.Element;
