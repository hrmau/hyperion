'use client';

import { useState, useRef, useEffect } from 'react';
import { getIso2 } from '@/lib/flags';
import type { Country } from '@/lib/types';

interface CountrySelectProps {
  countries: Country[];
  value: string;
  onChange: (iso3: string) => void;
  placeholder?: string;
}

/**
 * Country identity is an ISO 3166 two-letter code in mono, never a flag.
 * Flags are politically loaded, illegible at this size, and 214 of them is a
 * payload — see the iconography rules in docs/design-system/readme.md.
 */
function CountryCode({ iso3 }: { iso3: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-mono-xs)',
        letterSpacing: '0.06em',
        color: 'var(--text-quiet)',
        flex: 'none',
      }}
    >
      {getIso2(iso3) ?? '--'}
    </span>
  );
}

export default function CountrySelect({
  countries,
  value,
  onChange,
  placeholder = 'Select a country...',
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countries.find(c => c.iso3 === value);

  const filtered = search
    ? countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.iso3.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-inset border border-border rounded-lg text-sm text-left focus:outline-none focus:ring-1 focus:ring-border flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedCountry ? (
            <>
              <CountryCode iso3={selectedCountry.iso3} />
              <span className="text-primary truncate">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-2 py-1.5 bg-inset border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted">No countries found</div>
            ) : (
              filtered.map(country => (
                <button
                  key={country.iso3}
                  type="button"
                  onClick={() => {
                    onChange(country.iso3);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-inset transition-colors ${
                    value === country.iso3 ? 'bg-inset' : ''
                  }`}
                >
                  <CountryCode iso3={country.iso3} />
                  <span className="text-primary">{country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
