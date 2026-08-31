'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import FlagImg from '@/components/FlagImg';

/**
 * Module scope, not the component body: the React Compiler forbids writing to a
 * value defined outside a component from within one, and `document` is exactly
 * that. Hoisting the side effect out is the fix, and it reads better anyway.
 *
 * One year, lax — it has to survive arriving from an external link, and it is a
 * display preference rather than anything worth protecting.
 */
function rememberCountry(iso3: string) {
  document.cookie = `gg_country=${iso3}; path=/; max-age=31536000; samesite=lax`;
  window.location.assign('/');
}

interface Entry {
  iso3: string;
  name: string;
}

interface CountrySwitcherProps {
  current: string;
  entries: Entry[];
}

/**
 * "Viewing as Ireland · change", and the picker behind it.
 *
 * The choice is written to a cookie rather than localStorage because the
 * middleware has to read it: the homepage is prerendered per country and picked
 * before any JavaScript runs, so a preference the server cannot see would mean
 * rendering the wrong country and then swapping it under the reader. The cookie
 * holds one ISO3 code and nothing else — a functional preference, like the best
 * streak on /play, and outside the analytics consent gate for the same reason.
 */
export default function CountrySwitcher({ current, entries }: CountrySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? entries.filter((e) => e.name.toLowerCase().includes(q) || e.iso3.toLowerCase().startsWith(q))
      : entries;
    return pool.slice(0, 60);
  }, [query, entries]);

  const label = entries.find((e) => e.iso3 === current)?.name ?? 'the world';

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: '6px 12px',
          borderRadius: 'var(--r-pill)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-raised)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          cursor: 'pointer',
        }}
      >
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
        Viewing as {label}
        <span style={{ color: 'var(--text-quiet)' }}>· change</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose a country"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 320,
            maxWidth: '90vw',
            zIndex: 60,
            borderRadius: 'var(--r-card)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-card-strong, var(--bg-card))',
            padding: 'var(--space-4)',
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 200 countries…"
            aria-label="Search countries"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--r-input, 8px)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-inset, var(--bg-raised))',
              color: 'var(--text-primary)',
              fontSize: 'var(--fs-ui)',
              outline: 'none',
            }}
          />
          <ul style={{ listStyle: 'none', margin: 'var(--space-4) 0 0', padding: 0, maxHeight: 280, overflowY: 'auto' }}>
            {matches.map((e) => (
              <li key={e.iso3}>
                <button
                  type="button"
                  role="option"
                  aria-selected={e.iso3 === current}
                  onClick={() => rememberCountry(e.iso3)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: e.iso3 === current ? 'var(--bg-raised)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--fs-ui)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <FlagImg iso3={e.iso3} size={16} />
                  {e.name}
                </button>
              </li>
            ))}
            {!matches.length && (
              <li style={{ padding: '8px', fontSize: 'var(--fs-ui)', color: 'var(--text-quiet)' }}>
                Nothing matches “{query}”.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
