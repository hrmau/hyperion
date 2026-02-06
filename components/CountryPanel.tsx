'use client';

import type { Country, YearData, FossilFuelData } from '@/lib/types';
import type { BlocAggregates } from '@/lib/data';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { calculateIndependenceScoreV2, getFossilDataForYear, formatIndependenceScore, getIndependenceDescription, type IndependenceScore } from '@/lib/independence';
import FlagImg from './FlagImg';
import EnergyMixChart from './EnergyMixChart';

const BLOC_LABELS: Record<string, string> = {
  ALL: 'All', EU: 'EU', NATO: 'NATO', BRICS: 'BRICS+', G7: 'G7',
  G20: 'G20', OECD: 'OECD', ASEAN: 'ASEAN', THE_WEST: 'The West',
  GLOBAL_SOUTH: 'Global South', OPEC_PLUS: 'OPEC+',
};

interface CountryPanelProps {
  country: Country | null;
  year: number;
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
  const barWidth = Math.min(score.score, 100); // Max 100% for v2

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
          <span className="text-sm font-semibold text-primary tabular-nums w-12 text-right">
            {formatIndependenceScore(score.score)}
          </span>
        </div>
        <div className="text-[10px] text-muted mt-1">{getIndependenceDescription(score)}</div>
      </div>

      {/* Breakdown section */}
      <div className="border-t border-border-subtle pt-2">
        <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Score Breakdown</div>
        <div className="space-y-1.5">
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
            color="#8B5CF6"
            isIndependent
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
        </div>
      </div>

      {/* Strengths and Vulnerabilities */}
      {(score.strengths.length > 0 || score.vulnerabilities.length > 0) && (
        <div className="border-t border-border-subtle pt-2 space-y-2">
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
  const score = calculateIndependenceScoreV2(yearData, fossilYear);

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
      <div className="space-y-0.5">
        <StatRow label="Renewables" value={formatPercent(yearData.aggregates.renewables_pct)} />
        <StatRow label="Wind + Solar" value={formatPercent(yearData.aggregates.wind_solar_pct)} />
        <StatRow label="Fossil Fuels" value={formatPercent(yearData.aggregates.fossil_pct)} />
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

function CountryListItem({ country, index, year, onClick }: {
  country: Country; index: number; year: number; onClick: () => void;
}) {
  const yd = country.years[year.toString()];
  if (!yd) return null;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-inset transition-colors text-left"
    >
      <span className="text-[11px] text-muted w-5 text-right tabular-nums">{index + 1}</span>
      <FlagImg iso3={country.iso3} size={18} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-primary truncate">{country.name}</div>
        <div className="text-[10px] text-muted">{formatPercent(yd.aggregates.clean_pct)} clean</div>
      </div>
      <span className="text-xs text-secondary tabular-nums">{formatTWh(yd.total_generation_twh)}</span>
    </button>
  );
}

export default function CountryPanel({
  country, year, topCountries, onClose, onSelectCountry,
  selectedBloc, blocAgg, blocYearData, fossilFuelData,
}: CountryPanelProps) {

  // Single country detail
  if (country) {
    const yearData = country.years[year.toString()];
    return (
      <div className="card h-full overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <FlagImg iso3={country.iso3} size={24} />
            <div>
              <h2 className="text-sm font-medium text-primary">{country.name}</h2>
              <p className="text-[11px] text-muted">{country.emberRegion}</p>
            </div>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        {!yearData ? (
          <div className="p-4 text-xs text-muted">No data for {year}</div>
        ) : (
          <div className="p-4">
            <CountryDetail country={country} yearData={yearData} year={year} fossilFuelData={fossilFuelData} />
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
            {blocAgg.country_count} countries &middot; {year}
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
            <h3 className="text-xs font-medium text-secondary mb-2">Energy Mix ({year})</h3>
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
            <div className="space-y-0">
              {topCountries.slice(0, 5).map((c, i) => (
                <CountryListItem
                  key={c.iso3}
                  country={c}
                  index={i}
                  year={year}
                  onClick={() => onSelectCountry(c)}
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
        <p className="text-[11px] text-muted">By total generation, {year}</p>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {topCountries.map((c, i) => (
            <CountryListItem
              key={c.iso3}
              country={c}
              index={i}
              year={year}
              onClick={() => onSelectCountry(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
