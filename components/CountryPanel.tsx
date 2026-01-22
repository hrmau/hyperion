'use client';

import type { Country } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import EnergyMixChart from './EnergyMixChart';

interface CountryPanelProps {
  country: Country | null;
  year: number;
  onClose: () => void;
}

export default function CountryPanel({ country, year, onClose }: CountryPanelProps) {
  if (!country) return null;

  const yearData = country.years[year.toString()];

  return (
    <div className="card h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">{country.name}</h2>
          <p className="text-sm text-secondary">{country.emberRegion}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-inset rounded-lg transition-colors"
          aria-label="Close panel"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary"
          >
            <path d="M15 5L5 15M5 5l10 10" />
          </svg>
        </button>
      </div>

      {!yearData ? (
        <div className="p-5 text-secondary">
          No data available for {year}
        </div>
      ) : (
        <div className="p-5 space-y-6">
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-inset rounded-xl p-4">
              <div className="text-xs text-muted uppercase tracking-wide mb-1">
                Generation
              </div>
              <div className="text-xl font-semibold text-primary">
                {formatTWh(yearData.total_generation_twh)}
              </div>
            </div>
            <div className="bg-inset rounded-xl p-4">
              <div className="text-xs text-muted uppercase tracking-wide mb-1">
                Demand
              </div>
              <div className="text-xl font-semibold text-primary">
                {formatTWh(yearData.demand_twh)}
              </div>
            </div>
            <div className="bg-inset rounded-xl p-4">
              <div className="text-xs text-muted uppercase tracking-wide mb-1">
                Clean Energy
              </div>
              <div className="text-xl font-semibold text-positive">
                {formatPercent(yearData.aggregates.clean_pct)}
              </div>
            </div>
            <div className="bg-inset rounded-xl p-4">
              <div className="text-xs text-muted uppercase tracking-wide mb-1">
                Emissions
              </div>
              <div className="text-xl font-semibold text-primary">
                {formatEmissions(yearData.emissions.total_mtco2)}
              </div>
            </div>
          </div>

          {/* Energy mix */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-3">
              Energy Mix ({year})
            </h3>
            <EnergyMixChart yearData={yearData} />
          </div>

          {/* Aggregates */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-3">
              Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Renewables</span>
                <span className="text-primary font-medium">
                  {formatPercent(yearData.aggregates.renewables_pct)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Wind + Solar</span>
                <span className="text-primary font-medium">
                  {formatPercent(yearData.aggregates.wind_solar_pct)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Fossil Fuels</span>
                <span className="text-negative font-medium">
                  {formatPercent(yearData.aggregates.fossil_pct)}
                </span>
              </div>
            </div>
          </div>

          {/* Blocs */}
          {country.blocs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-primary mb-2">
                Member of
              </h3>
              <div className="flex flex-wrap gap-2">
                {country.blocs.map(bloc => (
                  <span
                    key={bloc}
                    className="px-2 py-1 bg-inset rounded-md text-xs text-secondary"
                  >
                    {bloc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
