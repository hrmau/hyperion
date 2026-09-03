'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FlagImg from '@/components/FlagImg';
import { trackCountryProfileOpen } from '@/lib/analytics';
import names from '@/public/data/country-names.json';
import pages from '@/public/data/country-pages.json';

/**
 * "Find a country", in the top bar of every page.
 *
 * This is the answer to a real gap: 200 country profiles existed with no way to
 * reach a specific one. You could spot it on the map, or scroll the rankings —
 * Luxembourg is 150th — and that was the whole list.
 *
 * It lives in the top bar rather than the primary nav because the primary nav
 * cannot take a fifth item: below 768px it is a fixed bottom bar of `flex: 1`
 * items and four already fills the width (see `navItems.ts`). The top bar, at
 * that width, holds the wordmark and nothing else — `.gg-nav-items` is fixed to
 * the bottom and `.gg-nav-meta` is hidden — so there is an empty row waiting for
 * exactly this.
 *
 * The index is imported rather than fetched. Both files together are 5KB, they
 * are already in the build, and a search box that has to wait for a network
 * round trip before it can match anything is not a search box.
 *
 * No magnifier: the system has no icon set, and gets by on typography, hairlines
 * and mono glyphs. A mono label says the same thing and cannot fail to load.
 */

interface Entry {
  iso3: string;
  name: string;
}

/** Module scope: the same 200 entries on every page, sorted once per bundle. */
const ENTRIES: Entry[] = (pages as string[])
  .map((iso3) => ({ iso3, name: (names as Record<string, string>)[iso3] ?? iso3 }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));

const LIMIT = 50;

export default function CountryFinder() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /**
   * Both resets happen here rather than in an effect on `open`. Clearing state
   * in an effect is a cascading render, and the panel closing is an event, not
   * something to synchronise with.
   */
  const close = () => {
    setOpen(false);
    setQuery('');
    setCursor(0);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ENTRIES.slice(0, LIMIT);
    // Names that start with the query rank above names that merely contain it,
    // so typing "ind" offers India before Indonesia and before British Indian
    // Ocean Territory. An ISO3 prefix matches too: "irl" should find Ireland.
    const starts: Entry[] = [];
    const contains: Entry[] = [];
    for (const e of ENTRIES) {
      const n = e.name.toLowerCase();
      if (n.startsWith(q) || e.iso3.toLowerCase().startsWith(q)) starts.push(e);
      else if (n.includes(q)) contains.push(e);
    }
    return [...starts, ...contains].slice(0, LIMIT);
  }, [query]);

  /** Keep the highlighted row inside the scroll box when arrowing past its edge. */
  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const go = (iso3: string) => {
    close();
    trackCountryProfileOpen('country_finder', iso3);
    router.push(`/country/${iso3.toLowerCase()}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && matches[cursor]) {
      e.preventDefault();
      go(matches[cursor].iso3);
    }
  };

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: 'none' }}>
      <button
        type="button"
        className="gg-touch-target"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          minHeight: 34,
          padding: '6px 12px',
          borderRadius: 'var(--r-pill)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-raised)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
        }}
      >
        Find a country
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Find a country"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 340,
            maxWidth: 'calc(100vw - var(--gutter) * 2)',
            zIndex: 60,
            borderRadius: 'var(--r-card)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-card-strong)',
            padding: 'var(--space-4)',
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // A new query means a new first row; keeping the old index would
              // arrow-and-Enter into whatever happens to be in that position.
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={`Search ${ENTRIES.length} countries`}
            aria-label="Search countries"
            aria-controls="gg-finder-list"
            autoComplete="off"
            style={{
              width: '100%',
              padding: '9px 10px',
              borderRadius: 'var(--r-well)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-raised)',
              color: 'var(--text-primary)',
              fontSize: 'var(--fs-ui)',
              outline: 'none',
            }}
          />

          <ul
            id="gg-finder-list"
            ref={listRef}
            role="listbox"
            aria-label="Countries"
            style={{
              listStyle: 'none',
              margin: 'var(--space-4) 0 0',
              padding: 0,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {matches.map((e, i) => (
              <li key={e.iso3}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === cursor}
                  className="gg-touch-target"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(e.iso3)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    width: '100%',
                    minHeight: 34,
                    padding: '7px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: i === cursor ? 'var(--bg-raised)' : 'transparent',
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
              <li style={{ padding: 8, fontSize: 'var(--fs-ui)', color: 'var(--text-quiet)' }}>
                Nothing matches &ldquo;{query}&rdquo;. Every country with enough
                generation to say something about has a page; 14 do not.
              </li>
            )}
          </ul>

          <div
            style={{
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <Link
              href="/countries"
              onClick={close}
              style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}
            >
              Browse all countries
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
