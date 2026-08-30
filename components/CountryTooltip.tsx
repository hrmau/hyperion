'use client';

import { useRef } from 'react';
import type { Country, FossilFuelData } from '@/lib/types';
import FlagImg from '@/components/FlagImg';
import { formatTWh, formatPercent } from '@/lib/scales';
import { getLatestYearData } from '@/lib/data';
import { calculateIndependenceScoreV2, getFossilDataForYear } from '@/lib/independence';

interface CountryTooltipProps {
  country: Country | null;
  position: { x: number; y: number } | null;
  fossilFuelData: FossilFuelData | null;
  onDismiss?: () => void;
}

const TOOLTIP_WIDTH = 240;
const TOOLTIP_OFFSET = 12;
const EDGE_PADDING = 8;
/** Enough for the tallest tooltip: name, stat rows and the mix bar. */
const TOOLTIP_EST_HEIGHT = 190;

export default function CountryTooltip({ country, position, fossilFuelData, onDismiss }: CountryTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Placement is derived, not stored.
  //
  // This used to run in a layout effect that called setState, which meant every
  // mousemove over the map produced two renders. The result is a pure function
  // of the cursor position and the viewport, so it belongs in the render pass.
  //
  // Height is a constant estimate rather than a measurement. The old code read
  // it from a ref with a fallback of 100, but the ref was only ever populated
  // from the previous commit, and reading a ref during render is impure — the
  // React compiler rejects it. The tooltip's content is a fixed shape (name,
  // four stats, a mix bar), so a constant is as good as the measurement was and
  // costs no render.
  const adjustedPos = (() => {
    if (!position || typeof window === 'undefined') return null;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipHeight = TOOLTIP_EST_HEIGHT;

    let left = position.x + TOOLTIP_OFFSET;
    let top = position.y + TOOLTIP_OFFSET;

    // Right edge: flip to the left of the cursor, then clamp.
    if (left + TOOLTIP_WIDTH + EDGE_PADDING > viewportWidth) {
      left = position.x - TOOLTIP_WIDTH - TOOLTIP_OFFSET;
      if (left < EDGE_PADDING) left = EDGE_PADDING;
    }

    // Bottom edge: flip above the cursor, then clamp.
    if (top + tooltipHeight + EDGE_PADDING > viewportHeight) {
      top = position.y - tooltipHeight - TOOLTIP_OFFSET;
      if (top < EDGE_PADDING) top = EDGE_PADDING;
    }

    return { left, top };
  })();

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
