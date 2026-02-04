'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  loadCountries,
  loadBlocs,
  getCountriesInBloc,
  getLatestYear,
  aggregateBloc,
  blocAggToYearData,
} from '@/lib/data';
import type { BlocAggregates } from '@/lib/data';
import type { CountriesData, BlocsData, Country, YearData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { getFlag } from '@/lib/flags';
import EnergyMixChart from '@/components/EnergyMixChart';

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
];

type SelectionType = 'country' | 'bloc';

interface Selection {
  type: SelectionType;
  id: string; // iso3 for country, bloc id for bloc
}

interface ResolvedSelection {
  label: string;
  flag: string;
  yearData: YearData;
  subtitle: string;
  blocAgg?: BlocAggregates;
}

function resolveSelection(
  sel: Selection,
  countries: CountriesData,
  blocs: BlocsData,
  year: number
): ResolvedSelection | null {
  if (sel.type === 'country') {
    const c = countries[sel.id];
    if (!c) return null;
    const yd = c.years[year.toString()];
    if (!yd) return null;
    return {
      label: c.name,
      flag: getFlag(c.iso3),
      yearData: yd,
      subtitle: c.emberRegion,
    };
  } else {
    const members = getCountriesInBloc(sel.id, countries, blocs);
    const agg = aggregateBloc(members, year);
    if (!agg) return null;
    const blocLabel = BLOC_OPTIONS.find(b => b.id === sel.id)?.label || sel.id;
    return {
      label: blocLabel,
      flag: '',
      yearData: blocAggToYearData(agg),
      subtitle: `${agg.country_count} countries`,
      blocAgg: agg,
    };
  }
}

function ComparisonBar({ label, valueA, valueB, formatFn, higherIsBetter }: {
  label: string;
  valueA: number;
  valueB: number;
  formatFn: (v: number) => string;
  higherIsBetter?: boolean;
}) {
  const max = Math.max(valueA, valueB, 0.01);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;

  let colorA = 'bg-blue-400';
  let colorB = 'bg-blue-400';
  if (higherIsBetter !== undefined && valueA !== valueB) {
    if (higherIsBetter) {
      colorA = valueA >= valueB ? 'bg-positive' : 'bg-gray-300';
      colorB = valueB >= valueA ? 'bg-positive' : 'bg-gray-300';
    } else {
      colorA = valueA <= valueB ? 'bg-positive' : 'bg-gray-300';
      colorB = valueB <= valueA ? 'bg-positive' : 'bg-gray-300';
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-secondary font-medium">{label}</div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full ${colorA} transition-all duration-500`}
              style={{ width: `${pctA}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary w-24 text-right tabular-nums">
            {formatFn(valueA)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full ${colorB} transition-all duration-500`}
              style={{ width: `${pctB}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary w-24 text-right tabular-nums">
            {formatFn(valueB)}
          </span>
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
              ? 'bg-primary text-white'
              : 'bg-inset text-muted hover:text-secondary'
          }`}
        >
          Country
        </button>
        <button
          onClick={() => onTypeChange('bloc')}
          className={`px-3 py-1 rounded-full text-xs transition-all ${
            type === 'bloc'
              ? 'bg-primary text-white'
              : 'bg-inset text-muted hover:text-secondary'
          }`}
        >
          Bloc
        </button>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-inset border border-gray-200 rounded-lg text-sm text-primary focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        <option value="">Select {type === 'country' ? 'a country' : 'a bloc'}...</option>
        {type === 'country' ? (
          sortedCountries.map(c => (
            <option key={c.iso3} value={c.iso3}>
              {getFlag(c.iso3)} {c.name}
            </option>
          ))
        ) : (
          BLOC_OPTIONS.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))
        )}
      </select>
    </div>
  );
}

export default function ComparePage() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(2025);

  const [typeA, setTypeA] = useState<SelectionType>('country');
  const [typeB, setTypeB] = useState<SelectionType>('country');
  const [idA, setIdA] = useState<string>('');
  const [idB, setIdB] = useState<string>('');

  useEffect(() => {
    Promise.all([loadCountries(), loadBlocs()])
      .then(([countriesData, blocsData]) => {
        setCountries(countriesData);
        setBlocs(blocsData);
        setYear(getLatestYear(countriesData));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const resolvedA = useMemo(() => {
    if (!countries || !blocs || !idA) return null;
    return resolveSelection({ type: typeA, id: idA }, countries, blocs, year);
  }, [countries, blocs, typeA, idA, year]);

  const resolvedB = useMemo(() => {
    if (!countries || !blocs || !idB) return null;
    return resolveSelection({ type: typeB, id: idB }, countries, blocs, year);
  }, [countries, blocs, typeB, idB, year]);

  if (loading || !countries || !blocs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-secondary text-sm">Loading energy data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-gray-100 bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-medium text-primary tracking-tight">
              Energy Comparison
            </h1>
            <p className="text-xs text-muted">{year}</p>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-2.5 py-1 rounded-full text-xs text-muted hover:text-secondary hover:bg-inset transition-colors"
            >
              Explore
            </Link>
            <span className="px-2.5 py-1 rounded-full text-xs bg-primary text-white">
              Compare
            </span>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Selection area */}
        <div>
          <div className="text-[10px] text-muted uppercase tracking-wider mb-3">
            Locations to compare
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectionDropdown
              value={idA}
              onChange={setIdA}
              countries={countries}
              type={typeA}
              onTypeChange={(t) => { setTypeA(t); setIdA(''); }}
            />
            <SelectionDropdown
              value={idB}
              onChange={setIdB}
              countries={countries}
              type={typeB}
              onTypeChange={(t) => { setTypeB(t); setIdB(''); }}
            />
          </div>
        </div>

        {/* Results */}
        {resolvedA && resolvedB && (
          <>
            {/* Summary card */}
            <div className="card p-5 bg-blue-50/50 border-blue-100">
              <div className="text-xs text-secondary font-medium mb-2 uppercase tracking-wider">
                Comparison Summary
              </div>
              <ComparisonSummary a={resolvedA} b={resolvedB} />
            </div>

            {/* Stat bars */}
            <div className="card p-5 space-y-5">
              <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-1">
                  {resolvedA.flag && <span className="text-lg">{resolvedA.flag}</span>}
                  <div>
                    <div className="text-xs font-medium text-primary">{resolvedA.label}</div>
                    <div className="text-[10px] text-muted">{resolvedA.subtitle}</div>
                  </div>
                </div>
                <div className="text-[10px] text-muted">vs</div>
                <div className="flex items-center gap-2 flex-1 justify-end text-right">
                  <div>
                    <div className="text-xs font-medium text-primary">{resolvedB.label}</div>
                    <div className="text-[10px] text-muted">{resolvedB.subtitle}</div>
                  </div>
                  {resolvedB.flag && <span className="text-lg">{resolvedB.flag}</span>}
                </div>
              </div>

              <ComparisonBar
                label="Total Generation"
                valueA={resolvedA.yearData.total_generation_twh}
                valueB={resolvedB.yearData.total_generation_twh}
                formatFn={formatTWh}
              />
              <ComparisonBar
                label="Clean Energy %"
                valueA={resolvedA.yearData.aggregates.clean_pct}
                valueB={resolvedB.yearData.aggregates.clean_pct}
                formatFn={formatPercent}
                higherIsBetter
              />
              <ComparisonBar
                label="Renewables %"
                valueA={resolvedA.yearData.aggregates.renewables_pct}
                valueB={resolvedB.yearData.aggregates.renewables_pct}
                formatFn={formatPercent}
                higherIsBetter
              />
              <ComparisonBar
                label="Wind + Solar %"
                valueA={resolvedA.yearData.aggregates.wind_solar_pct}
                valueB={resolvedB.yearData.aggregates.wind_solar_pct}
                formatFn={formatPercent}
                higherIsBetter
              />
              <ComparisonBar
                label="Fossil Fuels %"
                valueA={resolvedA.yearData.aggregates.fossil_pct}
                valueB={resolvedB.yearData.aggregates.fossil_pct}
                formatFn={formatPercent}
                higherIsBetter={false}
              />
              <ComparisonBar
                label="CO2 Emissions"
                valueA={resolvedA.yearData.emissions.total_mtco2}
                valueB={resolvedB.yearData.emissions.total_mtco2}
                formatFn={formatEmissions}
                higherIsBetter={false}
              />
            </div>

            {/* Energy breakdowns */}
            <div className="card p-5 space-y-6">
              <div className="text-xs text-secondary font-medium uppercase tracking-wider">
                Energy Breakdown
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {resolvedA.flag && <span className="text-base">{resolvedA.flag}</span>}
                  <span className="text-xs font-medium text-primary">{resolvedA.label}</span>
                </div>
                <EnergyMixChart yearData={resolvedA.yearData} />
              </div>
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 mb-2">
                  {resolvedB.flag && <span className="text-base">{resolvedB.flag}</span>}
                  <span className="text-xs font-medium text-primary">{resolvedB.label}</span>
                </div>
                <EnergyMixChart yearData={resolvedB.yearData} />
              </div>
            </div>

            {/* Quick country links */}
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
                          setTypeA('country');
                          setIdA(iso3);
                        } else {
                          setTypeB('country');
                          setIdB(iso3);
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[11px] text-muted hover:text-secondary hover:bg-inset transition-colors"
                    >
                      {getFlag(iso3)} {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Show prompt when no selections or only one */}
        {(!resolvedA || !resolvedB) && (
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
                      setTypeA('country'); setIdA(a);
                      setTypeB('country'); setIdB(b);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs bg-inset text-secondary hover:text-primary hover:bg-gray-200 transition-colors"
                  >
                    {getFlag(a)} {getFlag(b)} {label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setTypeA('bloc'); setIdA('EU');
                    setTypeB('bloc'); setIdB('BRICS');
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-inset text-secondary hover:text-primary hover:bg-gray-200 transition-colors"
                >
                  EU vs BRICS+
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-card mt-6">
        <div className="max-w-3xl mx-auto px-4 py-3 text-center text-xs text-muted">
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
    </div>
  );
}

function ComparisonSummary({ a, b }: { a: ResolvedSelection; b: ResolvedSelection }) {
  const cleanDiff = Math.abs(a.yearData.aggregates.clean_pct - b.yearData.aggregates.clean_pct);
  const cleaner = a.yearData.aggregates.clean_pct > b.yearData.aggregates.clean_pct ? a : b;
  const genA = a.yearData.total_generation_twh;
  const genB = b.yearData.total_generation_twh;
  const bigger = genA > genB ? a : b;
  const genRatio = genA > 0 && genB > 0
    ? (Math.max(genA, genB) / Math.min(genA, genB)).toFixed(1)
    : null;

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
    </div>
  );
}
