'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import type { Country, FossilFuelData } from '@/lib/types';
import { formatTWh, formatPercent } from '@/lib/scales';
import { getLatestYearData } from '@/lib/data';
import { calculateIndependenceScoreV2, getFossilDataForYear } from '@/lib/independence';
import FlagImg from './FlagImg';

interface CountryTooltipProps {
  country: Country | null;
  position: { x: number; y: number } | null;
  fossilFuelData: FossilFuelData | null;
  onDismiss?: () => void;
}

const TOOLTIP_WIDTH = 240;
const TOOLTIP_OFFSET = 12;
const EDGE_PADDING = 8;

export default function CountryTooltip({ country, position, fossilFuelData, onDismiss }: CountryTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!position) {
      setAdjustedPos(null);
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Estimate tooltip height (will be refined after render)
    const tooltipHeight = tooltipRef.current?.offsetHeight || 100;

    let left = position.x + TOOLTIP_OFFSET;
    let top = position.y + TOOLTIP_OFFSET;

    // Check right edge overflow - flip to left of cursor if needed
    if (left + TOOLTIP_WIDTH + EDGE_PADDING > viewportWidth) {
      left = position.x - TOOLTIP_WIDTH - TOOLTIP_OFFSET;
      // If still overflows left, clamp to edge
      if (left < EDGE_PADDING) {
        left = EDGE_PADDING;
      }
    }

    // Check bottom edge overflow - flip above cursor if needed
    if (top + tooltipHeight + EDGE_PADDING > viewportHeight) {
      top = position.y - tooltipHeight - TOOLTIP_OFFSET;
      // If still overflows top, clamp to edge
      if (top < EDGE_PADDING) {
        top = EDGE_PADDING;
      }
    }

    setAdjustedPos({ left, top });
  }, [position]);

  if (!country || !position) return null;

  const latest = getLatestYearData(country);
  if (!latest) return null;

  const { year, data: yearData } = latest;

  // Calculate independence score
  const countryFossil = fossilFuelData?.countries?.[country.iso3];
  const { data: fossilData } = getFossilDataForYear(countryFossil, year);
  const independence = calculateIndependenceScoreV2(yearData, fossilData, country.iso3);

  return (
    <div
      ref={tooltipRef}
      className={`card fixed z-50 px-3 py-2.5 ${onDismiss ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
      style={{
        left: adjustedPos?.left ?? position.x + TOOLTIP_OFFSET,
        top: adjustedPos?.top ?? position.y + TOOLTIP_OFFSET,
        maxWidth: `${TOOLTIP_WIDTH}px`,
      }}
      onClick={onDismiss}
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
        {independence && (
          <div className="flex justify-between gap-4">
            <span className="text-muted">Independence</span>
            <span className="text-primary tabular-nums">{independence.score.toFixed(0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
