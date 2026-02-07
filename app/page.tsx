'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
  getLatestYear,
  aggregateBloc,
  blocAggToYearData,
} from '@/lib/data';
import type { CountriesData, BlocsData, Country, FossilFuelData } from '@/lib/types';

export default function Home() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
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
        setSelectedYear(getLatestYear(countriesData));
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
    const yearStr = selectedYear.toString();
    const list = Object.values(countries)
      .filter(c => c.years[yearStr])
      .filter(c => selectedBloc === 'ALL' || blocCountryIds.has(c.iso3))
      .sort((a, b) =>
        (b.years[yearStr]?.total_generation_twh || 0) -
        (a.years[yearStr]?.total_generation_twh || 0)
      );
    return list.slice(0, 10);
  }, [countries, selectedYear, selectedBloc, blocCountryIds]);

  const blocAgg = useMemo(() => {
    if (!countries || !blocs || selectedBloc === 'ALL') return null;
    const members = getCountriesInBloc(selectedBloc, countries, blocs);
    return aggregateBloc(members, selectedYear);
  }, [countries, blocs, selectedBloc, selectedYear]);

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
    setSelectedCountry(prev =>
      prev?.iso3 === country.iso3 ? null : country
    );
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
          <div className="card flex-1 p-3">
            <div className="aspect-[16/9] lg:aspect-[2/1]">
              <WorldMap
                countries={countries}
                year={selectedYear}
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

          <div className="lg:w-[30%] lg:min-w-[320px] lg:max-w-md">
            <CountryPanel
              country={selectedCountry}
              year={selectedYear}
              topCountries={topCountries}
              onClose={() => setSelectedCountry(null)}
              onSelectCountry={setSelectedCountry}
              selectedBloc={selectedBloc}
              blocAgg={blocAgg}
              blocYearData={blocYearData}
              fossilFuelData={fossilFuelData}
            />
          </div>
        </div>
      </main>

      <Footer />

      <CountryTooltip
        country={hoveredCountry}
        year={selectedYear}
        position={tooltipPos}
      />
    </div>
  );
}
