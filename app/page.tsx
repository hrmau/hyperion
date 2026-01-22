'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import WorldMap from '@/components/WorldMap';
import CountryTooltip from '@/components/CountryTooltip';
import CountryPanel from '@/components/CountryPanel';
import BlocSelector from '@/components/BlocSelector';
import YearSlider from '@/components/YearSlider';
import {
  loadCountries,
  loadBlocs,
  getCountriesInBloc,
  getAvailableYears,
  getLatestYear,
} from '@/lib/data';
import type { CountriesData, BlocsData, Country } from '@/lib/types';

export default function Home() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedBloc, setSelectedBloc] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Load data
  useEffect(() => {
    Promise.all([loadCountries(), loadBlocs()])
      .then(([countriesData, blocsData]) => {
        setCountries(countriesData);
        setBlocs(blocsData);
        setSelectedYear(getLatestYear(countriesData));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const years = useMemo(() => {
    if (!countries) return [];
    return getAvailableYears(countries);
  }, [countries]);

  const blocCountryIds = useMemo(() => {
    if (!countries || !blocs) return new Set<string>();
    const countriesInBloc = getCountriesInBloc(selectedBloc, countries, blocs);
    return new Set(countriesInBloc.map(c => c.iso3));
  }, [countries, blocs, selectedBloc]);

  const handleHover = useCallback(
    (country: Country | null, event: MouseEvent | null) => {
      setHoveredCountry(country);
      if (event) {
        setTooltipPos({ x: event.clientX, y: event.clientY });
      } else {
        setTooltipPos(null);
      }
    },
    []
  );

  const handleClick = useCallback((country: Country | null) => {
    setSelectedCountry(country);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  if (loading || !countries || !blocs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-secondary">Loading energy data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b border-gray-100 bg-card">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-primary">
            Global Electricity Production
          </h1>
          <p className="text-sm text-secondary">
            Visualizing energy generation across 88 countries
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="border-b border-gray-100 bg-card">
        <div className="max-w-[1800px] mx-auto px-4 py-4 space-y-4">
          <BlocSelector selected={selectedBloc} onChange={setSelectedBloc} />
          <YearSlider
            years={years}
            selected={selectedYear}
            onChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1800px] mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Map */}
          <div
            className={`card flex-1 p-4 transition-all ${
              selectedCountry ? 'lg:w-[70%]' : 'w-full'
            }`}
          >
            <div className="aspect-[16/9] lg:aspect-[2/1]">
              <WorldMap
                countries={countries}
                year={selectedYear}
                selectedBloc={selectedBloc}
                blocCountryIds={blocCountryIds}
                onHover={handleHover}
                onClick={handleClick}
                selectedCountry={selectedCountry}
              />
            </div>
          </div>

          {/* Side panel */}
          {selectedCountry && (
            <div className="lg:w-[30%] lg:max-w-md">
              <CountryPanel
                country={selectedCountry}
                year={selectedYear}
                onClose={handleClosePanel}
              />
            </div>
          )}
        </div>
      </main>

      {/* Attribution footer */}
      <footer className="border-t border-gray-100 bg-card mt-8">
        <div className="max-w-[1800px] mx-auto px-4 py-4 text-center text-sm text-muted">
          Data:{' '}
          <a
            href="https://ember-energy.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary underline"
          >
            Ember
          </a>{' '}
          (ember-energy.org), CC BY 4.0
        </div>
      </footer>

      {/* Tooltip */}
      <CountryTooltip
        country={hoveredCountry}
        year={selectedYear}
        position={tooltipPos}
      />
    </div>
  );
}
