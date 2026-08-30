import * as React from "react";

/**
 * The non-stacked chart types. All render plain SVG — this system has no
 * chart library, so nothing arrives styled by someone else's defaults.
 *
 * Picking the right one:
 * - **StackedAreaChart** — composition over time (the signature form).
 * - **LineChart** — levels over time, 1–4 series. Past four, the tamed
 *   palette runs out of separable values: use small multiples.
 * - **BarChart** — one series over discrete years or categories.
 * - **RankedBarList** — comparing countries (horizontal keeps names readable).
 * - **ScatterChart** — the correlation view; carries the product's central
 *   argument, so it always gets axis titles and a causation caveat nearby.
 * - **DiffBar** — exactly two grids on one measure.
 *
 * @startingPoint section="Charts" subtitle="Line, bar, scatter, diff" viewport="700x420"
 */

export interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series?: Array<{ label: string; values: number[]; color?: string; emphasis?: boolean; dashed?: boolean }>;
  ticks?: Array<string | number>;
  height?: number;
  width?: number;
  yMax?: number;
}
export function LineChart(props: LineChartProps): JSX.Element;

export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: Array<{ label: string; value: number; color?: string; emphasis?: boolean }>;
  height?: number;
}
export function BarChart(props: BarChartProps): JSX.Element;

export interface ScatterChartProps extends React.HTMLAttributes<HTMLDivElement> {
  points?: Array<{ label: string; x: number; y: number; color?: string }>;
  height?: number;
  width?: number;
  xLabel?: string;
  yLabel?: string;
  xMax?: number;
  yMax?: number;
  /** Log X is usually right for per-capita electricity — the spread is 327×. */
  logX?: boolean;
  /** Label of the point to emphasise, normally the visitor's own country. */
  highlight?: string;
}
export function ScatterChart(props: ScatterChartProps): JSX.Element;

export interface DiffBarProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  left: number;
  right: number;
  leftLabel?: string;
  rightLabel?: string;
  max?: number;
}
export function DiffBar(props: DiffBarProps): JSX.Element;
