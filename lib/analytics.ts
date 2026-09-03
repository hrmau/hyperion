// Thin wrapper over GA4's gtag, plus the site's event vocabulary.
//
// GoogleAnalytics.tsx only injects gtag once the visitor has consented to
// analytics cookies, so `window.gtag` is simply absent otherwise and every call
// here becomes a no-op. That is the intended behaviour: never queue events for
// a visitor who declined — and it means every number below is a floor, not a
// count. Whatever share of visitors decline is missing from all of it.
//
// # The convention
//
// Event names are snake_case, and GA4's own recommended names are used where
// one fits (`share`) rather than inventing a parallel vocabulary.
//
// Parameters are typed unions rather than free strings. A misspelled `source`
// does not fail loudly at runtime — it quietly becomes a new row in a report
// nobody reconciles — so it fails at build time instead.
//
// **Custom parameters are invisible in GA4 reports until they are registered as
// custom dimensions** in Admin -> Custom definitions. Until then they exist only
// in DebugView and the BigQuery export. The parameters that need registering are
// named in CLAUDE.md.

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: GtagParams) => void;
  }
}

export function trackEvent(eventName: string, params?: GtagParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params);
  } catch {
    // Analytics must never break the page.
  }
}

/**
 * Which surface sent a reader to a country profile.
 *
 * Every internal route to a profile is in this union, and the union is the
 * point: 200 country pages share one event, so "what drives traffic to the
 * profiles" is one report split by this dimension rather than 200 reports.
 *
 * Referrers cannot answer this. App Router navigations are client-side, and a
 * referrer names the page a reader came from, not which of the several links on
 * it they took — /countries alone has two.
 *
 * External and search traffic is not here on purpose: session source/medium and
 * the landing-page report already cover it. This is the half GA cannot see.
 */
export type ProfileSource =
  | 'home_hero'          // the homepage's "See <country>'s full profile"
  | 'rankings'           // an expanded row on /rankings
  | 'countries_picks'    // a "Worth a look" card on /countries
  | 'countries_index'    // the A-Z index on /countries
  | 'country_finder'     // the search in the top bar, on any page
  | 'compare'            // "Full profile" beside a column on /compare
  | 'map_panel'          // the country panel on /explore
  | 'country_peers'      // the regional peers on another country's profile
  | 'pageless_fallback'; // the nearest grids offered to a country with no page

export function trackCountryProfileOpen(source: ProfileSource, iso3: string): void {
  trackEvent('country_profile_open', { source, country: iso3.toUpperCase() });
}

/** What was shared. `item_id` carries the comparison pair or the streak length. */
export type ShareContent = 'comparison' | 'streak';
export type ShareMethod = 'copy_link' | 'web_share';

/**
 * GA4's recommended `share` event, so total share volume is one number and the
 * split is a dimension. Replaces the bespoke `play_share`, which could only ever
 * have answered half the question.
 */
export function trackShare(
  contentType: ShareContent,
  method: ShareMethod,
  itemId: string
): void {
  trackEvent('share', { content_type: contentType, method, item_id: itemId });
}
