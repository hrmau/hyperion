'use client';

import type { YearData } from '@/lib/types';
import { fuelShares, FUEL_LABEL, FUEL_FILL } from '@/lib/fuels';
import { formatPercent } from '@/lib/scales';

interface EnergyMixChartProps {
  yearData: YearData;
}

export default function EnergyMixChart({ yearData }: EnergyMixChartProps) {
  // Driven by fuelShares rather than the raw sources: the data names nine
  // sources and the design system names eight fuels, and bioenergy and
  // other_renewables both land in "Other". Iterating sources here would draw
  // that band twice and list it twice in the legend.
  const data = fuelShares(yearData).filter((d) => d.twh > 0);

  return (
    <div className="space-y-2">
      <div className="h-5 rounded overflow-hidden flex">
        {data.map((d) => (
          <div
            key={d.fuel}
            style={{
              width: `${d.pct}%`,
              backgroundColor: FUEL_FILL[d.fuel],
            }}
            title={`${FUEL_LABEL[d.fuel]}: ${formatPercent(d.pct)}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {data.map((d) => (
          <div key={d.fuel} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ backgroundColor: FUEL_FILL[d.fuel] }}
            />
            <span className="text-[11px] text-muted truncate">{FUEL_LABEL[d.fuel]}</span>
            <span className="text-[11px] text-primary ml-auto tabular-nums">
              {formatPercent(d.pct)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
