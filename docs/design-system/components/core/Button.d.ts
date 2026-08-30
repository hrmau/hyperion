import * as React from "react";

/**
 * The action control. Exactly one `primary` per view; `accent` is reserved
 * for the single green call-to-action (the quiz, the story) and must never
 * appear twice on one screen.
 *
 * @startingPoint section="Core" subtitle="Primary, secondary, accent, ghost" viewport="700x150"
 */
export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  /** primary = inverse fill · secondary = hairline · accent = brand green */
  variant?: "primary" | "secondary" | "accent" | "onAccent" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Render as an anchor when the action navigates. */
  as?: "button" | "a";
}
export function Button(props: ButtonProps): JSX.Element;
