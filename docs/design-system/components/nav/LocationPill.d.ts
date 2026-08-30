import * as React from "react";

/** States the detected country and always offers "change". Required wherever
 *  content is geolocated — never geolocate silently. */
export interface LocationPillProps extends React.HTMLAttributes<HTMLDivElement> {
  country: string;
  onChange?: () => void;
  label?: string;
}
export function LocationPill(props: LocationPillProps): JSX.Element;
