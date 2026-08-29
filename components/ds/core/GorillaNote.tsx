import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { MARK } from './tokens';

export interface GorillaNoteProps extends HTMLAttributes<HTMLDivElement> {
  /** The green lead clause. Keep it to a few words. */
  lead?: ReactNode;
  children?: ReactNode;
  mark?: string;
  divider?: boolean;
  style?: CSSProperties;
}

/**
 * The gorilla's reading. Every chart in the product is followed by exactly one
 * of these, saying in plain English what to look at.
 *
 * This is a content contract as much as a component — it is the brand's voice
 * made visible. Do not use it for generic captions.
 */
export function GorillaNote({
  lead,
  children,
  mark = MARK,
  divider = true,
  style,
  ...rest
}: GorillaNoteProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-5)',
        marginTop: 'var(--space-8)',
        paddingTop: divider ? 'var(--space-7)' : 0,
        borderTop: divider ? '1px solid var(--border-default)' : undefined,
        ...style,
      }}
      {...rest}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG mark, no optimisation to do */}
      <img src={mark} alt="" style={{ width: 24, flex: 'none', marginTop: 2 }} />
      <div style={{ fontSize: 'var(--fs-body)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
        {lead && (
          <strong
            style={{ color: 'var(--green)', fontWeight: 'var(--fw-bold)' as CSSProperties['fontWeight'] }}
          >
            {lead}{' '}
          </strong>
        )}
        {children}
      </div>
    </div>
  );
}
