import type { CSSProperties, HTMLAttributes } from 'react';

export interface RankedBarItem {
  label: string;
  value: number;
  /** Pre-formatted value; falls back to a localised number. */
  display?: string;
  /** `accent` marks the row the page is actually about. */
  tone?: 'default' | 'accent' | 'down' | 'sage';
}

export interface RankedBarListProps extends HTMLAttributes<HTMLDivElement> {
  items: RankedBarItem[];
  max?: number;
  labelWidth?: number;
  barHeight?: number;
  showRank?: boolean;
  style?: CSSProperties;
}

/**
 * Ranked horizontal bars. Bars are neutral by default; pass tone "accent" on
 * the row the page is about.
 *
 * The bar carries the ratio, which is the thing a pair of numbers cannot say
 * on its own — "89.6 vs 31.8" is arithmetic, a bar three times longer is a fact
 * you see before you read.
 */
export function RankedBarList({
  items,
  max,
  labelWidth = 78,
  barHeight = 9,
  showRank = false,
  style,
  ...rest
}: RankedBarListProps) {
  const top = max ?? Math.max(...items.map((i) => i.value), 0);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style }}
      {...rest}
    >
      {items.map((item, i) => {
        const color =
          item.tone === 'accent'
            ? 'var(--green)'
            : item.tone === 'down'
              ? 'var(--clay)'
              : item.tone === 'sage'
                ? 'var(--sage)'
                : 'var(--paper-a55)';
        return (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              fontSize: 'var(--fs-caption)',
            }}
          >
            {showRank && (
              <span
                style={{ fontFamily: 'var(--font-mono)', width: 22, color: 'var(--text-quiet)' }}
              >
                {i + 1}
              </span>
            )}
            <span style={{ width: labelWidth, flex: 'none', color: 'var(--text-primary)' }}>
              {item.label}
            </span>
            <div style={{ flex: 1, height: barHeight, background: 'var(--chart-track)' }}>
              <div
                style={{
                  width: `${top > 0 ? Math.max(0.4, (item.value / top) * 100) : 0}%`,
                  height: '100%',
                  background: color,
                  transition: 'width var(--dur-chart) var(--ease-out)',
                }}
              />
            </div>
            <span
              style={{
                width: 72,
                textAlign: 'right',
                flex: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-sm)',
                color: item.tone === 'accent' ? 'var(--green)' : 'var(--text-secondary)',
              }}
            >
              {item.display ?? item.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
