'use client';

import { useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { FUEL_FILL, FUEL_LABEL, needsOutline, type Fuel } from '@/lib/fuels';

export interface MixBarShare {
  fuel: Fuel;
  /** Percentage of the mix. Zero-value fuels are dropped. */
  pct: number;
}

export interface MixBarProps extends HTMLAttributes<HTMLDivElement> {
  shares: MixBarShare[];
  height?: number;
  radius?: number;
  /** Bands are separated by a gap, not a stroke — see the chart rules. */
  gap?: number;
  /**
   * Set false where the bar is a dense repeated cell. It drops the readout, the
   * focus stop and the dimming, and restores the native `title` — a 200-row
   * table should not add 200 tab stops to reach the pagination below it.
   */
  interactive?: boolean;
  /**
   * Caption for the bar, rendered inside the reserved readout lane.
   *
   * A caller that puts its own label above the bar leaves the lane empty and
   * ends up with 38px between the label and the thing it names, which on
   * /compare was more than twice the 16px between one bar and the next label -
   * so each label read as belonging to the bar above it. Passing it here puts
   * it directly on top of its own bar and uses space already reserved.
   *
   * It shares the lane with the readout and gives way to it: while the pointer
   * is on a band the chip says which fuel, and the pointer itself says which
   * bar. They are never shown at once, so nothing overlaps.
   */
  caption?: ReactNode;
  style?: CSSProperties;
}

/**
 * Single-row 100% stacked bar — the compact form of the mix, for table rows,
 * country panels and comparison strips.
 *
 * Bands are always in canonical fuel order. Coal and oil carry a hairline
 * outline because they are near-black on a near-black page.
 *
 * A client component, but the bands themselves are still server-rendered: the
 * whole bar is in the HTML on first paint and the hover layer only adds
 * behaviour on top of markup that already exists.
 *
 * **The readout is the point, not a flourish.** Eight fuels drawn from one cold
 * ramp are five greys and three greens, and a reader cannot get from a band back
 * to its legend entry by colour alone — that is the ramp working as designed for
 * comparability, and it is exactly why the bar needs to name its own bands. On
 * `/compare` there is no legend beside it at all.
 *
 * Two behaviours do that naming. Hovering names the band under the pointer, and
 * dims the rest, which matters most for the slivers: China's oil is 0.8%, which
 * in a 900px bar is seven pixels, and dimming is the only way to be sure which
 * seven. And the arrow keys walk band to band, because a sliver you cannot
 * reliably hit with a mouse is one nobody can read without them.
 *
 * The readout gets a **reserved lane** above the bar rather than floating over
 * whatever is there. Floating is the usual answer and it was the first one here,
 * but it put the chip on top of the "Energy mix · 2025" eyebrow on /rankings —
 * and this system has no shadows, so a panel over text reads as a collision
 * rather than as elevation. Reserving the space costs `READOUT_LANE` above every
 * interactive bar and buys back a layout that cannot shift or overlap on hover.
 */

/** Measured chip height (31px) plus a gap. A constant, so the lane cannot shift. */
const READOUT_LANE = 38;
export function MixBar({
  shares,
  height = 16,
  radius = 0,
  gap = 1,
  interactive = true,
  caption,
  style,
  ...rest
}: MixBarProps) {
  const [active, setActive] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const bands = shares.filter((s) => s.pct > 0);
  const total = bands.reduce((sum, b) => sum + b.pct, 0);

  if (!bands.length) return null;

  /**
   * Which band sits under this x. Walks the cumulative widths rather than
   * relying on the band elements' own hit areas: the two agree, but this also
   * answers for the 1px gaps between them, which otherwise blank the readout
   * every time the pointer crosses a boundary.
   */
  const indexFromClientX = (clientX: number): number | null => {
    const box = frameRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || total === 0) return null;
    const ratio = Math.max(0, Math.min(1, (clientX - box.left) / box.width));
    let seen = 0;
    for (let i = 0; i < bands.length; i++) {
      seen += bands[i].pct / total;
      if (ratio <= seen) return i;
    }
    return bands.length - 1;
  };

  const step = (delta: number) =>
    setActive((prev) => {
      const next = (prev ?? 0) + delta;
      return Math.max(0, Math.min(bands.length - 1, next));
    });

  const current = active == null ? null : bands[active];

  /**
   * Anchor the readout at the middle of the active band, and flip it past the
   * two-thirds mark so it never runs off the right edge of a narrow strip.
   */
  const centreRatio =
    active == null
      ? 0
      : bands.slice(0, active).reduce((sum, b) => sum + b.pct, 0) / total +
        bands[active].pct / total / 2;
  const flip = centreRatio > 0.66;

  const label = `Generation mix by fuel: ${bands
    .map((b) => `${FUEL_LABEL[b.fuel]} ${b.pct.toFixed(1)}%`)
    .join(', ')}. Use the arrow keys to read each band.`;

  return (
    <div
      ref={frameRef}
      style={{ position: 'relative', paddingTop: interactive ? READOUT_LANE : 0, ...style }}
      {...rest}
    >
      <div
        style={{
          display: 'flex',
          height,
          borderRadius: radius,
          overflow: 'hidden',
          cursor: interactive ? 'crosshair' : undefined,
          outline: 'none',
        }}
        {...(interactive
          ? {
              tabIndex: 0,
              role: 'application' as const,
              'aria-label': label,
              onMouseMove: (e: React.MouseEvent) => setActive(indexFromClientX(e.clientX)),
              onMouseLeave: () => setActive(null),
              onTouchStart: (e: React.TouchEvent) => setActive(indexFromClientX(e.touches[0].clientX)),
              onTouchMove: (e: React.TouchEvent) => setActive(indexFromClientX(e.touches[0].clientX)),
              onTouchEnd: () => setActive(null),
              onFocus: () => setActive((p) => p ?? 0),
              onBlur: () => setActive(null),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
                if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
                if (e.key === 'Home') { e.preventDefault(); setActive(0); }
                if (e.key === 'End') { e.preventDefault(); setActive(bands.length - 1); }
                if (e.key === 'Escape') setActive(null);
              },
            }
          : {})}
      >
        {bands.map((b, i) => (
          <div
            key={b.fuel}
            // Only when there is no readout to say it better. A native tooltip
            // takes a second to appear and cannot be reached without a mouse.
            title={interactive ? undefined : `${FUEL_LABEL[b.fuel]} ${b.pct.toFixed(1)}%`}
            style={{
              flex: b.pct,
              background: FUEL_FILL[b.fuel],
              marginLeft: i === 0 ? 0 : gap,
              outline: needsOutline(b.fuel) ? '1px solid var(--line-soft)' : undefined,
              opacity: active == null || active === i ? 1 : 0.35,
              transition: 'opacity var(--dur-fast) var(--ease-out)',
            }}
          />
        ))}
      </div>

      {caption && interactive && !current && (
        <div
          style={{
            /*
             * Pinned to the lane and aligned to its foot, so the caption sits
             * just above the bar it names rather than floating midway between
             * two of them.
             *
             * Not `bottom: 0`: an absolutely positioned child resolves that
             * against the frame's padding box, which runs past the lane and
             * under the bar - the first attempt put the name on top of the
             * bands, overlapping by 14px.
             */
            position: 'absolute',
            left: 0,
            top: 0,
            height: READOUT_LANE,
            display: 'flex',
            alignItems: 'flex-end',
            paddingBottom: 'var(--space-3)',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono-xxs)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--text-label)',
            pointerEvents: 'none',
          }}
        >
          {caption}
        </div>
      )}

      {current && (
        <div
          role="status"
          style={{
            // top: 0 is the top of the padding box, which is the reserved lane.
            position: 'absolute',
            top: 0,
            [flip ? 'right' : 'left']: `calc(${
              flip ? 100 - centreRatio * 100 : centreRatio * 100
            }% - var(--space-5))`,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            whiteSpace: 'nowrap',
            padding: 'var(--space-2) var(--space-5)',
            borderRadius: 'var(--r-well)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-card-strong)',
            pointerEvents: 'none',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              flexShrink: 0,
              background: FUEL_FILL[current.fuel],
              outline: needsOutline(current.fuel) ? '1px solid var(--border-default)' : undefined,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            {FUEL_LABEL[current.fuel]}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              color: 'var(--text-primary)',
            }}
          >
            {current.pct.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
