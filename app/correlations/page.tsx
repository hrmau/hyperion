'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScatterPlot, { ScatterPlotLegend, type AxisMetric, type ColorMode } from '@/components/ScatterPlot';
import CorrelationFilters from '@/components/CorrelationFilters';
import CorrelationTooltip from '@/components/CorrelationTooltip';
import InsightCard from '@/components/InsightCard';
import {
  loadCountries,
  loadSocioeconomicData,
  getCorrelationData,
  getLatestYear,
} from '@/lib/data';
import type { CountriesData, SocioeconomicData, CorrelationDataPoint, Region, IncomeLevel } from '@/lib/types';

type ChartTab = 'gdp' | 'hdi' | 'life' | 'manufacturing';

const chartConfigs: Record<ChartTab, { yMetric: AxisMetric; title: string; description: string }> = {
  gdp: {
    yMetric: 'gdp_per_capita_ppp',
    title: 'Electricity & GDP',
    description: 'Economic output rises with energy abundance',
  },
  hdi: {
    yMetric: 'hdi',
    title: 'Electricity & Human Development',
    description: 'Health, education, and living standards all require power',
  },
  life: {
    yMetric: 'life_expectancy',
    title: 'Electricity & Life Expectancy',
    description: 'Modern medicine and sanitation depend on electricity',
  },
  manufacturing: {
    yMetric: 'manufacturing_per_capita',
    title: 'Electricity & Industry',
    description: 'Manufacturing economies are energy-intensive',
  },
};

function calculateRSquared(data: CorrelationDataPoint[], yMetric: AxisMetric): number | null {
  if (data.length < 2) return null;

  const points = data.map(d => ({
    x: d.electricity_per_capita_kwh,
    y: d[yMetric] as number,
  })).filter(p => p.x > 0 && p.y > 0 && isFinite(p.x) && isFinite(p.y));

  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTotal = points.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0);
  const ssResidual = points.reduce((s, p) => s + Math.pow(p.y - (slope * p.x + intercept), 2), 0);

  return 1 - ssResidual / ssTotal;
}

export default function CorrelationsPage() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [socioeconomic, setSocioeconomic] = useState<SocioeconomicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2023);

  // Chart state
  const [activeTab, setActiveTab] = useState<ChartTab>('gdp');
  const [colorMode, setColorMode] = useState<ColorMode>('region');
  const [useLogScale, setUseLogScale] = useState(true);
  const [showRegression, setShowRegression] = useState(true);

  // Filter state
  const [selectedRegions, setSelectedRegions] = useState<Set<Region>>(new Set());
  const [selectedIncomeLevels, setSelectedIncomeLevels] = useState<Set<IncomeLevel>>(new Set());

  // Interaction state
  const [hoveredPoint, setHoveredPoint] = useState<CorrelationDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([loadCountries(), loadSocioeconomicData()])
      .then(([countriesData, socioData]) => {
        setCountries(countriesData);
        setSocioeconomic(socioData);
        setYear(getLatestYear(countriesData));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const correlationData = useMemo(() => {
    if (!countries || !socioeconomic) return [];
    return getCorrelationData(countries, socioeconomic, year);
  }, [countries, socioeconomic, year]);

  const filteredData = useMemo(() => {
    return correlationData.filter(d => {
      const regionMatch = selectedRegions.size === 0 || selectedRegions.has(d.region);
      const incomeMatch = selectedIncomeLevels.size === 0 || selectedIncomeLevels.has(d.income_level);
      return regionMatch && incomeMatch;
    });
  }, [correlationData, selectedRegions, selectedIncomeLevels]);

  const rSquared = useMemo(() => {
    const config = chartConfigs[activeTab];
    return calculateRSquared(filteredData, config.yMetric);
  }, [filteredData, activeTab]);

  const handleHover = useCallback(
    (point: CorrelationDataPoint | null, event: MouseEvent | null) => {
      setHoveredPoint(point);
      if (event) {
        setTooltipPos({ x: event.clientX, y: event.clientY });
      } else {
        setTooltipPos(null);
      }
    },
    []
  );

  const handleClick = useCallback((point: CorrelationDataPoint) => {
    setSelectedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(point.iso3)) {
        newSet.delete(point.iso3);
      } else {
        newSet.add(point.iso3);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCountries(new Set());
  }, []);

  if (loading || !countries || !socioeconomic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-secondary text-sm">Loading correlation data...</div>
      </div>
    );
  }

  const config = chartConfigs[activeTab];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="correlations" />

      {/* Hero Section */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold text-primary mb-1">Energy & Prosperity</h1>
          <p className="text-sm text-secondary max-w-2xl">
            Is there a connection between electricity consumption and human development?
            Explore the data across 88 countries and discover what patterns emerge.
          </p>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <InsightCard data={filteredData} rSquared={rSquared} />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 pb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filters Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="card p-4 sticky top-4">
              <h3 className="text-sm font-medium text-primary mb-3">Filters</h3>
              <CorrelationFilters
                selectedRegions={selectedRegions}
                selectedIncomeLevels={selectedIncomeLevels}
                onRegionChange={setSelectedRegions}
                onIncomeLevelChange={setSelectedIncomeLevels}
                colorMode={colorMode}
                onColorModeChange={setColorMode}
                useLogScale={useLogScale}
                onLogScaleChange={setUseLogScale}
                showRegression={showRegression}
                onRegressionChange={setShowRegression}
              />

              {selectedCountries.size > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-secondary">
                      Selected ({selectedCountries.size})
                    </span>
                    <button
                      onClick={clearSelection}
                      className="text-[10px] text-muted hover:text-primary transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(selectedCountries).map(iso3 => {
                      const country = filteredData.find(d => d.iso3 === iso3);
                      return (
                        <span
                          key={iso3}
                          className="px-2 py-0.5 text-[10px] bg-inset border border-border rounded text-primary"
                        >
                          {country?.name || iso3}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1">
            <div className="card overflow-hidden">
              {/* Chart Tabs */}
              <div className="flex border-b border-border">
                {(Object.keys(chartConfigs) as ChartTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      flex-1 px-4 py-3 text-sm font-medium transition-colors
                      ${activeTab === tab
                        ? 'text-primary border-b-2 border-primary bg-card'
                        : 'text-muted hover:text-secondary bg-inset'
                      }
                    `}
                  >
                    {chartConfigs[tab].title}
                  </button>
                ))}
              </div>

              {/* Chart Header */}
              <div className="p-4 border-b border-border-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium text-primary">{config.title}</h2>
                    <p className="text-xs text-muted">{config.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">
                      {filteredData.length} countries · {year}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="p-4">
                <div className="h-[500px]">
                  <ScatterPlot
                    data={filteredData}
                    xMetric="electricity_per_capita_kwh"
                    yMetric={config.yMetric}
                    colorMode={colorMode}
                    useLogScale={useLogScale}
                    showRegression={showRegression}
                    highlightedCountries={selectedCountries}
                    onHover={handleHover}
                    onClick={handleClick}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="px-4 pb-4">
                <ScatterPlotLegend colorMode={colorMode} />
              </div>
            </div>

            {/* Attribution */}
            <div className="mt-4 text-xs text-muted text-center">
              Electricity data: <a href="https://ember-energy.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-secondary">Ember</a> (CC BY 4.0) ·
              Socioeconomic data: <a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-secondary">World Bank</a>, <a href="https://hdr.undp.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-secondary">UNDP</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CorrelationTooltip point={hoveredPoint} position={tooltipPos} />
    </div>
  );
}
