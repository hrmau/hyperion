import * as React from "react";

/** The Play hook. Green card, two answers, and a "% get this wrong" line —
 *  that stat is the hook, so never ship the card without it. Personalise one
 *  option to the detected country wherever possible. */
export interface QuizCardProps extends React.HTMLAttributes<HTMLDivElement> {
  question: React.ReactNode;
  options?: string[];
  onAnswer?: (option: string) => void;
  /** e.g. "58% of Irish visitors get this wrong." */
  footnote?: string;
  eyebrow?: string;
}
export function QuizCard(props: QuizCardProps): JSX.Element;
