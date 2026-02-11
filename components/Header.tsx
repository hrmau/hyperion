'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from './Navigation';
import DarkModeToggle from './DarkModeToggle';

type NavItem = 'explore' | 'compare' | 'rankings' | 'correlations' | 'story' | 'why' | 'methodology';

interface HeaderProps {
  currentPage?: NavItem;
  fixed?: boolean;
}

// Core navigation items
const coreNavItems: { key: NavItem; label: string; href: string }[] = [
  { key: 'explore', label: 'Explore', href: '/' },
  { key: 'compare', label: 'Compare', href: '/compare' },
  { key: 'rankings', label: 'Rankings', href: '/rankings' },
  { key: 'correlations', label: 'Correlations', href: '/correlations' },
  { key: 'story', label: 'Story', href: '/story' },
  { key: 'why', label: 'Why', href: '/why' },
];

// Secondary links (shown in mobile menu after separator)
const secondaryLinks: { key: string; label: string; href: string }[] = [
  { key: 'methodology', label: 'Methodology', href: '/methodology' },
  { key: 'credits', label: 'Credits', href: '/credits' },
  { key: 'privacy', label: 'Privacy', href: '/privacy' },
  { key: 'terms', label: 'Terms', href: '/terms' },
];

export default function Header({ currentPage, fixed }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const headerClass = fixed
    ? "fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm"
    : "border-b border-border bg-card";

  return (
    <>
      <header className={headerClass}>
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center">
          {/* Logo - always visible */}
          <div className="flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-2 group">
              {/* Light mode logo */}
              <Image
                src="/gridgorilla_logo.svg"
                alt="Grid Gorilla"
                width={32}
                height={32}
                className="dark:hidden flex-shrink-0"
              />
              {/* Dark mode logo */}
              <Image
                src="/gridgorilla_logo_dark.svg"
                alt="Grid Gorilla"
                width={32}
                height={32}
                className="hidden dark:block flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-medium text-primary tracking-tight group-hover:text-secondary transition-colors">
                  Grid Gorilla
                </h1>
                <p className="text-[11px] text-muted hidden sm:block">
                  <span className="text-secondary">Global electricity explorer</span> &middot; 88 countries &middot; 2025
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden lg:block">
            <Navigation currentPage={currentPage} />
          </div>

          {/* Right side: Dark mode toggle + Mobile menu button */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <DarkModeToggle />

            {/* Mobile menu button - visible on mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-inset transition-colors text-muted hover:text-primary"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out menu */}
          <nav
            className="lg:hidden fixed top-0 right-0 bottom-0 w-64 bg-card border-l border-border z-50 overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-inset transition-colors text-muted hover:text-primary"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {/* Core navigation */}
              {coreNavItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-3 rounded-lg text-[14px] transition-colors ${
                    item.key === currentPage
                      ? 'bg-inset text-primary font-medium'
                      : 'text-muted hover:text-primary hover:bg-inset'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Separator */}
              <div className="my-3 mx-3 border-t border-border-subtle" />

              {/* Secondary links */}
              <div className="pt-1">
                <span className="block px-3 pb-2 text-[11px] uppercase tracking-wider text-muted/70">
                  More
                </span>
                {secondaryLinks.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2.5 px-3 rounded-lg text-[13px] transition-colors ${
                      item.key === currentPage
                        ? 'bg-inset text-primary font-medium'
                        : 'text-muted hover:text-primary hover:bg-inset'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
