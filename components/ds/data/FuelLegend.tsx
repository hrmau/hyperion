import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { FUEL_FILL, FUEL_LABEL, needsOutline, type Fuel } from '@/lib/fuels';

export interface FuelLegendEntry {
  fuel: Fuel;
  /** Rendered verbatim beside the label — a percentage, a count, anything. */
  value?: ReactNode;
}

export interface FuelLegendProps extends HTMLAttributes<HTMLDivElement> {
  shares: FuelLegendEntry[];
  layout?: 'row' | 'column';
  style?: CSSProperties;
}

/**
 * Legend chips carry each band's EXACT fill; the label text stays neutral.
 *
 * Never tint a label to a lightened version of its band — adjacent fuels in
 * this ramp are too close in value to survive it, and the lightened labels all
 * collapse into one grey. The design system calls that a correctness bug, not
 * a style preference.
 */
export function FuelLegend({ shares, layout = 'row', style, ...rest }: FuelLegendProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: layout === 'column' ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: layout === 'column' ? 'var(--space-3)' : 'var(--space-6)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-mono-xs)',
        textTransform: 'uppercase',
        ...style,
      }}
      {...rest}
    >
      {shares.map(({ fuel, value }) => (
        <span
          key={fuel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              flex: 'none',
              background: FUEL_FILL[fuel],
              outline: needsOutline(fuel) ? '1px solid var(--line-strong)' : undefined,
            }}
          />
          {FUEL_LABEL[fuel]}
          {value != null && ' '}
          {value}
        </span>
      ))}
    </div>
  );
}
