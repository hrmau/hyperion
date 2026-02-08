'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navigation from './Navigation';
import DarkModeToggle from './DarkModeToggle';

type NavItem = 'explore' | 'compare' | 'rankings' | 'correlations' | 'story' | 'why' | 'methodology';

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
          <Link href="/" className="flex items-center gap-2 group">
            {/* Light mode logo */}
            <Image
              src="/gridgorilla_logo.svg"
              alt="Grid Gorilla"
              width={32}
              height={32}
              className="dark:hidden"
            />
            {/* Dark mode logo */}
            <Image
              src="/gridgorilla_logo_dark.svg"
              alt="Grid Gorilla"
              width={32}
              height={32}
              className="hidden dark:block"
            />
            <div>
              <h1 className="text-lg font-medium text-primary tracking-tight group-hover:text-secondary transition-colors">
                Grid Gorilla
              </h1>
              <p className="text-[11px] text-muted">
                <span className="text-secondary">Global electricity explorer</span> &middot; 88 countries &middot; 2025
              </p>
            </div>
          </Link>
        </div>
        <Navigation currentPage={currentPage} />
        <div className="flex-1 flex justify-end">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
