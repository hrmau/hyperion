import * as React from "react";

/**
 * Form controls. Every text-entry control is a dark well (`--ink-800`) with a
 * hairline that turns green on focus — there are no filled-grey inputs and no
 * floating labels: labels sit above in mono, like every other label in this
 * system. Minimum control height is 44px everywhere, not just on touch.
 *
 * Checked states (checkbox, radio, switch) are the one place a form control
 * uses the accent green: in this product "on" and "clean" are the same idea.
 * Errors use `--clay`, the system's only warm colour.
 *
 * `RangeSlider` is the one control styled from a stylesheet rather than inline
 * (`.gg-range` in `tokens/controls.css`): its track and thumb are vendor
 * pseudo-elements, which a style object cannot reach. Its 44px box and drawn
 * thumb live there — never re-set `height` on the input.
 *
 * @startingPoint section="Forms" subtitle="Inputs, select, checkbox, radio, switch, slider" viewport="700x420"
 */

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mono uppercase label above the control. */
  label?: string;
  /** Quiet helper text below. Replaced by `error` when that is set. */
  hint?: string;
  /** Error message; also switches the control's border to clay. */
  error?: string;
  htmlFor?: string;
  children?: React.ReactNode;
}
/** Label + control + hint/error wrapper. Wrap every input in one. */
export function Field(props: FieldProps): JSX.Element;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Mono glyph or short string rendered inside the well, e.g. "⌕". */
  iconLeft?: React.ReactNode;
}
export function Input(props: InputProps): JSX.Element;

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}
export function Textarea(props: TextareaProps): JSX.Element;

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<string | { value: string; label: string }>;
  invalid?: boolean;
}
/** Native select with system chrome. For 6+ options prefer this over pills. */
export function Select(props: SelectProps): JSX.Element;

export interface ToggleProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
}
export function Checkbox(props: ToggleProps): JSX.Element;
export function Radio(props: ToggleProps): JSX.Element;

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}
/** For settings that apply immediately. If it needs a Save button, use Checkbox.
 *  The whole row is one 44px button — the label text is part of the hit target,
 *  not a <label> wrapper (a <label> cannot drive a <button>). */
export function Switch(props: SwitchProps): JSX.Element;

export interface RangeSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number; max?: number; step?: number;
  value: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  format?: (value: number) => string;
}
export function RangeSlider(props: RangeSliderProps): JSX.Element;

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
  children?: React.ReactNode;
}
/** Groups related checkboxes or radios under a mono legend. */
export function Fieldset(props: FieldsetProps): JSX.Element;
