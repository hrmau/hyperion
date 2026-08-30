import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

const tones: Record<string, CSSProperties> = {
  /** Raised panel — chart wells, right rails. */
  raised: { background: 'var(--bg-raised)', border: '1px solid transparent' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-default)' },
  /** One step up the ink ramp, so a third card is told apart by VALUE not hue. */
  strong: { background: 'var(--bg-card-strong)', border: '1px solid var(--border-default)' },
  /** The one green card. */
  accent: {
    background: 'var(--bg-accent)',
    color: 'var(--text-on-accent)',
    border: '1px solid transparent',
  },
  outline: { background: 'transparent', border: '1px solid var(--border-default)' },
};

export type CardTone = 'raised' | 'card' | 'strong' | 'accent' | 'outline';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  tone?: CardTone;
  padding?: string;
  radius?: string;
  style?: CSSProperties;
}

export function Card({
  children,
  tone = 'card',
  padding = '24px 26px',
  radius = 'var(--r-card)',
  style,
  ...rest
}: CardProps) {
  return (
    <div style={{ borderRadius: radius, padding, ...tones[tone], ...style }} {...rest}>
      {children}
    </div>
  );
}
