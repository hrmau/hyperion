import * as React from "react";

/**
 * Long-form content: Story chapters, Why, methodology, glossary, about.
 *
 * Typography for prose lives in `tokens/prose.css` under `.gg-prose` and
 * targets ELEMENTS, not classes — an author writing markdown gets correct
 * styling without touching a class name. Wrap the body in `<Prose>` and write
 * plain `<p>`, `<h2>`, `<ul>`, `<blockquote>`.
 *
 * Measure is 68ch. Anything wider than the text column (charts, pull quotes,
 * takeaway boxes) carries `className="bleed"` to escape it — the components
 * below already do.
 *
 * @startingPoint section="Content" subtitle="Article header, prose, figures, data note" viewport="820x600"
 */

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}
/** Wrapper for markdown-shaped content. Give the opening paragraph
 *  `className="lede"` and wrap inline figures in `<span className="num">`. */
export function Prose(props: ProseProps): JSX.Element;

export interface ArticleHeaderProps extends React.HTMLAttributes<HTMLElement> {
  kicker?: string;
  title: React.ReactNode;
  /** One-sentence standfirst. 52ch measure. */
  standfirst?: string;
  byline?: string;
  readingTime?: string;
  updated?: string;
  /** e.g. "Chapter 03". */
  chapter?: string;
}
export function ArticleHeader(props: ArticleHeaderProps): JSX.Element;

export interface PullQuoteProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  attribution?: string;
}
/** No quotation marks, no italics — the size change is the emphasis. */
export function PullQuote(props: PullQuoteProps): JSX.Element;

export interface FigureProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  caption?: string;
  /** Mono source line. A chart in an article without one is not publishable. */
  source?: string;
  bleed?: boolean;
}
export function Figure(props: FigureProps): JSX.Element;

export interface CalloutProps extends React.HTMLAttributes<HTMLElement> {
  label?: string;
  children?: React.ReactNode;
  tone?: "default" | "accent" | "caution";
}
export function Callout(props: CalloutProps): JSX.Element;

export interface KeyTakeawaysProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 3–5 standalone sentences. Journalists lift these verbatim. */
  items?: string[];
  label?: string;
}
export function KeyTakeaways(props: KeyTakeawaysProps): JSX.Element;

export interface DataNoteProps extends React.HTMLAttributes<HTMLElement> {
  sources?: string[];
  method?: string;
  /** State what the data cannot tell you. Mandatory, not optional. */
  caveat?: string;
  updated?: string;
  label?: string;
}
/** Closes any page carrying figures. This is where the product earns trust —
 *  never ship a country or article page without one. */
export function DataNote(props: DataNoteProps): JSX.Element;
