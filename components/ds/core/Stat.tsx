import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  note?: ReactNode;
  /** `down` is clay — the only warm colour, reserved for a metric moving the wrong way. */
  tone?: 'default' | 'accent' | 'down' | 'sage';
  size?: 'md' | 'lg';
  style?: CSSProperties;
}

/**
 * Label / big number / footnote. The unit of every readout row in the product.
 *
 * Every number carries a comparison — pass `note` with a rank, a world average
 * or a multiple. "34%" alone is noise; "34% — 2nd of 214" is information.
 */
export function Stat({
  label,
  value,
  unit,
  note,
  tone = 'default',
  size = 'md',
  style,
  ...rest
}: StatProps) {
  const color =
    tone === 'accent'
      ? 'var(--green)'
      : tone === 'down'
        ? 'var(--clay)'
        : tone === 'sage'
          ? 'var(--sage)'
          : 'var(--text-primary)';
  return (
    <div style={style} {...rest}>
      {label && (
        <Eyebrow
          style={{
            fontSize: 'var(--fs-mono-xxs)',
            letterSpacing: 'var(--ls-label)',
            marginBottom: 'var(--space-3)',
          }}
        >
          {label}
        </Eyebrow>
      )}
      <div
        style={{
          fontSize: size === 'lg' ? 'var(--fs-stat)' : 'var(--fs-stat-sm)',
          fontWeight: 'var(--fw-bold)' as CSSProperties['fontWeight'],
          letterSpacing: 'var(--ls-stat)',
          lineHeight: 'var(--lh-stat)',
          color,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 15,
              fontWeight: 'var(--fw-medium)' as CSSProperties['fontWeight'],
              color: 'var(--text-tertiary)',
              marginLeft: 'var(--space-2)',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {note && (
        <div
          style={{
            fontSize: 'var(--fs-caption)',
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-1)',
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}
