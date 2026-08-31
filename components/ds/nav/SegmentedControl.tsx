'use client';

import type { CSSProperties } from 'react';

export interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Mutually exclusive view switch. Selection is an inverse fill, never green —
 * green is the accent, not a state.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  style,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={className}
      style={{
        display: 'inline-flex',
        gap: 2,
        padding: 3,
        borderRadius: 'var(--r-pill)',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-raised)',
        ...style,
      }}
    >
      {options.map((opt) => {
        const on = opt === value;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(opt)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-pill)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-ui)',
              fontWeight: 'var(--fw-medium)' as CSSProperties['fontWeight'],
              background: on ? 'var(--bg-inverse)' : 'transparent',
              color: on ? 'var(--text-on-inverse)' : 'var(--text-secondary)',
              transition: 'all var(--dur-fast) var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
