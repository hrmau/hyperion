'use client';

import type { CorrelationDataPoint } from '@/lib/types';
import { getIso2 } from '@/lib/flags';

interface CorrelationTooltipProps {
  point: CorrelationDataPoint | null;
  position: { x: number; y: number } | null;
}

function formatNumber(num: number, decimals = 0): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals > 0 ? 1 : 0) + 'k';
  }
  return num.toFixed(decimals);
}

export default function CorrelationTooltip({ point, position }: CorrelationTooltipProps) {
  if (!point || !position) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 15,
        top: position.y - 10,
        transform: position.x > window.innerWidth - 280 ? 'translateX(-110%)' : 'none',
      }}
    >
      <div className="card p-3 min-w-[220px] shadow-lg">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
          <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono-xs)',
          letterSpacing: '0.06em',
          color: 'var(--text-quiet)',
          flex: 'none',
        }}
      >
        {getIso2(point.iso3) ?? '--'}
      </span>
          <div>
            <h4 className="text-sm font-medium text-primary">{point.name}</h4>
            <p className="text-[10px] text-muted">{point.region} · {point.income_level.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div>
            <span className="text-muted">Electricity</span>
            <div className="text-primary font-medium">
              {formatNumber(point.electricity_per_capita_kwh)} kWh
            </div>
          </div>
          <div>
            <span className="text-muted">GDP/capita</span>
            <div className="text-primary font-medium">
              ${formatNumber(point.gdp_per_capita_ppp)}
            </div>
          </div>
          <div>
            <span className="text-muted">HDI</span>
            <div className="text-primary font-medium">
              {point.hdi.toFixed(3)}
            </div>
          </div>
          <div>
            <span className="text-muted">Life Expectancy</span>
            <div className="text-primary font-medium">
              {point.life_expectancy.toFixed(1)} yrs
            </div>
          </div>
          <div>
            <span className="text-muted">Manufacturing</span>
            <div className="text-primary font-medium">
              ${formatNumber(point.manufacturing_per_capita)}
            </div>
          </div>
          <div>
            <span className="text-muted">Population</span>
            <div className="text-primary font-medium">
              {point.population_millions.toFixed(1)}M
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Clean Energy</span>
            <span className="text-primary font-medium">{point.clean_pct.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
