// Single source of truth for the primary nav. `TopNav` is the only reader; the
// demoted routes live in `components/ds/nav/SiteFooter.tsx`, which keeps its own
// three-column list because those columns are grouped and labelled editorially
// ("Explore", "Learn", "About") rather than being one flat tier.

/**
 * Which page is current.
 *
 * Wider than `primaryNavItems` on purpose: the demoted pages still pass their
 * own key to `TopNav`, where it simply matches nothing and no item lights up.
 * That is the correct result — Story is not a primary destination — and the
 * alternative is every one of those pages passing nothing and losing the
 * ability to ever be promoted without a type change.
 */
export type NavItem =
  | 'explore'
  | 'play'
  | 'compare'
  | 'rankings'
  | 'correlations'
  | 'story'
  | 'why'
  | 'methodology';

/**
 * Primary nav — the desktop header, and the fixed bottom bar below 768px.
 *
 * Four is a ceiling, not a default. `tokens/responsive.css` turns this list into
 * a bottom bar whose items are `flex: 1`, and at 375px four items leave about
 * 58px for a label once padding is taken off — which "Rankings" already fills.
 * A fifth item overflows rather than wraps, because the items are `nowrap`.
 * Anything new that wants to be reachable everywhere belongs in the top bar
 * alongside the wordmark, which is empty at that width, or in the footer.
 */
export const primaryNavItems: { key: NavItem; label: string; href: string }[] = [
  { key: 'explore', label: 'Explore', href: '/explore' },
  { key: 'play', label: 'Play', href: '/play' },
  { key: 'compare', label: 'Compare', href: '/compare' },
  { key: 'rankings', label: 'Rankings', href: '/rankings' },
];
