'use client';

import Link from 'next/link';
import type { NavItem } from './navItems';
import { primaryNavItems } from './navItems';

interface NavigationProps {
  currentPage?: NavItem;
}

export default function Navigation({ currentPage }: NavigationProps) {
  return (
    <nav className="flex items-center gap-5">
      {primaryNavItems.map((item) =>
        item.key === currentPage ? (
          <span
            key={item.key}
            className="text-[14px] font-medium text-primary"
            aria-current="page"
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
