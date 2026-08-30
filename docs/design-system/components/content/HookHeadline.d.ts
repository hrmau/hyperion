import * as React from "react";

/** The hook: 60px, tight tracking, ~17ch measure, two of the visitor's own
 *  numbers in tension. The tinted figure must match the fuel band it refers
 *  to — tinting a gas figure with the "other" colour points at the wrong
 *  band and is a correctness bug, not a style choice.
 *
 * @startingPoint section="Content" subtitle="Geolocated hero headline" viewport="700x180"
 */
export interface HookHeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Full custom markup; overrides lead/highlight/tail. */
  children?: React.ReactNode;
  lead?: string;
  /** The measured figure, e.g. "42%". */
  highlight?: string;
  /** Text-safe fuel token for the figure, e.g. var(--fuel-gas-ink).
   *  Must be an *-ink token — chart fills fail contrast as text. */
  highlightTone?: string;
  tail?: string;
}
export function HookHeadline(props: HookHeadlineProps): JSX.Element;
