import fs from 'node:fs';
import path from 'node:path';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { ArticleShell } from '@/components/ds/content/Prose';
import Link from 'next/link';

interface DataMeta {
  /** When OWID last published, not when we last ran the refresh. */
  sourceUpdatedOn: string;
  countryCount: number;
  earliestYear: number;
  latestYear: number;
  countriesByLatestYear: Record<string, number>;
}

/**
 * Read the data's own metadata at build time.
 *
 * This page used to describe the dataset in prose that nobody remembered to
 * update, so it drifted. The refresh workflow regenerates data-meta.json on
 * every run, which means this block cannot go stale without the data itself
 * going stale.
 */
function readDataMeta(): DataMeta | null {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'data-meta.json');
    return JSON.parse(fs.readFileSync(file, 'utf8')) as DataMeta;
  } catch {
    return null;
  }
}

export const metadata = {
  title: "What's New | Grid Gorilla",
  description: 'Latest updates and feature releases for Grid Gorilla.',
  alternates: {
    canonical: '/updates',
  },
};

interface Update {
  date: string;
  title: string;
  description: string;
  highlights?: string[];
  tag?: 'feature' | 'data' | 'launch';
}

const updates: Update[] = [
  {
    date: 'Sep 2026',
    title: 'A Profile for Every Country',
    description: 'Two hundred countries now have a page of their own, and each one opens on a different kind of claim rather than the same sentence with the numbers swapped. Bhutan leads on running entirely off one river system, Germany on the year wind passed coal, Tanzania on having France\'s population and a fortieth of its electricity.',
    highlights: [
      'The lead fact is picked from seven families, so no two pages read alike',
      'Every figure printed in one is checked against the data that produced it',
      'Fourteen grids too small to say anything true about deliberately have no page',
    ],
    tag: 'feature',
  },
  {
    date: 'Sep 2026',
    title: 'A Homepage About Your Own Grid',
    description: 'The front page now opens with a fact about the country you are reading from, rather than a world map with no obvious first move. The map moved to /explore, where it still is.',
    highlights: [
      'Switch to any other country from the header, and it is remembered',
      'Location is read from the connection and never stored',
      'No country detected, or one we cannot cover, shows the world instead',
    ],
    tag: 'feature',
  },
  {
    date: 'Sep 2026',
    title: 'What a Grid Depends On',
    description: 'Country pages now carry carbon intensity, electricity trade and energy independence - three measures that say more about a country than how much power it makes. Each explains itself in plain English, because none of those terms mean anything on their own.',
    highlights: [
      'Carbon intensity is ranked, so a number becomes "cleaner than 7 in 10 grids"',
      'Trade is stated from whichever side a country is on: Luxembourg buys in 77%, Paraguay sells 35%',
      'Independence is never coloured good or bad - mining your own coal scores well',
    ],
    tag: 'feature',
  },
  {
    date: 'Sep 2026',
    title: 'Charts You Can Read a Year Off',
    description: 'The forty-year mix charts told you wind grew and nothing else. Hovering one now marks the year and gives every fuel\'s share at it, and the keyboard walks the years for anyone not using a mouse.',
    highlights: [
      'The figure beside each hook is now the one the hook is about, set in green',
      'Arrow keys move through the years, Home and End jump to either end',
    ],
    tag: 'feature',
  },
  {
    date: 'Sep 2026',
    title: 'Geothermal Separated From Bioenergy',
    description: 'The two were reported as one source, which was harmless while it was an unlabelled band on a chart and wrong the moment a page described it in words. Kenya read as 48% bioenergy when it is overwhelmingly geothermal; so did Iceland, New Zealand and the Philippines.',
    highlights: [
      'No published figure moved - the chart band is the sum of the two',
      'Emissions relabelled CO2e: the source counts methane and the full lifecycle, not just carbon dioxide',
      'Every country gained a region, so the smallest grids can be compared with their neighbours',
    ],
    tag: 'data',
  },
  {
    date: 'Aug 2026',
    title: 'Automatic Data Refresh',
    description: 'Energy data now refreshes from Our World in Data on a weekly schedule instead of by hand, so country figures stop drifting months behind the source.',
    highlights: [
      'Fossil fuel import data is now generated rather than hand-maintained',
      'Refreshes are validated before publishing - a bad upstream release is rejected',
      'Quiz insights that the new data contradicts are flagged for rewriting, not published',
    ],
    tag: 'data',
  },
  {
    date: 'Aug 2026',
    title: 'Correlation Figures Corrected',
    description: 'The correlation strength (r-squared) shown on the Energy & Prosperity page was being calculated with a straight-line model while the charts were drawn on logarithmic axes. The two now match, and the relationship is considerably stronger than previously published.',
    highlights: [
      'Electricity vs GDP: 0.35 to 0.65',
      'Electricity vs Human Development Index: 0.35 to 0.69',
      'Electricity vs life expectancy: 0.26 to 0.53',
      'Electricity vs manufacturing: 0.17 to 0.60',
    ],
    tag: 'data',
  },
  {
    date: 'Aug 2026',
    title: 'Map Coverage Fixed',
    description: 'The world map could only colour 99 countries while the dataset held 214. Countries including Ghana, Bahrain and DR Congo had full generation records but rendered as blank grey and could not be clicked.',
    highlights: [
      '173 countries now shaded and interactive, up from 99',
      '99.7% of world generation now represented on the map, up from 97.6%',
      'Per-capita electricity figures corrected - they were 1,000x too high',
    ],
    tag: 'data',
  },
  {
    date: 'Aug 2026',
    title: 'Higher or Lower',
    description: 'A guessing game at /play. Two countries, one energy metric, pick which is higher and build a streak. Every round ends with the story behind the number.',
    highlights: [
      'Questions are hand-curated, not randomly generated',
      'Both countries are always compared in the same year',
      'A wrong answer resets the streak but never ends the run',
      'Best streak is remembered between visits',
    ],
    tag: 'feature',
  },
  {
    date: 'Aug 2026',
    title: 'Simpler Navigation',
    description: 'The top navigation is now Explore, Play, Compare and Rankings. Correlations, Story and Why moved to the footer - all three pages are unchanged and still live at the same addresses.',
    tag: 'feature',
  },
  {
    date: 'Feb 2026',
    title: 'Rankings Page Enhancements',
    description: 'Click any country row in the rankings table to expand detailed information inline, without navigating away.',
    highlights: [
      'Visual energy mix breakdown with color-coded bars',
      'Key statistics including demand, emissions, and independence',
      'Quick link to compare with other countries',
      'Bloc membership at a glance',
    ],
    tag: 'feature',
  },
  {
    date: 'Feb 2026',
    title: 'Independence Score v3: Electricity Imports',
    description: 'Independence score now accounts for electricity imports via interconnectors, not just fuel imports.',
    highlights: [
      'Score calculated against demand, not generation',
      'Net electricity importers (demand > generation) penalized',
      'Countries like Luxembourg now show true import dependency',
      'Asterisk (*) indicates missing fossil fuel data',
    ],
    tag: 'data',
  },
  {
    date: 'Feb 2026',
    title: 'Shareable Compare URLs',
    description: 'Compare page state is now saved to the URL. Share specific country comparisons with others by copying the link.',
    tag: 'feature',
  },
  {
    date: 'Feb 2026',
    title: 'Correlation Dashboard',
    description: 'New interactive scatter plots exploring the relationship between energy consumption and prosperity indicators.',
    highlights: [
      'GDP per capita vs electricity consumption',
      'Human Development Index correlations',
      'Life expectancy relationships',
      'Manufacturing output analysis',
    ],
    tag: 'feature',
  },
  {
    date: 'Feb 2026',
    title: 'Map Color Modes',
    description: 'Switch between three different map visualizations to explore different aspects of global electricity.',
    highlights: [
      'Production view - total generation by country',
      'Independence view - energy independence scores',
      'Clean energy view - renewable + nuclear percentage',
    ],
    tag: 'feature',
  },
  {
    date: 'Jan 2026',
    title: 'Why Energy Matters',
    description: 'Comprehensive educational page explaining the connection between energy abundance and economic prosperity.',
    tag: 'feature',
  },
  {
    date: 'Jan 2026',
    title: 'Energy Story Timeline',
    description: 'Visual narrative exploring how global electricity generation has evolved from 1998 to 2025, highlighting key transitions and country stories.',
    tag: 'feature',
  },
  {
    date: 'Jan 2026',
    title: 'Energy Independence Score v2',
    description: 'Major methodology update incorporating fossil fuel import dependency and uranium production data.',
    highlights: [
      'Fossil fuel production/consumption ratios from Our World in Data',
      'Uranium mining data from World Nuclear Association',
      'Countries scored on actual domestic fuel production',
      'France now scored at ~20% due to 100% uranium imports',
    ],
    tag: 'data',
  },
  {
    date: 'Jan 2026',
    title: 'Rankings Page',
    description: 'Sortable table showing all 88 countries ranked by various metrics including generation, independence score, clean energy percentage, and more.',
    tag: 'feature',
  },
  {
    date: 'Jan 2026',
    title: 'Country Comparison',
    description: 'Side-by-side comparison of up to 4 countries with split bars showing energy mix breakdown.',
    highlights: [
      'Compare any countries directly',
      'Bloc comparison aggregates',
      'Country flags for quick identification',
    ],
    tag: 'feature',
  },
  {
    date: 'Dec 2025',
    title: 'Energy Independence Score MVP',
    description: 'First version of the independence scoring system, measuring how much electricity comes from domestic vs imported sources.',
    tag: 'feature',
  },
  {
    date: 'Dec 2025',
    title: 'Dark Mode',
    description: 'Full dark theme support across all pages. Toggle in the header to switch between light and dark modes.',
    tag: 'feature',
  },
  {
    date: 'Dec 2025',
    title: 'Map Zoom & Pan',
    description: 'Interactive map controls allowing zoom and pan for detailed regional exploration.',
    tag: 'feature',
  },
  {
    date: 'Dec 2025',
    title: 'Initial Launch',
    description: 'Grid Gorilla launches with core features for exploring global electricity data.',
    highlights: [
      'Interactive world map with choropleth visualization',
      '88 countries with yearly data from 1998-2025',
      'Bloc filtering (EU, NATO, BRICS, G7, G20, etc.)',
      'Year slider for historical exploration',
      'Country detail panels with energy mix breakdown',
    ],
    tag: 'launch',
  },
];

function TagBadge({ tag }: { tag: Update['tag'] }) {
  const colors = {
    feature: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    data: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    launch: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  };

  const labels = {
    feature: 'Feature',
    data: 'Data',
    launch: 'Launch',
  };

  if (!tag) return null;

  return (
    <span
      className={colors[tag]}
      style={{
        padding: '3px 9px',
        borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-mono-xs)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {labels[tag]}
    </span>
  );
}

function TimelineItem({ update, isLast }: { update: Update; isLast: boolean }) {
  return (
    <div className="relative pl-6 pb-6 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
      )}

      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-card border-2 border-border flex items-center justify-center">
        <div className="w-[5px] h-[5px] rounded-full bg-secondary" />
      </div>

      {/* Content */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-quiet)',
            }}
          >
            {update.date}
          </span>
          <TagBadge tag={update.tag} />
        </div>

        <h3
          style={{
            margin: '0 0 var(--space-3)',
            fontSize: 'var(--fs-h4)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-h4)',
          }}
        >
          {update.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--fs-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--text-secondary)',
          }}
        >
          {update.description}
        </p>

        {/* No bullet of its own: .gg-prose already draws a mono marker on every
            list item, so the hand-rolled dot rendered a second one beside it. */}
        {update.highlights && update.highlights.length > 0 && (
          <ul style={{ margin: 'var(--space-5) 0 0' }}>
            {update.highlights.map((highlight, i) => (
              <li
                key={i}
                style={{
                  fontSize: 'var(--fs-body-sm)',
                  lineHeight: 'var(--lh-body-sm)',
                  color: 'var(--text-tertiary)',
                }}
              >
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function UpdatesPage() {
  const meta = readDataMeta();
  const currentYearCount = meta ? meta.countriesByLatestYear[String(meta.latestYear)] ?? 0 : 0;

  return (
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav />

      <ArticleShell
        kicker="Changelog"
        title="What's new"
        standfirst="Feature releases and data corrections, newest first."
      >
        <div>
          {/* Header */}
          <div className="mb-8">
            
            <p>
              Major updates and feature releases for Grid Gorilla
            </p>
          </div>

          {/* Data currency — generated, never hand-edited. See readDataMeta above. */}
          {meta && (
            <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-9)' }}>
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h2
                  style={{
                    margin: 0,
                    fontSize: 'var(--fs-h4)',
                    fontWeight: 'var(--fw-bold)',
                    letterSpacing: 'var(--ls-h4)',
                    maxWidth: 'none',
                  }}
                >
                  Data currency
                </h2>
                <span style={{ fontSize: 'var(--fs-body-sm)' }}>
                  source published {meta.sourceUpdatedOn}
                </span>
              </div>
              <p>
                {meta.countryCount} countries, {meta.earliestYear}-{meta.latestYear}.{' '}
                {currentYearCount} of them already report {meta.latestYear} figures; the rest
                run to whichever year their national statistics office has published.
                That is why country labels across the site show different years.
              </p>
              <p style={{ fontSize: 'var(--fs-body-sm)', marginTop: 'var(--space-4)' }}>
                Checked weekly against{' '}
                <a
                  href="https://ourworldindata.org/energy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline decoration-dotted underline-offset-2"
                >
                  Our World in Data
                </a>
                , CC BY 4.0.
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {updates.map((update, index) => (
              <TimelineItem
                key={index}
                update={update}
                isLast={index === updates.length - 1}
              />
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center">
              Have a feature request?{' '}
              <a
                href="mailto:contact@gridgorilla.app"
                className="hover:text-primary underline"
              >
                Let us know
              </a>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/explore"
              className="hover:text-primary transition-colors"
            >
              ← Back to explorer
            </Link>
          </div>
        </div>
      </ArticleShell>

      <SiteFooter />
    </div>
  );
}
