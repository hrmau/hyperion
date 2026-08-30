import type { CSSProperties, HTMLAttributes } from 'react';
import { FUEL_FILL, FUEL_ORDER, type Fuel } from '@/lib/fuels';

export interface StackedAreaChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Percentage series per fuel, one entry per year, all the same length. */
  series: Partial<Record<Fuel, number[]>>;
  years: number[];
  height?: number;
  width?: number;
  radius?: string;
  separators?: boolean;
  well?: string;
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
 */
export function StackedAreaChart({
  series,
  years,
  height = 210,
  width = 480,
  radius = 'var(--r-well)',
  separators = true,
  well = 'var(--chart-well)',
  style,
  ...rest
}: StackedAreaChartProps) {
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

  return (
    <div style={{ position: 'relative', ...style }} {...rest}>
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
      </svg>
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
