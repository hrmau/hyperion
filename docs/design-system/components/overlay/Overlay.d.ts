import * as React from "react";

/**
 * Layered surfaces. Two system-wide rules:
 *
 * 1. **The scrim is a flat ink wash, never a backdrop blur.** Blur is banned
 *    across this system — it destroys the legibility of chart colours sitting
 *    behind the panel.
 * 2. **Escape always closes, and the scrim is always clickable.** A reader
 *    must never be trapped in a panel.
 *
 * @startingPoint section="Overlays" subtitle="Modal, drawer, popover, menu" viewport="700x420"
 */

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  eyebrow?: string;
  children?: React.ReactNode;
  /** Action row, right-aligned, above a hairline. */
  footer?: React.ReactNode;
  width?: number;
}
/** Centred panel for a focused task (country picker, share, methodology).
 *  If the reader may want it open *beside* a chart, use a Drawer or a page. */
export function Modal(props: ModalProps): JSX.Element | null;

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  /** right on desktop; bottom is the mobile filter pattern. */
  side?: "right" | "bottom";
  children?: React.ReactNode;
  width?: number;
}
export function Drawer(props: DrawerProps): JSX.Element | null;

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  align?: "left" | "right";
  width?: number;
}
/** Anchored panel — requires a `position: relative` parent. Not a nav
 *  pattern: the global nav is five flat destinations by design. */
export function Popover(props: PopoverProps): JSX.Element | null;

export interface MenuItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  selected?: boolean;
  /** Mono right-hand value, e.g. a count or shortcut. */
  meta?: string;
}
export function MenuItem(props: MenuItemProps): JSX.Element;
