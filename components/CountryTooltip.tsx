'use client';

import type { Country } from '@/lib/types';
import { formatTWh, formatPercent } from '@/lib/scales';

interface CountryTooltipProps {
  country: Country | null;
  year: number;
  position: { x: number; y: number } | null;
}

export default function CountryTooltip({ country, year, position }: CountryTooltipProps) {
  if (!country || !position) return null;

  const yearData = country.years[year.toString()];
  if (!yearData) return null;

  return (
    <div
      className="card fixed z-50 px-4 py-3 pointer-events-none"
      style={{
        left: position.x + 12,
        top: position.y + 12,
        maxWidth: '280px',
      }}
    >
      <div className="font-semibold text-primary mb-2">{country.name}</div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-secondary">Generation</span>
          <span className="text-primary font-medium">
            {formatTWh(yearData.total_generation_twh)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-secondary">Clean energy</span>
          <span className="text-primary font-medium">
            {formatPercent(yearData.aggregates.clean_pct)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-secondary">Fossil fuels</span>
          <span className="text-primary font-medium">
            {formatPercent(yearData.aggregates.fossil_pct)}
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-muted">
        Click for details
      </div>
    </div>
  );
}
