import type { CSSProperties, HTMLAttributes } from 'react';

export interface MapLegendProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  min?: string;
  max?: string;
  /** Show the no-data swatch. Always true on this map — coverage is uneven. */
  noData?: boolean;
  /**
   * Number of ramp stops the map is actually using. Measures that are not
   * about cleanliness drop the green top stop, and the legend must drop it
   * too — a gradient showing a colour the map never paints is a lie.
   */
  stops?: number;
  style?: CSSProperties;
}

const mono: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono-xs)',
  color: 'var(--text-tertiary)',
};

export function MapLegend({
  label,
  min = '0%',
  max = '100%',
  noData = true,
  stops = 7,
  style,
  ...rest
}: MapLegendProps) {
  const ramp = Array.from({ length: stops }, (_, i) => `var(--scale-${i + 1})`).join(', ');
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        flexWrap: 'wrap',
        ...style,
      }}
      {...rest}
    >
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono-xxs)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--text-label)',
          }}
        >
          {label}
        </span>
      )}
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={mono}>{min}</span>
        <span
          style={{
            width: 160,
            height: 10,
            background: `linear-gradient(90deg, ${ramp})`,
          }}
        />
        <span style={mono}>{max}</span>
      </span>
      {noData && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            ...mono,
            color: 'var(--text-quiet)',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{ width: 10, height: 10, background: 'var(--ink-700)', outline: '1px solid var(--line)' }}
          />
          No data
        </span>
      )}
    </div>
  );
}
