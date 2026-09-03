import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import FlagImg from '@/components/FlagImg';
import CountrySwitcher from '@/components/CountrySwitcher';
import CountryProfileLink from '@/components/CountryProfileLink';
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
import { leadStat } from '@/lib/leadStat';
import { loadHomeView, loadSwitcherIndex, loadHomeQuestion, publishableIso3 } from '@/lib/facts';
import { theName, subjectName, possessiveName } from '@/lib/countryNames';

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
    // Keyword-first like every other page, and the same separator. The old
    // title led with the brand and contained no term anyone searches for; the
    // voice lives in the description, where it has room.
    title: { absolute: 'Electricity by country | Grid Gorilla' },
    description:
      'Every country on Earth runs on something. See what your grid actually burns, how clean it is, and how it compares with 200 others.',
    alternates: { canonical: '/' },
  };
}

const num = (n: number, dp = 0) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

/** "H3 25px — card claims", per the display type card in the design system. */
const claimStyle = {
  margin: 0,
  fontSize: 'var(--fs-h3)',
  fontWeight: 'var(--fw-bold)' as const,
  letterSpacing: 'var(--ls-h3)',
  lineHeight: 'var(--lh-h3)',
  textWrap: 'pretty' as const,
};

const supportStyle = {
  margin: 'var(--space-4) 0 var(--space-6)',
  fontSize: 'var(--fs-ui)',
  color: 'var(--text-secondary)',
  lineHeight: 'var(--lh-body)',
};

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
  const question = await loadHomeQuestion(view.iso3);
  const named = theName(view.name);
  const lead = view.hero ? leadStat(view.hero, view.data) : null;

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* No active item: the homepage is not one of the primary nav destinations,
          and marking Explore made it look as though you were already on the map. */}
      <TopNav />

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
                // No ch cap. The column is already half the page; capping the
                // measure on top of that left the headline in a narrow ribbon
                // with most of its own column empty beside it.
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
                  maxWidth: '52ch',
                  fontSize: 'var(--fs-body-lg)',
                  lineHeight: 'var(--lh-body)',
                  color: 'var(--text-secondary)',
                  textWrap: 'pretty',
                }}
              >
                {view.detail}
              </p>
            )}

            {/* Key figures, ruled off from the actions below them. Without the
                second rule the buttons read as a fourth statistic. */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-8)',
                flexWrap: 'wrap',
                margin: 'var(--space-8) 0',
                padding: 'var(--space-7) 0',
                borderTop: '1px solid var(--border-default)',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              {lead && (
                <Stat
                  label={lead.label}
                  value={lead.value}
                  unit={lead.unit}
                  note={lead.note}
                  tone="accent"
                />
              )}
              {lead?.label !== 'Clean share' && (
                <Stat
                  label="Clean share"
                  value={num(view.data.aggregates.clean_pct)}
                  unit="%"
                  note={`in ${view.year}`}
                />
              )}
              {lead?.label !== 'Total output' && (
                <Stat
                  label="Total output"
                  value={num(
                    view.data.total_generation_twh,
                    view.data.total_generation_twh < 10 ? 1 : 0
                  )}
                  unit="TWh"
                  note="a year"
                />
              )}
              {perPerson != null && lead?.label !== 'Per person' && (
                <Stat label="Per person" value={num(perPerson)} unit="kWh" note="a year" />
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {/* The anchor is the link, the Button is only its styling.
                  `ButtonProps` does not accept props it knows nothing about, and
                  widening it to forward them would cost type-checking on every
                  other Button on the site. */}
              {view.profilePath ? (
                <CountryProfileLink
                  iso3={view.key}
                  source="home_hero"
                  href={view.profilePath}
                  style={{ display: 'inline-flex' }}
                >
                  <Button as="span" variant="primary">
                    See {view.name}&rsquo;s full profile
                  </Button>
                </CountryProfileLink>
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
              alignItems: 'stretch',
            }}
          >
            {/* The accent card. Green is "the one thing to click", so exactly
                one of the three carries it, and it is the one that asks
                something rather than telling you something. */}
            <Card tone="accent" style={{ display: 'flex', flexDirection: 'column' }}>
              <Eyebrow style={{ marginBottom: 'var(--space-4)', color: 'var(--green-ink)', opacity: 0.75 }}>
                Higher or lower
              </Eyebrow>
              {question ? (
                <>
                  <p style={{ ...claimStyle, color: 'var(--green-ink)' }}>{question.prompt}</p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--space-3)',
                      margin: 'var(--space-6) 0 var(--space-4)',
                    }}
                  >
                    {[question.a, question.b].map((side) => (
                      <Link
                        key={side.iso3}
                        href="/play"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--space-3)',
                          padding: '10px 12px',
                          borderRadius: 'var(--r-pill)',
                          background: 'var(--green-ink)',
                          color: 'var(--green)',
                          fontSize: 'var(--fs-ui)',
                          fontWeight: 'var(--fw-medium)',
                          textAlign: 'center',
                        }}
                      >
                        <FlagImg iso3={side.iso3} size={16} />
                        {side.name}
                      </Link>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--fs-ui)', color: 'var(--green-ink)', opacity: 0.8 }}>
                    {question.aboutYou
                      ? `Pick one - it is your grid on the line.`
                      : `Pick one and see how many you get right.`}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ ...claimStyle, color: 'var(--green-ink)' }}>
                    Two grids, one question. Most people do worse than they expect.
                  </p>
                  <Link
                    href="/play"
                    style={{ marginTop: 'auto', color: 'var(--green-ink)', fontSize: 'var(--fs-ui)', fontWeight: 'var(--fw-medium)' }}
                  >
                    Play a round →
                  </Link>
                </>
              )}
            </Card>

            {view.neighbours[0] ? (
              <Card style={{ display: 'flex', flexDirection: 'column' }}>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>Your neighbours</Eyebrow>
                {/* Leads with how the two DIFFER, not with a fact about the
                    neighbour. "Thailand is third in Asia for bioenergy" under a
                    heading that says "your neighbours" leaves a reader in the
                    UAE wondering why they are being told that. */}
                {/* The relationship has to be stated accurately: these are real
                    neighbours now, not the nearest grid of a similar size, so
                    the sentence must not claim a size match it no longer picks
                    for. */}
                <p style={claimStyle}>
                  {view.neighbours[0].cleanPct != null
                    ? `${subjectName(view.neighbours[0].name)} is ${view.neighbours[0].borders ? `over ${possessiveName(view.name)} border` : `the closest grid to ${theName(view.name)}`}, and ${Math.round(view.neighbours[0].cleanPct)}% of its electricity is clean against ${Math.round(view.data.aggregates.clean_pct)}%.`
                    : `${subjectName(view.neighbours[0].name)} is ${view.neighbours[0].borders ? `over ${possessiveName(view.name)} border` : `the closest grid to ${theName(view.name)}`}.`}
                </p>
                <p style={supportStyle}>{view.neighbours[0].headline}</p>
                <Link
                  href={`/compare?a=${view.key}&b=${view.neighbours[0].iso3}`}
                  style={{ marginTop: 'auto', color: 'var(--green)', fontSize: 'var(--fs-ui)' }}
                >
                  Compare them →
                </Link>
              </Card>
            ) : (
              <Card style={{ display: 'flex', flexDirection: 'column' }}>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>Side by side</Eyebrow>
                <p style={claimStyle}>France against Germany is the argument that never ends.</p>
                <p style={supportStyle}>
                  One bet on nuclear, one on renewables and coal. Here is the tape.
                </p>
                <Link
                  href="/compare?a=FRA&b=DEU"
                  style={{ marginTop: 'auto', color: 'var(--green)', fontSize: 'var(--fs-ui)' }}
                >
                  Settle it →
                </Link>
              </Card>
            )}

            <Card style={{ display: 'flex', flexDirection: 'column' }}>
              <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>The world</Eyebrow>
              <p style={claimStyle}>
                Every country on Earth, coloured by what keeps its lights on.
              </p>
              <p style={supportStyle}>
                {isWorld
                  ? 'Zoom out to all 214 grids and see how unevenly the world is wired.'
                  : `Zoom out to all 214 grids and see where ${named} actually sits.`}
              </p>
              <Link
                href="/explore"
                style={{ marginTop: 'auto', color: 'var(--green)', fontSize: 'var(--fs-ui)' }}
              >
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
              Location detected from your connection, never stored. Your choice of country is
              kept on this device only.
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
