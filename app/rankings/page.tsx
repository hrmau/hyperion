'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  loadCountries,
  loadCountryPages,
  countryPagePath,
  loadFossilFuelData,
  loadBlocs,
  getLatestYearData,
  getBlocsForCountry,
  mapPathFor,
} from '@/lib/data';
import type { CountriesData, Country, FossilFuelData, YearData, BlocsData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import {
  calculateIndependenceScoreV2,
  getFossilDataForYear,
  formatIndependenceScore,
} from '@/lib/independence';
import { fuelShares } from '@/lib/fuels';
import FlagImg from '@/components/FlagImg';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import CountryProfileLink from '@/components/CountryProfileLink';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Pill } from '@/components/ds/core/Pill';
import { Stat } from '@/components/ds/core/Stat';
import { GorillaNote } from '@/components/ds/core/GorillaNote';
import { Button } from '@/components/ds/core/Button';
import { DataTable, type DataTableColumn } from '@/components/ds/data/DataTable';
import { MixBar } from '@/components/ds/data/MixBar';
import { FuelLegend } from '@/components/ds/data/FuelLegend';
import { Sparkline } from '@/components/ds/data/Sparkline';

/** Every metric stays sortable — the Pills replace nine columns, not nine metrics. */
const MEASURES = [
  'Generation',
  'Independence',
  'Clean %',
  'Fossil %',
  'Renewables %',
  'Wind+Solar %',
  'Nuclear %',
  'CO₂e',
] as const;
type Measure = (typeof MEASURES)[number];

/** How many years of history the row sparkline shows. */
const TREND_YEARS = 12;

/** blocs.json keys are machine names; these are what a reader should see. */
const BLOC_LABELS: Record<string, string> = {
  EU: 'EU',
  NATO: 'NATO',
  BRICS: 'BRICS+',
  G7: 'G7',
  G20: 'G20',
  OECD: 'OECD',
  ASEAN: 'ASEAN',
  THE_WEST: 'The West',
  GLOBAL_SOUTH: 'Global South',
  OPEC_PLUS: 'OPEC+',
  ELECTROSTATES: 'Electrostates',
  PETROSTATES: 'Petrostates',
  NUCLEAR_CLUB: 'Nuclear Club',
};

interface RowData {
  country: Country;
  year: number;
  yearData: YearData;
  value: number;
  /** False when the independence score could not be computed at all. */
  available: boolean;
  missingFossilData: boolean;
  trend: number[];
  generation: number;
  emissions: number;
  cleanPct: number;
  independence: number;
  independenceAvailable: boolean;
}

function measureOf(measure: Measure, yd: YearData, independence: number | null): number {
  switch (measure) {
    case 'Generation':
      return yd.total_generation_twh;
    case 'Independence':
      return independence ?? 0;
    case 'Clean %':
      return yd.aggregates.clean_pct;
    case 'Fossil %':
      return yd.aggregates.fossil_pct;
    case 'Renewables %':
      return yd.aggregates.renewables_pct;
    case 'Wind+Solar %':
      return yd.aggregates.wind_solar_pct;
    case 'Nuclear %':
      return yd.generation.nuclear?.pct ?? 0;
    case 'CO₂e':
      return yd.emissions.total_mtco2;
  }
}

function formatMeasure(measure: Measure, value: number, missingFossil: boolean): string {
  switch (measure) {
    case 'Generation':
      return formatTWh(value);
    case 'CO₂e':
      return formatEmissions(value);
    case 'Independence':
      return formatIndependenceScore(value) + (missingFossil ? '*' : '');
    default:
      return formatPercent(value);
  }
}

export default function RankingsPage() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [blocsData, setBlocsData] = useState<BlocsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [measure, setMeasure] = useState<Measure>('Generation');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [countryPages, setCountryPages] = useState<Set<string> | null>(null);

  useEffect(() => {
    loadCountryPages().then(setCountryPages).catch(() => {});
    Promise.all([loadCountries(), loadFossilFuelData(), loadBlocs()])
      .then(([data, fossilData, blocs]) => {
        setCountries(data);
        setFossilFuelData(fossilData);
        setBlocsData(blocs);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const rows = useMemo<RowData[]>(() => {
    if (!countries) return [];

    return Object.values(countries)
      .map((c): RowData | null => {
        const latest = getLatestYearData(c);
        if (!latest) return null;
        const { year, data: yd } = latest;

        const scoreFor = (y: number, d: YearData) => {
          const { data: ff } = getFossilDataForYear(fossilFuelData?.countries[c.iso3], y);
          return calculateIndependenceScoreV2(d, ff, c.iso3);
        };

        const indep = scoreFor(year, yd);
        const value = measureOf(measure, yd, indep?.score ?? null);

        // Sparkline of the measure currently being ranked, so the trend always
        // explains the column beside it.
        const years = Object.keys(c.years)
          .map(Number)
          .sort((a, b) => a - b)
          .slice(-TREND_YEARS);
        const trend = years
          .map((y) => {
            const d = c.years[String(y)];
            if (!d) return null;
            return measureOf(measure, d, measure === 'Independence' ? (scoreFor(y, d)?.score ?? null) : null);
          })
          .filter((v): v is number => v != null);

        return {
          country: c,
          year,
          yearData: yd,
          value,
          available: measure !== 'Independence' || indep !== null,
          missingFossilData: indep?.missingFossilData ?? false,
          trend,
          generation: yd.total_generation_twh,
          emissions: yd.emissions.total_mtco2,
          cleanPct: yd.aggregates.clean_pct,
          independence: indep?.score ?? 0,
          independenceAvailable: indep !== null,
        };
      })
      .filter((r): r is RowData => r !== null);
  }, [countries, fossilFuelData, measure]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      // Rows with no computable score sink to the bottom rather than
      // masquerading as the most dependent grids on earth.
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.value - a.value;
    });
  }, [rows]);

  const toggle = useCallback((iso3: string) => {
    setExpanded((prev) => (prev === iso3 ? null : iso3));
  }, []);

  const columns = useMemo<DataTableColumn<RowData>[]>(
    () => [
      {
        key: 'rank',
        label: '#',
        mono: true,
        width: 56,
        render: (_r, i) => i + 1,
      },
      {
        key: 'country',
        label: 'Country',
        render: (r) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <FlagImg iso3={r.country.iso3} size={16} />
            <span>{r.country.name}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-xxs)',
                color: 'var(--text-quiet)',
              }}
            >
              {r.year}
            </span>
          </span>
        ),
      },
      {
        key: 'mix',
        label: 'Generation mix',
        mobileOptional: true,
        // Not interactive: one focus stop per row would put 200 of them between
        // the table and the controls under it, and the row already expands to a
        // full mix with a legend.
        render: (r) => <MixBar shares={fuelShares(r.yearData)} height={10} interactive={false} />,
      },
      {
        key: 'trend',
        label: `${measure} trend`,
        width: 110,
        mobileOptional: true,
        render: (r) => <Sparkline values={r.trend} />,
      },
      {
        key: 'value',
        label: measure,
        mono: true,
        align: 'right',
        width: 120,
        render: (r) =>
          r.available ? formatMeasure(measure, r.value, r.missingFossilData) : '-',
      },
    ],
    [measure]
  );

  if (loading || !countries) {
    return (
      <div className="gg-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono)',
            color: 'var(--text-quiet)',
          }}
        >
          Loading grids…
        </span>
      </div>
    );
  }

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav active="rankings" meta={`${sorted.length} countries`} />

      <main style={{ flex: 1, padding: 'var(--band-y) var(--gutter) var(--space-10)' }}>
        <Eyebrow style={{ marginBottom: 'var(--space-6)' }}>Rankings</Eyebrow>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-h2)',
            lineHeight: 'var(--lh-h2)',
            maxWidth: '24ch',
            textWrap: 'pretty',
          }}
        >
          Every grid on Earth, ordered however you like.
        </h1>

        <div
          className="gg-scroll-row"
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            margin: 'var(--space-8) 0 var(--space-9)',
          }}
        >
          {MEASURES.map((m) => (
            <Pill key={m} selected={m === measure} onClick={() => setMeasure(m)}>
              {m}
            </Pill>
          ))}
        </div>

        <DataTable
          columns={columns}
          rows={sorted}
          rowKey={(r) => r.country.iso3}
          onRowClick={(r) => toggle(r.country.iso3)}
          isExpanded={(r) => expanded === r.country.iso3}
          renderExpanded={(r) => {
            const shares = fuelShares(r.yearData);
            const blocs = blocsData ? getBlocsForCountry(r.country.iso3, blocsData) : [];
            return (
              <div
                className="gg-card-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-9)',
                  paddingTop: 'var(--space-7)',
                }}
              >
                <div>
                  <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>
                    Energy mix · {r.year}
                  </Eyebrow>
                  <MixBar shares={shares} height={16} style={{ marginBottom: 'var(--space-6)' }} />
                  <FuelLegend
                    layout="column"
                    shares={shares
                      .filter((s) => s.twh > 0)
                      .map((s) => ({ fuel: s.fuel, value: formatPercent(s.pct) }))}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 'var(--space-7)',
                    alignContent: 'start',
                  }}
                >
                  <Stat label="Generation" value={formatTWh(r.generation)} />
                  <Stat label="Demand" value={formatTWh(r.yearData.demand_twh)} />
                  <Stat label="Clean" value={formatPercent(r.cleanPct)} tone="accent" />
                  <Stat label="Emissions" value={formatEmissions(r.emissions)} />
                  <Stat
                    label="Independence"
                    value={
                      r.independenceAvailable
                        ? formatIndependenceScore(r.independence) +
                          (r.missingFossilData ? '*' : '')
                        : '-'
                    }
                    note={r.missingFossilData ? 'Incomplete fuel data' : undefined}
                  />
                </div>

                <div style={{ alignContent: 'start', display: 'grid', gap: 'var(--space-6)' }}>
                  {blocs.length > 0 && (
                    <div>
                      <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>Blocs</Eyebrow>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--fs-mono-xs)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {blocs.map((b) => BLOC_LABELS[b] ?? b).join(' · ')}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    {(() => {
                      const profile = countryPagePath(r.country.iso3, countryPages);
                      return profile ? (
                        <CountryProfileLink
                          iso3={r.country.iso3}
                          source="rankings"
                          href={profile}
                          style={{ display: 'inline-flex' }}
                        >
                          <Button as="span" variant="primary" size="sm">
                            Full profile
                          </Button>
                        </CountryProfileLink>
                      ) : null;
                    })()}
                    <Button
                      as={Link}
                      href={`/compare?a=${r.country.iso3}`}
                      variant="secondary"
                      size="sm"
                    >
                      Compare
                    </Button>
                    <Button
                      as={Link}
                      href={mapPathFor(r.country.iso3)}
                      variant="ghost"
                      size="sm"
                    >
                      See on map
                    </Button>
                  </div>
                </div>
              </div>
            );
          }}
        />

        <GorillaNote lead="The top of this table is often geology, not policy.">
          Norway, Brazil and Paraguay are clean because of where they are. Denmark and France chose
          it. That distinction matters more than the ordering does - and an asterisk means the
          independence score is built on incomplete fuel data.
        </GorillaNote>
      </main>

      <SiteFooter />
    </div>
  );
}
