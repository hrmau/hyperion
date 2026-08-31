import Link from 'next/link';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Button } from '@/components/ds/core/Button';

/**
 * Reached by an unknown ISO3 code, and also by the ~14 real countries that
 * generate too little electricity for the fact engine to say anything true and
 * interesting about them.
 *
 * They get no page on purpose. A page that exists only to report that a
 * territory generated 0.04 TWh is thin content, and fourteen near-identical ones
 * is exactly the pattern that would make the other 200 look like a farm.
 */
export default function CountryNotFound() {
  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      <main style={{ flex: 1, padding: 'var(--band-y) var(--gutter)' }}>
        <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>No profile</Eyebrow>
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
          There is no profile at that address.
        </h1>
        <p
          style={{
            margin: 'var(--space-6) 0 0',
            maxWidth: '58ch',
            fontSize: 'var(--fs-body-lg)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--lh-body)',
          }}
        >
          Either the country code is wrong, or the grid is too small for us to say anything
          worth reading about it. A handful of territories generate less electricity in a year
          than a single large power station does in a week, and we would rather publish nothing
          than pad the page out.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-8)' }}>
          <Button as={Link} href="/explore" variant="primary">
            Find a country on the map
          </Button>
          <Button as={Link} href="/rankings" variant="ghost">
            Browse the rankings
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
