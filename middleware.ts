import { NextResponse, type NextRequest } from 'next/server';
import { getIso3 } from '@/lib/flags';
import { REGION_SLUG } from '@/lib/regions';
import countryPages from './public/data/country-pages.json';
import countryRegions from './public/data/country-regions.json';

/**
 * Serves the homepage as the visitor's own country, and `/countries` as their
 * own region.
 *
 * A rewrite, not a redirect: the URL stays `/` while the response is the
 * prerendered `/home/<iso3>`. Every variant is built ahead of time and served
 * from the CDN, so personalising the homepage costs no render and no data read
 * at request time. The alternative — reading the header in a dynamic server
 * component — would re-read a 6MB dataset on every visit to produce a page that
 * changes once a week.
 *
 * Order matters: an explicit choice beats a guess from an IP address.
 */

const PAGES = new Set(countryPages as string[]);
const REGIONS = countryRegions as Record<string, string>;
const COOKIE = 'gg_country';

export function middleware(req: NextRequest) {
  const chosen = req.cookies.get(COOKIE)?.value?.toUpperCase();
  const detected = req.headers.get('x-vercel-ip-country');

  const iso3 =
    (chosen && PAGES.has(chosen) && chosen) ||
    (detected && pageFor(detected)) ||
    // No header (local dev, a VPN, a crawler), a country the dataset does not
    // cover, or one too small to have a hook: the world view is a real page,
    // not an error state.
    'WORLD';

  const url = req.nextUrl.clone();

  if (req.nextUrl.pathname === '/countries') {
    // Only the six recommendation cards differ between variants; the A-Z index
    // under them is the same 200 links on every one, which is the part that has
    // to be indexable. So this is six prerendered pages rather than 200: the
    // reader's region is enough personalisation, and their own country is
    // already what `/` leads with.
    url.pathname = `/countries/r/${slugFor(iso3)}`;
    return NextResponse.rewrite(url);
  }

  url.pathname = `/home/${iso3.toLowerCase()}`;
  return NextResponse.rewrite(url);
}

/** Unknown region, or North America, which has too few pages to draw from. */
function slugFor(iso3: string): string {
  return REGION_SLUG[REGIONS[iso3]] ?? 'world';
}

function pageFor(iso2: string): string | null {
  const iso3 = getIso3(iso2);
  return iso3 && PAGES.has(iso3) ? iso3 : null;
}

export const config = {
  matcher: ['/', '/countries'],
};
