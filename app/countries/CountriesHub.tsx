import Link from 'next/link';

import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import FlagImg from '@/components/FlagImg';
import CountryIndex, { type IndexEntry } from '@/components/CountryIndex';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Card } from '@/components/ds/core/Card';
import { Button } from '@/components/ds/core/Button';

import { loadFacts } from '@/lib/facts';
import { regionPhrase } from '@/lib/regions';
import picks from '@/data/country-picks.json';
import regionsByIso from '@/public/data/country-regions.json';

/**
 * `/countries` - the hub that makes 200 country pages findable.
 *
 * Before this there was no page listing them. You reached a profile from the
 * homepage's "viewing as", from a position in the rankings, from the map, or
 * from the five regional peers on another country's page. Nothing linked the
 * set, which is a strange thing to be true of the pages the site exists for.
 *
 * Rendered by `/countries` and by every `/countries/r/<slug>` variant, which is
 * what middleware actually serves. The only difference between them is which
 * six cards sit under "Worth a look"; the index below is the same 200 links
 * every time, and that is the part that has to be in the HTML.
 */

const SETS = picks.sets as Record<string, string[]>;
const REGIONS = regionsByIso as Record<string, string>;

export interface CountriesHubProps {
  /** Ember region name, or null for the world set. */
  region: string | null;
}

export default async function CountriesHub({ region }: CountriesHubProps) {
  const facts = await loadFacts();

  const set = (region && SETS[region]) || SETS.world;
  const where = regionPhrase(region);

  const entries: IndexEntry[] = Object.values(facts)
    .map((c) => ({ iso3: c.iso3, name: c.name, region: REGIONS[c.iso3] ?? 'Other' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  return (
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav meta={`${entries.length} countries`} />

      <main
        style={{
          flex: 1,
          paddingBlock: 'var(--space-11)',
          paddingInline: 'var(--gutter)',
        }}
      >
        <header style={{ maxWidth: '62ch' }}>
          <Eyebrow>Every country</Eyebrow>
          <h1
            style={{
              margin: 'var(--space-5) 0 0',
              fontSize: 'var(--fs-h1)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-h1)',
              lineHeight: 'var(--lh-h1)',
              textWrap: 'balance',
            }}
          >
            Electricity, country by country
          </h1>
          <p
            style={{
              margin: 'var(--space-6) 0 0',
              fontSize: 'var(--fs-body)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--text-secondary)',
            }}
          >
            {entries.length} grids, one page each - what they burn, how clean they
            are, and the one thing about each that is worth knowing. Search for a
            country, start from the ones worth a look, or see them all at once on
            the map.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-8)' }}>
            <Button as={Link} href="#all" variant="primary">
              Find a country
            </Button>
            <Button as={Link} href="/explore" variant="secondary">
              See them on the map
            </Button>
          </div>
        </header>

        <section style={{ marginTop: 'var(--space-11)' }}>
          <h2
            style={{
              margin: '0 0 var(--space-3)',
              fontSize: 'var(--fs-h3)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-h3)',
            }}
          >
            {where ? `Worth a look in ${where}` : 'Worth a look'}
          </h2>
          <p
            style={{
              margin: '0 0 var(--space-8)',
              maxWidth: '62ch',
              fontSize: 'var(--fs-ui)',
              color: 'var(--text-secondary)',
            }}
          >
            {where
              ? `Grids near you that do something most people would not guess.`
              : `Grids that do something most people would not guess.`}
          </p>

          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(272px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {set.map((iso3) => {
              const c = facts[iso3];
              // check-data.js fails the build if a pick has no page, so this is
              // belt and braces rather than a real branch.
              if (!c) return null;
              return (
                <li key={iso3} style={{ display: 'flex' }}>
                  <Link href={`/country/${iso3.toLowerCase()}`} style={{ display: 'flex', width: '100%' }}>
                    <Card tone="card" padding="var(--space-7)" style={{ width: '100%' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-4)',
                          marginBottom: 'var(--space-5)',
                        }}
                      >
                        <FlagImg iso3={iso3} size={20} />
                        <span
                          style={{
                            fontSize: 'var(--fs-ui)',
                            fontWeight: 'var(--fw-semibold)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {c.name}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 'var(--fs-body-sm)',
                          lineHeight: 'var(--lh-body-sm)',
                          color: 'var(--text-secondary)',
                          textWrap: 'pretty',
                        }}
                      >
                        {c.hero.headline}
                      </p>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="all" style={{ marginTop: 'var(--space-11)', scrollMarginTop: 'var(--space-8)' }}>
          <h2
            style={{
              margin: '0 0 var(--space-3)',
              fontSize: 'var(--fs-h3)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-h3)',
            }}
          >
            All {entries.length} countries
          </h2>
          <p
            style={{
              margin: '0 0 var(--space-8)',
              maxWidth: '62ch',
              fontSize: 'var(--fs-ui)',
              color: 'var(--text-secondary)',
            }}
          >
            Every grid with enough generation to say something about. The 14 that
            are too small have no page - they would be a paragraph of hedging.
          </p>
          <CountryIndex entries={entries} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
