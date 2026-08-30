import * as React from "react";

/** Chart legend. Swatches carry the band's exact fill; labels are neutral
 *  grey. Coal and oil chips get a hairline outline so they read on the dark
 *  page. Order must match the chart's stacking order. */
export interface FuelLegendProps extends React.HTMLAttributes<HTMLDivElement> {
  shares: Array<{ fuel: "wind" | "solar" | "other" | "hydro" | "nuclear" | "gas" | "oil" | "coal"; value: number | string }>;
  layout?: "row" | "column";
}
export function FuelLegend(props: FuelLegendProps): JSX.Element;
