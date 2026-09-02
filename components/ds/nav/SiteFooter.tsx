import Link from 'next/link';
import type { CSSProperties } from 'react';
import { MARK } from '@/components/ds/core/tokens';
import dataMeta from '@/public/data/data-meta.json';

/**
 * Site footer.
 *
 * Ported from the design system's SiteFooter. Its link columns and source list
 * upstream are placeholders — the system's own readme is emphatic that every
 * figure in it is unverified — so both are replaced here with the real routes
 * and the real provenance.
 *
 * The vintage is read from `public/data/data-meta.json`, which the transform
 * regenerates on every refresh. That file is a few hundred bytes and imported
 * directly rather than fetched, so the footer states the true data vintage on
 * every page without a request and without anyone remembering to edit it.
 *
 * The Ember + Our World in Data CC BY 4.0 attribution below is required on
 * every page of the site. Do not remove it.
 */

const COLUMNS: { label: string; links: { label: string; href: string }[] }[] = [
  {
    label: 'Explore',
    links: [
      // /explore, not /. The map moved there when the homepage became the
      // personalised hook; this one was missed in that pass.
      { label: 'The map', href: '/explore' },
      { label: 'Higher or lower', href: '/play' },
      { label: 'Compare', href: '/compare' },
      { label: 'Rankings', href: '/rankings' },
    ],
  },
  {
    label: 'Learn',
    links: [
      { label: 'The energy story', href: '/story' },
      { label: 'Why electricity matters', href: '/why' },
      { label: 'Energy and prosperity', href: '/correlations' },
      { label: 'Methodology', href: '/methodology' },
    ],
  },
  {
    label: 'About',
    links: [
      { label: 'Credits and sources', href: '/credits' },
      { label: "What's new", href: '/updates' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

const SOURCES: { name: string; detail: string; href: string }[] = [
  {
    name: 'Ember',
    detail: 'Electricity generation by source, demand and emissions',
    href: 'https://ember-energy.org',
  },
  {
    name: 'Our World in Data',
    detail: `Energy dataset, published ${dataMeta.sourceUpdatedOn}`,
    href: 'https://ourworldindata.org/energy',
  },
  {
    name: 'World Bank · UNDP',
    detail: 'Population, GDP, life expectancy and HDI',
    href: 'https://data.worldbank.org',
  },
];

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono-xxs)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase',
  color: 'var(--text-label)',
  marginBottom: 'var(--space-6)',
};

export interface SiteFooterProps {
  style?: CSSProperties;
}

export default function SiteFooter({ style }: SiteFooterProps) {
  const coverage = `${dataMeta.countryCount} countries · ${dataMeta.earliestYear}-${dataMeta.latestYear}`;

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-default)',
        background: 'var(--bg-raised)',
        ...style,
      }}
    >
      <div
        className="gg-footer-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr repeat(3, 1fr)',
          gap: 'var(--space-9)',
          padding: 'var(--space-11) var(--gutter) var(--space-10)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG mark */}
            <img src={MARK} alt="" style={{ width: 26 }} />
            <span
              style={{
                fontSize: 17,
                fontWeight: 'var(--fw-bold)' as CSSProperties['fontWeight'],
                letterSpacing: '-0.015em',
              }}
            >
              Grid Gorilla
            </span>
          </div>
          <p
            style={{
              margin: 'var(--space-6) 0 0',
              maxWidth: '34ch',
              fontSize: 'var(--fs-body-sm)',
              lineHeight: 'var(--lh-body-sm)',
              color: 'var(--text-tertiary)',
            }}
          >
            Where the world&rsquo;s electricity actually comes from - {coverage}, free, no account.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.label} aria-label={col.label}>
            <div style={labelStyle}>{col.label}</div>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--paper-a66)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        className="gg-footer-sources"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-9)',
          padding: 'var(--space-8) var(--gutter)',
          borderTop: '1px solid var(--border-default)',
        }}
      >
        {SOURCES.map((s) => (
          <div key={s.name}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-xs)',
                letterSpacing: '0.06em',
                color: 'var(--paper)',
                marginBottom: 4,
                display: 'block',
              }}
            >
              {s.name}
            </a>
            <div
              style={{ fontSize: 'var(--fs-caption)', lineHeight: 1.45, color: 'var(--text-quiet)' }}
            >
              {s.detail}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-8)',
          flexWrap: 'wrap',
          padding: 'var(--space-7) var(--gutter) var(--space-9)',
          borderTop: '1px solid var(--border-default)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono-xs)',
          lineHeight: 1.6,
          color: 'var(--paper-a32)',
        }}
      >
        <span style={{ maxWidth: '62ch' }}>
          Data from{' '}
          <a href="https://ember-energy.org" target="_blank" rel="noopener noreferrer">
            Ember
          </a>{' '}
          and{' '}
          <a href="https://ourworldindata.org/energy" target="_blank" rel="noopener noreferrer">
            Our World in Data
          </a>
          , licensed{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
          .
        </span>
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            textAlign: 'right',
          }}
        >
          <span>Source data published {dataMeta.sourceUpdatedOn}</span>
          <span>Analytics only with your consent.</span>
        </span>
      </div>
    </footer>
  );
}
