import type { Metadata } from 'next';
import Link from 'next/link';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Button } from '@/components/ds/core/Button';

/**
 * Next's built-in 404 renders unstyled, off the design system, and titled
 * "404: This page could not be found." with no brand - which is what was
 * showing in analytics.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      <main style={{ flex: 1, padding: 'var(--band-y) var(--gutter)' }}>
        <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>404</Eyebrow>
        <h1
          style={{
            margin: 0,
            maxWidth: '20ch',
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-h2)',
            lineHeight: 'var(--lh-h2)',
          }}
        >
          There is nothing at this address.
        </h1>
        <p
          style={{
            margin: 'var(--space-6) 0 0',
            maxWidth: '52ch',
            fontSize: 'var(--fs-body-lg)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--lh-body)',
          }}
        >
          The link may be old, or the page may never have existed. The map is the best place to
          start from.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-8)' }}>
          <Button as={Link} href="/explore" variant="primary">
            Open the map
          </Button>
          <Button as={Link} href="/rankings" variant="secondary">
            Browse the rankings
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
