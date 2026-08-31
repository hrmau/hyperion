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

import { fuelShares, fuelSeries } from '@/lib/fuels';
import { loadProfile, loadNeighbours, publishableIso3, type CountryProfile, type NeighbourLink } from '@/lib/facts';

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
  if (!p) return { title: 'Country not found | Grid Gorilla' };

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

type ModuleKey = 'hero' | 'stats' | 'mix' | 'history' | 'evidence' | 'neighbours' | 'exits';

/**
 * Which sections this country's page is made of, and in what order.
 *
 * Deliberately a list rather than a fixed template. If every page were the same
 * sequence with different numbers, the only thing distinguishing 200 pages would
 * be the digits — which is the doorway-page failure arriving through the back
 * door, and it caps what a country page can ever become.
 *
 * The hero's family decides the order. When the hook is a crossover or a
 * trajectory the story is the shape of the series, so the chart comes first and
 * the reader sees the claim happen. When it is a rank or a concentration, the
 * present-day mix is the evidence, so that leads.
 */
function modulesFor(p: CountryProfile & { neighbours: NeighbourLink[] }): ModuleKey[] {
  const family = p.facts.hero.family;
  const timeIsThePoint = family === 'crossover' || family === 'trajectory';
  const hasHistory = p.years.length >= 5;

  const mods: ModuleKey[] = ['hero', 'stats'];
  if (timeIsThePoint && hasHistory) mods.push('history', 'mix');
  else {
    mods.push('mix');
    if (hasHistory) mods.push('history');
  }
  if (p.facts.supporting.length) mods.push('evidence');
  if (p.neighbours.length) mods.push('neighbours');
  mods.push('exits');
  return mods;
}

/* -------------------------------------------------------------------------- */

const num = (n: number, dp = 0) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

const sectionStyle = { padding: '0 var(--gutter)', marginTop: 'var(--space-9)' } as const;

const headingStyle = {
  margin: '0 0 var(--space-5)',
  fontSize: 'var(--fs-h4)',
  fontWeight: 'var(--fw-bold)' as const,
  letterSpacing: 'var(--ls-h4)',
};

export default async function CountryPage({ params }: { params: Promise<{ iso3: string }> }) {
  const { iso3 } = await params;
  const p = await loadProfile(iso3);
  if (!p) notFound();

  const neighbours = await loadNeighbours(iso3);
  const { facts, country, data, year, years } = p;
  const shares = fuelShares(data).filter((s) => s.pct > 0);
  const { years: seriesYears, series } = fuelSeries(years, (y) => country.years[String(y)]);
  const perPerson = data.population ? (data.total_generation_twh * 1e9) / data.population : null;
  const modules = modulesFor({ ...p, neighbours });

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav meta={`${facts.name} · ${year}`} />

      <main style={{ flex: 1, paddingBottom: 'var(--space-10)' }}>
        {/* Identity — always first, never optional */}
        <header style={{ padding: 'var(--band-y) var(--gutter) 0' }}>
          <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>
            {country.emberRegion && country.emberRegion !== 'Other'
              ? country.emberRegion
              : 'Country profile'}
          </Eyebrow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            <FlagImg iso3={facts.iso3} size={40} />
            <h1
              style={{
                margin: 0,
                fontSize: 'var(--fs-h1)',
                fontWeight: 'var(--fw-bold)',
                letterSpacing: 'var(--ls-h1)',
                lineHeight: 'var(--lh-h1)',
              }}
            >
              {facts.name}
            </h1>
            <Badge tone="outline">{facts.iso3}</Badge>
          </div>

          {facts.stale && (
            <Banner label="Older figures" style={{ marginTop: 'var(--space-6)', maxWidth: '68ch' }}>
              {facts.name}&rsquo;s electricity data stops in {year}, so everything on this page
              describes {year} rather than today.
            </Banner>
          )}
        </header>

        {modules.map((key) => {
          switch (key) {
            case 'hero':
              return (
                <section key={key} style={sectionStyle}>
                  <p
                    style={{
                      margin: 0,
                      maxWidth: '26ch',
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
                        margin: 'var(--space-5) 0 0',
                        maxWidth: '58ch',
                        fontSize: 'var(--fs-body-lg)',
                        lineHeight: 'var(--lh-body)',
                        color: 'var(--text-secondary)',
                        textWrap: 'pretty',
                      }}
                    >
                      {facts.hero.detail}
                    </p>
                  )}
                </section>
              );

            case 'stats':
              return (
                <section key={key} style={sectionStyle}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 'var(--space-6)',
                      maxWidth: '72ch',
                    }}
                  >
                    <Stat
                      label="Clean share"
                      value={num(data.aggregates.clean_pct)}
                      unit="%"
                      note={`of everything it generates in ${year}`}
                      tone={data.aggregates.clean_pct >= 60 ? 'accent' : 'default'}
                    />
                    <Stat
                      label="Total output"
                      value={num(data.total_generation_twh, data.total_generation_twh < 10 ? 1 : 0)}
                      unit="TWh"
                      note="a year"
                    />
                    {perPerson != null && (
                      <Stat
                        label="Per person"
                        value={num(perPerson)}
                        unit="kWh"
                        note="per year"
                      />
                    )}
                  </div>
                </section>
              );

            case 'mix':
              return (
                <section key={key} style={sectionStyle}>
                  <h2 style={headingStyle}>What it runs on</h2>
                  <div style={{ maxWidth: '72ch' }}>
                    <MixBar shares={shares} height={28} />
                    <FuelLegend
                      shares={shares.map((s) => ({ fuel: s.fuel, pct: s.pct }))}
                      style={{ marginTop: 'var(--space-5)' }}
                    />
                  </div>
                </section>
              );

            case 'history':
              return (
                <section key={key} style={sectionStyle}>
                  <h2 style={headingStyle}>
                    How that changed, {seriesYears[0]} to {seriesYears[seriesYears.length - 1]}
                  </h2>
                  <div style={{ maxWidth: '80ch' }}>
                    <StackedAreaChart series={series} years={seriesYears} height={260} />
                  </div>
                </section>
              );

            case 'evidence':
              return (
                <section key={key} style={sectionStyle}>
                  <h2 style={headingStyle}>Also true of {facts.name}</h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: 'var(--space-5)',
                      maxWidth: '84ch',
                    }}
                  >
                    {facts.supporting.map((f) => (
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
              );

            case 'neighbours':
              return (
                <section key={key} style={sectionStyle}>
                  <h2 style={headingStyle}>Grids of a similar size nearby</h2>
                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 'var(--space-4)',
                      maxWidth: '84ch',
                    }}
                  >
                    {neighbours.map((n) => (
                      <li key={n.iso3}>
                        <Link
                          href={`/country/${n.iso3.toLowerCase()}`}
                          style={{
                            display: 'block',
                            padding: 'var(--space-5)',
                            borderRadius: 'var(--r-card)',
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
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
                            style={{
                              fontSize: 'var(--fs-ui)',
                              color: 'var(--text-secondary)',
                              lineHeight: 'var(--lh-body)',
                            }}
                          >
                            {n.headline}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );

            case 'exits':
              return (
                <section key={key} style={sectionStyle}>
                  <h2 style={headingStyle}>Keep going</h2>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <Button as={Link} href="/explore" variant="primary">
                      See {facts.name} on the map
                    </Button>
                    <Button as={Link} href="/compare" variant="ghost">
                      Compare it with another country
                    </Button>
                    <Button as={Link} href="/rankings" variant="ghost">
                      All rankings
                    </Button>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}

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
