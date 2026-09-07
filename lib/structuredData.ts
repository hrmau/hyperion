import type { CountryFacts } from '@/lib/facts';

/**
 * JSON-LD builders.
 *
 * Kept out of the page components because the shapes are data, not markup, and
 * because every value in them has to come from the same place the visible page
 * gets it. Structured data that disagrees with the page it sits on is worse
 * than none: Google treats the mismatch as a quality signal, and a reader who
 * checks finds two different numbers.
 *
 * Deliberately no `SearchAction` on the WebSite. The sitelinks searchbox
 * requires a URL a query can be appended to, and this site has no such
 * endpoint - CountryFinder is a client-side dropdown over a 5KB index. Claiming
 * one would be describing a search that does not exist.
 *
 * Deliberately no `FAQPage` on /methodology either, despite the FAQ section:
 * Google restricted that rich result to government and health sites in 2023, so
 * it buys nothing and adds a surface that has to be kept true.
 */

const BASE = 'https://gridgorilla.app';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';

/** The two upstream sources, named the way /credits names them. */
const SOURCES = [
  { '@type': 'Organization', name: 'Ember', url: 'https://ember-energy.org' },
  { '@type': 'Organization', name: 'Our World in Data', url: 'https://ourworldindata.org/energy' },
] as const;

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Grid Gorilla',
  url: `${BASE}/`,
  logo: { '@type': 'ImageObject', url: `${BASE}/icons/android-chrome-512x512.png` },
} as const;

export type JsonLdObject = Record<string, unknown>;

/**
 * The site itself. On the homepage only, which is served by every `/home/*`
 * variant - so the url is `/`, matching the canonical, and not the variant path.
 */
export function websiteJsonLd(description: string): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Grid Gorilla',
    alternateName: 'Grid Gorilla energy data',
    url: `${BASE}/`,
    description,
    inLanguage: 'en-GB',
    publisher: PUBLISHER,
    license: CC_BY_4,
    isAccessibleForFree: true,
  };
}

/**
 * A country profile, as the dataset it presents.
 *
 * `Dataset` and not `Article`: the page is a rendering of a series we also ship
 * as JSON, the licence and the upstream creators are real, and `distribution`
 * points at the actual file rather than at a description of one. An `Article`
 * would need an author and a publication date that do not exist - these pages
 * are generated from data, and saying otherwise to earn a rich result is the
 * kind of thing this codebase does not do.
 */
export function countryDatasetJsonLd(
  facts: CountryFacts,
  opts: { firstYear: number; lastYear: number; measures: string[] }
): JsonLdObject {
  const url = `${BASE}/country/${facts.iso3.toLowerCase()}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${facts.name} electricity generation by source, ${opts.firstYear}-${opts.lastYear}`,
    description: [facts.hero.headline, facts.hero.detail].filter(Boolean).join(' '),
    url,
    license: CC_BY_4,
    creator: SOURCES,
    publisher: PUBLISHER,
    isAccessibleForFree: true,
    // The year the figures describe, not the build date. A crawler that sees a
    // fresh date on every deploy learns to ignore the field.
    temporalCoverage: `${opts.firstYear}/${opts.lastYear}`,
    dateModified: `${facts.year}-12-31`,
    spatialCoverage: {
      '@type': 'Country',
      name: facts.name,
      identifier: facts.iso3,
    },
    variableMeasured: opts.measures.map((name) => ({ '@type': 'PropertyValue', name })),
    isBasedOn: 'https://github.com/owid/energy-data',
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Yearly generation mix, demand, emissions and population for every country',
        encodingFormat: 'application/json',
        contentUrl: `${BASE}/data/countries-yearly.json`,
      },
    ],
    keywords: [
      facts.name,
      'electricity',
      'energy mix',
      'renewable energy',
      'energy independence',
    ],
  };
}

/** Home > Countries > this page. The last item carries no `item`, per spec. */
export function breadcrumbJsonLd(trail: { name: string; path?: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      ...(step.path ? { item: `${BASE}${step.path}` } : {}),
    })),
  };
}
