/**
 * Where analytics needs an explicit yes before it runs.
 *
 * Read by middleware.ts, which classifies each visitor by the country their
 * connection appears to come from, and by lib/cookies.ts, which reads the
 * result back out of a cookie. Both halves live here so the cookie's name and
 * values cannot drift between the writer and the reader.
 *
 * "The EU" is not the boundary, and is deliberately not what this list is
 * called. The rules that make analytics cookies opt-in are the ePrivacy
 * Directive plus GDPR, and they reach further than the Union:
 *
 * - the EEA states that adopt EU law without being members (IS, LI, NO)
 * - the United Kingdom, whose PECR keeps the same consent rule post-Brexit -
 *   and, with Ireland, the audience the site launches to
 * - Switzerland, whose revised FADP is looser on cookies, included because
 *   asking costs a banner and not asking costs an argument
 * - territories with their own ISO code that are EU territory (the French
 *   outermost regions, Aland) or run GDPR-equivalent law (Gibraltar, the
 *   Crown dependencies)
 *
 * **An unknown country requires consent.** No header means local dev, a proxy,
 * or a host that did not supply one, and opting someone in because we could
 * not tell where they are is exactly the mistake this file exists to avoid.
 */

const CONSENT_REQUIRED = new Set([
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE',
  // EU territory with its own ISO code
  'AX', 'GF', 'GP', 'MQ', 'RE', 'YT', 'MF',
  // EEA
  'IS', 'LI', 'NO',
  // UK and GDPR-equivalent British jurisdictions
  'GB', 'GI', 'GG', 'JE', 'IM',
  // Switzerland
  'CH',
]);

/** Cookie middleware writes and lib/cookies.ts reads. Not HttpOnly: the client reads it. */
export const CONSENT_REGION_COOKIE = 'gg_consent_region';

/** `required`: ask first. `implied`: analytics on until the visitor says otherwise. */
export type ConsentRegion = 'required' | 'implied';

export function consentRegionFor(iso2: string | null | undefined): ConsentRegion {
  if (!iso2) return 'required';
  const code = iso2.toUpperCase();
  // Vercel sends `XX` for unknown. Anything not two letters is not a country.
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX') return 'required';
  return CONSENT_REQUIRED.has(code) ? 'required' : 'implied';
}
