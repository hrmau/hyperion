'use client';

import { useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { FUEL_FILL, FUEL_LABEL, FUEL_ORDER, needsOutline, type Fuel } from '@/lib/fuels';

export interface StackedAreaChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Percentage series per fuel, one entry per year, all the same length. */
  series: Partial<Record<Fuel, number[]>>;
  years: number[];
  height?: number;
  width?: number;
  radius?: string;
  separators?: boolean;
  well?: string;
  /** Set false for a purely decorative instance. */
  interactive?: boolean;
  style?: CSSProperties;
}

/**
 * 100% stacked area — the signature chart of the product, hand-rolled SVG with
 * no library.
 *
 * Two rules that are not cosmetic. Bands stack in canonical fuel order, always,
 * so the transition reads as a rising band and shapes stay comparable between
 * countries. And boundaries are drawn as a 1.4px stroke in the *well* colour,
 * not a grey: adjacent tones in this tamed ramp bleed together without it, and
 * a coloured stroke would read as another band.
 *
 * A client component, but still server-rendered: forty years of bands are in the
 * HTML on first paint, which is what makes the country pages worth publishing.
 * The hover layer only adds behaviour on top of markup that already exists.
 *
 * Reading a shape is not the same as reading a year. Without a readout the chart
 * says "wind grew" and nothing else — you cannot tell what any particular year
 * held. The guide line answers where you are and the panel answers what was true
 * there. Keyboard-operable too: the chart takes focus and arrow keys walk the
 * years, because a mouse-only readout hides the numbers from anyone not using
 * one.
 */
export function StackedAreaChart({
  series,
  years,
  height = 210,
  width = 480,
  radius = 'var(--r-well)',
  separators = true,
  well = 'var(--chart-well)',
  interactive = true,
  style,
  ...rest
}: StackedAreaChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const bands = FUEL_ORDER.filter((f) => series[f]?.some((v) => v > 0)).map((f) => ({
    fuel: f,
    values: series[f]!,
  }));

  const n = bands[0]?.values.length ?? 0;
  if (n < 2) return null;

  const x = (i: number) => (i / (n - 1)) * width;

  // Normalise each column to 100 so rounding in the source data cannot leave a
  // sliver of well colour along the top of the stack.
  const totals = Array.from({ length: n }, (_, i) =>
    bands.reduce((sum, b) => sum + (b.values[i] || 0), 0)
  );
  const normalised = bands.map((b) =>
    b.values.map((v, i) => (totals[i] > 0 ? ((v || 0) / totals[i]) * 100 : 0))
  );

  // Cumulative tops are derived per band rather than accumulated into a
  // reassigned variable — the React compiler rejects mutation during render,
  // and with eight fuels the cost of recomputing is nothing.
  const paths = bands.map((band, k) => {
    const top = normalised
      .slice(0, k)
      .reduce<number[]>((acc, s) => acc.map((v, i) => v + s[i]), new Array(n).fill(0));
    const bottom = top.map((v, i) => v + normalised[k][i]);
    const edge = bottom.map((v, i) => `${x(i)},${(v / 100) * height}`);
    return {
      fuel: band.fuel,
      points: [
        ...top.map((v, i) => `${x(i)},${(v / 100) * height}`),
        ...edge.slice().reverse(),
      ].join(' '),
      edge: edge.join(' '),
    };
  });

  const indexFromClientX = (clientX: number) => {
    const box = frameRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return null;
    const ratio = (clientX - box.left) / box.width;
    return Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
  };

  const step = (delta: number) =>
    setActive((prev) => {
      const next = (prev ?? n - 1) + delta;
      return Math.max(0, Math.min(n - 1, next));
    });

  const activeShares =
    active == null
      ? []
      : bands
          .map((b, k) => ({ fuel: b.fuel, pct: normalised[k][active] }))
          .filter((d) => d.pct >= 0.5);

  // Flip the panel to the other side near the right edge so it never hangs off.
  const activeRatio = active == null ? 0 : active / (n - 1);
  const flip = activeRatio > 0.6;

  return (
    <div style={{ position: 'relative', ...style }} {...rest}>
      <div
        ref={frameRef}
        style={{ position: 'relative', cursor: interactive ? 'crosshair' : 'default' }}
        {...(interactive
          ? {
              tabIndex: 0,
              role: 'application' as const,
              'aria-label': `Generation mix by fuel, ${years[0]} to ${years[years.length - 1]}. Use the arrow keys to read a year.`,
              onMouseMove: (e: React.MouseEvent) => setActive(indexFromClientX(e.clientX)),
              onMouseLeave: () => setActive(null),
              onTouchStart: (e: React.TouchEvent) => setActive(indexFromClientX(e.touches[0].clientX)),
              onTouchMove: (e: React.TouchEvent) => setActive(indexFromClientX(e.touches[0].clientX)),
              onTouchEnd: () => setActive(null),
              onFocus: () => setActive((p) => p ?? n - 1),
              onBlur: () => setActive(null),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
                if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
                if (e.key === 'Home') { e.preventDefault(); setActive(0); }
                if (e.key === 'End') { e.preventDefault(); setActive(n - 1); }
                if (e.key === 'Escape') setActive(null);
              },
            }
          : {})}
      >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height, borderRadius: radius, overflow: 'hidden', background: well }}
        aria-hidden="true"
      >
        {paths.map((p) => (
          <polygon key={p.fuel} points={p.points} fill={FUEL_FILL[p.fuel]} />
        ))}
        {separators &&
          paths.slice(0, -1).map((p) => (
            <polyline
              key={`${p.fuel}-sep`}
              points={p.edge}
              fill="none"
              stroke="var(--chart-sep)"
              strokeWidth="var(--chart-sep-width)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        {active != null && (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={0}
            y2={height}
            stroke="var(--paper)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            opacity="0.85"
          />
        )}
      </svg>

      {active != null && activeShares.length > 0 && (
        <div
          role="status"
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            [flip ? 'right' : 'left']: `calc(${flip ? 100 - activeRatio * 100 : activeRatio * 100}% + var(--space-4))`,
            zIndex: 2,
            minWidth: 132,
            padding: 'var(--space-4)',
            borderRadius: 'var(--r-card)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-card-strong, var(--bg-card))',
            pointerEvents: 'none',
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              color: 'var(--text-quiet)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {years[active]}
          </div>
          {activeShares.map((d) => (
            <div
              key={d.fuel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                fontSize: 'var(--fs-ui)',
                lineHeight: 1.7,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  flexShrink: 0,
                  background: FUEL_FILL[d.fuel],
                  outline: needsOutline(d.fuel) ? '1px solid var(--border-default)' : undefined,
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>{FUEL_LABEL[d.fuel]}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              >
                {Math.round(d.pct)}%
              </span>
            </div>
          ))}
        </div>
      )}
      </div>
      {years.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 'var(--space-3)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono-xxs)',
            color: 'var(--chart-axis-text)',
          }}
        >
          <span>{years[0]}</span>
          <span>{years[years.length - 1]}</span>
        </div>
      )}
    </div>
  );
}
