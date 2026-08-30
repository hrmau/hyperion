import type { CSSProperties, HTMLAttributes } from 'react';
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
  style?: CSSProperties;
}

/**
 * Single-row 100% stacked bar — the compact form of the mix, for table rows,
 * country panels and comparison strips.
 *
 * Bands are always in canonical fuel order. Coal and oil carry a hairline
 * outline because they are near-black on a near-black page.
 */
export function MixBar({ shares, height = 16, radius = 0, gap = 1, style, ...rest }: MixBarProps) {
  const bands = shares.filter((s) => s.pct > 0);
  if (!bands.length) return null;

  return (
    <div
      style={{ display: 'flex', height, borderRadius: radius, overflow: 'hidden', ...style }}
      {...rest}
    >
      {bands.map((b, i) => (
        <div
          key={b.fuel}
          title={`${FUEL_LABEL[b.fuel]} ${b.pct.toFixed(1)}%`}
          style={{
            flex: b.pct,
            background: FUEL_FILL[b.fuel],
            marginLeft: i === 0 ? 0 : gap,
            outline: needsOutline(b.fuel) ? '1px solid var(--line-soft)' : undefined,
          }}
        />
      ))}
    </div>
  );
}
