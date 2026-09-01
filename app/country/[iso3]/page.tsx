import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import FlagImg from '@/components/FlagImg';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Card } from '@/components/ds/core/Card';
import { Stat } from '@/components/ds/core/Stat';
import { Badge } from '@/components/ds/core/Badge';
import { Button } from '@/components/ds/core/Button';
import { Banner } from '@/components/ds/feedback/Banner';
import { MixBar } from '@/components/ds/data/MixBar';
import { FuelLegend } from '@/components/ds/data/FuelLegend';
import { StackedAreaChart } from '@/components/ds/data/StackedAreaChart';
import { RankedBarList } from '@/components/ds/data/RankedBarList';
import { GorillaNote } from '@/components/ds/core/GorillaNote';

import { fuelShares, fuelSeries } from '@/lib/fuels';
import { leadStat } from '@/lib/leadStat';
import GridMetrics from '@/components/GridMetrics';
import { intensityMetric, tradeMetric, independenceMetric } from '@/lib/gridMetrics';
import { calculateIndependenceScoreV2, getFossilDataForYear } from '@/lib/independence';
import { loadFossilServer } from '@/lib/facts';
import {
  loadProfile,
  loadNeighbours,
  loadPagelessCountry,
  countryName,
  loadIntensityRanks,
  publishableIso3,
  type NeighbourLink,
} from '@/lib/facts';

/**
 * True, so /country/DEU resolves as well as /country/deu — the spec asks for
 * case-insensitive codes, and prerendering both cases would mean 400 pages for
 * 200 countries. Unknown codes fall through to notFound(); the canonical tag on
 * every page points at the lowercase form, so the two cases cannot be indexed
 * as duplicates.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const codes = await publishableIso3();
  return codes.map((iso3) => ({ iso3: iso3.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ iso3: string }>;
}): Promise<Metadata> {
  const { iso3 } = await params;
  const p = await loadProfile(iso3);
  if (!p) {
    const pageless = await loadPagelessCountry(iso3);
    // Deliberately noindex: this page exists to give a reader somewhere to go,
    // not to add a fifteenth near-identical entry to the index.
    return pageless
      ? {
          title: `${pageless.name} | Grid Gorilla`,
          description: `${pageless.name}'s grid is too small to profile. Nearby grids and where to find them.`,
          robots: { index: false, follow: true },
        }
      : { title: 'Country not found | Grid Gorilla', robots: { index: false, follow: true } };
  }

  const { facts } = p;
  // The description is the hook itself. A link to /country/nor in a group chat
  // should preview as the fact about Norway, not as the site's boilerplate.
  const description = [facts.hero.headline, facts.hero.detail].filter(Boolean).join(' ');
  const title = `${facts.name}: where its electricity comes from`;
  const url = `/country/${facts.iso3.toLowerCase()}`;

  return {
    title: `${title} | Grid Gorilla`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', siteName: 'Grid Gorilla' },
    twitter: { card: 'summary', title, description },
  };
}

/* -------------------------------------------------------------------------- */
/* Composition                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Which chart sits beside the hook.
 *
 * This is where the per-country composition actually lives. The rule is that the
 * graph has to be about the sentence next to it — a stacked area chart beside
 * "Nigeria has a fifth of Brazil's electricity per person" is decoration, and
 * decoration is how 200 pages become one page printed 200 times.
 *
 * `peer` is the case that forces the point: its claim is a comparison between
 * two countries, so the chart is two bars, not forty years of fuel mix.
 */
type RightPanel = 'series' | 'peer';

function panelFor(family: string): RightPanel {
  return family === 'peer' ? 'peer' : 'series';
}

const num = (n: number, dp = 0) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

const sectionStyle = { padding: '0 var(--gutter)', marginTop: 'var(--space-9)' } as const;

const headingStyle = {
  margin: '0 0 var(--space-5)',
  fontSize: 'var(--fs-h4)',
  fontWeight: 'var(--fw-bold)' as const,
  letterSpacing: 'var(--ls-h4)',
};

const panelLabelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono-xs)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--text-quiet)',
  marginBottom: 'var(--space-5)',
};

/** A country in the dataset that the engine has nothing to say about. */
async function NoProfile({ iso3 }: { iso3: string }) {
  const c = await loadPagelessCountry(iso3);
  if (!c) notFound();
  const neighbours = await loadNeighbours(iso3, 6);

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      <main style={{ flex: 1, padding: 'var(--band-y) var(--gutter)' }}>
        <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>No profile</Eyebrow>
        <h1
          style={{
            margin: 0,
            maxWidth: '24ch',
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-h2)',
            lineHeight: 'var(--lh-h2)',
          }}
        >
          {c.name}&rsquo;s grid is too small to profile.
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
          It generates less electricity in a year than a single large power station does in a
          week, which is not enough for us to say anything about it that is both true and worth
          reading. Rather than pad a page out, here are the grids nearest to it.
        </p>
        {neighbours.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              margin: 'var(--space-8) 0 0',
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
              maxWidth: '84ch',
            }}
          >
            {neighbours.map((n) => (
              <li key={n.iso3}>
                <NeighbourCard n={n} />
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-8)' }}>
          <Button as={Link} href="/explore" variant="primary">
            Find it on the map
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function NeighbourCard({ n }: { n: NeighbourLink }) {
  return (
    <Link
      href={`/country/${n.iso3.toLowerCase()}`}
      style={{
        display: 'block',
        padding: 'var(--space-5)',
        borderRadius: 'var(--r-card)',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        height: '100%',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <FlagImg iso3={n.iso3} size={18} />
        <span style={{ fontWeight: 'var(--fw-medium)' }}>{n.name}</span>
      </span>
      <span
        style={{ fontSize: 'var(--fs-ui)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)' }}
      >
        {n.headline}
      </span>
    </Link>
  );
}

export default async function CountryPage({ params }: { params: Promise<{ iso3: string }> }) {
  const { iso3 } = await params;
  const p = await loadProfile(iso3);
  if (!p) return <NoProfile iso3={iso3} />;

  const neighbours = await loadNeighbours(iso3);
  const { facts, country, data, year, years } = p;
  const shares = fuelShares(data).filter((s) => s.pct > 0);
  const { years: seriesYears, series } = fuelSeries(years, (y) => country.years[String(y)]);
  const perPerson = data.population ? (data.total_generation_twh * 1e9) / data.population : null;
  const panel = panelFor(facts.hero.family);
  const note = facts.supporting[0] ?? null;
  // The peer is chosen by population, so it is usually not a regional neighbour
  // and has to be looked up rather than found in that list.
  const peerName = panel === 'peer' ? await countryName(facts.hero.comparisonSet) : null;
  const lead = leadStat(facts.hero, data);

  // The three measures under the hook. Independence is shown only where the
  // fossil data exists: a country absent from that file is scored as fully
  // import-dependent, so publishing the number for the other 101 would not be a
  // rough figure, it would be a wrong one.
  const [{ ranks, of }, fossil] = await Promise.all([loadIntensityRanks(), loadFossilServer()]);
  const indep = (() => {
    const entry = fossil[facts.iso3];
    if (!entry) return null;
    const { data: fossilYear } = getFossilDataForYear(entry, year);
    if (!fossilYear) return null;
    const s = calculateIndependenceScoreV2(data, fossilYear, facts.iso3);
    return s && !s.missingFossilData ? s : null;
  })();

  const metrics = [
    intensityMetric(data, ranks[facts.iso3] ?? null, of),
    tradeMetric(data, facts.name),
    indep ? independenceMetric(indep.score, indep.label) : null,
  ].filter((m) => m !== null);

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav meta={`${facts.name} · ${year}`} />

      <main style={{ flex: 1, paddingBottom: 'var(--space-10)' }}>
        {facts.stale && (
          <div style={{ padding: 'var(--space-6) var(--gutter) 0' }}>
            <Banner label="Older figures" style={{ maxWidth: '68ch' }}>
              {facts.name}&rsquo;s electricity data stops in {year}, so everything on this page
              describes {year} rather than today.
            </Banner>
          </div>
        )}

        {/* Hook left, the chart it is about on the right. */}
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
              padding: 'var(--band-y) var(--space-9) var(--space-10) var(--gutter)',
              borderRight: '1px solid var(--border-default)',
            }}
          >
            <Eyebrow tone="accent" style={{ marginBottom: 'var(--space-5)' }}>
              {country.emberRegion && country.emberRegion !== 'Other'
                ? country.emberRegion
                : 'Country profile'}
            </Eyebrow>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
              }}
            >
              <FlagImg iso3={facts.iso3} size={28} />
              <h1
                style={{
                  margin: 0,
                  fontSize: 'var(--fs-h3)',
                  fontWeight: 'var(--fw-bold)',
                  letterSpacing: 'var(--ls-h3)',
                }}
              >
                {facts.name}
              </h1>
              <Badge tone="outline">{facts.iso3}</Badge>
            </div>

            <p
              style={{
                margin: 0,
                // No ch cap — the column is already half the page, and capping
                // the measure on top of that left the headline in a narrow
                // ribbon with most of its own column empty beside it.
                fontSize: 'var(--fs-h2)',
                fontWeight: 'var(--fw-bold)',
                letterSpacing: 'var(--ls-h2)',
                lineHeight: 'var(--lh-h2)',
                textWrap: 'pretty',
              }}
            >
              {facts.hero.headline}
            </p>

            {facts.hero.detail && (
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
                {facts.hero.detail}
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
                  value={num(data.aggregates.clean_pct)}
                  unit="%"
                  note={`in ${year}`}
                />
              )}
              {lead?.label !== 'Total output' && (
                <Stat
                  label="Total output"
                  value={num(data.total_generation_twh, data.total_generation_twh < 10 ? 1 : 0)}
                  unit="TWh"
                  note="a year"
                />
              )}
              {perPerson != null && lead?.label !== 'Per person' && (
                <Stat label="Per person" value={num(perPerson)} unit="kWh" note="a year" />
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Button as={Link} href={`/compare?a=${facts.iso3}`} variant="primary">
                Compare {facts.name}
              </Button>
              <Button as={Link} href="/explore" variant="secondary">
                See it on the map
              </Button>
            </div>
          </div>

          <div style={{ padding: 'var(--band-y) var(--gutter) var(--space-10) var(--space-9)' }}>
            {panel === 'series' ? (
              <>
                <div style={panelLabelStyle}>
                  {facts.name} · mix since {seriesYears[0]}
                </div>
                <StackedAreaChart series={series} years={seriesYears} height={280} />
                <FuelLegend
                  shares={shares.map((s) => ({ fuel: s.fuel, pct: s.pct }))}
                  style={{ marginTop: 'var(--space-5)' }}
                />
              </>
            ) : (
              <>
                <div style={panelLabelStyle}>Electricity per person, a year</div>
                <RankedBarList
                  items={[
                    {
                      label: facts.name,
                      value: facts.hero.values.kwh_per_person ?? 0,
                      display: `${num(facts.hero.values.kwh_per_person ?? 0)} kWh`,
                      tone: 'accent',
                    },
                    {
                      label: peerName ?? facts.hero.comparisonSet,
                      value: facts.hero.values.peer_kwh_per_person ?? 0,
                      display: `${num(facts.hero.values.peer_kwh_per_person ?? 0)} kWh`,
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
            )}

            {note && (
              <GorillaNote lead={note.headline} style={{ marginTop: 'var(--space-7)' }}>
                {note.detail}
              </GorillaNote>
            )}
          </div>
        </div>

        {metrics.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={headingStyle}>What this grid depends on</h2>
            <p
              style={{
                margin: '0 0 var(--space-6)',
                maxWidth: '62ch',
                fontSize: 'var(--fs-body)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--lh-body)',
              }}
            >
              Three measures that say more about a country than how much power it makes. Each one
              is explained underneath, because none of them mean much on their own.
            </p>
            <GridMetrics metrics={metrics} />
          </section>
        )}

        {facts.supporting.length > 1 && (
          <section style={sectionStyle}>
            <h2 style={headingStyle}>Also true of {facts.name}</h2>
            <div
              className="gg-card-row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--space-5)',
                maxWidth: '96ch',
              }}
            >
              {facts.supporting.slice(1).map((f) => (
                <Card key={f.id}>
                  <p style={{ margin: 0, fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)' }}>
                    {f.headline}
                  </p>
                  {f.detail && (
                    <p
                      style={{
                        margin: 'var(--space-3) 0 0',
                        fontSize: 'var(--fs-ui)',
                        color: 'var(--text-secondary)',
                        lineHeight: 'var(--lh-body)',
                      }}
                    >
                      {f.detail}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {neighbours.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={headingStyle}>{facts.name}&rsquo;s neighbours</h2>
            <ul
              className="gg-card-row"
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--space-4)',
                maxWidth: '96ch',
              }}
            >
              {neighbours.map((n) => (
                <li key={n.iso3}>
                  <NeighbourCard n={n} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section style={{ ...sectionStyle, marginTop: 'var(--space-10)' }}>
          <p style={{ margin: 0, maxWidth: '68ch', fontSize: 'var(--fs-ui)', color: 'var(--text-quiet)' }}>
            Figures are for {year}, the most recent year reported for {facts.name}. Generation
            shares are a percentage of electricity generated, not of energy used.{' '}
            <Link href="/methodology" style={{ color: 'var(--text-secondary)' }}>
              How this is calculated
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
