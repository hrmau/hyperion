'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import { loadCountries, loadFossilFuelData, loadBlocs, getLatestYearData, getBlocsForCountry } from '@/lib/data';
import type { CountriesData, Country, FossilFuelData, YearData, BlocsData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { calculateIndependenceScoreV2, getFossilDataForYear, formatIndependenceScore } from '@/lib/independence';
import { energyColors, energyLabels, energyOrder } from '@/lib/colors';
import FlagImg from '@/components/FlagImg';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import Link from 'next/link';

type SortKey =
  | 'name'
  | 'total_generation_twh'
  | 'independence_score'
  | 'clean_pct'
  | 'fossil_pct'
  | 'renewables_pct'
  | 'wind_solar_pct'
  | 'nuclear_pct'
  | 'emissions';

type SortDir = 'asc' | 'desc';

interface ColumnDef {
  key: SortKey;
  label: string;
  shortLabel: string;
  align: 'left' | 'right';
  format: (row: RowData) => string;
  colorFn?: (row: RowData) => string | undefined;
}

interface RowData {
  country: Country;
  year: number;
  yearData: YearData;
  total_generation_twh: number;
  independence_score: number;
  /** False when the score could not be computed at all (no demand and no generation). */
  independence_available: boolean;
  independence_color: string | undefined;
  independence_missing_data: boolean;
  clean_pct: number;
  fossil_pct: number;
  renewables_pct: number;
  wind_solar_pct: number;
  nuclear_pct: number;
  emissions: number;
}

const columns: ColumnDef[] = [
  {
    key: 'name',
    label: 'Country',
    shortLabel: 'Country',
    align: 'left',
    format: () => '',
  },
  {
    key: 'total_generation_twh',
    label: 'Generation',
    shortLabel: 'Gen.',
    align: 'right',
    format: (r) => formatTWh(r.total_generation_twh),
  },
  {
    key: 'independence_score',
    label: 'Independence',
    shortLabel: 'Indep.',
    align: 'right',
    format: (r) =>
      r.independence_available
        ? formatIndependenceScore(r.independence_score) + (r.independence_missing_data ? '*' : '')
        : '—',
    colorFn: (r) => (r.independence_available ? r.independence_color : undefined),
  },
  {
    key: 'clean_pct',
    label: 'Clean %',
    shortLabel: 'Clean',
    align: 'right',
    format: (r) => formatPercent(r.clean_pct),
  },
  {
    key: 'fossil_pct',
    label: 'Fossil %',
    shortLabel: 'Fossil',
    align: 'right',
    format: (r) => formatPercent(r.fossil_pct),
  },
  {
    key: 'renewables_pct',
    label: 'Renewables %',
    shortLabel: 'Renew.',
    align: 'right',
    format: (r) => formatPercent(r.renewables_pct),
  },
  {
    key: 'wind_solar_pct',
    label: 'Wind+Solar %',
    shortLabel: 'W+S',
    align: 'right',
    format: (r) => formatPercent(r.wind_solar_pct),
  },
  {
    key: 'nuclear_pct',
    label: 'Nuclear %',
    shortLabel: 'Nucl.',
    align: 'right',
    format: (r) => formatPercent(r.nuclear_pct),
  },
  {
    key: 'emissions',
    label: 'CO₂ Emissions',
    shortLabel: 'CO₂',
    align: 'right',
    format: (r) => formatEmissions(r.emissions),
  },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`inline-block ml-0.5 ${active ? 'text-primary' : 'text-muted/50'}`}>
      {active ? (dir === 'asc' ? '▲' : '▼') : '▽'}
    </span>
  );
}

const BLOC_LABELS: Record<string, string> = {
  EU: 'EU', NATO: 'NATO', BRICS: 'BRICS+', G7: 'G7',
  G20: 'G20', OECD: 'OECD', ASEAN: 'ASEAN', THE_WEST: 'The West',
  GLOBAL_SOUTH: 'Global South', OPEC_PLUS: 'OPEC+',
  ELECTROSTATES: 'Electrostates', PETROSTATES: 'Petrostates', NUCLEAR_CLUB: 'Nuclear Club',
};

export default function RankingsPage() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [blocsData, setBlocsData] = useState<BlocsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('total_generation_twh');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([loadCountries(), loadFossilFuelData(), loadBlocs()])
      .then(([data, fossilData, blocs]) => {
        setCountries(data);
        setFossilFuelData(fossilData);
        setBlocsData(blocs);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const rows = useMemo(() => {
    if (!countries) return [];

    return Object.values(countries)
      .map((c): RowData | null => {
        const latest = getLatestYearData(c);
        if (!latest) return null;
        const { year, data: yd } = latest;
        const { data: fossilYear } = getFossilDataForYear(fossilFuelData?.countries[c.iso3], year);
        const indep = calculateIndependenceScoreV2(yd, fossilYear, c.iso3);
        return {
          country: c,
          year,
          yearData: yd,
          total_generation_twh: yd.total_generation_twh,
          independence_score: indep?.score ?? 0,
          independence_available: indep !== null,
          independence_color: indep?.color,
          independence_missing_data: indep?.missingFossilData ?? false,
          clean_pct: yd.aggregates.clean_pct,
          fossil_pct: yd.aggregates.fossil_pct,
          renewables_pct: yd.aggregates.renewables_pct,
          wind_solar_pct: yd.aggregates.wind_solar_pct,
          nuclear_pct: yd.generation.nuclear?.pct || 0,
          emissions: yd.emissions.total_mtco2,
        };
      })
      .filter((r): r is RowData => r !== null);
  }, [countries, fossilFuelData]);

  const sorted = useMemo(() => {
    const mult = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === 'name') {
        return mult * a.country.name.localeCompare(b.country.name);
      }
      // Rows with no computable independence score sink to the bottom in both
      // directions, rather than masquerading as the most dependent grids on earth.
      if (sortKey === 'independence_score' && a.independence_available !== b.independence_available) {
        return a.independence_available ? -1 : 1;
      }
      return mult * ((a[sortKey] as number) - (b[sortKey] as number));
    });
  }, [rows, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const toggleRow = (iso3: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(iso3)) {
        next.delete(iso3);
      } else {
        next.add(iso3);
      }
      return next;
    });
  };

  if (loading || !countries) {
    return (
      <div className="gg-page min-h-screen flex items-center justify-center">
        <div className="text-secondary text-sm">Loading energy data...</div>
      </div>
    );
  }

  return (
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav active="rankings" />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-inset/50">
                  <th className="py-3.5 px-3 text-left text-[11px] text-secondary font-semibold uppercase tracking-wider w-8">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`py-3.5 px-3 text-[11px] text-secondary font-semibold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none whitespace-nowrap ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <span className="hidden sm:inline">{col.label}</span>
                      <span className="sm:hidden">{col.shortLabel}</span>
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => {
                  const isExpanded = expandedRows.has(row.country.iso3);
                  const colCount = columns.length + 1; // +1 for rank column

                  return (
                    <Fragment key={row.country.iso3}>
                      <tr
                        onClick={() => toggleRow(row.country.iso3)}
                        className={`border-b border-border-subtle hover:bg-inset transition-colors cursor-pointer ${isExpanded ? 'bg-inset/50' : ''}`}
                      >
                        <td className="py-2 px-3 text-[11px] text-muted tabular-nums">
                          {i + 1}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              ▶
                            </span>
                            <FlagImg iso3={row.country.iso3} size={18} />
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-primary truncate">{row.country.name}</div>
                              <div className="text-[10px] text-muted">{row.country.emberRegion}</div>
                            </div>
                          </div>
                        </td>
                        {columns.slice(1).map((col) => {
                          const cellColor = col.colorFn?.(row);
                          return (
                            <td
                              key={col.key}
                              className={`py-2 px-3 text-right text-xs tabular-nums whitespace-nowrap ${cellColor ? 'font-medium' : 'text-primary'}`}
                              style={cellColor ? { color: cellColor } : undefined}
                            >
                              {col.format(row)}
                            </td>
                          );
                        })}
                      </tr>
                      {isExpanded && (
                        <tr key={`${row.country.iso3}-details`} className="border-b border-border-subtle bg-inset/30">
                          <td colSpan={colCount} className="p-0">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Energy Mix */}
                                <div>
                                  <h4 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-3">
                                    Energy Mix ({row.year})
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="h-4 rounded overflow-hidden flex">
                                      {energyOrder.map(source => {
                                        const pct = row.yearData.generation[source]?.pct || 0;
                                        if (pct === 0) return null;
                                        return (
                                          <div
                                            key={source}
                                            style={{
                                              width: `${pct}%`,
                                              backgroundColor: energyColors[source],
                                            }}
                                            title={`${energyLabels[source]}: ${formatPercent(pct)}`}
                                          />
                                        );
                                      })}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                      {energyOrder.map(source => {
                                        const pct = row.yearData.generation[source]?.pct || 0;
                                        const twh = row.yearData.generation[source]?.twh || 0;
                                        if (twh === 0) return null;
                                        return (
                                          <div key={source} className="flex items-center gap-1.5">
                                            <div
                                              className="w-2 h-2 rounded-sm shrink-0"
                                              style={{ backgroundColor: energyColors[source] }}
                                            />
                                            <span className="text-[10px] text-muted truncate">{energyLabels[source]}</span>
                                            <span className="text-[10px] text-primary ml-auto tabular-nums">
                                              {formatPercent(pct)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Key Stats */}
                                <div>
                                  <h4 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-3">
                                    Key Statistics
                                  </h4>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted">Total Generation</span>
                                      <span className="text-primary font-medium tabular-nums">{formatTWh(row.total_generation_twh)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted">Demand</span>
                                      <span className="text-primary font-medium tabular-nums">{formatTWh(row.yearData.demand_twh)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted">CO₂ Emissions</span>
                                      <span className="text-primary font-medium tabular-nums">{formatEmissions(row.emissions)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted">Clean Energy</span>
                                      <span className="text-primary font-medium tabular-nums">{formatPercent(row.clean_pct)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted">Independence</span>
                                      <span className="font-medium tabular-nums" style={{ color: row.independence_color }}>
                                        {formatIndependenceScore(row.independence_score)}{row.independence_missing_data ? '*' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div>
                                  <h4 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-3">
                                    Explore More
                                  </h4>
                                  <div className="space-y-2">
                                    <Link
                                      href={`/compare?countries=${row.country.iso3}`}
                                      className="block text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Compare with other countries →
                                    </Link>
                                    {(() => {
                                      const memberBlocs = blocsData
                                        ? getBlocsForCountry(row.country.iso3, blocsData)
                                        : row.country.blocs;
                                      if (memberBlocs.length === 0) return null;
                                      return (
                                        <div className="pt-2">
                                          <span className="text-[10px] text-muted">Member of: </span>
                                          <span className="text-[10px] text-secondary">
                                            {memberBlocs.slice(0, 5).map(b => BLOC_LABELS[b] || b).join(', ')}
                                            {memberBlocs.length > 5 && ` +${memberBlocs.length - 5} more`}
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metrics Legend */}
        <div className="card p-6 mt-6">
          <h3 className="text-sm font-semibold text-primary mb-4">Understanding the Metrics</h3>
          <div className="grid md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <div className="font-medium text-secondary mb-1">Generation (TWh)</div>
                <p className="text-muted leading-relaxed">
                  Total electricity produced in terawatt-hours. This includes all sources: fossil fuels, nuclear, and renewables.
                  China leads with ~10,400 TWh, while smaller nations may produce under 50 TWh.
                </p>
              </div>
              <div>
                <div className="font-medium text-secondary mb-1">Energy Independence</div>
                <p className="text-muted leading-relaxed">
                  Weighted score accounting for fuel import dependency. Renewables count as 100% independent.
                  Nuclear is weighted by domestic uranium production (e.g., France at 0% uranium production means nuclear contributes less to independence).
                  Fossil fuels are weighted by domestic production/consumption ratio (e.g., if a country imports 97% of its gas,
                  gas-based electricity only contributes 3% to independence).
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#05966910', color: '#059669' }}>95%+ Fortress</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#22C55E10', color: '#22C55E' }}>80-94% Strong</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#EAB30810', color: '#EAB308' }}>60-79% Moderate</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#F9731610', color: '#F97316' }}>40-59% Dependent</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#EF444410', color: '#EF4444' }}>&lt;40% Critical</span>
                </div>
                <p className="text-muted leading-relaxed mt-2">
                  <span className="text-secondary font-medium">*</span> Score marked with an asterisk indicates no fossil fuel import data is available for that country.
                  In these cases, fossil fuel generation is assumed to be 100% imported, which may underestimate independence for countries with domestic fossil fuel production.
                </p>
              </div>
              <div>
                <div className="font-medium text-secondary mb-1">Clean Energy %</div>
                <p className="text-muted leading-relaxed">
                  Percentage from non-fossil sources: nuclear + renewables (hydro, wind, solar, bioenergy).
                  Sweden leads at ~98% clean, while Poland is ~25% due to coal dependence.
                </p>
              </div>
              <div>
                <div className="font-medium text-secondary mb-1">Fossil Fuels %</div>
                <p className="text-muted leading-relaxed">
                  Percentage from coal, gas, and other fossil fuels. The inverse of clean energy.
                  High fossil = higher CO₂ emissions and price volatility exposure.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-secondary mb-1">Renewables %</div>
                <p className="text-muted leading-relaxed">
                  Percentage from renewable sources only: hydro, wind, solar, and bioenergy.
                  Excludes nuclear. Norway leads at ~98% (mostly hydro), while Middle Eastern countries are under 5%.
                </p>
              </div>
              <div>
                <div className="font-medium text-secondary mb-1">Wind + Solar %</div>
                <p className="text-muted leading-relaxed">
                  Combined share of wind and solar generation. The fastest-growing energy sources globally.
                  Denmark leads at ~80%, showing what&apos;s possible with policy commitment.
                </p>
              </div>
              <div>
                <div className="font-medium text-secondary mb-1">Nuclear %</div>
                <p className="text-muted leading-relaxed">
                  Percentage from nuclear power plants. Provides reliable, low-carbon baseload power.
                  France leads at ~65%, while many countries have 0% (either by policy choice or lacking infrastructure).
                </p>
              </div>
              <div>
                <div className="font-medium text-secondary mb-1">CO₂ Emissions</div>
                <p className="text-muted leading-relaxed">
                  Total carbon dioxide from electricity generation in megatonnes (Mt) or gigatonnes (Gt).
                  Directly correlates with fossil fuel percentage. China emits ~5.9 Gt, while Iceland emits near zero.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
