'use client';

import type { Region, IncomeLevel } from '@/lib/types';
import type { ColorMode } from './ScatterPlot';

interface CorrelationFiltersProps {
  selectedRegions: Set<Region>;
  selectedIncomeLevels: Set<IncomeLevel>;
  onRegionChange: (regions: Set<Region>) => void;
  onIncomeLevelChange: (levels: Set<IncomeLevel>) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  useLogScale: boolean;
  onLogScaleChange: (useLog: boolean) => void;
  showRegression: boolean;
  onRegressionChange: (show: boolean) => void;
}

const regions: Region[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
const incomeLevels: { value: IncomeLevel; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'upper-middle', label: 'Upper-middle' },
  { value: 'lower-middle', label: 'Lower-middle' },
  { value: 'low', label: 'Low' },
];

export default function CorrelationFilters({
  selectedRegions,
  selectedIncomeLevels,
  onRegionChange,
  onIncomeLevelChange,
  colorMode,
  onColorModeChange,
  useLogScale,
  onLogScaleChange,
  showRegression,
  onRegressionChange,
}: CorrelationFiltersProps) {
  const toggleRegion = (region: Region) => {
    const newSet = new Set(selectedRegions);
    if (newSet.has(region)) {
      newSet.delete(region);
    } else {
      newSet.add(region);
    }
    onRegionChange(newSet);
  };

  const toggleIncomeLevel = (level: IncomeLevel) => {
    const newSet = new Set(selectedIncomeLevels);
    if (newSet.has(level)) {
      newSet.delete(level);
    } else {
      newSet.add(level);
    }
    onIncomeLevelChange(newSet);
  };

  const selectAllRegions = () => onRegionChange(new Set(regions));
  const clearRegions = () => onRegionChange(new Set());
  const selectAllIncome = () => onIncomeLevelChange(new Set(incomeLevels.map(l => l.value)));
  const clearIncome = () => onIncomeLevelChange(new Set());

  return (
    <div className="space-y-4">
      {/* Region Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-secondary uppercase tracking-wide">Region</h4>
          <div className="flex gap-2 text-[10px]">
            <button
              onClick={selectAllRegions}
              className="text-muted hover:text-primary transition-colors"
            >
              All
            </button>
            <span className="text-border">|</span>
            <button
              onClick={clearRegions}
              className="text-muted hover:text-primary transition-colors"
            >
              None
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={`
                px-2.5 py-1 text-xs rounded-full border transition-all
                ${selectedRegions.has(region) || selectedRegions.size === 0
                  ? 'bg-card border-border text-primary'
                  : 'bg-inset border-transparent text-muted hover:text-secondary'
                }
              `}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Income Level Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-secondary uppercase tracking-wide">Income Level</h4>
          <div className="flex gap-2 text-[10px]">
            <button
              onClick={selectAllIncome}
              className="text-muted hover:text-primary transition-colors"
            >
              All
            </button>
            <span className="text-border">|</span>
            <button
              onClick={clearIncome}
              className="text-muted hover:text-primary transition-colors"
            >
              None
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {incomeLevels.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleIncomeLevel(value)}
              className={`
                px-2.5 py-1 text-xs rounded-full border transition-all
                ${selectedIncomeLevels.has(value) || selectedIncomeLevels.size === 0
                  ? 'bg-card border-border text-primary'
                  : 'bg-inset border-transparent text-muted hover:text-secondary'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Options */}
      <div className="pt-2 border-t border-border-subtle">
        <h4 className="text-xs font-medium text-secondary uppercase tracking-wide mb-2">Options</h4>
        <div className="space-y-2">
          {/* Color Mode */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary">Color by</span>
            <select
              value={colorMode}
              onChange={e => onColorModeChange(e.target.value as ColorMode)}
              className="text-xs bg-inset border border-border rounded px-2 py-1 text-primary"
            >
              <option value="region">Region</option>
              <option value="income">Income Level</option>
            </select>
          </div>

          {/* Log Scale */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-secondary">Log scale</span>
            <input
              type="checkbox"
              checked={useLogScale}
              onChange={e => onLogScaleChange(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
          </label>

          {/* Regression Line */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-secondary">Trend line</span>
            <input
              type="checkbox"
              checked={showRegression}
              onChange={e => onRegressionChange(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
