import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { ArticleShell } from '@/components/ds/content/Prose';
import Link from 'next/link';

export const metadata = {
  title: 'Credits & Attributions | Grid Gorilla',
  description: 'Data sources, attributions, and acknowledgements for Grid Gorilla.',
  alternates: {
    canonical: '/credits',
  },
};

function AttributionCard({
  title,
  items
}: {
  title: string;
  items: { name: string; url?: string; license: string; description: string }[]
}) {
  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      <h2
        style={{
          margin: '0 0 var(--space-5)',
          fontSize: 'var(--fs-h4)',
          fontWeight: 'var(--fw-bold)',
          letterSpacing: 'var(--ls-h4)',
        }}
      >
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="pb-4 border-b border-border-subtle last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-medium)', textDecoration: 'underline', textUnderlineOffset: 3 }}
                  >
                    {item.name}
                  </a>
                ) : (
                  <span style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-medium)' }}>{item.name}</span>
                )}
                <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-body-sm)', color: 'var(--text-secondary)' }}>{item.description}</p>
              </div>
              <span className="bg-inset shrink-0" style={{ padding: '3px 8px', borderRadius: 'var(--r-pill)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                {item.license}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav />

      <ArticleShell
        kicker="Sources"
        title="Credits and attributions"
        standfirst="Everyone whose data and work this site is built on."
      >
        <div className="max-w-3xl mx-auto px-4">
          
          <p className="mb-8">
            Grid Gorilla is built on open data and open source software. We gratefully acknowledge the following sources.
          </p>

          <div className="space-y-6">
            {/* Data Sources */}
            <AttributionCard
              title="Data Sources"
              items={[
                {
                  name: 'Ember Climate',
                  url: 'https://ember-energy.org',
                  license: 'CC BY 4.0',
                  description: 'Global electricity generation data by country and source (1998-2025). Primary data source for all electricity statistics.',
                },
                {
                  name: 'Our World in Data',
                  url: 'https://ourworldindata.org/energy',
                  license: 'CC BY 4.0',
                  description: 'Fossil fuel production and consumption data used for calculating energy independence scores.',
                },
                {
                  name: 'World Bank Open Data',
                  url: 'https://data.worldbank.org',
                  license: 'CC BY 4.0',
                  description: 'GDP, population, and other socioeconomic indicators for correlation analysis.',
                },
                {
                  name: 'UNDP Human Development Reports',
                  url: 'https://hdr.undp.org',
                  license: 'Open Access',
                  description: 'Human Development Index (HDI) data for quality of life correlations.',
                },
                {
                  name: 'World Nuclear Association',
                  url: 'https://world-nuclear.org',
                  license: 'Fair Use',
                  description: 'Uranium production data by country for nuclear independence calculations.',
                },
              ]}
            />

            {/* Map & Geographic Data */}
            <AttributionCard
              title="Map & Geographic Data"
              items={[
                {
                  name: 'Natural Earth',
                  url: 'https://www.naturalearthdata.com',
                  license: 'Public Domain',
                  description: 'World country boundaries and geographic features used in the interactive map.',
                },
                {
                  name: 'TopoJSON World Atlas',
                  url: 'https://github.com/topojson/world-atlas',
                  license: 'ISC License',
                  description: 'Optimized TopoJSON format of Natural Earth data for efficient web rendering.',
                },
              ]}
            />

            {/* Design Assets */}
            <AttributionCard
              title="Design Assets"
              items={[
                {
                  name: 'Gorilla tattoo icon by Astima',
                  url: 'https://thenounproject.com/browse/icons/term/gorilla-tattoo/',
                  license: 'CC BY 3.0',
                  description: 'Grid Gorilla logo from The Noun Project.',
                },
              ]}
            />

            {/* Open Source */}
            <AttributionCard
              title="Open Source Software"
              items={[
                {
                  name: 'Next.js',
                  url: 'https://nextjs.org',
                  license: 'MIT',
                  description: 'React framework for production-grade web applications.',
                },
                {
                  name: 'D3.js',
                  url: 'https://d3js.org',
                  license: 'ISC',
                  description: 'Data visualization library powering the interactive map and charts.',
                },
                {
                  name: 'Tailwind CSS',
                  url: 'https://tailwindcss.com',
                  license: 'MIT',
                  description: 'Utility-first CSS framework for styling.',
                },
              ]}
            />
          </div>

          {/* License Notice */}
          <div className="mt-8 p-4 bg-inset rounded-lg">
            <h3 className="mb-2">License Compliance</h3>
            <p>
              We comply with all license requirements for the data and assets used. Creative Commons
              licensed content is attributed as required. If you believe we have missed an attribution
              or made an error, please{' '}
              <a
                href="mailto:contact@gridgorilla.app"
                className="hover:text-primary underline"
              >
                contact us
              </a>.
            </p>
          </div>

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
