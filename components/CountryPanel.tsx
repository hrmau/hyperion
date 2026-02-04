'use client';

import type { Country, YearData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import EnergyMixChart from './EnergyMixChart';

interface CountryPanelProps {
  primary: Country | null;
  compare: Country | null;
  year: number;
  topCountries: Country[];
  onClose: () => void;
  onSelectCountry: (country: Country) => void;
}

function StatRow({ label, value }: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-medium text-primary">{value}</span>
    </div>
  );
}

function CountryDetail({ country, yearData, year }: {
  country: Country;
  yearData: YearData;
  year: number;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
            Generation
          </div>
          <div className="text-sm font-medium text-primary">
            {formatTWh(yearData.total_generation_twh)}
          </div>
        </div>
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
            Demand
          </div>
          <div className="text-sm font-medium text-primary">
            {formatTWh(yearData.demand_twh)}
          </div>
        </div>
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
            Clean Energy
          </div>
          <div className="text-sm font-medium text-positive">
            {formatPercent(yearData.aggregates.clean_pct)}
          </div>
        </div>
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">
            Emissions
          </div>
          <div className="text-sm font-medium text-primary">
            {formatEmissions(yearData.emissions.total_mtco2)}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-secondary mb-2">
          Energy Mix ({year})
        </h3>
        <EnergyMixChart yearData={yearData} />
      </div>

      <div className="space-y-0.5">
        <StatRow label="Renewables" value={formatPercent(yearData.aggregates.renewables_pct)} />
        <StatRow label="Wind + Solar" value={formatPercent(yearData.aggregates.wind_solar_pct)} />
        <StatRow label="Fossil Fuels" value={formatPercent(yearData.aggregates.fossil_pct)} />
      </div>

      {country.blocs.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-secondary mb-1.5">Member of</h3>
          <div className="flex flex-wrap gap-1.5">
            {country.blocs.map(bloc => (
              <span key={bloc} className="px-2 py-0.5 bg-inset rounded text-[11px] text-muted">
                {bloc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareRow({ label, a, b, highlightHigher, highlightLower, aVal, bVal }: {
  label: string;
  a: string;
  b: string;
  highlightHigher?: boolean;
  highlightLower?: boolean;
  aVal?: number;
  bVal?: number;
}) {
  let aClass = 'text-xs font-medium text-primary';
  let bClass = 'text-xs font-medium text-primary';

  if (aVal !== undefined && bVal !== undefined) {
    if (highlightHigher) {
      if (aVal > bVal) aClass = 'text-xs font-medium text-positive';
      if (bVal > aVal) bClass = 'text-xs font-medium text-positive';
    }
    if (highlightLower) {
      if (aVal < bVal) aClass = 'text-xs font-medium text-positive';
      if (bVal < aVal) bClass = 'text-xs font-medium text-positive';
    }
  }

  return (
    <div className="flex items-baseline py-1.5 border-b border-gray-50">
      <span className="text-[11px] text-muted flex-1">{label}</span>
      <span className={`w-24 text-right ${aClass}`}>{a}</span>
      <span className={`w-24 text-right ${bClass}`}>{b}</span>
    </div>
  );
}

function CompareView({ primary, compare, year }: {
  primary: Country;
  compare: Country;
  year: number;
}) {
  const pData = primary.years[year.toString()];
  const cData = compare.years[year.toString()];

  if (!pData || !cData) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-inset rounded-lg p-2.5 text-center">
          <div className="text-xs font-medium text-primary">{primary.name}</div>
          <div className="text-[10px] text-muted">{primary.emberRegion}</div>
        </div>
        <div className="bg-inset rounded-lg p-2.5 text-center">
          <div className="text-xs font-medium text-primary">{compare.name}</div>
          <div className="text-[10px] text-muted">{compare.emberRegion}</div>
        </div>
      </div>

      <div className="space-y-0.5">
        <CompareRow label="Generation" a={formatTWh(pData.total_generation_twh)} b={formatTWh(cData.total_generation_twh)} />
        <CompareRow label="Demand" a={formatTWh(pData.demand_twh)} b={formatTWh(cData.demand_twh)} />
        <CompareRow
          label="Clean Energy" a={formatPercent(pData.aggregates.clean_pct)} b={formatPercent(cData.aggregates.clean_pct)}
          highlightHigher aVal={pData.aggregates.clean_pct} bVal={cData.aggregates.clean_pct}
        />
        <CompareRow
          label="Renewables" a={formatPercent(pData.aggregates.renewables_pct)} b={formatPercent(cData.aggregates.renewables_pct)}
          highlightHigher aVal={pData.aggregates.renewables_pct} bVal={cData.aggregates.renewables_pct}
        />
        <CompareRow
          label="Wind + Solar" a={formatPercent(pData.aggregates.wind_solar_pct)} b={formatPercent(cData.aggregates.wind_solar_pct)}
          highlightHigher aVal={pData.aggregates.wind_solar_pct} bVal={cData.aggregates.wind_solar_pct}
        />
        <CompareRow
          label="Fossil Fuels" a={formatPercent(pData.aggregates.fossil_pct)} b={formatPercent(cData.aggregates.fossil_pct)}
          highlightLower aVal={pData.aggregates.fossil_pct} bVal={cData.aggregates.fossil_pct}
        />
        <CompareRow label="Emissions" a={formatEmissions(pData.emissions.total_mtco2)} b={formatEmissions(cData.emissions.total_mtco2)} />
      </div>

      <div>
        <h3 className="text-xs font-medium text-secondary mb-2">Energy Mix</h3>
        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-muted mb-1">{primary.name}</div>
            <EnergyMixChart yearData={pData} />
          </div>
          <div>
            <div className="text-[10px] text-muted mb-1">{compare.name}</div>
            <EnergyMixChart yearData={cData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CountryPanel({
  primary,
  compare,
  year,
  topCountries,
  onClose,
  onSelectCountry,
}: CountryPanelProps) {
  // Compare mode
  if (primary && compare) {
    return (
      <div className="card h-full overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-sm font-medium text-primary">Compare</h2>
            <p className="text-[11px] text-muted">{year}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-inset rounded-md transition-colors" aria-label="Clear selection">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M15 5L5 15M5 5l10 10" /></svg>
          </button>
        </div>
        <div className="p-4">
          <CompareView primary={primary} compare={compare} year={year} />
        </div>
      </div>
    );
  }

  // Single country mode
  if (primary) {
    const yearData = primary.years[year.toString()];
    return (
      <div className="card h-full overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-sm font-medium text-primary">{primary.name}</h2>
            <p className="text-[11px] text-muted">{primary.emberRegion}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-inset rounded-md transition-colors" aria-label="Clear selection">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M15 5L5 15M5 5l10 10" /></svg>
          </button>
        </div>
        {!yearData ? (
          <div className="p-4 text-xs text-muted">No data for {year}</div>
        ) : (
          <div className="p-4">
            <CountryDetail country={primary} yearData={yearData} year={year} />
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] text-muted">Click another country to compare</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default — top producers ranking
  return (
    <div className="card h-full overflow-y-auto">
      <div className="sticky top-0 bg-card border-b border-gray-100 px-4 py-3 z-10">
        <h2 className="text-sm font-medium text-primary">Top Producers</h2>
        <p className="text-[11px] text-muted">By total generation, {year}</p>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {topCountries.map((country, i) => {
            const yd = country.years[year.toString()];
            if (!yd) return null;
            return (
              <button
                key={country.iso3}
                onClick={() => onSelectCountry(country)}
                className="w-full flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-inset transition-colors text-left"
              >
                <span className="text-[11px] text-muted w-5 text-right tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-primary truncate">{country.name}</div>
                  <div className="text-[10px] text-muted">{formatPercent(yd.aggregates.clean_pct)} clean</div>
                </div>
                <span className="text-xs text-secondary tabular-nums">{formatTWh(yd.total_generation_twh)}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-muted">
            Click a country on the map for details. Click two countries to compare.
          </p>
        </div>
      </div>
    </div>
  );
}
