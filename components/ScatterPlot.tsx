'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import type { CorrelationDataPoint, Region, IncomeLevel } from '@/lib/types';

export type AxisMetric =
  | 'electricity_per_capita_kwh'
  | 'gdp_per_capita_ppp'
  | 'hdi'
  | 'life_expectancy'
  | 'manufacturing_per_capita';

export type ColorMode = 'region' | 'income';

interface ScatterPlotProps {
  data: CorrelationDataPoint[];
  xMetric: AxisMetric;
  yMetric: AxisMetric;
  colorMode: ColorMode;
  useLogScale: boolean;
  showRegression: boolean;
  highlightedCountries?: Set<string>;
  onHover?: (point: CorrelationDataPoint | null, event: MouseEvent | null) => void;
  onClick?: (point: CorrelationDataPoint) => void;
}

const metricLabels: Record<AxisMetric, string> = {
  electricity_per_capita_kwh: 'Electricity (kWh/capita)',
  gdp_per_capita_ppp: 'GDP per capita (PPP $)',
  hdi: 'Human Development Index',
  life_expectancy: 'Life Expectancy (years)',
  manufacturing_per_capita: 'Manufacturing ($/capita)',
};

const regionColors: Record<Region, string> = {
  Africa: '#F97316',
  Americas: '#3B82F6',
  Asia: '#EF4444',
  Europe: '#22C55E',
  Oceania: '#A855F7',
};

const incomeColors: Record<IncomeLevel, string> = {
  low: '#EF4444',
  'lower-middle': '#F97316',
  'upper-middle': '#FBBF24',
  high: '#22C55E',
};

const MARGIN = { top: 20, right: 30, bottom: 50, left: 70 };

function calculateRegression(data: CorrelationDataPoint[], xMetric: AxisMetric, yMetric: AxisMetric): {
  slope: number;
  intercept: number;
  rSquared: number;
} | null {
  if (data.length < 2) return null;

  const points = data.map(d => ({
    x: d[xMetric] as number,
    y: d[yMetric] as number,
  })).filter(p => p.x > 0 && p.y > 0 && isFinite(p.x) && isFinite(p.y));

  if (points.length < 2) return null;

  const n = points.length;
  const sumX = d3.sum(points, p => p.x);
  const sumY = d3.sum(points, p => p.y);
  const sumXY = d3.sum(points, p => p.x * p.y);
  const sumXX = d3.sum(points, p => p.x * p.x);
  const sumYY = d3.sum(points, p => p.y * p.y);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const meanY = sumY / n;
  const ssTotal = d3.sum(points, p => Math.pow(p.y - meanY, 2));
  const ssResidual = d3.sum(points, p => Math.pow(p.y - (slope * p.x + intercept), 2));
  const rSquared = 1 - ssResidual / ssTotal;

  return { slope, intercept, rSquared };
}

export default function ScatterPlot({
  data,
  xMetric,
  yMetric,
  colorMode,
  useLogScale,
  showRegression,
  highlightedCountries,
  onHover,
  onClick,
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [isDark, setIsDark] = useState(false);

  // Watch for theme changes
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Resize observer
  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(400, height) });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const xVal = d[xMetric] as number;
      const yVal = d[yMetric] as number;
      return xVal > 0 && yVal > 0 && isFinite(xVal) && isFinite(yVal);
    });
  }, [data, xMetric, yMetric]);

  const regression = useMemo(() => {
    if (!showRegression) return null;
    return calculateRegression(filteredData, xMetric, yMetric);
  }, [filteredData, xMetric, yMetric, showRegression]);

  const handleMouseMove = useCallback(
    (event: MouseEvent, point: CorrelationDataPoint) => {
      onHover?.(point, event);
    },
    [onHover]
  );

  const handleMouseLeave = useCallback(() => {
    onHover?.(null, null);
  }, [onHover]);

  const handleClick = useCallback(
    (point: CorrelationDataPoint) => {
      onClick?.(point);
    },
    [onClick]
  );

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const { width, height } = dimensions;
    const plotWidth = width - MARGIN.left - MARGIN.right;
    const plotHeight = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Get theme colors
    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--text-primary').trim() || '#1A1A1A';
    const mutedColor = styles.getPropertyValue('--text-muted').trim() || '#78808C';
    const borderColor = styles.getPropertyValue('--border').trim() || 'rgba(0,0,0,0.08)';

    // Create scales
    const xExtent = d3.extent(filteredData, d => d[xMetric] as number) as [number, number];
    const yExtent = d3.extent(filteredData, d => d[yMetric] as number) as [number, number];

    const xScale = useLogScale
      ? d3.scaleLog().domain([Math.max(1, xExtent[0] * 0.8), xExtent[1] * 1.2]).range([0, plotWidth])
      : d3.scaleLinear().domain([0, xExtent[1] * 1.1]).range([0, plotWidth]);

    const yScale = useLogScale
      ? d3.scaleLog().domain([Math.max(0.1, yExtent[0] * 0.9), yExtent[1] * 1.1]).range([plotHeight, 0])
      : d3.scaleLinear().domain([0, yExtent[1] * 1.1]).range([plotHeight, 0]);

    // Population scale for bubble size
    const popExtent = d3.extent(filteredData, d => d.population_millions) as [number, number];
    const sizeScale = d3.scaleSqrt().domain(popExtent).range([4, 30]);

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Grid lines
    const xAxis = useLogScale
      ? d3.axisBottom(xScale).ticks(5, '~s')
      : d3.axisBottom(xScale).ticks(8);
    const yAxis = useLogScale
      ? d3.axisLeft(yScale).ticks(5, '~s')
      : d3.axisLeft(yScale).ticks(8);

    // X grid
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(
        (useLogScale
          ? d3.axisBottom(xScale).ticks(5)
          : d3.axisBottom(xScale).ticks(8))
          .tickSize(-plotHeight)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', borderColor)
      .attr('stroke-dasharray', '2,2');

    // Y grid
    g.append('g')
      .attr('class', 'grid')
      .call(
        (useLogScale
          ? d3.axisLeft(yScale).ticks(5)
          : d3.axisLeft(yScale).ticks(8))
          .tickSize(-plotWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', borderColor)
      .attr('stroke-dasharray', '2,2');

    // Remove domain lines from grid
    g.selectAll('.grid .domain').remove();

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(xAxis)
      .attr('color', mutedColor)
      .selectAll('text')
      .attr('fill', mutedColor)
      .attr('font-size', '11px');

    // Y axis
    g.append('g')
      .call(yAxis)
      .attr('color', mutedColor)
      .selectAll('text')
      .attr('fill', mutedColor)
      .attr('font-size', '11px');

    // X axis label
    g.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', plotHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(metricLabels[xMetric]);

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(metricLabels[yMetric]);

    // Regression line
    if (regression && showRegression) {
      const xMin = xScale.domain()[0];
      const xMax = xScale.domain()[1];
      const yMin = regression.slope * xMin + regression.intercept;
      const yMax = regression.slope * xMax + regression.intercept;

      g.append('line')
        .attr('x1', xScale(xMin))
        .attr('y1', yScale(Math.max(yScale.domain()[0], yMin)))
        .attr('x2', xScale(xMax))
        .attr('y2', yScale(Math.min(yScale.domain()[1], yMax)))
        .attr('stroke', '#6366F1')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,4')
        .attr('opacity', 0.7);

      // R² label
      g.append('text')
        .attr('x', plotWidth - 10)
        .attr('y', 20)
        .attr('text-anchor', 'end')
        .attr('fill', '#6366F1')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text(`r² = ${regression.rSquared.toFixed(2)}`);
    }

    // Bubbles
    const bubbles = g.selectAll('circle')
      .data(filteredData)
      .join('circle')
      .attr('cx', d => xScale(d[xMetric] as number))
      .attr('cy', d => yScale(d[yMetric] as number))
      .attr('r', d => sizeScale(d.population_millions))
      .attr('fill', d => {
        if (colorMode === 'region') {
          return regionColors[d.region];
        }
        return incomeColors[d.income_level];
      })
      .attr('fill-opacity', d => {
        if (highlightedCountries && highlightedCountries.size > 0) {
          return highlightedCountries.has(d.iso3) ? 0.8 : 0.15;
        }
        return 0.7;
      })
      .attr('stroke', d => {
        if (highlightedCountries?.has(d.iso3)) {
          return textColor;
        }
        return 'white';
      })
      .attr('stroke-width', d => highlightedCountries?.has(d.iso3) ? 2 : 1)
      .attr('cursor', 'pointer')
      .on('mousemove', function (event, d) {
        handleMouseMove(event, d);
        d3.select(this).attr('stroke-width', 2).attr('stroke', textColor);
      })
      .on('mouseleave', function (event, d) {
        handleMouseLeave();
        d3.select(this)
          .attr('stroke-width', highlightedCountries?.has(d.iso3) ? 2 : 1)
          .attr('stroke', highlightedCountries?.has(d.iso3) ? textColor : 'white');
      })
      .on('click', function (event, d) {
        handleClick(d);
      });

    // Add country labels for highlighted or large countries
    const labeledData = filteredData.filter(d =>
      highlightedCountries?.has(d.iso3) || d.population_millions > 200
    );

    g.selectAll('text.country-label')
      .data(labeledData)
      .join('text')
      .attr('class', 'country-label')
      .attr('x', d => xScale(d[xMetric] as number))
      .attr('y', d => yScale(d[yMetric] as number) - sizeScale(d.population_millions) - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text(d => d.iso3);

  }, [filteredData, dimensions, xMetric, yMetric, colorMode, useLogScale, showRegression, regression, highlightedCountries, handleMouseMove, handleMouseLeave, handleClick, isDark]);

  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      className="w-full h-full"
    />
  );
}

// Legend component
export function ScatterPlotLegend({ colorMode }: { colorMode: ColorMode }) {
  const items = colorMode === 'region'
    ? Object.entries(regionColors).map(([label, color]) => ({ label, color }))
    : [
        { label: 'High income', color: incomeColors.high },
        { label: 'Upper-middle', color: incomeColors['upper-middle'] },
        { label: 'Lower-middle', color: incomeColors['lower-middle'] },
        { label: 'Low income', color: incomeColors.low },
      ];

  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-secondary">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-2 border-l border-border pl-3">
        <div className="flex items-center gap-0.5">
          <div className="w-2 h-2 rounded-full bg-muted opacity-50" />
          <div className="w-3 h-3 rounded-full bg-muted opacity-50" />
          <div className="w-4 h-4 rounded-full bg-muted opacity-50" />
        </div>
        <span className="text-muted">= Population</span>
      </div>
    </div>
  );
}
