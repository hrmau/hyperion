import * as React from "react";

/** Story chapter entry — zero-padded number, optional year, title, one line
 *  of support. Chapters are sequential; always show the number. */
export interface ChapterCardProps extends React.HTMLAttributes<HTMLDivElement> {
  number: number | string;
  title: React.ReactNode;
  children?: React.ReactNode;
  year?: string;
  tone?: "card" | "strong" | "outline";
}
export function ChapterCard(props: ChapterCardProps): JSX.Element;
