'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import WorldMap from '@/components/WorldMap';
import CountryTooltip from '@/components/CountryTooltip';
import CountryPanel from '@/components/CountryPanel';
import BlocSelector from '@/components/BlocSelector';
import MapModeSelector from '@/components/MapModeSelector';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { MapColorMode } from '@/lib/colors';
import {
  loadCountries,
  loadBlocs,
  loadFossilFuelData,
  getCountriesInBloc,
  getLatestYearData,
  aggregateBlocLatest,
  blocAggToYearData,
} from '@/lib/data';
import type { CountriesData, BlocsData, Country, FossilFuelData } from '@/lib/types';

export default function Home() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBloc, setSelectedBloc] = useState<string>('ALL');
  const [mapMode, setMapMode] = useState<MapColorMode>('production');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    Promise.all([loadCountries(), loadBlocs(), loadFossilFuelData()])
      .then(([countriesData, blocsData, fossilData]) => {
        setCountries(countriesData);
        setBlocs(blocsData);
        setFossilFuelData(fossilData);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const blocCountryIds = useMemo(() => {
    if (!countries || !blocs) return new Set<string>();
    const countriesInBloc = getCountriesInBloc(selectedBloc, countries, blocs);
    return new Set(countriesInBloc.map(c => c.iso3));
  }, [countries, blocs, selectedBloc]);

  const topCountries = useMemo(() => {
    if (!countries) return [];
    const list = Object.values(countries)
      .map(c => {
        const latest = getLatestYearData(c);
        return { country: c, latest };
      })
      .filter(({ latest }) => latest !== null)
      .filter(({ country }) => selectedBloc === 'ALL' || blocCountryIds.has(country.iso3))
      .sort((a, b) =>
        (b.latest?.data.total_generation_twh || 0) -
        (a.latest?.data.total_generation_twh || 0)
      )
      .map(({ country }) => country);
    return list.slice(0, 10);
  }, [countries, selectedBloc, blocCountryIds]);

  const blocAgg = useMemo(() => {
    if (!countries || !blocs || selectedBloc === 'ALL') return null;
    const members = getCountriesInBloc(selectedBloc, countries, blocs);
    return aggregateBlocLatest(members);
  }, [countries, blocs, selectedBloc]);

  const blocYearData = useMemo(() => {
    if (!blocAgg) return null;
    return blocAggToYearData(blocAgg);
  }, [blocAgg]);

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
    if (!country) return;
    setSelectedCountry(prev => {
      const isDeselecting = prev?.iso3 === country.iso3;
      if (isDeselecting) {
        // Clear hover state when deselecting (important for mobile)
        setHoveredCountry(null);
        setTooltipPos(null);
        return null;
      }
      return country;
    });
  }, []);

  const handleTooltipDismiss = useCallback(() => {
    setHoveredCountry(null);
    setTooltipPos(null);
  }, []);

  const handleBlocChange = useCallback((bloc: string) => {
    setSelectedBloc(bloc);
    setSelectedCountry(null);
  }, []);

  if (loading || !countries || !blocs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-secondary text-sm">Loading energy data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="explore" />

      <div className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <BlocSelector selected={selectedBloc} onChange={handleBlocChange} />
          <MapModeSelector selected={mapMode} onChange={setMapMode} />
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1800px] mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="card flex-1 p-3 lg:self-start">
            <div className="aspect-[16/9] lg:aspect-[2/1]">
              <WorldMap
                countries={countries}
                selectedBloc={selectedBloc}
                blocCountryIds={blocCountryIds}
                onHover={handleHover}
                onClick={handleClick}
                selectedCountry={selectedCountry}
                mapMode={mapMode}
                fossilFuelData={fossilFuelData}
              />
            </div>
          </div>

          <div className="lg:w-[30%] lg:min-w-[320px] lg:max-w-md space-y-4">
            {/* Entry point for cold visitors: 88 coloured countries is a poor
                "what do I do now" prompt. Deliberately modest — the map leads. */}
            <Link
              href="/play"
              className="card card-hover block p-4 group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-primary">
                    Not sure where to start?
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Play a round of Higher or Lower.
                  </div>
                </div>
                <span
                  className="text-muted group-hover:text-primary transition-colors shrink-0"
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </Link>

            <CountryPanel
              country={selectedCountry}
              topCountries={topCountries}
              onClose={() => setSelectedCountry(null)}
              onSelectCountry={setSelectedCountry}
              selectedBloc={selectedBloc}
              blocAgg={blocAgg}
              blocYearData={blocYearData}
              fossilFuelData={fossilFuelData}
              blocsData={blocs}
            />
          </div>
        </div>
      </main>

      <Footer />

      <CountryTooltip
        country={hoveredCountry}
        position={tooltipPos}
        fossilFuelData={fossilFuelData}
        onDismiss={handleTooltipDismiss}
      />
    </div>
  );
}
