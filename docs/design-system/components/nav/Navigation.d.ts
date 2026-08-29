import * as React from "react";

/**
 * Navigation patterns beyond the global nav.
 *
 * The one distinction to hold onto: **Tabs change the VIEW, Pills change the
 * DATASET.** A tab row switches between Mix / Rankings / Sources for the same
 * country; a pill row redraws the same chart for World / EU / China. Keeping
 * those affordances visually separate (underline vs. filled pill) is the
 * reason both exist — never swap them.
 *
 * @startingPoint section="Navigation" subtitle="Tabs, segmented, breadcrumbs, pagination, TOC" viewport="700x420"
 */

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: Array<string | { value: string; label: string; count?: number }>;
  active?: string;
  onChange?: (value: string) => void;
}
export function Tabs(props: TabsProps): JSX.Element;

export interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 2–4 short options. More than four belongs in a Select. */
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
}
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items?: Array<{ label: string; href?: string }>;
}
export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;

export function BackLink(props: { children?: React.ReactNode; href?: string; onClick?: (e: React.MouseEvent) => void }): JSX.Element;

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  page?: number;
  pages?: number;
  onChange?: (page: number) => void;
}
/** For tables past ~50 rows. Current page is an inverse fill, matching every
 *  other selected state in the system. */
export function Pagination(props: PaginationProps): JSX.Element;

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  items?: Array<{ id: string; label: string }>;
  active?: string;
  onSelect?: (id: string) => void;
  label?: string;
}
/** Sticky sidebar for Story chapters and methodology. The active marker is
 *  the one place green moves during a long read. */
export function TableOfContents(props: TableOfContentsProps): JSX.Element;

export interface NextPrevProps extends React.HTMLAttributes<HTMLDivElement> {
  prev?: { label: string; href?: string };
  next?: { label: string; href?: string };
}
export function NextPrev(props: NextPrevProps): JSX.Element;

/** Required as the first element of every page. */
export function SkipLink(props: { href?: string; children?: React.ReactNode }): JSX.Element;
