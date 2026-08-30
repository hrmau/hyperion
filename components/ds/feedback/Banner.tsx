import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

const TONES: Record<string, { bg: string; border: string; accent: string }> = {
  info: { bg: 'var(--ink-800)', border: 'var(--border-default)', accent: 'var(--text-label)' },
  accent: { bg: 'var(--green-wash)', border: 'rgba(0,199,88,0.28)', accent: 'var(--green)' },
  warn: { bg: 'var(--ink-800)', border: 'rgba(191,139,111,0.4)', accent: 'var(--clay)' },
};

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'accent' | 'warn';
  label?: string;
  children?: ReactNode;
  action?: ReactNode;
  style?: CSSProperties;
}

/** Standing note attached to a surface — a caveat, not a transient message. */
export function Banner({ tone = 'info', label, children, action, style, ...rest }: BannerProps) {
  const t = TONES[tone];
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-5)',
        padding: '14px 16px',
        borderRadius: 'var(--r-button)',
        border: `1px solid ${t.border}`,
        background: t.bg,
        ...style,
      }}
      {...rest}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xxs)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: t.accent,
              marginBottom: 'var(--space-2)',
            }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            fontSize: 'var(--fs-body-sm)',
            lineHeight: 'var(--lh-body-sm)',
            color: 'var(--paper-a76)',
          }}
        >
          {children}
        </div>
      </div>
      {action}
    </div>
  );
}
