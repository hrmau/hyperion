import * as React from "react";

/** Country / Explore page header — eyebrow, name, lead, and the standard
 *  three-stat row bracketed by hairlines. Keep to three or four stats; the
 *  rest belong in the profile below. */
export interface CountryHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  country: string;
  eyebrow?: string;
  stats?: Array<{ label: string; value: React.ReactNode; unit?: string; note?: string; tone?: "default" | "accent" | "sage" | "down" }>;
  children?: React.ReactNode;
}
export function CountryHeader(props: CountryHeaderProps): JSX.Element;
