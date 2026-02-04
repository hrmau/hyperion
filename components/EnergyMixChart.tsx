'use client';

import type { YearData, EnergySource } from '@/lib/types';
import { energyColors, energyLabels, energyOrder } from '@/lib/colors';
import { formatPercent } from '@/lib/scales';

interface EnergyMixChartProps {
  yearData: YearData;
}

export default function EnergyMixChart({ yearData }: EnergyMixChartProps) {
  const { generation } = yearData;

  const data = energyOrder.map(source => ({
    source,
    label: energyLabels[source],
    color: energyColors[source],
    twh: generation[source]?.twh || 0,
    pct: generation[source]?.pct || 0,
  })).filter(d => d.twh > 0);

  return (
    <div className="space-y-2">
      <div className="h-5 rounded overflow-hidden flex">
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

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {data.map((d) => (
          <div key={d.source} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-[11px] text-muted truncate">{d.label}</span>
            <span className="text-[11px] text-primary ml-auto tabular-nums">
              {formatPercent(d.pct)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
