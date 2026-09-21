import { NextResponse, type NextRequest } from 'next/server';
import { getIso3 } from '@/lib/flags';
import { REGION_SLUG } from '@/lib/regions';
import countryPages from './public/data/country-pages.json';
import countryRegions from './public/data/country-regions.json';
import { CONSENT_REGION_COOKIE, consentRegionFor } from '@/lib/consentRegion';

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
 *
 * It also runs on every other page, for one job: telling the client whether
 * this visitor must be asked before analytics runs. Every page is prerendered,
 * so the browser has no other way to learn where it is - see lib/consentRegion.ts.
 */

const PAGES = new Set(countryPages as string[]);
const REGIONS = countryRegions as Record<string, string>;
const COOKIE = 'gg_country';

export function middleware(req: NextRequest) {
  const detected = req.headers.get('x-vercel-ip-country');
  const { pathname } = req.nextUrl;

  const res =
    pathname === '/' || pathname === '/countries'
      ? personalise(req, detected)
      : NextResponse.next();

  // Written only when it changes, so a returning visitor's responses carry no
  // Set-Cookie at all. Recomputed rather than trusted: someone who crosses a
  // border mid-session should be classified by where they are now. A session cookie: it is re-derived on every request, so a longer lifetime
  // would add nothing but a stale answer.
  const region = consentRegionFor(detected);
  if (req.cookies.get(CONSENT_REGION_COOKIE)?.value !== region) {
    res.cookies.set(CONSENT_REGION_COOKIE, region, {
      path: '/',
      sameSite: 'lax',
      secure: req.nextUrl.protocol === 'https:',
    });
  }
  return res;
}

function personalise(req: NextRequest, detected: string | null): NextResponse {
  const chosen = req.cookies.get(COOKIE)?.value?.toUpperCase();

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
  // Every page, and nothing that is not one: build assets, the data files and
  // anything else with an extension, and the generated share cards, which a
  // crawler fetches and which have no use for a consent cookie.
  matcher: ['/((?!_next/|.*\\..*|.*opengraph-image).*)'],
};
