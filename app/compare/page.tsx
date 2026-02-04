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
import type { CountriesData, BlocsData, YearData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { getIso2 } from '@/lib/flags';
import FlagImg from '@/components/FlagImg';
import EnergyMixChart from '@/components/EnergyMixChart';
import DarkModeToggle from '@/components/DarkModeToggle';

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

interface ResolvedSelection {
  label: string;
  iso3: string | null;
  yearData: YearData;
  subtitle: string;
  blocAgg?: BlocAggregates;
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
    const yd = c.years[year.toString()];
    if (!yd) return null;
    return {
      label: c.name,
      iso3: c.iso3,
      yearData: yd,
      subtitle: c.emberRegion,
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
    };
  }
}

function ComparisonBar({ label, labelA, labelB, valueA, valueB, formatFn }: {
  label: string;
  labelA: string;
  labelB: string;
  valueA: number;
  valueB: number;
  formatFn: (v: number) => string;
}) {
  const total = valueA + valueB;
  const pctA = total > 0 ? (valueA / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="text-xs text-secondary font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <div className="w-20 text-right">
          <span className="text-[11px] font-medium text-primary tabular-nums">{formatFn(valueA)}</span>
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
          <span className="text-[11px] font-medium text-primary tabular-nums">{formatFn(valueB)}</span>
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-muted">{labelA}</span>
        <span className="text-[10px] text-muted">{labelB}</span>
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-inset border border-border rounded-lg text-sm text-primary focus:outline-none focus:ring-1 focus:ring-border"
      >
        <option value="">Select {type === 'country' ? 'a country' : 'a bloc'}...</option>
        {type === 'country' ? (
          sortedCountries.map(c => {
            const iso2 = getIso2(c.iso3);
            return (
              <option key={c.iso3} value={c.iso3}>
                {iso2 ? `${iso2} ` : ''}{c.name}
              </option>
            );
          })
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
    return resolveSelection(typeA, idA, countries, blocs, year);
  }, [countries, blocs, typeA, idA, year]);

  const resolvedB = useMemo(() => {
    if (!countries || !blocs || !idB) return null;
    return resolveSelection(typeB, idB, countries, blocs, year);
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
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <div className="flex-1">
            <h1 className="text-base font-medium text-primary tracking-tight">
              Hyperion
            </h1>
            <p className="text-[11px] text-secondary">Global electricity, visualized</p>
            <p className="text-[11px] text-muted">{year}</p>
          </div>
          <nav className="flex items-center gap-5">
            <Link
              href="/"
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              Explore
            </Link>
            <span className="text-sm font-medium text-primary">
              Compare
            </span>
          </nav>
          <div className="flex-1 flex justify-end">
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider mb-3">
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

        {resolvedA && resolvedB && (
          <>
            <div className="card p-5 border-border bg-inset">
              <div className="text-[11px] text-secondary font-medium mb-2 uppercase tracking-wider">
                Comparison Summary
              </div>
              <ComparisonSummary a={resolvedA} b={resolvedB} />
            </div>

            <div className="card p-5 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <div className="w-20 text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {resolvedA.iso3 && <FlagImg iso3={resolvedA.iso3} size={20} />}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-xs font-medium text-primary">{resolvedA.label}</span>
                      </div>
                      <div className="text-[10px] text-muted">{resolvedA.subtitle}</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-muted">vs</span>
                </div>
                <div className="w-20">
                  <div className="flex items-center gap-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-primary">{resolvedB.label}</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                      </div>
                      <div className="text-[10px] text-muted">{resolvedB.subtitle}</div>
                    </div>
                    {resolvedB.iso3 && <FlagImg iso3={resolvedB.iso3} size={20} />}
                  </div>
                </div>
              </div>

              <ComparisonBar
                label="Total Generation"
                labelA={resolvedA.label}
                labelB={resolvedB.label}
                valueA={resolvedA.yearData.total_generation_twh}
                valueB={resolvedB.yearData.total_generation_twh}
                formatFn={formatTWh}
              />
              <ComparisonBar
                label="Clean Energy %"
                labelA={resolvedA.label}
                labelB={resolvedB.label}
                valueA={resolvedA.yearData.aggregates.clean_pct}
                valueB={resolvedB.yearData.aggregates.clean_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Renewables %"
                labelA={resolvedA.label}
                labelB={resolvedB.label}
                valueA={resolvedA.yearData.aggregates.renewables_pct}
                valueB={resolvedB.yearData.aggregates.renewables_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Wind + Solar %"
                labelA={resolvedA.label}
                labelB={resolvedB.label}
                valueA={resolvedA.yearData.aggregates.wind_solar_pct}
                valueB={resolvedB.yearData.aggregates.wind_solar_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="Fossil Fuels %"
                labelA={resolvedA.label}
                labelB={resolvedB.label}
                valueA={resolvedA.yearData.aggregates.fossil_pct}
                valueB={resolvedB.yearData.aggregates.fossil_pct}
                formatFn={formatPercent}
              />
              <ComparisonBar
                label="CO2 Emissions"
                labelA={resolvedA.label}
                labelB={resolvedB.label}
                valueA={resolvedA.yearData.emissions.total_mtco2}
                valueB={resolvedB.yearData.emissions.total_mtco2}
                formatFn={formatEmissions}
              />
            </div>

            <div className="card p-5 space-y-6">
              <div className="text-[11px] text-secondary font-medium uppercase tracking-wider">
                Energy Breakdown
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {resolvedA.iso3 && <FlagImg iso3={resolvedA.iso3} size={18} />}
                  <span className="text-xs font-medium text-primary">{resolvedA.label}</span>
                </div>
                <EnergyMixChart yearData={resolvedA.yearData} />
              </div>
              <div className="border-t border-border pt-5">
                <div className="flex items-center gap-2 mb-2">
                  {resolvedB.iso3 && <FlagImg iso3={resolvedB.iso3} size={18} />}
                  <span className="text-xs font-medium text-primary">{resolvedB.label}</span>
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
                          setTypeA('country');
                          setIdA(iso3);
                        } else {
                          setTypeB('country');
                          setIdB(iso3);
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
                    className="px-3 py-1.5 rounded-full text-xs bg-inset text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    <FlagImg iso3={a} size={14} /> <FlagImg iso3={b} size={14} /> {label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setTypeA('bloc'); setIdA('EU');
                    setTypeB('bloc'); setIdB('BRICS');
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

      <footer className="border-t border-border bg-card mt-6">
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
