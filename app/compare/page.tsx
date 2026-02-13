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
} from '@/lib/data';
import type { BlocAggregates } from '@/lib/data';
import type { CountriesData, BlocsData, YearData, FossilFuelData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { calculateIndependenceScoreV2, getFossilDataForYear, formatIndependenceScore } from '@/lib/independence';
import FlagImg from '@/components/FlagImg';
import CountrySelect from '@/components/CountrySelect';
import EnergyMixChart from '@/components/EnergyMixChart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareButton from '@/components/ShareButton';
import { ToastProvider } from '@/components/Toast';
import { useCompareParams } from '@/hooks/useCompareParams';

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

function ComparePageContent() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [defaultYear, setDefaultYear] = useState(2025);

  // URL-driven state
  const { params, setSelectionA, setSelectionB, yearIsExplicit } = useCompareParams(defaultYear);

  useEffect(() => {
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

  // Dynamic page title
  useEffect(() => {
    if (resolvedA && resolvedB) {
      document.title = `${resolvedA.label} vs ${resolvedB.label} — Grid Gorilla`;
    } else {
      document.title = 'Compare — Grid Gorilla';
    }
  }, [resolvedA, resolvedB]);

  if (loading || !countries || !blocs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-secondary text-sm">Loading energy data...</div>
      </div>
    );
  }

  const hasComparison = resolvedA && resolvedB;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="compare" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] text-muted uppercase tracking-wider">
              Locations to compare
            </div>
            <ShareButton disabled={!hasComparison} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {hasComparison && (
          <>
            <div className="card p-5 border-border bg-inset">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] text-secondary font-medium uppercase tracking-wider">
                  Comparison Summary
                </div>
                <div className="text-[11px] text-muted">
                  {resolvedA.actualYear === resolvedB.actualYear ? (
                    <>Data from <span className="font-medium text-secondary">{resolvedA.actualYear}</span></>
                  ) : (
                    <>Data from <span className="font-medium text-secondary">{resolvedA.actualYear}</span> / <span className="font-medium text-secondary">{resolvedB.actualYear}</span></>
                  )}
                </div>
              </div>
              <ComparisonSummary a={resolvedA} b={resolvedB} fossilFuelData={fossilFuelData} />
            </div>

            <div className="card p-5 space-y-5">
              <div className="flex items-center pb-3 border-b border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-start">
                    {resolvedA.iso3 && <FlagImg iso3={resolvedA.iso3} size={20} />}
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-primary flex items-center gap-1.5">
                        <span className="truncate">{resolvedA.label}</span>
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      </div>
                      <div className="text-[10px] text-muted truncate">{resolvedA.subtitle}</div>
                    </div>
                  </div>
                </div>
                <div className="px-3 shrink-0">
                  <span className="text-[10px] text-muted">vs</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="min-w-0 text-right">
                      <div className="text-xs font-medium text-primary flex items-center gap-1.5 justify-end">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate">{resolvedB.label}</span>
                      </div>
                      <div className="text-[10px] text-muted truncate">{resolvedB.subtitle}</div>
                    </div>
                    {resolvedB.iso3 && <FlagImg iso3={resolvedB.iso3} size={20} />}
                  </div>
                </div>
              </div>

              <ComparisonBar
                label="Total Generation"
                valueA={resolvedA.yearData.total_generation_twh}
                valueB={resolvedB.yearData.total_generation_twh}
                formatFn={formatTWh}
              />
              {(() => {
                const scoreA = calculateIndependenceScoreV2(
                  resolvedA.yearData,
                  resolvedA.iso3 ? getFossilDataForYear(fossilFuelData?.countries[resolvedA.iso3], resolvedA.actualYear).data : null,
                  resolvedA.iso3 ?? undefined
                );
                const scoreB = calculateIndependenceScoreV2(
                  resolvedB.yearData,
                  resolvedB.iso3 ? getFossilDataForYear(fossilFuelData?.countries[resolvedB.iso3], resolvedB.actualYear).data : null,
                  resolvedB.iso3 ?? undefined
                );
                return (
                  <ComparisonBar
                    label="Energy Independence"
                    valueA={scoreA?.score ?? 0}
                    valueB={scoreB?.score ?? 0}
                    formatFn={formatIndependenceScore}
                    suffixA={scoreA?.missingFossilData ? '*' : undefined}
                    suffixB={scoreB?.missingFossilData ? '*' : undefined}
                  />
                );
              })()}
              <ComparisonBar
                label="Clean Energy %"
                valueA={resolvedA.yearData.aggregates.clean_pct}
                valueB={resolvedB.yearData.aggregates.clean_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Renewables %"
                valueA={resolvedA.yearData.aggregates.renewables_pct}
                valueB={resolvedB.yearData.aggregates.renewables_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Wind + Solar %"
                valueA={resolvedA.yearData.aggregates.wind_solar_pct}
                valueB={resolvedB.yearData.aggregates.wind_solar_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Fossil Fuels %"
                valueA={resolvedA.yearData.aggregates.fossil_pct}
                valueB={resolvedB.yearData.aggregates.fossil_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="CO2 Emissions"
                valueA={resolvedA.yearData.emissions.total_mtco2}
                valueB={resolvedB.yearData.emissions.total_mtco2}
                formatFn={formatEmissions}
              />
              {(() => {
                const scoreA = resolvedA.iso3 ? calculateIndependenceScoreV2(
                  resolvedA.yearData,
                  getFossilDataForYear(fossilFuelData?.countries[resolvedA.iso3], resolvedA.actualYear).data,
                  resolvedA.iso3
                ) : null;
                const scoreB = resolvedB.iso3 ? calculateIndependenceScoreV2(
                  resolvedB.yearData,
                  getFossilDataForYear(fossilFuelData?.countries[resolvedB.iso3], resolvedB.actualYear).data,
                  resolvedB.iso3
                ) : null;
                if (scoreA?.missingFossilData || scoreB?.missingFossilData) {
                  return (
                    <div className="text-[10px] text-muted pt-2 border-t border-border-subtle">
                      <span className="text-secondary">*</span> No fossil fuel import data available. Fossil fuels assumed 100% imported.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="card p-5 space-y-6">
              <div className="text-[11px] text-secondary font-medium uppercase tracking-wider">
                Energy Breakdown
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {resolvedA.iso3 && <FlagImg iso3={resolvedA.iso3} size={18} />}
                  <span className="text-xs font-medium text-primary">{resolvedA.label}</span>
                  <span className="text-[10px] text-muted">({resolvedA.actualYear})</span>
                </div>
                <EnergyMixChart yearData={resolvedA.yearData} />
              </div>
              <div className="border-t border-border pt-5">
                <div className="flex items-center gap-2 mb-2">
                  {resolvedB.iso3 && <FlagImg iso3={resolvedB.iso3} size={18} />}
                  <span className="text-xs font-medium text-primary">{resolvedB.label}</span>
                  <span className="text-[10px] text-muted">({resolvedB.actualYear})</span>
                </div>
                <EnergyMixChart yearData={resolvedB.yearData} />
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-[11px] text-muted mb-2">Try other countries:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {['USA', 'CHN', 'DEU', 'FRA', 'IND', 'BRA', 'JPN', 'GBR'].map(iso3 => {
                  const c = countries[iso3];
                  if (!c) return null;
                  return (
                    <button
                      key={iso3}
                      onClick={() => {
                        if (!idA || (typeA === 'country' && idA === iso3)) {
                          setSelectionA('country', iso3);
                        } else {
                          setSelectionB('country', iso3);
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[11px] text-muted hover:text-secondary hover:bg-inset transition-colors inline-flex items-center gap-1"
                    >
                      <FlagImg iso3={iso3} size={14} /> {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {!hasComparison && (
          <div className="card p-8 text-center">
            <div className="text-sm text-secondary mb-2">
              Select two countries or blocs to compare
            </div>
            <div className="text-xs text-muted">
              Choose countries or geopolitical blocs from the dropdowns above to see a side-by-side comparison of their electricity production data.
            </div>
            <div className="mt-6">
              <div className="text-[11px] text-muted mb-2">Quick start:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { a: 'USA', b: 'CHN', label: 'USA vs China' },
                  { a: 'DEU', b: 'FRA', label: 'Germany vs France' },
                  { a: 'IND', b: 'BRA', label: 'India vs Brazil' },
                ].map(({ a, b, label }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setSelectionA('country', a);
                      setSelectionB('country', b);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs bg-inset text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    <FlagImg iso3={a} size={14} /> <FlagImg iso3={b} size={14} /> {label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectionA('bloc', 'EU');
                    setSelectionB('bloc', 'BRICS');
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-inset text-secondary hover:text-primary transition-colors"
                >
                  EU vs BRICS+
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <div className="text-secondary text-sm">Loading...</div>
        </div>
      }>
        <ComparePageContent />
      </Suspense>
    </ToastProvider>
  );
}

function ComparisonSummary({ a, b, fossilFuelData }: {
  a: ResolvedSelection;
  b: ResolvedSelection;
  fossilFuelData: FossilFuelData | null;
}) {
  const cleanDiff = Math.abs(a.yearData.aggregates.clean_pct - b.yearData.aggregates.clean_pct);
  const cleaner = a.yearData.aggregates.clean_pct > b.yearData.aggregates.clean_pct ? a : b;
  const genA = a.yearData.total_generation_twh;
  const genB = b.yearData.total_generation_twh;
  const bigger = genA > genB ? a : b;
  const genRatio = genA > 0 && genB > 0
    ? (Math.max(genA, genB) / Math.min(genA, genB)).toFixed(1)
    : null;

  // Calculate independence scores using each selection's actual year
  const scoreA = calculateIndependenceScoreV2(
    a.yearData,
    a.iso3 ? getFossilDataForYear(fossilFuelData?.countries[a.iso3], a.actualYear).data : null,
    a.iso3 ?? undefined
  );
  const scoreB = calculateIndependenceScoreV2(
    b.yearData,
    b.iso3 ? getFossilDataForYear(fossilFuelData?.countries[b.iso3], b.actualYear).data : null,
    b.iso3 ?? undefined
  );

  const moreIndependent = (scoreA?.score ?? 0) >= (scoreB?.score ?? 0) ? { selection: a, score: scoreA } : { selection: b, score: scoreB };
  const lessIndependent = moreIndependent.selection === a ? { selection: b, score: scoreB } : { selection: a, score: scoreA };
  const indepDiff = Math.abs((scoreA?.score ?? 0) - (scoreB?.score ?? 0));

  // Get primary driver for each country's independence score
  const getIndependenceDriver = (score: typeof scoreA): string => {
    if (!score) return '';
    const { breakdown } = score;

    // Find the largest contributor
    const contributors = [
      { name: 'renewables', value: breakdown.renewable.contribution, pct: breakdown.renewable.pct },
      { name: 'nuclear', value: breakdown.nuclear.contribution, pct: breakdown.nuclear.pct },
      { name: 'coal', value: breakdown.coal.contribution, pct: breakdown.coal.pct },
      { name: 'gas', value: breakdown.gas.contribution, pct: breakdown.gas.pct },
    ].filter(c => c.value > 0).sort((x, y) => y.value - x.value);

    if (contributors.length === 0) return '';

    const top = contributors[0];
    const topTwoContribute = contributors.length >= 2
      ? contributors[0].value + contributors[1].value
      : contributors[0].value;
    const totalContribution = contributors.reduce((sum, c) => sum + c.value, 0);

    // If top two sources dominate (>70% of score)
    if (contributors.length >= 2 && topTwoContribute / totalContribution > 0.7) {
      return `${Math.round(contributors[0].pct)}% ${contributors[0].name} and ${Math.round(contributors[1].pct)}% ${contributors[1].name}`;
    }

    return `${Math.round(top.pct)}% ${top.name}`;
  };

  return (
    <div className="space-y-1.5 text-xs text-primary">
      <p>
        <span className="font-medium">{cleaner.label}</span> has a cleaner electricity grid, with{' '}
        <span className="font-medium">{formatPercent(cleaner.yearData.aggregates.clean_pct)}</span>{' '}
        clean energy vs{' '}
        <span className="font-medium">
          {formatPercent(
            cleaner === a
              ? b.yearData.aggregates.clean_pct
              : a.yearData.aggregates.clean_pct
          )}
        </span>{' '}
        ({cleanDiff.toFixed(1)} percentage points difference).
      </p>
      {genRatio && (
        <p>
          <span className="font-medium">{bigger.label}</span> generates{' '}
          <span className="font-medium">{genRatio}x</span> more electricity overall (
          {formatTWh(bigger.yearData.total_generation_twh)}).
        </p>
      )}
      {moreIndependent.score && lessIndependent.score && (
        <p>
          <span className="font-medium">{moreIndependent.selection.label}</span> has a higher energy independence score (
          <span className="font-medium">{formatIndependenceScore(moreIndependent.score.score)}{moreIndependent.score.missingFossilData ? '*' : ''}</span> vs{' '}
          <span className="font-medium">{formatIndependenceScore(lessIndependent.score.score)}{lessIndependent.score.missingFossilData ? '*' : ''}</span>
          {indepDiff >= 1 && <>, {indepDiff.toFixed(0)} points higher</>}).
          {getIndependenceDriver(moreIndependent.score) && (
            <> This is driven by {getIndependenceDriver(moreIndependent.score)}.</>
          )}
        </p>
      )}
      {lessIndependent.score && getIndependenceDriver(lessIndependent.score) && (
        <p>
          <span className="font-medium">{lessIndependent.selection.label}</span>&apos;s independence score is driven by {getIndependenceDriver(lessIndependent.score)}.
        </p>
      )}
    </div>
  );
}
