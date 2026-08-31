import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import FlagImg from '@/components/FlagImg';
import CountrySwitcher from '@/components/CountrySwitcher';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Card } from '@/components/ds/core/Card';
import { Stat } from '@/components/ds/core/Stat';
import { Button } from '@/components/ds/core/Button';
import { Banner } from '@/components/ds/feedback/Banner';
import { GorillaNote } from '@/components/ds/core/GorillaNote';
import { MixBar } from '@/components/ds/data/MixBar';
import { FuelLegend } from '@/components/ds/data/FuelLegend';
import { StackedAreaChart } from '@/components/ds/data/StackedAreaChart';
import { RankedBarList } from '@/components/ds/data/RankedBarList';

import { fuelShares, fuelSeries } from '@/lib/fuels';
import { loadHomeView, loadSwitcherIndex, publishableIso3 } from '@/lib/facts';

/**
 * The homepage, one variant per country plus the world.
 *
 * Never linked and never navigated to directly in normal use: middleware
 * rewrites `/` here based on the visitor's cookie or IP country, so the URL a
 * reader sees is always `/`. Every variant is prerendered, which is the whole
 * point — personalising the homepage costs a CDN lookup rather than a render.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const codes = await publishableIso3();
  return [{ iso3: 'world' }, ...codes.map((iso3) => ({ iso3: iso3.toLowerCase() }))];
}

/**
 * Deliberately identical for every variant.
 *
 * This metadata is what `/` serves, and `/` must not describe itself
 * differently depending on where the reader happens to be sitting. The canonical
 * points at `/` from every variant so the `/home/*` paths cannot be indexed
 * separately from the homepage they render.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Grid Gorilla — what keeps your lights on',
    description:
      'Every country on Earth runs on something. See what your grid actually burns, how clean it is, and how it compares with 200 others.',
    alternates: { canonical: '/' },
  };
}

const num = (n: number, dp = 0) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

const panelLabelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono-xs)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--text-quiet)',
  marginBottom: 'var(--space-5)',
};

export default async function Home({ params }: { params: Promise<{ iso3: string }> }) {
  const { iso3 } = await params;
  const view = await loadHomeView(iso3);
  if (!view) notFound();

  const entries = await loadSwitcherIndex();
  const shares = fuelShares(view.data).filter((s) => s.pct > 0);
  const { years: seriesYears, series } = fuelSeries(view.years, view.yearData);
  const perPerson = view.data.population
    ? (view.data.total_generation_twh * 1e9) / view.data.population
    : null;
  const isWorld = view.key === 'WORLD';

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav active="explore" />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 'var(--space-5) var(--gutter) 0',
        }}
      >
        <CountrySwitcher current={view.key} entries={entries} />
      </div>

      <main style={{ flex: 1 }}>
        {view.stale && (
          <div style={{ padding: 'var(--space-6) var(--gutter) 0' }}>
            <Banner label="Older figures" style={{ maxWidth: '68ch' }}>
              {view.name}&rsquo;s electricity data stops in {view.year}, so this describes{' '}
              {view.year} rather than today.
            </Banner>
          </div>
        )}

        <div
          className="gg-hero-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'start',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div
            style={{
              padding: 'var(--space-8) var(--space-9) var(--space-10) var(--gutter)',
              borderRight: '1px solid var(--border-default)',
            }}
          >
            <Eyebrow tone="accent" style={{ marginBottom: 'var(--space-6)' }}>
              {isWorld ? 'The world, right now' : 'Your grid, right now'}
            </Eyebrow>

            <h1
              style={{
                margin: 0,
                maxWidth: '18ch',
                fontSize: 'var(--fs-h1)',
                fontWeight: 'var(--fw-bold)',
                letterSpacing: 'var(--ls-h1)',
                lineHeight: 'var(--lh-h1)',
                textWrap: 'pretty',
              }}
            >
              {view.headline}
            </h1>

            {view.detail && (
              <p
                style={{
                  margin: 'var(--space-6) 0 0',
                  maxWidth: '46ch',
                  fontSize: 'var(--fs-body-lg)',
                  lineHeight: 'var(--lh-body)',
                  color: 'var(--text-secondary)',
                  textWrap: 'pretty',
                }}
              >
                {view.detail}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-8)',
                flexWrap: 'wrap',
                margin: 'var(--space-8) 0',
                paddingTop: 'var(--space-7)',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <Stat
                label="Clean share"
                value={num(view.data.aggregates.clean_pct)}
                unit="%"
                note={`in ${view.year}`}
                tone={view.data.aggregates.clean_pct >= 60 ? 'accent' : 'default'}
              />
              <Stat
                label="Total output"
                value={num(
                  view.data.total_generation_twh,
                  view.data.total_generation_twh < 10 ? 1 : 0
                )}
                unit="TWh"
                note="a year"
              />
              {perPerson != null && (
                <Stat label="Per person" value={num(perPerson)} unit="kWh" note="a year" />
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {view.profilePath ? (
                <Button as={Link} href={view.profilePath} variant="primary">
                  See {view.name}&rsquo;s full profile
                </Button>
              ) : (
                <Button as={Link} href="/rankings" variant="primary">
                  See every country ranked
                </Button>
              )}
              <Button as={Link} href="/explore" variant="secondary">
                Explore the map
              </Button>
            </div>
          </div>

          <div style={{ padding: 'var(--space-8) var(--gutter) var(--space-10) var(--space-9)' }}>
            {view.peer ? (
              <>
                <div style={panelLabelStyle}>Electricity per person, a year</div>
                <RankedBarList
                  items={[
                    {
                      label: view.name,
                      value: view.peer.mine,
                      display: `${num(view.peer.mine)} kWh`,
                      tone: 'accent',
                    },
                    {
                      label: view.peer.name,
                      value: view.peer.theirs,
                      display: `${num(view.peer.theirs)} kWh`,
                    },
                  ]}
                  barHeight={22}
                />
                <div style={{ marginTop: 'var(--space-7)' }}>
                  <MixBar shares={shares} height={24} />
                  <FuelLegend
                    shares={shares.map((s) => ({ fuel: s.fuel, pct: s.pct }))}
                    style={{ marginTop: 'var(--space-5)' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={panelLabelStyle}>
                  {view.name} · mix since {seriesYears[0]}
                </div>
                <StackedAreaChart series={series} years={seriesYears} height={280} />
                <FuelLegend
                  shares={shares.map((s) => ({ fuel: s.fuel, pct: s.pct }))}
                  style={{ marginTop: 'var(--space-5)' }}
                />
              </>
            )}

            {view.note && (
              <GorillaNote lead={view.note.headline} style={{ marginTop: 'var(--space-7)' }}>
                {view.note.detail}
              </GorillaNote>
            )}
          </div>
        </div>

        <section style={{ padding: 'var(--space-9) var(--gutter) var(--space-10)' }}>
          <Eyebrow style={{ marginBottom: 'var(--space-6)' }}>How you compare</Eyebrow>
          <div
            className="gg-card-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            <Card>
              <Eyebrow tone="accent" style={{ marginBottom: 'var(--space-4)' }}>
                Higher or lower
              </Eyebrow>
              <p style={{ margin: 0, fontSize: 'var(--fs-body-lg)', fontWeight: 'var(--fw-medium)' }}>
                Two grids, one question. Most people do worse than they expect.
              </p>
              <p style={{ margin: 'var(--space-4) 0 var(--space-5)', fontSize: 'var(--fs-ui)', color: 'var(--text-secondary)' }}>
                Guess which country gets more of its power from wind, coal or the sun.
              </p>
              <Link href="/play" style={{ color: 'var(--green)', fontSize: 'var(--fs-ui)' }}>
                Play a round →
              </Link>
            </Card>

            {view.neighbours[0] ? (
              <Card>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>Your neighbours</Eyebrow>
                <p style={{ margin: 0, fontSize: 'var(--fs-body-lg)', fontWeight: 'var(--fw-medium)' }}>
                  {view.neighbours[0].headline}
                </p>
                <p style={{ margin: 'var(--space-4) 0 var(--space-5)', fontSize: 'var(--fs-ui)', color: 'var(--text-secondary)' }}>
                  {view.neighbours[0].name} runs a grid about the size of {view.name}&rsquo;s.
                </p>
                <Link
                  href={`/compare?a=${view.key}&b=${view.neighbours[0].iso3}`}
                  style={{ color: 'var(--green)', fontSize: 'var(--fs-ui)' }}
                >
                  Compare them →
                </Link>
              </Card>
            ) : (
              <Card>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>Side by side</Eyebrow>
                <p style={{ margin: 0, fontSize: 'var(--fs-body-lg)', fontWeight: 'var(--fw-medium)' }}>
                  France against Germany is the argument that never ends.
                </p>
                <p style={{ margin: 'var(--space-4) 0 var(--space-5)', fontSize: 'var(--fs-ui)', color: 'var(--text-secondary)' }}>
                  One bet on nuclear, one on renewables and coal. Here is the tape.
                </p>
                <Link href="/compare?a=FRA&b=DEU" style={{ color: 'var(--green)', fontSize: 'var(--fs-ui)' }}>
                  Settle it →
                </Link>
              </Card>
            )}

            <Card>
              <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>The world</Eyebrow>
              <p style={{ margin: 0, fontSize: 'var(--fs-body-lg)', fontWeight: 'var(--fw-medium)' }}>
                Every country on Earth, coloured by what keeps its lights on.
              </p>
              <p style={{ margin: 'var(--space-4) 0 var(--space-5)', fontSize: 'var(--fs-ui)', color: 'var(--text-secondary)' }}>
                Zoom out to all 214 grids and see where {view.name} actually sits.
              </p>
              <Link href="/explore" style={{ color: 'var(--green)', fontSize: 'var(--fs-ui)' }}>
                Open the map →
              </Link>
            </Card>
          </div>

          {view.iso3 && (
            <p
              style={{
                margin: 'var(--space-8) 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                fontSize: 'var(--fs-ui)',
                color: 'var(--text-quiet)',
              }}
            >
              <FlagImg iso3={view.iso3} size={16} />
              Location detected from your connection, never stored. Your choice of country is kept
              on this device only.
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
