// Single source of truth for navigation. Header, Navigation and Footer all read
// from here so the primary/secondary split can only be changed in one place.

export type NavItem =
  | 'explore'
  | 'play'
  | 'compare'
  | 'rankings'
  | 'correlations'
  | 'story'
  | 'why'
  | 'methodology';

export interface NavLink {
  key: NavItem | string;
  label: string;
  href: string;
}

/** Primary nav — desktop header and the top block of the mobile menu. */
export const primaryNavItems: { key: NavItem; label: string; href: string }[] = [
  { key: 'explore', label: 'Explore', href: '/' },
  { key: 'play', label: 'Play', href: '/play' },
  { key: 'compare', label: 'Compare', href: '/compare' },
  { key: 'rankings', label: 'Rankings', href: '/rankings' },
];

/**
 * Secondary links — footer "More" column and the mobile menu below the divider.
 * These routes are all still live; only their nav placement is demoted.
 */
export const secondaryNavItems: NavLink[] = [
  { key: 'correlations', label: 'Correlations', href: '/correlations' },
  { key: 'story', label: 'Story', href: '/story' },
  { key: 'why', label: 'Why', href: '/why' },
  { key: 'methodology', label: 'Methodology', href: '/methodology' },
  { key: 'updates', label: 'Updates', href: '/updates' },
  { key: 'credits', label: 'Credits', href: '/credits' },
  { key: 'privacy', label: 'Privacy', href: '/privacy' },
  { key: 'terms', label: 'Terms', href: '/terms' },
];
