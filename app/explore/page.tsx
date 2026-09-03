'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import WorldMap from '@/components/WorldMap';
import CountryTooltip from '@/components/CountryTooltip';
import CountryPanel from '@/components/CountryPanel';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import { SegmentedControl } from '@/components/ds/nav/SegmentedControl';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Pill } from '@/components/ds/core/Pill';
import { MapLegend } from '@/components/ds/data/MapLegend';
import { Banner } from '@/components/ds/feedback/Banner';
import type { MapColorMode } from '@/lib/colors';
import {
  loadCountries,
  loadBlocs,
  loadFossilFuelData,
  loadCountryPages,
  MAP_COUNTRY_PARAM,
  getCountriesInBloc,
  getLatestYearData,
  aggregateBlocCommonYear,
  blocAggToYearData,
} from '@/lib/data';
import type { CountriesData, BlocsData, Country, FossilFuelData } from '@/lib/types';

const BLOCS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'World' },
  { id: 'EU', label: 'EU' },
  { id: 'NATO', label: 'NATO' },
  { id: 'BRICS', label: 'BRICS+' },
  { id: 'G7', label: 'G7' },
  { id: 'G20', label: 'G20' },
  { id: 'OECD', label: 'OECD' },
  { id: 'ASEAN', label: 'ASEAN' },
  { id: 'THE_WEST', label: 'The West' },
  { id: 'GLOBAL_SOUTH', label: 'Global South' },
  { id: 'ELECTROSTATES', label: 'Electrostates' },
  { id: 'PETROSTATES', label: 'Petrostates' },
  { id: 'NUCLEAR_CLUB', label: 'Nuclear Club' },
];

const MEASURES = ['Total output', 'Clean share', 'Independence'] as const;
type Measure = (typeof MEASURES)[number];

const MEASURE_TO_MODE: Record<Measure, MapColorMode> = {
  'Total output': 'production',
  'Clean share': 'clean',
  Independence: 'independence',
};

/**
 * Legend bounds and ramp length per measure.
 *
 * Output is a quantile ramp, so it reads as a rank rather than a value. Only
 * clean share uses all seven stops: the seventh is brand green, and green in
 * this system means clean energy. The other two stop at six so the accent
 * never says "big" or "self-sufficient" — see SCALE_NEUTRAL in lib/fuels.ts.
 */
const MEASURE_LEGEND: Record<Measure, { min: string; max: string; stops: number }> = {
  'Total output': { min: 'Least', max: 'Most', stops: 6 },
  'Clean share': { min: '0%', max: '100%', stops: 7 },
  Independence: { min: '0', max: '100', stops: 6 },
};

export default function Explore() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBloc, setSelectedBloc] = useState<string>('ALL');
  const [measure, setMeasure] = useState<Measure>('Total output');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [countryPages, setCountryPages] = useState<Set<string> | null>(null);
  const [focusIso3, setFocusIso3] = useState<string | null>(null);

  const mapMode = MEASURE_TO_MODE[measure];

  useEffect(() => {
    // 1.2KB; decides whether the panel offers a profile link at all.
    loadCountryPages().then(setCountryPages).catch(() => {});
    Promise.all([loadCountries(), loadBlocs(), loadFossilFuelData()])
      .then(([countriesData, blocsData, fossilData]) => {
        setCountries(countriesData);
        setBlocs(blocsData);
        setFossilFuelData(fossilData);
        setLoading(false);

        // Arriving from a "see on map" link: select that country and frame the
        // map on it, rather than dropping the reader on the world view to find
        // it themselves.
        //
        // Read from `window.location` rather than `useSearchParams`, which
        // would put this statically-rendered page behind a Suspense boundary
        // for a value that is only ever read once, on the client, on arrival.
        const wanted = new URLSearchParams(window.location.search)
          .get(MAP_COUNTRY_PARAM)
          ?.toUpperCase();
        if (wanted && countriesData[wanted]) {
          setSelectedCountry(countriesData[wanted]);
          setFocusIso3(wanted);
        }
      })
      .catch(console.error);
  }, []);

  const blocCountryIds = useMemo(() => {
    if (!countries || !blocs) return new Set<string>();
    return new Set(getCountriesInBloc(selectedBloc, countries, blocs).map((c) => c.iso3));
  }, [countries, blocs, selectedBloc]);

  const topCountries = useMemo(() => {
    if (!countries) return [];
    return Object.values(countries)
      .map((c) => ({ country: c, latest: getLatestYearData(c) }))
      .filter(({ latest }) => latest !== null)
      .filter(({ country }) => selectedBloc === 'ALL' || blocCountryIds.has(country.iso3))
      .sort(
        (a, b) =>
          (b.latest?.data.total_generation_twh || 0) - (a.latest?.data.total_generation_twh || 0)
      )
      .map(({ country }) => country)
      .slice(0, 10);
  }, [countries, selectedBloc, blocCountryIds]);

  const blocAgg = useMemo(() => {
    if (!countries || !blocs || selectedBloc === 'ALL') return null;
    return aggregateBlocCommonYear(getCountriesInBloc(selectedBloc, countries, blocs))?.agg ?? null;
  }, [countries, blocs, selectedBloc]);

  const blocYearData = useMemo(() => (blocAgg ? blocAggToYearData(blocAgg) : null), [blocAgg]);

  const handleHover = useCallback((country: Country | null, event: MouseEvent | null) => {
    setHoveredCountry(country);
    setTooltipPos(event ? { x: event.clientX, y: event.clientY } : null);
  }, []);

  const handleClick = useCallback((country: Country | null) => {
    if (!country) return;
    setSelectedCountry((prev) => {
      if (prev?.iso3 === country.iso3) {
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
      <div className="gg-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-quiet)' }}>
          Loading grids…
        </span>
      </div>
    );
  }

  const countryCount = Object.keys(countries).length;

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav active="explore" meta={`${countryCount} countries`} />

      {/* Hero band */}
      <div style={{ padding: 'var(--band-y) var(--gutter) var(--space-8)' }}>
        <Eyebrow style={{ marginBottom: 'var(--space-6)' }}>Explore · all grids</Eyebrow>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-h2)',
            lineHeight: 'var(--lh-h2)',
            maxWidth: '22ch',
            textWrap: 'pretty',
          }}
        >
          Every country on Earth, coloured by what keeps its lights on.
        </h1>
      </div>

      {/* Controls band */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
          flexWrap: 'wrap',
          padding: 'var(--space-6) var(--gutter)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <SegmentedControl
          className="gg-measure-switch"
          label="Measure"
          options={MEASURES}
          value={measure}
          onChange={setMeasure}
        />
        <div
          className="gg-scroll-row"
          style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
        >
          {BLOCS.map((b) => (
            <Pill
              key={b.id}
              selected={selectedBloc === b.id}
              onClick={() => handleBlocChange(b.id)}
            >
              {b.label}
            </Pill>
          ))}
        </div>
        <span
          className="gg-hover-hint"
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: hoveredCountry ? 'var(--paper)' : 'var(--text-quiet)',
            whiteSpace: 'nowrap',
          }}
        >
          {hoveredCountry ? hoveredCountry.name : 'Hover a country'}
        </span>
      </div>

      {/* Map + rail */}
      <main
        className="gg-explore-split"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 'var(--space-9)',
          padding: 'var(--space-8) var(--gutter) var(--space-10)',
          alignItems: 'start',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              background: 'var(--bg-raised)',
              borderRadius: 'var(--r-well)',
              padding: 'var(--space-5)',
            }}
          >
            <div style={{ aspectRatio: '2 / 1' }}>
              <WorldMap
                countries={countries}
                selectedBloc={selectedBloc}
                blocCountryIds={blocCountryIds}
                onHover={handleHover}
                onClick={handleClick}
                selectedCountry={selectedCountry}
                mapMode={mapMode}
                fossilFuelData={fossilFuelData}
                focusIso3={focusIso3}
              />
            </div>
          </div>

          <MapLegend
            label={measure}
            min={MEASURE_LEGEND[measure].min}
            max={MEASURE_LEGEND[measure].max}
            stops={MEASURE_LEGEND[measure].stops}
            style={{ marginTop: 'var(--space-6)' }}
          />

          <Banner
            label="Read the map carefully"
            style={{ marginTop: 'var(--space-8)', maxWidth: '72ch' }}
          >
            Area is land, not electricity. Singapore and Malta are almost invisible here and both
            matter - and the countries that top the clean rankings are often the ones a map makes
            smallest.
          </Banner>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', minWidth: 0 }}>
          <Link
            href="/play"
            style={{
              display: 'block',
              padding: 'var(--space-6)',
              borderRadius: 'var(--r-card)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <Eyebrow tone="accent" style={{ marginBottom: 'var(--space-3)' }}>
              Not sure where to start
            </Eyebrow>
            <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>
              Play a round of Higher or Lower →
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
            countryPages={countryPages}
          />
        </div>
      </main>

      <SiteFooter />

      <CountryTooltip
        country={hoveredCountry}
        position={tooltipPos}
        fossilFuelData={fossilFuelData}
        onDismiss={handleTooltipDismiss}
      />
    </div>
  );
}
