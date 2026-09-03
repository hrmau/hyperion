/**
 * Ember region <-> URL slug, and the set of `/countries` variants.
 *
 * Pure constants with no filesystem access, because `middleware.ts` imports this
 * and runs on the edge. Keep it that way.
 */

/**
 * North America is deliberately absent.
 *
 * Only 4 of its countries have a page - the same reason CLAUDE.md gives for it
 * having no regional ranking - so a North American visitor falls through to the
 * world set rather than being offered three neighbours and themselves.
 */
export const REGION_SLUG: Record<string, string> = {
  Africa: 'africa',
  Asia: 'asia',
  Europe: 'europe',
  'Latin America and Caribbean': 'latin-america',
  Oceania: 'oceania',
};

export const SLUG_REGION: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_SLUG).map(([region, slug]) => [slug, region])
);

/** Every prerendered `/countries` variant, world first. */
export const HUB_SLUGS = ['world', ...Object.values(REGION_SLUG)];

/** "Latin America and Caribbean" reads badly mid-sentence; this is the prose form. */
export function regionPhrase(region: string | null): string {
  if (!region) return '';
  return region === 'Latin America and Caribbean' ? 'Latin America and the Caribbean' : region;
}
