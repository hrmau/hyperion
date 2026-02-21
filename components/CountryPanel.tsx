'use client';

import { useState } from 'react';
import type { Country, YearData, FossilFuelData } from '@/lib/types';
import type { BlocAggregates } from '@/lib/data';
import { getLatestYearData } from '@/lib/data';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { calculateIndependenceScoreV2, getFossilDataForYear, formatIndependenceScore, getIndependenceDescription, type IndependenceScore } from '@/lib/independence';
import { energyColors, energyLabels, energyOrder } from '@/lib/colors';
import FlagImg from './FlagImg';
import EnergyMixChart from './EnergyMixChart';

const BLOC_LABELS: Record<string, string> = {
  ALL: 'All', EU: 'EU', NATO: 'NATO', BRICS: 'BRICS+', G7: 'G7',
  G20: 'G20', OECD: 'OECD', ASEAN: 'ASEAN', THE_WEST: 'The West',
  GLOBAL_SOUTH: 'Global South', OPEC_PLUS: 'OPEC+',
  ELECTROSTATES: 'Electrostates', PETROSTATES: 'Petrostates', NUCLEAR_CLUB: 'Nuclear Club',
};

interface CountryPanelProps {
  country: Country | null;
  topCountries: Country[];
  onClose: () => void;
  onSelectCountry: (country: Country) => void;
  selectedBloc: string;
  blocAgg: BlocAggregates | null;
  blocYearData: YearData | null;
  fossilFuelData: FossilFuelData | null;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-medium text-primary">{value}</span>
    </div>
  );
}

function IndependenceScoreDisplay({ score }: { score: IndependenceScore }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const barWidth = Math.min(score.score, 100); // Max 100%

  return (
    <div className="bg-inset rounded-lg p-3 space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] text-muted uppercase tracking-wider">Energy Independence</div>
          <div className="text-xs font-medium" style={{ color: score.color }}>{score.label}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${barWidth}%`, backgroundColor: score.color }}
            />
          </div>
          <span className="text-sm font-semibold text-primary tabular-nums w-14 text-right">
            {formatIndependenceScore(score.score)}{score.missingFossilData && '*'}
          </span>
        </div>
        <div className="text-[10px] text-muted mt-1">{getIndependenceDescription(score)}</div>
        {score.missingFossilData && (
          <div className="text-[10px] text-muted mt-1.5 pt-1.5 border-t border-border-subtle">
            <span className="text-secondary">*</span> No fossil fuel import data available. Fossil fuels assumed 100% imported.
          </div>
        )}
      </div>

      {/* Collapsible Breakdown section */}
      <div className="border-t border-border-subtle">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left py-2.5 -mx-1 px-1 rounded hover:bg-card/50 transition-colors group"
        >
          <span className="text-[10px] text-muted uppercase tracking-wider group-hover:text-secondary transition-colors">
            Score Breakdown
          </span>
          <svg
            className={`w-3 h-3 text-muted group-hover:text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-1.5">
            <BreakdownRow
              label="Renewables"
              pct={score.breakdown.renewable.pct}
              contribution={score.breakdown.renewable.contribution}
              color="#22C55E"
              isIndependent
            />
            <BreakdownRow
              label="Nuclear"
              pct={score.breakdown.nuclear.pct}
              contribution={score.breakdown.nuclear.contribution}
              independence={score.breakdown.nuclear.independence}
              color="#8B5CF6"
            />
            {score.breakdown.coal.pct > 0.5 && (
              <BreakdownRow
                label="Coal"
                pct={score.breakdown.coal.pct}
                contribution={score.breakdown.coal.contribution}
                independence={score.breakdown.coal.independence}
                color="#374151"
              />
            )}
            {score.breakdown.gas.pct > 0.5 && (
              <BreakdownRow
                label="Gas"
                pct={score.breakdown.gas.pct}
                contribution={score.breakdown.gas.contribution}
                independence={score.breakdown.gas.independence}
                color="#F59E0B"
              />
            )}
            {score.breakdown.oil.pct > 0.5 && (
              <BreakdownRow
                label="Other Fossil"
                pct={score.breakdown.oil.pct}
                contribution={score.breakdown.oil.contribution}
                independence={score.breakdown.oil.independence}
                color="#D97706"
              />
            )}
            {score.breakdown.electricityImports && score.breakdown.electricityImports.pct > 0.5 && (
              <div className="flex items-center gap-2 text-[10px]">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-secondary w-16">Imports</span>
                <span className="text-muted w-10 text-right">{formatPercent(score.breakdown.electricityImports.pct)}</span>
                <span className="text-muted w-16 text-right">(via grid)</span>
                <span className="text-negative font-medium ml-auto">+0.0</span>
              </div>
            )}

            {/* Strengths and Vulnerabilities - inside expanded section */}
            {(score.strengths.length > 0 || score.vulnerabilities.length > 0) && (
              <div className="border-t border-border-subtle pt-2 mt-2 space-y-2">
                {score.strengths.length > 0 && (
                  <div>
                    <div className="text-[10px] text-positive font-medium mb-1">Strengths</div>
                    <ul className="text-[10px] text-muted space-y-0.5">
                      {score.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-positive">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {score.vulnerabilities.length > 0 && (
                  <div>
                    <div className="text-[10px] text-negative font-medium mb-1">Vulnerabilities</div>
                    <ul className="text-[10px] text-muted space-y-0.5">
                      {score.vulnerabilities.map((v, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-negative">!</span>
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  pct,
  contribution,
  independence,
  color,
  isIndependent = false,
}: {
  label: string;
  pct: number;
  contribution: number;
  independence?: number;
  color: string;
  isIndependent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-secondary w-16">{label}</span>
      <span className="text-muted w-10 text-right">{formatPercent(pct)}</span>
      {!isIndependent && independence !== undefined && (
        <span className="text-muted w-16 text-right">
          ({Math.round(independence * 100)}% dom.)
        </span>
      )}
      {isIndependent && (
        <span className="text-muted w-16 text-right">(100% dom.)</span>
      )}
      <span className="text-primary font-medium ml-auto">+{contribution.toFixed(1)}</span>
    </div>
  );
}

function CountryDetail({ country, yearData, year, fossilFuelData }: {
  country: Country; yearData: YearData; year: number; fossilFuelData: FossilFuelData | null;
}) {
  // Get fossil fuel data for this country, falling back to nearest available year
  const { data: fossilYear, actualYear } = getFossilDataForYear(
    fossilFuelData?.countries[country.iso3],
    year
  );
  const score = calculateIndependenceScoreV2(yearData, fossilYear, country.iso3);

  return (
    <div className="space-y-5">
      {score && <IndependenceScoreDisplay score={score} />}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Generation</div>
          <div className="text-sm font-medium text-primary">{formatTWh(yearData.total_generation_twh)}</div>
        </div>
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Demand</div>
          <div className="text-sm font-medium text-primary">{formatTWh(yearData.demand_twh)}</div>
        </div>
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Clean Energy</div>
          <div className="text-sm font-medium text-positive">{formatPercent(yearData.aggregates.clean_pct)}</div>
        </div>
        <div className="bg-inset rounded-lg p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Emissions</div>
          <div className="text-sm font-medium text-primary">{formatEmissions(yearData.emissions.total_mtco2)}</div>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-medium text-secondary mb-2 flex items-center gap-1.5">
          <FlagImg iso3={country.iso3} size={14} />
          <span>Energy Mix ({year})</span>
        </h3>
        <EnergyMixChart yearData={yearData} />
      </div>
      {country.blocs.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-secondary mb-1.5">Member of</h3>
          <div className="flex flex-wrap gap-1.5">
            {country.blocs.map(bloc => (
              <span key={bloc} className="px-2 py-0.5 bg-inset rounded text-[11px] text-muted">{bloc}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-1.5 hover:bg-inset rounded-md transition-colors" aria-label="Clear selection">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M15 5L5 15M5 5l10 10" /></svg>
    </button>
  );
}

function MiniEnergyBar({ yearData }: { yearData: YearData }) {
  const { generation } = yearData;
  const data = energyOrder.map(source => ({
    source,
    color: energyColors[source],
    pct: generation[source]?.pct || 0,
  })).filter(d => d.pct > 0);

  return (
    <div className="h-2 rounded-full overflow-hidden flex bg-inset">
      {data.map((d) => (
        <div
          key={d.source}
          style={{ width: `${d.pct}%`, backgroundColor: d.color }}
        />
      ))}
    </div>
  );
}

function ExpandableCountryRow({ country, index, onViewDetails, fossilFuelData, expandedIso, setExpandedIso }: {
  country: Country;
  index: number;
  onViewDetails: () => void;
  fossilFuelData: FossilFuelData | null;
  expandedIso: string | null;
  setExpandedIso: (iso: string | null) => void;
}) {
  const latest = getLatestYearData(country);
  if (!latest) return null;
  const { year, data: yd } = latest;
  const isExpanded = expandedIso === country.iso3;

  const { data: fossilYear } = getFossilDataForYear(
    fossilFuelData?.countries[country.iso3],
    year
  );
  const score = calculateIndependenceScoreV2(yd, fossilYear, country.iso3);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIso(isExpanded ? null : country.iso3);
  };

  return (
    <div className={`rounded-lg transition-colors ${isExpanded ? 'bg-inset' : ''}`}>
      <button
        onClick={toggleExpand}
        className={`w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-inset transition-colors text-left ${isExpanded ? 'hover:bg-inset/50' : ''}`}
      >
        <span className="text-[11px] text-muted w-5 text-right tabular-nums">{index + 1}</span>
        <FlagImg iso3={country.iso3} size={18} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-primary truncate">
            {country.name}
            <span className="text-muted font-normal ml-1">({year})</span>
          </div>
          <div className="text-[10px] text-muted">{formatPercent(yd.aggregates.clean_pct)} clean</div>
        </div>
        <span className="text-xs text-secondary tabular-nums">{formatTWh(yd.total_generation_twh)}</span>
        <svg
          className={`w-3.5 h-3.5 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-3">
          {/* Mini energy bar */}
          <div>
            <div className="text-[10px] text-muted mb-1">Energy Mix</div>
            <MiniEnergyBar yearData={yd} />
            <div className="flex justify-between mt-1.5 text-[10px]">
              <span className="text-muted">
                <span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ backgroundColor: '#22C55E' }} />
                Renewables {formatPercent(yd.aggregates.renewables_pct)}
              </span>
              <span className="text-muted">
                <span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ backgroundColor: '#8B5CF6' }} />
                Nuclear {formatPercent(yd.generation.nuclear?.pct || 0)}
              </span>
              <span className="text-muted">
                <span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ backgroundColor: '#374151' }} />
                Fossil {formatPercent(yd.aggregates.fossil_pct)}
              </span>
            </div>
          </div>

          {/* Key stats grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-card rounded-md py-1.5 px-2">
              <div className="text-[9px] text-muted uppercase tracking-wider">Generation</div>
              <div className="text-[11px] font-medium text-primary">{formatTWh(yd.total_generation_twh)}</div>
            </div>
            <div className="bg-card rounded-md py-1.5 px-2">
              <div className="text-[9px] text-muted uppercase tracking-wider">Demand</div>
              <div className="text-[11px] font-medium text-primary">{formatTWh(yd.demand_twh)}</div>
            </div>
            <div className="bg-card rounded-md py-1.5 px-2">
              <div className="text-[9px] text-muted uppercase tracking-wider">Emissions</div>
              <div className="text-[11px] font-medium text-primary">{formatEmissions(yd.emissions.total_mtco2)}</div>
            </div>
          </div>

          {/* Independence score mini display */}
          {score && (
            <div className="flex items-center gap-2 bg-card rounded-md py-2 px-2.5">
              <div className="flex-1">
                <div className="text-[9px] text-muted uppercase tracking-wider mb-1">Energy Independence</div>
                <div className="h-1.5 bg-inset rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(score.score, 100)}%`, backgroundColor: score.color }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-primary tabular-nums">
                  {formatIndependenceScore(score.score)}{score.missingFossilData && '*'}
                </div>
                <div className="text-[9px]" style={{ color: score.color }}>{score.label}</div>
              </div>
            </div>
          )}

          {/* View full details button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="w-full py-1.5 text-[11px] text-secondary hover:text-primary border border-border rounded-md hover:bg-card transition-colors"
          >
            View full details →
          </button>
        </div>
      )}
    </div>
  );
}

export default function CountryPanel({
  country, topCountries, onClose, onSelectCountry,
  selectedBloc, blocAgg, blocYearData, fossilFuelData,
}: CountryPanelProps) {
  const [expandedIso, setExpandedIso] = useState<string | null>(null);

  // Single country detail - use latest available data
  if (country) {
    const latest = getLatestYearData(country);
    return (
      <div className="card h-full overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <FlagImg iso3={country.iso3} size={24} />
            <div>
              <h2 className="text-sm font-medium text-primary">{country.name}</h2>
              <p className="text-[11px] text-muted">{country.emberRegion}{latest ? ` · ${latest.year}` : ''}</p>
            </div>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        {!latest ? (
          <div className="p-4 text-xs text-muted">No data available</div>
        ) : (
          <div className="p-4">
            <CountryDetail country={country} yearData={latest.data} year={latest.year} fossilFuelData={fossilFuelData} />
          </div>
        )}
      </div>
    );
  }

  // Bloc overview when a bloc is selected
  if (selectedBloc !== 'ALL' && blocAgg && blocYearData) {
    return (
      <div className="card h-full overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
          <h2 className="text-sm font-medium text-primary">
            {BLOC_LABELS[selectedBloc] || selectedBloc} Overview
          </h2>
          <p className="text-[11px] text-muted">
            {blocAgg.country_count} countries
          </p>
        </div>
        <div className="p-4 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-inset rounded-lg p-3">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Generation</div>
              <div className="text-sm font-medium text-primary">{formatTWh(blocAgg.total_generation_twh)}</div>
            </div>
            <div className="bg-inset rounded-lg p-3">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Clean Energy</div>
              <div className="text-sm font-medium text-positive">{formatPercent(blocAgg.clean_pct)}</div>
            </div>
            <div className="bg-inset rounded-lg p-3">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Emissions</div>
              <div className="text-sm font-medium text-primary">{formatEmissions(blocAgg.total_emissions_mtco2)}</div>
            </div>
            <div className="bg-inset rounded-lg p-3">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Wind + Solar</div>
              <div className="text-sm font-medium text-primary">{formatPercent(blocAgg.wind_solar_pct)}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-secondary mb-2">Energy Mix</h3>
            <EnergyMixChart yearData={blocYearData} />
          </div>

          <div className="space-y-0.5">
            <StatRow label="Renewables" value={formatPercent(blocAgg.renewables_pct)} />
            <StatRow label="Fossil Fuels" value={formatPercent(blocAgg.fossil_pct)} />
          </div>

          <div>
            <h3 className="text-xs font-medium text-secondary mb-2">
              Top Producers
            </h3>
            <div className="space-y-0.5">
              {topCountries.slice(0, 5).map((c, i) => (
                <ExpandableCountryRow
                  key={c.iso3}
                  country={c}
                  index={i}
                  onViewDetails={() => onSelectCountry(c)}
                  fossilFuelData={fossilFuelData}
                  expandedIso={expandedIso}
                  setExpandedIso={setExpandedIso}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default — top producers ranking
  return (
    <div className="card h-full overflow-y-auto">
      <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
        <h2 className="text-sm font-medium text-primary">Top Producers</h2>
        <p className="text-[11px] text-muted">By total generation (latest data)</p>
      </div>
      <div className="p-4">
        <div className="space-y-0.5">
          {topCountries.map((c, i) => (
            <ExpandableCountryRow
              key={c.iso3}
              country={c}
              index={i}
              onViewDetails={() => onSelectCountry(c)}
              fossilFuelData={fossilFuelData}
              expandedIso={expandedIso}
              setExpandedIso={setExpandedIso}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
