'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import FlagImg from '@/components/FlagImg';

/**
 * The browsable index on `/countries`: a filter box over every country that has
 * a page, grouped by region.
 *
 * Separate from `CountryFinder` in the top bar on purpose, because they are
 * different jobs. The finder is a dropdown for "I know what I want" and closes
 * the moment you pick. This one is the page's content: it renders all 200 links
 * into the HTML, which is what gives the country pages the internal-link hub
 * they have never had. Filtering only hides rows that are already there.
 */

export interface IndexEntry {
  iso3: string;
  name: string;
  region: string;
}

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  minHeight: 34,
  padding: '6px 8px',
  borderRadius: 6,
  color: 'var(--text-secondary)',
  fontSize: 'var(--fs-ui)',
};

export default function CountryIndex({ entries }: { entries: IndexEntry[] }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const groups = useMemo(() => {
    const matched = q
      ? entries.filter(
          (e) => e.name.toLowerCase().includes(q) || e.iso3.toLowerCase().startsWith(q)
        )
      : entries;
    const by = new Map<string, IndexEntry[]>();
    for (const e of matched) {
      const list = by.get(e.region);
      if (list) list.push(e);
      else by.set(e.region, [e]);
    }
    return [...by.entries()].sort((a, b) => a[0].localeCompare(b[0], 'en'));
  }, [entries, q]);

  const count = groups.reduce((n, [, list]) => n + list.length, 0);

  return (
    <div>
      <label
        htmlFor="gg-index-filter"
        style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono-xxs)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: 'var(--text-label)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Filter
      </label>
      <input
        id="gg-index-filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Type a country name, or a code like IRL`}
        autoComplete="off"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '11px 12px',
          borderRadius: 'var(--r-well)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-raised)',
          color: 'var(--text-primary)',
          fontSize: 'var(--fs-ui)',
          outline: 'none',
        }}
      />

      <p
        aria-live="polite"
        style={{
          margin: 'var(--space-4) 0 var(--space-8)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono-xs)',
          color: 'var(--text-quiet)',
        }}
      >
        {count} {count === 1 ? 'country' : 'countries'}
        {q ? ` matching “${query.trim()}”` : ''}
      </p>

      {!count && (
        <p style={{ fontSize: 'var(--fs-ui)', color: 'var(--text-secondary)' }}>
          Nothing matches that. Every country with enough generation to say
          something about has a page; 14 are too small, and they are not listed
          here.
        </p>
      )}

      <div style={{ display: 'grid', gap: 'var(--space-10)' }}>
        {groups.map(([region, list]) => (
          <section key={region}>
            <h3
              style={{
                margin: '0 0 var(--space-5)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-xxs)',
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: 'var(--text-label)',
                fontWeight: 'var(--fw-medium)' as React.CSSProperties['fontWeight'],
              }}
            >
              {region} · {list.length}
            </h3>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '2px var(--space-4)',
              }}
            >
              {list.map((e) => (
                <li key={e.iso3}>
                  <Link
                    href={`/country/${e.iso3.toLowerCase()}`}
                    className="gg-touch-target"
                    style={ROW}
                  >
                    <FlagImg iso3={e.iso3} size={16} />
                    {e.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
