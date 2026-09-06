import Link from 'next/link';
import type { CSSProperties } from 'react';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { ArticleHeader, Prose } from '@/components/ds/content/Prose';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Button } from '@/components/ds/core/Button';
import { Stat } from '@/components/ds/core/Stat';
import { GorillaNote } from '@/components/ds/core/GorillaNote';
import { RankedBarList } from '@/components/ds/data/RankedBarList';
import { StackedAreaChart } from '@/components/ds/data/StackedAreaChart';
import { FuelLegend } from '@/components/ds/data/FuelLegend';
import CountryProfileLink from '@/components/CountryProfileLink';
import OnThisPage from '@/components/OnThisPage';
import { loadCountriesServer, publishableIso3 } from '@/lib/facts';
import { fuelSeries, fuelShares } from '@/lib/fuels';
import type { Country, YearData } from '@/lib/types';

/**
 * The argument for why any of this matters.
 *
 * A server component, and that is the point. The previous version hard-coded
 * six per-capita figures in JSX; four had drifted, China's was out by 24%, and
 * China had quietly overtaken Germany, which inverted the ladder the section
 * was built on. Every figure below is read from `countries-yearly.json` at
 * build time and moves on its own at the next refresh, exactly like the 200
 * country pages. A page arguing that people should follow the numbers cannot
 * be the one page on the site that types them in by hand.
 *
 * Laid out as full-bleed bands rather than one prose column, which is the
 * system's own layout language - ruled panels stacked vertically, each
 * introduced by a mono eyebrow. /story already leaves ArticleShell for the same
 * reason. The header stays, so the page still opens like the rest of the
 * publication; only the body is banded.
 */

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The per-capita ladder. Ten grids chosen to span the range with names a reader
 * recognises, rather than the literal top and bottom five - a ladder of
 * countries nobody can place is a chart about nothing. Sorted by value at build
 * time, so a refresh that moves two of them past each other cannot leave the
 * list in the wrong order. It already has: China passed Germany.
 */
const LADDER = ['ISL', 'NOR', 'CAN', 'USA', 'CHN', 'DEU', 'ZAF', 'IND', 'PAK', 'NGA'];

/** Latest year for this country holding both halves of a per-person figure. */
function latestWithPopulation(country: Country): { year: number; data: YearData } | null {
  const years = Object.keys(country.years)
    .map(Number)
    .sort((a, b) => b - a);
  for (const year of years) {
    const data = country.years[String(year)];
    if (data?.population && data.demand_twh) return { year, data };
  }
  return null;
}

function kwhPerPerson(country: Country): number | null {
  const latest = latestWithPopulation(country);
  if (!latest) return null;
  return (latest.data.demand_twh * 1e9) / latest.data.population!;
}

/** Latest year present in the series, whatever it holds. */
function latestYear(country: Country): number {
  return Math.max(...Object.keys(country.years).map(Number));
}

const num = (n: number) => Math.round(n).toLocaleString('en-GB');
const oneDp = (n: number) => n.toFixed(1);

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * One band: hairline on top, gutter padding, content held to the article
 * column - the same shape as a section on a country page, so the two read as
 * the same publication.
 */
const bandStyle: CSSProperties = {
  borderTop: '1px solid var(--border-default)',
  padding: 'var(--band-y) var(--gutter) var(--space-10)',
};

const columnStyle: CSSProperties = { maxWidth: 'var(--maxw-article)' };

/** A chart sits in a well, never loose on the page ground. */
const wellStyle: CSSProperties = {
  background: 'var(--bg-raised)',
  borderRadius: 'var(--r-well)',
  padding: 'var(--space-7)',
  marginTop: 'var(--space-8)',
};

const actionRowStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-4)',
  flexWrap: 'wrap',
  marginTop: 'var(--space-9)',
};

const splitStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  marginTop: 'var(--space-8)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--r-well)',
  overflow: 'hidden',
};

const splitPanelStyle: CSSProperties = {
  padding: 'var(--space-7)',
  borderRight: '1px solid var(--border-default)',
};

const statRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-9)',
  marginTop: 'var(--space-8)',
};

const wellLabelStyle: CSSProperties = {
  marginTop: 'var(--space-6)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono-xxs)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase',
  color: 'var(--text-quiet)',
};

/** A dated row of events. Mono year, hairline between, no bullets. */
function Timeline({ rows }: { rows: { year: string; text: string }[] }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {rows.map((r) => (
        <li
          key={r.year}
          style={{
            display: 'flex',
            gap: 'var(--space-5)',
            padding: 'var(--space-5) 0',
            margin: 0,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 'var(--fs-body-sm)',
            lineHeight: 'var(--lh-body-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              letterSpacing: '0.06em',
              color: 'var(--text-label)',
              minWidth: 40,
              flex: 'none',
            }}
          >
            {r.year}
          </span>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default async function WhyEnergyMattersPage() {
  const [countries, pages] = await Promise.all([loadCountriesServer(), publishableIso3()]);

  /* The spread. */
  const ladder = LADDER.map((iso3) => {
    const country = countries[iso3];
    const kwh = country ? kwhPerPerson(country) : null;
    return kwh == null ? null : { iso3, name: country.name, kwh };
  })
    .filter((r): r is { iso3: string; name: string; kwh: number } => r !== null)
    .sort((a, b) => b.kwh - a.kwh);

  const top = ladder[0];
  const bottom = ladder[ladder.length - 1];
  const spread = Math.round(top.kwh / bottom.kwh);

  /*
   * The price. The gas price is not in our data; the demand it destroyed is,
   * which is the half of the 2022 story this site can actually stand behind.
   */
  const deu = countries.DEU;
  const deuNow = latestYear(deu);
  const deu2021 = deu.years['2021'];
  const deu2023 = deu.years['2023'];
  const deuLatest = deu.years[String(deuNow)];
  const demandDrop = ((deu2021.demand_twh - deu2023.demand_twh) / deu2021.demand_twh) * 100;

  /* Two long bets. */
  const fra = countries.FRA;
  const fraNow = latestYear(fra);
  const fraLatest = fra.years[String(fraNow)];

  const yearsOf = (c: Country) =>
    Object.keys(c.years)
      .map(Number)
      .sort((a, b) => a - b);
  const fraYears = yearsOf(fra);
  const deuYears = yearsOf(deu);
  const fraSeries = fuelSeries(fraYears, (y) => fra.years[String(y)]);
  const deuSeries = fuelSeries(deuYears, (y) => deu.years[String(y)]);

  const emissionsRatio = deuLatest.emissions.total_mtco2 / fraLatest.emissions.total_mtco2;
  const demandGap = (deuLatest.demand_twh / fraLatest.demand_twh - 1) * 100;
  const deuFirst = deu.years[String(deuYears[0])];
  const deuCut = (1 - deuLatest.emissions.total_mtco2 / deuFirst.emissions.total_mtco2) * 100;

  return (
    <div className="gg-page min-h-screen flex flex-col" id="top">
      <TopNav active="why" />

      <main className="gg-article" style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ padding: 'var(--band-y) var(--gutter) var(--space-9)' }}>
          <div style={columnStyle}>
            <ArticleHeader
              kicker="The argument"
              title="Why energy matters"
              standfirst="Electricity is not one sector among many. It is the input to all the others."
            />
            <OnThisPage
              items={[
                { id: 'spread', label: 'How much you have' },
                { id: 'price', label: 'The price' },
                { id: 'leverage', label: 'The leverage' },
                { id: 'bets', label: 'Two long bets' },
                { id: 'reading', label: 'How to read a claim' },
              ]}
            />
          </div>
        </div>

        {/*
          1 - How much you have.

          No borderTop on this one band: OnThisPage already closes with a rule,
          and a second one 24px under it made four hairlines stack in the first
          screen. The header is furniture, not sections.
        */}
        <section id="spread" style={{ ...bandStyle, borderTop: 'none' }}>
          <div style={columnStyle}>
            <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>How much you have</Eyebrow>
            <Prose>
              <h2>How much electricity a country has decides what it can build</h2>
              <p className="lede">
                Most people picture electricity as keeping the lights on. Lighting is a tiny part
                of it. What the meter really measures is steel, fertiliser, clean water,
                hospitals and phone networks. So how much a country uses per person says more
                about what it can do than almost any other single number.
              </p>
              <p>
                So it matters that countries do not have remotely similar amounts of it. Here is
                the range, from one of the highest in the world to one of the lowest.
              </p>
            </Prose>

            <div style={wellStyle}>
              <RankedBarList
                labelWidth={132}
                barHeight={11}
                items={ladder.map((r) => ({
                  label: r.name,
                  value: r.kwh,
                  display: `${num(r.kwh)} kWh`,
                }))}
              />
              <div style={wellLabelStyle}>
                Electricity demand per person, a year &middot; each country&rsquo;s own latest
                full year
              </div>
            </div>

            <GorillaNote lead="Read the range, not the order.">
              {top.name} uses {spread} times what {bottom.name} does. That is not the same life
              lived more simply. It is a ceiling on what {bottom.name} can build, and every
              other number on this site is a detail of it. Coverage is uneven, so each bar is that
              country&rsquo;s own latest full year rather than a common one; the most recent
              available runs from 2022 to {deuNow} depending on the country.
            </GorillaNote>

            <Prose style={{ marginTop: 'var(--space-9)' }}>
              <p>What the difference actually buys:</p>
              <ul>
                <li>
                  <strong>Making things.</strong> Melting metal takes more electricity than
                  almost anything else people do: about 5,000 kWh for a tonne of steel, three
                  times that for aluminium. Countries without cheap power do not make these
                  things. They buy them from countries that do.
                </li>
                <li>
                  <strong>Food.</strong> The fertiliser that grows it, the pumps that water it,
                  and the fridges and refrigerated lorries that get it to a shop before it
                  spoils. Where the power is short, less food is grown and more of it is lost on
                  the way.
                </li>
                <li>
                  <strong>Hospitals.</strong> An operating theatre, an incubator or a
                  ventilator cannot stop when the power does, and neither can the fridge holding
                  the vaccines.
                </li>
                <li>
                  <strong>Clean water.</strong> It has to be pumped, cleaned, and in dry
                  countries made out of seawater. All of that runs on electricity. Where the
                  power is unreliable, so is the tap.
                </li>
                <li>
                  <strong>Everything on a phone.</strong> Mobile networks, banking, and every
                  app and site people use all day. All of it is electricity, running in buildings
                  most of us never see.
                </li>
              </ul>
            </Prose>

            <div className="gg-action-row" style={actionRowStyle}>
              <Button as={Link} href="/countries" variant="primary">
                Find your own country
              </Button>
            </div>
          </div>
        </section>

        {/* 2 - The price */}
        <section id="price" style={bandStyle}>
          <div style={columnStyle}>
            <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>The price</Eyebrow>
            <Prose>
              <h2>When electricity gets expensive, everything does</h2>
              <p>
                Russia began reducing gas deliveries to Europe in 2021 and cut them outright after
                invading Ukraine in 2022. European wholesale gas went from about &euro;20/MWh in
                early 2021 to more than &euro;300 at the peak in August 2022.
              </p>
              <p>
                Gas sets the electricity price in most European markets, so the rise did not stay
                in the gas market. Fertiliser is made from gas, so food got more expensive.
                Aluminium and chemicals are made with electricity, so those plants shut. Household
                bills in Germany went from roughly &euro;100 a month to several times that, and
                energy poverty stopped being a technical term.
              </p>
            </Prose>

            <div className="gg-stat-row" style={statRowStyle}>
              <Stat
                label="German demand, 2021"
                value={num(deu2021.demand_twh)}
                unit="TWh"
                note="the year before the cut"
              />
              <Stat
                label="Two years later"
                value={num(deu2023.demand_twh)}
                unit="TWh"
                tone="down"
                note={`${oneDp(demandDrop)}% below 2021`}
              />
              <Stat
                label={`And in ${deuNow}`}
                value={num(deuLatest.demand_twh)}
                unit="TWh"
                note="still short of where it started"
              />
            </div>

            <GorillaNote lead="Demand that leaves does not always come back.">
              Some of that fall is efficiency and mild winters, and some of it is production that
              moved abroad. The series cannot tell you the split. What it can tell you is
              that Germany still uses less electricity than it did before the shock, which is not
              what a recovery looks like.
            </GorillaNote>

            <div className="gg-action-row" style={actionRowStyle}>
              <CountryProfileLink iso3="DEU" source="why_article" style={{ display: 'inline-flex' }}>
                <Button as="span" variant="secondary">
                  See Germany&rsquo;s grid
                </Button>
              </CountryProfileLink>
            </div>
          </div>
        </section>

        {/* 3 - The leverage */}
        <section id="leverage" style={bandStyle}>
          <div style={columnStyle}>
            <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>The leverage</Eyebrow>
            <Prose>
              <h2>Whoever supplies your energy gets a say in your politics</h2>
              <p>
                This is not a theory about bad actors. It is what happens whenever one side of a
                trade can survive its interruption and the other cannot.
              </p>
            </Prose>

            <div className="gg-compare-split" style={splitStyle}>
              <div style={splitPanelStyle}>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>How it has gone</Eyebrow>
                <Timeline
                  rows={[
                    {
                      year: '1973',
                      text: 'OPEC embargoes the West. Oil roughly quadruples, from about $3 a barrel to $12. Rationing in Europe, queues in the United States.',
                    },
                    {
                      year: '2006',
                      text: 'Russia cuts gas to Ukraine in January. Deliveries onward into Europe fall with it.',
                    },
                    {
                      year: '2009',
                      text: 'It happens again and lasts nearly two weeks. South-east Europe is worst hit.',
                    },
                    {
                      year: '2014',
                      text: 'Crimea is annexed. Germany’s share of gas from Russia keeps rising afterwards, not falling.',
                    },
                    {
                      year: '2022',
                      text: 'Pipeline gas to Europe is cut outright. Germany had been taking about 55% of its gas from Russia the year before.',
                    },
                  ]}
                />
              </div>
              <div style={{ ...splitPanelStyle, borderRight: 'none' }}>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>What it costs you</Eyebrow>
                <Prose style={{ fontSize: 'var(--fs-body-sm)' }}>
                  <p>
                    A country that makes its own power decides its own foreign policy. A country
                    that imports it negotiates with someone who can turn the supply off.
                  </p>
                  <ul>
                    <li>Your supplier raises the price and there is no second bidder.</li>
                    <li>
                      Your position on their behaviour becomes a domestic heating question.
                    </li>
                    <li>
                      A crisis somewhere else arrives as your electricity bill, on a timetable you
                      do not set.
                    </li>
                  </ul>
                  <p>
                    Interdependence describes two parties who can each hurt the other. Where only
                    one of them can, it is dependence with better manners.
                  </p>
                </Prose>
              </div>
            </div>

            <div className="gg-action-row" style={actionRowStyle}>
              <Button as={Link} href="/rankings" variant="secondary">
                Who is least exposed
              </Button>
            </div>
          </div>
        </section>

        {/* 4 - Two long bets */}
        <section id="bets" style={bandStyle}>
          <div style={columnStyle}>
            <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>Two long bets</Eyebrow>
            <Prose>
              <h2>France and Germany chose differently, and both still live with it</h2>
              <p>
                After the 1973 embargo France built more than 50 reactors in 25 years. After
                Fukushima in 2011 Germany decided to close the reactors it had. Neither choice
                could be undone by a later government, because power stations outlast the
                parliaments that order them. Which is why it is worth looking at the two grids as
                they actually ran, rather than at what either country said it was doing.
              </p>
            </Prose>

            <div className="gg-compare-split" style={splitStyle}>
              <div style={splitPanelStyle}>
                <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>
                  France &middot; mix since {fraYears[0]}
                </Eyebrow>
                <StackedAreaChart series={fraSeries.series} years={fraSeries.years} height={200} />
                <FuelLegend
                  shares={fuelShares(fraLatest)
                    .filter((s) => s.pct > 0)
                    .map((s) => ({ fuel: s.fuel, value: `${oneDp(s.pct)}%` }))}
                  style={{ marginTop: 'var(--space-5)' }}
                />
              </div>
              <div style={{ ...splitPanelStyle, borderRight: 'none' }}>
                <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>
                  Germany &middot; mix since {deuYears[0]}
                </Eyebrow>
                <StackedAreaChart series={deuSeries.series} years={deuSeries.years} height={200} />
                <FuelLegend
                  shares={fuelShares(deuLatest)
                    .filter((s) => s.pct > 0)
                    .map((s) => ({ fuel: s.fuel, value: `${oneDp(s.pct)}%` }))}
                  style={{ marginTop: 'var(--space-5)' }}
                />
              </div>
            </div>

            <div className="gg-stat-row" style={statRowStyle}>
              <Stat
                label={`France, clean share ${fraNow}`}
                value={oneDp(fraLatest.aggregates.clean_pct)}
                unit="%"
                tone="accent"
                note={`${num(fraLatest.emissions.total_mtco2)} Mt CO₂e`}
              />
              <Stat
                label={`Germany, clean share ${deuNow}`}
                value={oneDp(deuLatest.aggregates.clean_pct)}
                unit="%"
                note={`${num(deuLatest.emissions.total_mtco2)} Mt CO₂e`}
              />
              <Stat
                label="So Germany emits"
                value={`${oneDp(emissionsRatio)}×`}
                tone="down"
                note={`more, for ${Math.round(demandGap)}% more electricity`}
              />
            </div>

            <GorillaNote lead="Neither one gets to be the simple answer.">
              Germany has cut its own electricity emissions by {Math.round(deuCut)}% since{' '}
              {deuYears[0]} and is still cutting. That is the half of the story a gap of{' '}
              {oneDp(emissionsRatio)}&times; hides. France imports 100% of the uranium its bet runs
              on, which is why its independence score is nothing like as high as its clean share.
              A 50-year decision buys one set of problems in exchange for another.
            </GorillaNote>

            <div className="gg-action-row" style={actionRowStyle}>
              <CountryProfileLink iso3="FRA" source="why_article" style={{ display: 'inline-flex' }}>
                <Button as="span" variant="secondary">
                  France in full
                </Button>
              </CountryProfileLink>
              <CountryProfileLink iso3="DEU" source="why_article" style={{ display: 'inline-flex' }}>
                <Button as="span" variant="secondary">
                  Germany in full
                </Button>
              </CountryProfileLink>
            </div>
          </div>
        </section>

        {/* 5 - How to read a claim */}
        <section id="reading" style={bandStyle}>
          <div style={columnStyle}>
            <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>How to read a claim</Eyebrow>
            <Prose>
              <h2>Four questions, and four answers that should worry you</h2>
              <p>
                Everything above is background. This is the part worth keeping: what to ask when
                someone tells you what your grid should do next.
              </p>
            </Prose>

            <div className="gg-compare-split" style={splitStyle}>
              <div style={splitPanelStyle}>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>Ask</Eyebrow>
                <Prose style={{ fontSize: 'var(--fs-body-sm)' }}>
                  <ul>
                    <li>What is the total cost, including the grid, and who pays it?</li>
                    <li>What runs when this one does not, at 6pm in January?</li>
                    <li>What are we importing to make it work, and from whom?</li>
                    <li>What is the plan if it takes twice as long as promised?</li>
                  </ul>
                </Prose>
              </div>
              <div style={{ ...splitPanelStyle, borderRight: 'none' }}>
                <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>Worry when you hear</Eyebrow>
                <Prose style={{ fontSize: 'var(--fs-body-sm)' }}>
                  <ul>
                    <li>A target with no cost attached to it.</li>
                    <li>More renewables, and nothing about what backs them up.</li>
                    <li>A power station closing before its replacement is running.</li>
                    <li>Independence claimed alongside a new import.</li>
                  </ul>
                </Prose>
              </div>
            </div>

            <Prose style={{ marginTop: 'var(--space-9)' }}>
              <p>
                Those questions work because there is no source without a cost. Anyone who tells
                you their option has no trade-off is selling something.
              </p>
            </Prose>

            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>What it gives you</th>
                  <th>What it costs you</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Coal</strong>
                  </td>
                  <td>Cheap, available almost everywhere, runs whenever you need it</td>
                  <td>The highest emissions on the grid, and the local air</td>
                </tr>
                <tr>
                  <td>
                    <strong>Gas</strong>
                  </td>
                  <td>Flexible, quick to build, cleaner than coal</td>
                  <td>Still fossil, and usually somebody else&rsquo;s gas</td>
                </tr>
                <tr>
                  <td>
                    <strong>Nuclear</strong>
                  </td>
                  <td>Runs day and night for decades, very little carbon, very little land</td>
                  <td>Slow and expensive to build, waste, imported fuel</td>
                </tr>
                <tr>
                  <td>
                    <strong>Wind and solar</strong>
                  </td>
                  <td>The cheapest new generation there has ever been</td>
                  <td>Only when the weather agrees, so storage, grid and backup</td>
                </tr>
                <tr>
                  <td>
                    <strong>Hydro</strong>
                  </td>
                  <td>Clean, runs on demand, and the only way we can store power in bulk today</td>
                  <td>You need the geography, and rivers have other claims on them</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Close */}
        <section style={bandStyle}>
          <div style={columnStyle}>
            <Eyebrow tone="accent" style={{ marginBottom: 'var(--space-5)' }}>
              Start here
            </Eyebrow>
            <Prose>
              <h2>The argument is general. Your grid is not.</h2>
              <p>
                Each of the {pages.length} countries on this site has its own page, its own mix and
                its own dependencies, and most of them are not what people assume. Pick one you
                think you already know.
              </p>
            </Prose>
            <div className="gg-action-row" style={actionRowStyle}>
              <Button as={Link} href="/countries" variant="primary">
                Browse every country
              </Button>
              <Button as={Link} href="/play" variant="secondary">
                Or test what you know
              </Button>
            </div>
          </div>
        </section>

        <div
          style={{
            borderTop: '1px solid var(--border-default)',
            padding: 'var(--space-7) var(--gutter)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--space-6)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--text-quiet)',
            }}
          >
            <a
              href="#top"
              style={{
                color: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
              }}
            >
              &uarr; Back to top
            </a>
            <span>Updated September 2026</span>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
