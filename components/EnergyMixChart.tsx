'use client';

import type { YearData, EnergySource } from '@/lib/types';
import { energyColors, energyLabels, energyOrder } from '@/lib/colors';
import { formatPercent, formatTWh } from '@/lib/scales';

interface EnergyMixChartProps {
  yearData: YearData;
}

export default function EnergyMixChart({ yearData }: EnergyMixChartProps) {
  const { generation } = yearData;

  // Build data for chart
  const data = energyOrder.map(source => ({
    source,
    label: energyLabels[source],
    color: energyColors[source],
    twh: generation[source]?.twh || 0,
    pct: generation[source]?.pct || 0,
  })).filter(d => d.twh > 0);

  return (
    <div className="space-y-3">
      {/* Stacked horizontal bar */}
      <div className="h-8 rounded-lg overflow-hidden flex">
        {data.map((d) => (
          <div
            key={d.source}
            style={{
              width: `${d.pct}%`,
              backgroundColor: d.color,
            }}
            title={`${d.label}: ${formatPercent(d.pct)}`}
          />
        ))}
      </div>

      {/* Legend / breakdown */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((d) => (
          <div key={d.source} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-secondary truncate">{d.label}</span>
            <span className="text-primary font-medium ml-auto">
              {formatPercent(d.pct)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
