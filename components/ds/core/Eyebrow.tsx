import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface EyebrowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** `accent` tints green — reserve it for a live/geolocated label. */
  tone?: 'quiet' | 'accent';
  /** Blinking live-signal dot. */
  dot?: boolean;
  style?: CSSProperties;
}

/**
 * Mono, uppercase, wide-tracked section label. The workhorse of this system:
 * every band, stat and chart is introduced by one.
 */
export function Eyebrow({ children, tone = 'quiet', dot = false, style, ...rest }: EyebrowProps) {
  const color = tone === 'accent' ? 'var(--text-accent)' : 'var(--text-label)';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-mono-sm)',
        letterSpacing: 'var(--ls-eyebrow)',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 'var(--r-pill)',
            background: 'var(--green)',
            animation: 'gg-blink var(--dur-blink) steps(1) infinite',
          }}
        />
      )}
      {children}
    </div>
  );
}
