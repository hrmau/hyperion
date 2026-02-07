'use client';

import { useEffect, useState, useMemo } from 'react';
import { loadCountries, loadFossilFuelData, getLatestYear } from '@/lib/data';
import type { CountriesData, Country, FossilFuelData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { calculateIndependenceScoreV2, getFossilDataForYear, formatIndependenceScore } from '@/lib/independence';
import FlagImg from '@/components/FlagImg';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  total_generation_twh: number;
  independence_score: number;
  independence_color: string | undefined;
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
    format: (r) => formatIndependenceScore(r.independence_score),
    colorFn: (r) => r.independence_color,
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

export default function RankingsPage() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(2025);
  const [sortKey, setSortKey] = useState<SortKey>('total_generation_twh');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    Promise.all([loadCountries(), loadFossilFuelData()])
      .then(([data, fossilData]) => {
        setCountries(data);
        setFossilFuelData(fossilData);
        setYear(getLatestYear(data));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const rows = useMemo(() => {
    if (!countries) return [];

    return Object.values(countries)
      .map((c): RowData | null => {
        const yd = c.years[year.toString()];
        if (!yd) return null;
        const { data: fossilYear } = getFossilDataForYear(fossilFuelData?.countries[c.iso3], year);
        const indep = calculateIndependenceScoreV2(yd, fossilYear, c.iso3);
        return {
          country: c,
          total_generation_twh: yd.total_generation_twh,
          independence_score: indep?.score ?? 0,
          independence_color: indep?.color,
          clean_pct: yd.aggregates.clean_pct,
          fossil_pct: yd.aggregates.fossil_pct,
          renewables_pct: yd.aggregates.renewables_pct,
          wind_solar_pct: yd.aggregates.wind_solar_pct,
          nuclear_pct: yd.generation.nuclear?.pct || 0,
          emissions: yd.emissions.total_mtco2,
        };
      })
      .filter((r): r is RowData => r !== null);
  }, [countries, year, fossilFuelData]);

  const sorted = useMemo(() => {
    const mult = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === 'name') {
        return mult * a.country.name.localeCompare(b.country.name);
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

  if (loading || !countries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-secondary text-sm">Loading energy data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="rankings" />

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
                {sorted.map((row, i) => (
                  <tr
                    key={row.country.iso3}
                    className="border-b border-border-subtle hover:bg-inset transition-colors"
                  >
                    <td className="py-2 px-3 text-[11px] text-muted tabular-nums">
                      {i + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
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
                ))}
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
                <div className="font-medium text-secondary mb-1">Energy Independence (v2)</div>
                <p className="text-muted leading-relaxed">
                  Weighted score accounting for fossil fuel import dependency. Renewables and nuclear count as 100% independent.
                  Fossil fuels are weighted by domestic production/consumption ratio (e.g., if a country imports 97% of its gas,
                  gas-based electricity only contributes 3% to independence). Germany scores ~69% despite high production
                  because of gas import dependency.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#05966910', color: '#059669' }}>90%+ Fortress</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#22C55E10', color: '#22C55E' }}>70-90% Strong</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#EAB30810', color: '#EAB308' }}>50-70% Moderate</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#F9731610', color: '#F97316' }}>30-50% Dependent</span>
                  <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#EF444410', color: '#EF4444' }}>&lt;30% Critical</span>
                </div>
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

      <Footer />
    </div>
  );
}
