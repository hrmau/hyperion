import type { ButtonHTMLAttributes, CSSProperties, ElementType, ReactNode, Ref } from 'react';

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-3)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--fs-ui)',
  fontWeight: 'var(--fw-semibold)' as CSSProperties['fontWeight'],
  borderRadius: 'var(--r-button)',
  cursor: 'pointer',
  border: '1px solid transparent',
  whiteSpace: 'nowrap',
  transition:
    'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), opacity var(--dur-instant) var(--ease-out)',
};

const sizes: Record<string, CSSProperties> = {
  sm: { padding: '9px 14px', fontSize: 'var(--fs-caption)' },
  md: { padding: '13px 22px' },
  lg: { padding: '14px 24px', fontSize: '15px' },
};

const variants: Record<string, CSSProperties> = {
  /** The inverse button. One per view — this is the primary action. */
  primary: { background: 'var(--bg-inverse)', color: 'var(--text-on-inverse)' },
  /** Hairline button. Use for the second action beside a primary. */
  secondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-emphasis)',
  },
  /** Green. Only for actions that ARE the accent. Never two on a screen. */
  accent: { background: 'var(--bg-accent)', color: 'var(--text-on-accent)' },
  /** On a green field. */
  onAccent: { background: 'var(--green-ink)', color: 'var(--green)' },
  ghost: { background: 'transparent', color: 'var(--text-secondary)' },
};

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'onAccent' | 'ghost';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'style'> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  iconRight?: ReactNode;
  iconLeft?: ReactNode;
  /** Render as another element (e.g. Next's Link) while keeping the styling. */
  as?: ElementType;
  href?: string;
  style?: CSSProperties;
  /**
   * React 19 passes ref as a plain prop to function components, so no
   * forwardRef is needed. Focus management depends on this — /play moves focus
   * to Next on reveal so keyboard players are not stranded on a card that has
   * just gone inert.
   */
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  iconRight,
  iconLeft,
  as,
  style,
  ...rest
}: ButtonProps) {
  const Tag = (as ?? 'button') as ElementType;
  return (
    <Tag
      disabled={Tag === 'button' ? disabled : undefined}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? 'none' : undefined,
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}
