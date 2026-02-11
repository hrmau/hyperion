'use client';

import Link from 'next/link';

type NavItem = 'explore' | 'compare' | 'rankings' | 'correlations' | 'story' | 'why' | 'methodology';

interface NavigationProps {
  currentPage?: NavItem;
}

// Core nav items for desktop - Methodology moved to footer
const navItems: { key: NavItem; label: string; href: string }[] = [
  { key: 'explore', label: 'Explore', href: '/' },
  { key: 'compare', label: 'Compare', href: '/compare' },
  { key: 'rankings', label: 'Rankings', href: '/rankings' },
  { key: 'correlations', label: 'Correlations', href: '/correlations' },
  { key: 'story', label: 'Story', href: '/story' },
  { key: 'why', label: 'Why', href: '/why' },
];

export default function Navigation({ currentPage }: NavigationProps) {
  return (
    <nav className="flex items-center gap-5">
      {navItems.map((item) =>
        item.key === currentPage ? (
          <span
            key={item.key}
            className="text-[14px] font-medium text-primary"
          >
            {item.label}
          </span>
        ) : (
          <Link
            key={item.key}
            href={item.href}
            className="text-[14px] text-muted hover:text-primary transition-colors"
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
