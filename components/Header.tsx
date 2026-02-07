'use client';

import Link from 'next/link';
import Navigation from './Navigation';
import DarkModeToggle from './DarkModeToggle';

type NavItem = 'explore' | 'compare' | 'rankings' | 'story' | 'why' | 'methodology';

interface HeaderProps {
  currentPage?: NavItem;
  fixed?: boolean;
}

export default function Header({ currentPage, fixed }: HeaderProps) {
  const headerClass = fixed
    ? "fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm"
    : "border-b border-border bg-card";

  return (
    <header className={headerClass}>
      <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center">
        <div className="flex-1">
          <Link href="/">
            <h1 className="text-base font-medium text-primary tracking-tight hover:text-secondary transition-colors">
              Hyperion
            </h1>
          </Link>
          <p className="text-[11px] text-muted">
            <span className="text-secondary">Global electricity explorer</span> &middot; 88 countries &middot; 2025
          </p>
        </div>
        <Navigation currentPage={currentPage} />
        <div className="flex-1 flex justify-end">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
