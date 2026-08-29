import * as React from "react";

/**
 * Status, feedback and non-data states.
 *
 * House rules for this group:
 * - **Say what happened in a sentence.** No "Oops", no shrug illustrations,
 *   no error codes as headlines.
 * - **Skeletons do not shimmer.** Shimmer implies progress the app cannot
 *   promise, and this system has no decorative motion.
 * - **Loading placeholders occupy the final height** so the page never jumps.
 * - Most notices in this product are about the DATA (a stale vintage, a known
 *   gap for one country), not the app — write them that way.
 *
 * @startingPoint section="Feedback" subtitle="Banner, toast, tooltip, empty, error, skeleton" viewport="700x420"
 */

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** info = neutral · accent = green · caution = clay (the only warm colour). */
  tone?: "info" | "accent" | "caution";
  /** Mono uppercase kicker, e.g. "DATA VINTAGE". */
  label?: string;
  children?: React.ReactNode;
  /** A single Button, usually secondary. */
  action?: React.ReactNode;
  onDismiss?: () => void;
}
export function Banner(props: BannerProps): JSX.Element;

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  tone?: "info" | "accent";
}
/** Transient confirmation. Bottom-LEFT, so it never covers nav or a legend.
 *  Never for errors that require a decision — use Banner. */
export function Toast(props: ToastProps): JSX.Element;

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Short; mono, so exact figures read as data. Never contains an action. */
  label: string;
  children?: React.ReactNode;
  side?: "top" | "bottom" | "right";
}
export function Tooltip(props: TooltipProps): JSX.Element;

export interface DefinedTermProps {
  term: React.ReactNode;
  definition: string;
}
/** Dotted-underline glossary term — the affordance for jargon like capacity
 *  factor, load, or TWh. Use on first mention per page, not every mention. */
export function DefinedTerm(props: DefinedTermProps): JSX.Element;

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  children?: React.ReactNode;
  onRetry?: () => void;
}
export function ErrorState(props: ErrorStateProps): JSX.Element;

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: number;
}
export function Skeleton(props: SkeletonProps): JSX.Element;

export interface ChartSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Match the real chart's height exactly. */
  height?: number;
}
export function ChartSkeleton(props: ChartSkeletonProps): JSX.Element;

export function Spinner(props: { size?: number } & React.HTMLAttributes<HTMLSpanElement>): JSX.Element;

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
}
export function ProgressBar(props: ProgressBarProps): JSX.Element;
