'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import {
  loadCountries,
  loadBlocs,
  loadFossilFuelData,
  getCountriesInBloc,
  getLatestYear,
  aggregateBloc,
  blocAggToYearData,
  loadCountryPages,
  countryPagePath,
} from '@/lib/data';
import type { BlocAggregates } from '@/lib/data';
import type { CountriesData, BlocsData, YearData, FossilFuelData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { calculateIndependenceScoreV2, getFossilDataForYear, formatIndependenceScore } from '@/lib/independence';
import CountrySelect from '@/components/CountrySelect';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import ShareButton from '@/components/ShareButton';
import CountryProfileLink from '@/components/CountryProfileLink';
import { theName, subjectName } from '@/lib/countryNames';
import { ToastProvider } from '@/components/Toast';
import { useCompareParams } from '@/hooks/useCompareParams';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Stat } from '@/components/ds/core/Stat';
import { GorillaNote } from '@/components/ds/core/GorillaNote';
import { StackedAreaChart } from '@/components/ds/data/StackedAreaChart';
import { FuelLegend } from '@/components/ds/data/FuelLegend';
import { DonutStat } from '@/components/ds/data/DonutStat';
import { MixBar } from '@/components/ds/data/MixBar';
import { fuelShares, fuelSeries } from '@/lib/fuels';
import FlagImg from '@/components/FlagImg';

const BLOC_OPTIONS: { id: string; label: string }[] = [
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

type SelectionType = 'country' | 'bloc';

interface ResolvedSelection {
  label: string;
  iso3: string | null;
  yearData: YearData;
  subtitle: string;
  blocAgg?: BlocAggregates;
  actualYear: number;
}

/**
 * Get available years for a selection (country or bloc)
 */
function getAvailableYearsForSelection(
  type: SelectionType,
  id: string,
  countries: CountriesData,
  blocs: BlocsData
): number[] {
  if (type === 'country') {
    const c = countries[id];
    if (!c) return [];
    return Object.keys(c.years).map(Number).sort((a, b) => a - b);
  } else {
    // For blocs, find years where at least some members have data
    const members = getCountriesInBloc(id, countries, blocs);
    const yearsSet = new Set<number>();
    for (const m of members) {
      for (const y of Object.keys(m.years)) {
        yearsSet.add(parseInt(y));
      }
    }
    return Array.from(yearsSet).sort((a, b) => a - b);
  }
}

/**
 * Find the latest common year available for both selections
 */
function getCommonLatestYear(
  typeA: SelectionType,
  idA: string,
  typeB: SelectionType,
  idB: string,
  countries: CountriesData,
  blocs: BlocsData,
  defaultYear: number
): number {
  if (!idA || !idB) return defaultYear;

  const yearsA = getAvailableYearsForSelection(typeA, idA, countries, blocs);
  const yearsB = getAvailableYearsForSelection(typeB, idB, countries, blocs);

  if (yearsA.length === 0 || yearsB.length === 0) return defaultYear;

  // Find common years
  const setB = new Set(yearsB);
  const commonYears = yearsA.filter(y => setB.has(y));

  if (commonYears.length === 0) {
    // No common years - fall back to the minimum of their latest years
    return Math.min(yearsA[yearsA.length - 1], yearsB[yearsB.length - 1]);
  }

  return commonYears[commonYears.length - 1]; // Latest common year
}

/**
 * Find the nearest available year to the target year for a country
 */
function getNearestAvailableYear(country: { years: Record<string, YearData> }, targetYear: number): number | null {
  const availableYears = Object.keys(country.years).map(Number).sort((a, b) => a - b);
  if (availableYears.length === 0) return null;

  // First try exact match
  if (availableYears.includes(targetYear)) return targetYear;

  // Find nearest year
  let nearest = availableYears[0];
  let minDiff = Math.abs(targetYear - nearest);

  for (const y of availableYears) {
    const diff = Math.abs(targetYear - y);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = y;
    }
  }

  return nearest;
}

function resolveSelection(
  type: SelectionType,
  id: string,
  countries: CountriesData,
  blocs: BlocsData,
  year: number
): ResolvedSelection | null {
  if (type === 'country') {
    const c = countries[id];
    if (!c) return null;

    // Try requested year first, fall back to nearest available
    let actualYear = year;
    let yd = c.years[year.toString()];
    if (!yd) {
      const nearestYear = getNearestAvailableYear(c, year);
      if (!nearestYear) return null;
      actualYear = nearestYear;
      yd = c.years[nearestYear.toString()];
    }

    return {
      label: c.name,
      iso3: c.iso3,
      yearData: yd,
      subtitle: c.emberRegion,
      actualYear,
    };
  } else {
    const members = getCountriesInBloc(id, countries, blocs);
    const agg = aggregateBloc(members, year);
    if (!agg) return null;
    const blocLabel = BLOC_OPTIONS.find(b => b.id === id)?.label || id;
    return {
      label: blocLabel,
      iso3: null,
      yearData: blocAggToYearData(agg),
      subtitle: `${agg.country_count} countries`,
      blocAgg: agg,
      actualYear: year,
    };
  }
}

function ComparisonBar({ label, valueA, valueB, formatFn, suffixA, suffixB }: {
  label: string;
  valueA: number;
  valueB: number;
  formatFn: (v: number) => string;
  suffixA?: string;
  suffixB?: string;
}) {
  const total = valueA + valueB;
  const pctA = total > 0 ? (valueA / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="text-xs text-secondary font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <div className="w-20 text-right">
          <span className="text-[11px] font-medium text-primary tabular-nums">{formatFn(valueA)}{suffixA}</span>
        </div>
        <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-inset">
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${pctA}%` }}
          />
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${100 - pctA}%` }}
          />
        </div>
        <div className="w-20">
          <span className="text-[11px] font-medium text-primary tabular-nums">{formatFn(valueB)}{suffixB}</span>
        </div>
      </div>
    </div>
  );
}

function SelectionDropdown({ value, onChange, countries, type, onTypeChange }: {
  value: string;
  onChange: (id: string) => void;
  countries: CountriesData;
  type: SelectionType;
  onTypeChange: (t: SelectionType) => void;
}) {
  const sortedCountries = useMemo(() => {
    return Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => onTypeChange('country')}
          className={`px-3 py-1 rounded-full text-xs transition-all ${
            type === 'country'
              ? 'bg-primary text-canvas'
              : 'bg-inset text-muted hover:text-secondary'
          }`}
        >
          Country
        </button>
        <button
          onClick={() => onTypeChange('bloc')}
          className={`px-3 py-1 rounded-full text-xs transition-all ${
            type === 'bloc'
              ? 'bg-primary text-canvas'
              : 'bg-inset text-muted hover:text-secondary'
          }`}
        >
          Bloc
        </button>
      </div>
      {type === 'country' ? (
        <CountrySelect
          countries={sortedCountries}
          value={value}
          onChange={onChange}
          placeholder="Select a country..."
        />
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-inset border border-border rounded-lg text-sm text-primary focus:outline-none focus:ring-1 focus:ring-border"
        >
          <option value="">Select a bloc...</option>
          {BLOC_OPTIONS.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

/**
 * Fuel-share history for one side of the comparison, ending at the year the
 * comparison is pinned to.
 *
 * Blocs are aggregated per year rather than reusing the latest-per-country
 * rollup: a chart of a bloc's transition has to be built from the same year on
 * every point or the shape is meaningless.
 */
function seriesFor(
  sel: ResolvedSelection,
  type: SelectionType,
  id: string,
  countries: CountriesData,
  blocs: BlocsData
): { years: number[]; series: ReturnType<typeof fuelSeries>['series'] } {
  if (type === 'country' && countries[id]) {
    const c = countries[id];
    const years = Object.keys(c.years)
      .map(Number)
      .sort((x, y) => x - y)
      .filter((y) => y <= sel.actualYear)
      .slice(-24);
    return fuelSeries(years, (y) => c.years[String(y)]);
  }
  if (type === 'bloc') {
    const members = getCountriesInBloc(id, countries, blocs);
    const years = Array.from({ length: 24 }, (_, i) => sel.actualYear - 23 + i);
    return fuelSeries(years, (y) => {
      const agg = aggregateBloc(members, y);
      return agg ? blocAggToYearData(agg) : undefined;
    });
  }
  return { years: [], series: fuelSeries([], () => undefined).series };
}

function scoreFor(sel: ResolvedSelection, fossilFuelData: FossilFuelData | null) {
  return calculateIndependenceScoreV2(
    sel.yearData,
    sel.iso3
      ? getFossilDataForYear(fossilFuelData?.countries[sel.iso3], sel.actualYear).data
      : null,
    sel.iso3 ?? undefined
  );
}

function Side({
  sel,
  type,
  id,
  border,
  countries,
  blocs,
  fossilFuelData,
  countryPages,
}: {
  sel: ResolvedSelection;
  type: SelectionType;
  id: string;
  border?: boolean;
  countries: CountriesData;
  blocs: BlocsData;
  fossilFuelData: FossilFuelData | null;
  countryPages: Set<string> | null;
}) {
  const { years, series } = seriesFor(sel, type, id, countries, blocs);
  const shares = fuelShares(sel.yearData);
  const score = scoreFor(sel, fossilFuelData);
  const yd = sel.yearData;

  return (
    <div
      style={{
        padding: '30px var(--gutter)',
        borderRight: border ? '1px solid var(--border-default)' : undefined,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-7)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--fs-h3)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-h3)',
            }}
          >
            {sel.iso3 && (
              <FlagImg iso3={sel.iso3} size={20} className="mr-2 align-middle" />
            )}
            {sel.label}
          </h2>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              color: 'var(--text-quiet)',
              marginTop: 'var(--space-3)',
            }}
          >
            {sel.subtitle} · {sel.actualYear}
          </div>
          {sel.iso3 && countryPagePath(sel.iso3, countryPages) && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <CountryProfileLink
                iso3={sel.iso3}
                source="compare"
                href={countryPagePath(sel.iso3, countryPages)!}
                style={{ fontSize: 'var(--fs-ui)', color: 'var(--green)' }}
              >
                Full profile →
              </CountryProfileLink>
            </div>
          )}
        </div>
        <DonutStat value={yd.aggregates.clean_pct} label="Clean" size={78} thickness={11} />
      </div>

      <StackedAreaChart series={series} years={years} height={180} />
      <FuelLegend
        shares={shares.filter((s) => s.pct >= 1).map((s) => ({ fuel: s.fuel, value: formatPercent(s.pct) }))}
        style={{ marginTop: 'var(--space-5)' }}
      />

      <div
        className="gg-stat-row"
        style={{
          display: 'flex',
          gap: 'var(--space-9)',
          flexWrap: 'wrap',
          marginTop: 'var(--space-8)',
          paddingTop: 'var(--space-7)',
          borderTop: '1px solid var(--border-default)',
        }}
      >
        <Stat label="Generation" value={formatTWh(yd.total_generation_twh)} />
        <Stat
          label="Independence"
          value={score ? formatIndependenceScore(score.score) : '-'}
          note={score?.missingFossilData ? 'Incomplete fuel data' : undefined}
        />
        <Stat label="Emissions" value={formatEmissions(yd.emissions.total_mtco2)} />
      </div>
    </div>
  );
};

function ComparePageContent() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [defaultYear, setDefaultYear] = useState(2025);
  const [countryPages, setCountryPages] = useState<Set<string> | null>(null);

  // URL-driven state
  const { params, setSelectionA, setSelectionB, yearIsExplicit } = useCompareParams(defaultYear);

  useEffect(() => {
    loadCountryPages().then(setCountryPages).catch(() => {});
    Promise.all([loadCountries(), loadBlocs(), loadFossilFuelData()])
      .then(([countriesData, blocsData, fossilData]) => {
        setCountries(countriesData);
        setBlocs(blocsData);
        setFossilFuelData(fossilData);
        setDefaultYear(getLatestYear(countriesData));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Extract state from URL params
  const typeA = params.a.type;
  const typeB = params.b.type;
  const idA = params.a.id;
  const idB = params.b.id;
  const urlYear = params.year;

  // Calculate effective year: use URL year if explicitly set, otherwise find common year for both selections
  const effectiveYear = useMemo(() => {
    if (yearIsExplicit && urlYear) return urlYear;
    if (!countries || !blocs || !idA || !idB) return defaultYear;
    return getCommonLatestYear(typeA, idA, typeB, idB, countries, blocs, defaultYear);
  }, [yearIsExplicit, urlYear, countries, blocs, typeA, idA, typeB, idB, defaultYear]);

  const year = effectiveYear;

  // Handlers that update URL
  const handleSetIdA = useCallback((id: string) => {
    setSelectionA(typeA, id);
  }, [setSelectionA, typeA]);

  const handleSetIdB = useCallback((id: string) => {
    setSelectionB(typeB, id);
  }, [setSelectionB, typeB]);

  const handleSetTypeA = useCallback((t: SelectionType) => {
    setSelectionA(t, '');
  }, [setSelectionA]);

  const handleSetTypeB = useCallback((t: SelectionType) => {
    setSelectionB(t, '');
  }, [setSelectionB]);

  const resolvedA = useMemo(() => {
    if (!countries || !blocs || !idA) return null;
    return resolveSelection(typeA, idA, countries, blocs, year);
  }, [countries, blocs, typeA, idA, year]);

  const resolvedB = useMemo(() => {
    if (!countries || !blocs || !idB) return null;
    return resolveSelection(typeB, idB, countries, blocs, year);
  }, [countries, blocs, typeB, idB, year]);

  // The title is set on the server now, from ?a= and ?b=, so there is nothing to
  // do here. Setting it again after hydration would only mean the tab briefly
  // says one thing and then another, and would still leave every non-JavaScript
  // scraper reading the generic version.

  if (loading || !countries || !blocs) {
    return (
      <div className="gg-page min-h-screen flex items-center justify-center">
        <div className="text-secondary text-sm">Loading energy data...</div>
      </div>
    );
  }

  const hasComparison = resolvedA && resolvedB;

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav active="compare" />

      <div style={{ padding: 'var(--band-y) var(--gutter) 0' }}>
        <Eyebrow style={{ marginBottom: 'var(--space-6)' }}>Compare · side by side</Eyebrow>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-h2)',
            lineHeight: 'var(--lh-h2)',
            maxWidth: '26ch',
            textWrap: 'pretty',
          }}
        >
          {hasComparison
            ? `${subjectName(resolvedA.label)} and ${theName(resolvedB.label)}, side by side.`
            : 'Pick two countries or blocs and see how they compare.'}
        </h1>

        <div
          className="gg-card-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-6)',
            alignItems: 'end',
            margin: 'var(--space-9) 0 var(--space-6)',
          }}
        >
          <SelectionDropdown
            value={idA}
            onChange={handleSetIdA}
            countries={countries}
            type={typeA}
            onTypeChange={handleSetTypeA}
          />
          <SelectionDropdown
            value={idB}
            onChange={handleSetIdB}
            countries={countries}
            type={typeB}
            onTypeChange={handleSetTypeB}
          />
        </div>

        {/* Sharing waits until there is something to share, and then asks.
            It used to be a small chip in a third column beside the two
            selectors, permanently present and disabled most of the time -
            which put the least interesting control on the row at the moment
            it could do nothing, and hid it at the moment it could. */}
        {hasComparison && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              flexWrap: 'wrap',
              margin: '0 0 var(--space-8)',
            }}
          >
            <ShareButton itemId={`${idA}_${idB}`} />
            <p
              style={{
                margin: 0,
                maxWidth: '46ch',
                fontSize: 'var(--fs-ui)',
                lineHeight: 'var(--lh-body)',
                color: 'var(--text-secondary)',
              }}
            >
              Send it to someone who would have guessed wrong.
            </p>
          </div>
        )}
      </div>

      {hasComparison ? (
        <>
          <div
            className="gg-compare-split"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <Side sel={resolvedA} type={typeA} id={idA} border countries={countries} blocs={blocs} fossilFuelData={fossilFuelData} countryPages={countryPages} />
            <Side sel={resolvedB} type={typeB} id={idB} countries={countries} blocs={blocs} fossilFuelData={fossilFuelData} countryPages={countryPages} />
          </div>

          <div
            style={{
              padding: 'var(--space-8) var(--gutter) var(--space-10)',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <Eyebrow style={{ marginBottom: 'var(--space-6)' }}>Head to head</Eyebrow>
            <div style={{ display: 'grid', gap: 'var(--space-7)', maxWidth: 900 }}>
              <ComparisonBar
                label="Total generation"
                valueA={resolvedA.yearData.total_generation_twh}
                valueB={resolvedB.yearData.total_generation_twh}
                formatFn={formatTWh}
              />
              <ComparisonBar
                label="Clean share"
                valueA={resolvedA.yearData.aggregates.clean_pct}
                valueB={resolvedB.yearData.aggregates.clean_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Renewables"
                valueA={resolvedA.yearData.aggregates.renewables_pct}
                valueB={resolvedB.yearData.aggregates.renewables_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Wind + solar"
                valueA={resolvedA.yearData.aggregates.wind_solar_pct}
                valueB={resolvedB.yearData.aggregates.wind_solar_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Emissions"
                valueA={resolvedA.yearData.emissions.total_mtco2}
                valueB={resolvedB.yearData.emissions.total_mtco2}
                formatFn={formatEmissions}
              />
              {(() => {
                const a = scoreFor(resolvedA, fossilFuelData);
                const b = scoreFor(resolvedB, fossilFuelData);
                return (
                  <ComparisonBar
                    label="Energy independence"
                    valueA={a?.score ?? 0}
                    valueB={b?.score ?? 0}
                    formatFn={formatIndependenceScore}
                    suffixA={a?.missingFossilData ? '*' : undefined}
                    suffixB={b?.missingFossilData ? '*' : undefined}
                  />
                );
              })()}
            </div>

            <div style={{ marginTop: 'var(--space-8)' }}>
              <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>Mix, this year</Eyebrow>
              {/* Two unlabelled bars are a quiz, not a comparison - nothing on
                  screen said which was which, and the order is not something a
                  reader should have to infer from the columns above. */}
              <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: 900 }}>
                {[resolvedA, resolvedB].map((sel, i) => (
                  <div key={`${sel.label}-${i}`}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--fs-mono-xxs)',
                        letterSpacing: 'var(--ls-label)',
                        textTransform: 'uppercase',
                        color: 'var(--text-label)',
                      }}
                    >
                      {sel.label}
                    </div>
                    <MixBar shares={fuelShares(sel.yearData)} height={14} />
                  </div>
                ))}
              </div>
            </div>

            <GorillaNote lead="Check the year before you quote this.">
              {resolvedA.actualYear === resolvedB.actualYear ? (
                <>
                  Both are shown for {resolvedA.actualYear}, the most recent year they
                  both report.
                </>
              ) : (
                <>
                  These two are not the same year - {resolvedA.label} is {resolvedA.actualYear} and{' '}
                  {resolvedB.label} is {resolvedB.actualYear}. National statistics offices publish
                  at different speeds, and a comparison across years is worth less than one within
                  a year.
                </>
              )}{' '}
              An asterisk means the independence score is built on incomplete fuel data.
            </GorillaNote>
          </div>
        </>
      ) : (
        <div style={{ padding: 'var(--space-11) var(--gutter)', borderTop: '1px solid var(--border-default)' }}>
          <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 'var(--fs-lead)', maxWidth: '46ch' }}>
            Choose a country or bloc on each side. Every comparison is pinned to the most recent
            year both of them report.
          </p>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}


export default function CompareClient() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="gg-page min-h-screen flex items-center justify-center">
          <div className="text-secondary text-sm">Loading...</div>
        </div>
      }>
        <ComparePageContent />
      </Suspense>
    </ToastProvider>
  );
}

