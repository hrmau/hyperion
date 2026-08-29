import * as React from "react";

/** Year timeline under the hero chart. Ticks are real data years only —
 *  never interpolate labels the dataset does not have. Keep the selected year
 *  and every dependent readout in sync; a stale readout beside a moved handle
 *  is the most damaging bug in this product.
 *
 *  Styling comes from `.gg-range` in `tokens/controls.css` — a 44px hit target
 *  with an explicitly drawn 18px thumb. Do not override `height`: after
 *  `appearance: none` WebKit stops painting its default thumb, so the handle is
 *  ours to draw. */
export interface YearScrubberProps extends React.HTMLAttributes<HTMLDivElement> {
  years: Array<string | number>;
  value: string | number;
  onChange?: (year: string | number) => void;
}
export function YearScrubber(props: YearScrubberProps): JSX.Element;
