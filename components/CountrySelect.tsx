'use client';

import { useState, useRef, useEffect } from 'react';
import FlagImg from './FlagImg';
import type { Country } from '@/lib/types';

interface CountrySelectProps {
  countries: Country[];
  value: string;
  onChange: (iso3: string) => void;
  placeholder?: string;
}

/**
 * Every control here clears the design system's 44px floor, which the
 * accessibility card states applies "at every breakpoint - not just touch".
 * The trigger, the search field and each option row were around 36px, which is
 * a miss on a phone and a documented violation everywhere else.
 */
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
        className="w-full min-h-[44px] px-4 py-2.5 bg-inset border border-border rounded-lg text-sm text-left focus:outline-none focus:ring-1 focus:ring-border flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedCountry ? (
            <>
              <FlagImg iso3={selectedCountry.iso3} size={18} />
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
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full min-h-[44px] px-3 bg-inset border border-border rounded text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <div className="overflow-y-auto max-h-60">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted">No countries found</div>
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
                  className={`w-full min-h-[44px] px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-inset transition-colors ${
                    value === country.iso3 ? 'bg-inset' : ''
                  }`}
                >
                  <FlagImg iso3={country.iso3} size={18} />
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
