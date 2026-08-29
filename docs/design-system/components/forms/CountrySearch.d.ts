import * as React from "react";

/**
 * Typeahead over all 214 grids — the product's primary navigation device, and
 * faster than any map for a reader who knows what they are looking for.
 * Keyboard-first: ArrowUp/Down move, Enter commits, Escape clears.
 *
 * Results show the mono ISO code, the country name, and its dominant fuel as
 * a badge plus swatch — so the list itself teaches the colour scale.
 *
 * @startingPoint section="Forms" subtitle="Country typeahead, keyboard-first" viewport="700x300"
 */
export interface CountrySearchProps extends React.HTMLAttributes<HTMLDivElement> {
  countries?: Array<{
    code: string;
    name: string;
    /** Dominant fuel label, e.g. "Wind". */
    fuel?: string;
    /** Matching fuel fill token, e.g. var(--fuel-wind). */
    color?: string;
  }>;
  onSelect?: (country: { code: string; name: string }) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Max results shown. 7 keeps the list scannable without scrolling. */
  limit?: number;
  emptyLabel?: string;
}
export function CountrySearch(props: CountrySearchProps): JSX.Element;
