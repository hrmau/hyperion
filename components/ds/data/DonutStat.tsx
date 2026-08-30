import type { CSSProperties, HTMLAttributes } from 'react';

export interface DonutStatProps extends HTMLAttributes<HTMLDivElement> {
  /** 0-100. */
  value: number;
  label?: string;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
  style?: CSSProperties;
}

/**
 * Ring gauge for a single share. Used sparingly — two per view maximum, for
 * clean versus fossil. Anything more granular belongs in a MixBar.
 */
export function DonutStat({
  value,
  label,
  size = 120,
  thickness = 16,
  color = 'var(--green)',
  track = 'var(--chart-track)',
  style,
  ...rest
}: DonutStatProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ textAlign: 'center', ...style }} {...rest}>
      <div
        style={{
          width: size,
          height: size,
          margin: '0 auto',
          borderRadius: '50%',
          background: `conic-gradient(${color} 0 ${pct}%, ${track} ${pct}% 100%)`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            width: size - thickness * 2,
            height: size - thickness * 2,
            borderRadius: '50%',
            background: 'var(--bg-page)',
            display: 'grid',
            placeItems: 'center',
            lineHeight: 1.2,
          }}
        >
          <div>
            <div
              style={{
                fontSize: size * 0.19,
                fontWeight: 'var(--fw-bold)' as CSSProperties['fontWeight'],
                color,
              }}
            >
              {Math.round(pct)}
              <span style={{ fontSize: size * 0.1 }}>%</span>
            </div>
            {label && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-mono-xxs)',
                  letterSpacing: 'var(--ls-label)',
                  color: 'var(--text-label)',
                  marginTop: 3,
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
