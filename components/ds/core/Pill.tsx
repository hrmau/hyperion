import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export interface PillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children?: ReactNode;
  /** Selected is an inverse fill, never green — green is the accent, not a state. */
  selected?: boolean;
  dashed?: boolean;
  style?: CSSProperties;
}

/** Single-select taxonomy control: bloc filters, measure switches. */
export function Pill({ children, selected = false, dashed = false, style, ...rest }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-ui)',
        fontWeight: 'var(--fw-medium)' as CSSProperties['fontWeight'],
        padding: '7px 14px',
        borderRadius: 'var(--r-pill)',
        cursor: 'pointer',
        background: selected ? 'var(--bg-inverse)' : 'transparent',
        color: selected
          ? 'var(--text-on-inverse)'
          : dashed
            ? 'var(--text-secondary)'
            : 'var(--text-primary)',
        border: selected
          ? '1px solid transparent'
          : `1px ${dashed ? 'dashed' : 'solid'} var(--line-strong)`,
        transition: 'all var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
