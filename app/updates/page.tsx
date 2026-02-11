import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: "What's New | Grid Gorilla",
  description: 'Latest updates and feature releases for Grid Gorilla.',
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
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors[tag]}`}>
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
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted tabular-nums">{update.date}</span>
            <TagBadge tag={update.tag} />
          </div>
        </div>

        <h3 className="text-sm font-medium text-primary mb-1.5">{update.title}</h3>
        <p className="text-xs text-secondary leading-relaxed">{update.description}</p>

        {update.highlights && update.highlights.length > 0 && (
          <ul className="mt-3 space-y-1">
            {update.highlights.map((highlight, i) => (
              <li key={i} className="text-xs text-muted flex items-start gap-2">
                <span className="text-border mt-0.5">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[18px] font-semibold text-primary mb-2">What&apos;s New</h1>
            <p className="text-sm text-secondary leading-relaxed">
              Major updates and feature releases for Grid Gorilla
            </p>
          </div>

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
            <p className="text-xs text-muted text-center">
              Have a feature request?{' '}
              <a
                href="mailto:contact@gridgorilla.app"
                className="text-secondary hover:text-primary underline"
              >
                Let us know
              </a>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              ← Back to explorer
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
