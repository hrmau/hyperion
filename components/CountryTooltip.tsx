'use client';

import type { Country } from '@/lib/types';
import { formatTWh, formatPercent } from '@/lib/scales';
import { getLatestYearData } from '@/lib/data';
import FlagImg from './FlagImg';

interface CountryTooltipProps {
  country: Country | null;
  position: { x: number; y: number } | null;
}

export default function CountryTooltip({ country, position }: CountryTooltipProps) {
  if (!country || !position) return null;

  const latest = getLatestYearData(country);
  if (!latest) return null;

  const { year, data: yearData } = latest;

  return (
    <div
      className="card fixed z-50 px-3 py-2.5 pointer-events-none"
      style={{
        left: position.x + 12,
        top: position.y + 12,
        maxWidth: '240px',
      }}
    >
      <div className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1.5">
        <FlagImg iso3={country.iso3} size={16} />
        <span>{country.name}</span>
        <span className="text-muted font-normal">({year})</span>
      </div>
      <div className="space-y-0.5 text-[11px]">
        <div className="flex justify-between gap-4">
          <span className="text-muted">Generation</span>
          <span className="text-primary tabular-nums">{formatTWh(yearData.total_generation_twh)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted">Clean energy</span>
          <span className="text-primary tabular-nums">{formatPercent(yearData.aggregates.clean_pct)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted">Fossil fuels</span>
          <span className="text-primary tabular-nums">{formatPercent(yearData.aggregates.fossil_pct)}</span>
        </div>
      </div>
    </div>
  );
}
