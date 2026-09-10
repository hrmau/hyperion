'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import {
  loadCountries,
  loadBlocs,
  loadFossilFuelData,
  getCountriesInBloc,
  getLatestYear,
  aggregateBloc,
  blocAggToYearData,
  loadCountryPages,
  countryPagePath,
} from '@/lib/data';
import type { BlocAggregates } from '@/lib/data';
import type { CountriesData, BlocsData, YearData, FossilFuelData } from '@/lib/types';
import { formatTWh, formatPercent, formatEmissions } from '@/lib/scales';
import { calculateIndependenceScoreV2, getFossilDataForYear, formatIndependenceScore } from '@/lib/independence';
import CountrySelect from '@/components/CountrySelect';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import ShareButton from '@/components/ShareButton';
import CountryProfileLink from '@/components/CountryProfileLink';
import { theName, subjectName } from '@/lib/countryNames';
import { ToastProvider } from '@/components/Toast';
import { useCompareParams } from '@/hooks/useCompareParams';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Stat } from '@/components/ds/core/Stat';
import { GorillaNote } from '@/components/ds/core/GorillaNote';
import { StackedAreaChart } from '@/components/ds/data/StackedAreaChart';
import { CompareRow, CompareLegend, type CompareEncoding } from '@/components/ds/data/CompareRow';
import { carbonIntensity } from '@/lib/gridMetrics';
import { distributionFor, rankOf, type CompareMetric } from '@/lib/compareDistribution';
import { FuelLegend } from '@/components/ds/data/FuelLegend';
import { DonutStat } from '@/components/ds/data/DonutStat';
import { MixBar } from '@/components/ds/data/MixBar';
import { fuelShares, fuelSeries } from '@/lib/fuels';
import FlagImg from '@/components/FlagImg';

const BLOC_OPTIONS: { id: string; label: string }[] = [
  { id: 'EU', label: 'EU' },
  { id: 'NATO', label: 'NATO' },
  { id: 'BRICS', label: 'BRICS+' },
  { id: 'G7', label: 'G7' },
  { id: 'G20', label: 'G20' },
  { id: 'OECD', label: 'OECD' },
  { id: 'ASEAN', label: 'ASEAN' },
  { id: 'THE_WEST', label: 'The West' },
  { id: 'GLOBAL_SOUTH', label: 'Global South' },
  { id: 'ELECTROSTATES', label: 'Electrostates' },
  { id: 'PETROSTATES', label: 'Petrostates' },
  { id: 'NUCLEAR_CLUB', label: 'Nuclear Club' },
];

type SelectionType = 'country' | 'bloc';

interface ResolvedSelection {
  label: string;
  iso3: string | null;
  yearData: YearData;
  subtitle: string;
  blocAgg?: BlocAggregates;
  actualYear: number;
}

/**
 * Get available years for a selection (country or bloc)
 */
function getAvailableYearsForSelection(
  type: SelectionType,
  id: string,
  countries: CountriesData,
  blocs: BlocsData
): number[] {
  if (type === 'country') {
    const c = countries[id];
    if (!c) return [];
    return Object.keys(c.years).map(Number).sort((a, b) => a - b);
  } else {
    // For blocs, find years where at least some members have data
    const members = getCountriesInBloc(id, countries, blocs);
    const yearsSet = new Set<number>();
    for (const m of members) {
      for (const y of Object.keys(m.years)) {
        yearsSet.add(parseInt(y));
      }
    }
    return Array.from(yearsSet).sort((a, b) => a - b);
  }
}

/**
 * Find the latest common year available for both selections
 */
function getCommonLatestYear(
  typeA: SelectionType,
  idA: string,
  typeB: SelectionType,
  idB: string,
  countries: CountriesData,
  blocs: BlocsData,
  defaultYear: number
): number {
  if (!idA || !idB) return defaultYear;

  const yearsA = getAvailableYearsForSelection(typeA, idA, countries, blocs);
  const yearsB = getAvailableYearsForSelection(typeB, idB, countries, blocs);

  if (yearsA.length === 0 || yearsB.length === 0) return defaultYear;

  // Find common years
  const setB = new Set(yearsB);
  const commonYears = yearsA.filter(y => setB.has(y));

  if (commonYears.length === 0) {
    // No common years - fall back to the minimum of their latest years
    return Math.min(yearsA[yearsA.length - 1], yearsB[yearsB.length - 1]);
  }

  return commonYears[commonYears.length - 1]; // Latest common year
}

/**
 * Find the nearest available year to the target year for a country
 */
function getNearestAvailableYear(country: { years: Record<string, YearData> }, targetYear: number): number | null {
  const availableYears = Object.keys(country.years).map(Number).sort((a, b) => a - b);
  if (availableYears.length === 0) return null;

  // First try exact match
  if (availableYears.includes(targetYear)) return targetYear;

  // Find nearest year
  let nearest = availableYears[0];
  let minDiff = Math.abs(targetYear - nearest);

  for (const y of availableYears) {
    const diff = Math.abs(targetYear - y);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = y;
    }
  }

  return nearest;
}

function resolveSelection(
  type: SelectionType,
  id: string,
  countries: CountriesData,
  blocs: BlocsData,
  year: number
): ResolvedSelection | null {
  if (type === 'country') {
    const c = countries[id];
    if (!c) return null;

    // Try requested year first, fall back to nearest available
    let actualYear = year;
    let yd = c.years[year.toString()];
    if (!yd) {
      const nearestYear = getNearestAvailableYear(c, year);
      if (!nearestYear) return null;
      actualYear = nearestYear;
      yd = c.years[nearestYear.toString()];
    }

    return {
      label: c.name,
      iso3: c.iso3,
      yearData: yd,
      subtitle: c.emberRegion,
      actualYear,
    };
  } else {
    const members = getCountriesInBloc(id, countries, blocs);
    const agg = aggregateBloc(members, year);
    if (!agg) return null;
    const blocLabel = BLOC_OPTIONS.find(b => b.id === id)?.label || id;
    return {
      label: blocLabel,
      iso3: null,
      yearData: blocAggToYearData(agg),
      subtitle: `${agg.country_count} countries`,
      blocAgg: agg,
      actualYear: year,
    };
  }
}

function SelectionDropdown({ value, onChange, countries, type, onTypeChange }: {
  value: string;
  onChange: (id: string) => void;
  countries: CountriesData;
  type: SelectionType;
  onTypeChange: (t: SelectionType) => void;
}) {
  const sortedCountries = useMemo(() => {
    return Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => onTypeChange('country')}
          className={`px-3 py-1 rounded-full text-xs transition-all ${
            type === 'country'
              ? 'bg-primary text-canvas'
              : 'bg-inset text-muted hover:text-secondary'
          }`}
        >
          Country
        </button>
        <button
          onClick={() => onTypeChange('bloc')}
          className={`px-3 py-1 rounded-full text-xs transition-all ${
            type === 'bloc'
              ? 'bg-primary text-canvas'
              : 'bg-inset text-muted hover:text-secondary'
          }`}
        >
          Bloc
        </button>
      </div>
      {type === 'country' ? (
        <CountrySelect
          countries={sortedCountries}
          value={value}
          onChange={onChange}
          placeholder="Select a country..."
        />
      ) : (
        /* Matched to CountrySelect's trigger deliberately, class for class.
           The two sit in the same slot and swap on a toggle, so any difference
           between them reads as the box resizing rather than as two controls -
           this one was `px-3 py-2` against `px-4 py-2.5` and, more to the point,
           had no `min-h-[44px]`, which is both why the card jumped and a control
           under the design system's 44px floor.

           `appearance-none` plus the same chevron for the same reason: a native
           select arrow next to a custom one looks like a bug even when nothing
           moves. */
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 pr-10 appearance-none bg-inset border border-border rounded-lg text-sm text-primary focus:outline-none focus:ring-1 focus:ring-border"
          >
            <option value="">Select a bloc...</option>
            {BLOC_OPTIONS.map(b => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Fuel-share history for one side of the comparison, ending at the year the
 * comparison is pinned to.
 *
 * Blocs are aggregated per year rather than reusing the latest-per-country
 * rollup: a chart of a bloc's transition has to be built from the same year on
 * every point or the shape is meaningless.
 */
function seriesFor(
  sel: ResolvedSelection,
  type: SelectionType,
  id: string,
  countries: CountriesData,
  blocs: BlocsData
): { years: number[]; series: ReturnType<typeof fuelSeries>['series'] } {
  if (type === 'country' && countries[id]) {
    const c = countries[id];
    const years = Object.keys(c.years)
      .map(Number)
      .sort((x, y) => x - y)
      .filter((y) => y <= sel.actualYear)
      .slice(-24);
    return fuelSeries(years, (y) => c.years[String(y)]);
  }
  if (type === 'bloc') {
    const members = getCountriesInBloc(id, countries, blocs);
    const years = Array.from({ length: 24 }, (_, i) => sel.actualYear - 23 + i);
    return fuelSeries(years, (y) => {
      const agg = aggregateBloc(members, y);
      return agg ? blocAggToYearData(agg) : undefined;
    });
  }
  return { years: [], series: fuelSeries([], () => undefined).series };
}

/**
 * The head-to-head rows, in two blocks split by unit.
 *
 * Shares and scores share one 0-100 axis; absolutes are normalised per row. The
 * two must not be mixed in a block, because a dumbbell on a shared axis is only
 * honest when every row on it means the same thing.
 */
interface RowSpec {
  key: CompareMetric;
  label: string;
  encoding: CompareEncoding;
  higherIsBetter: boolean;
  format: (v: number) => string;
  /** Decimal places `format` prints to, so the chip matches what is on screen. */
  dp?: number;
  of: (sel: ResolvedSelection) => number | null;
}

const formatIntensity = (v: number) => `${Math.round(v)} g`;

const ROWS: RowSpec[] = [
  { key: 'clean_pct', label: 'Clean electricity', encoding: 'share', higherIsBetter: true,
    format: formatPercent, of: (s) => s.yearData.aggregates?.clean_pct ?? null },
  { key: 'renewables_pct', label: 'Renewables', encoding: 'share', higherIsBetter: true,
    format: formatPercent, of: (s) => s.yearData.aggregates?.renewables_pct ?? null },
  { key: 'wind_solar_pct', label: 'Wind and solar', encoding: 'share', higherIsBetter: true,
    format: formatPercent, of: (s) => s.yearData.aggregates?.wind_solar_pct ?? null },
  { key: 'total_generation', label: 'Total generation', encoding: 'absolute', higherIsBetter: true,
    format: formatTWh, of: (s) => (s.yearData.total_generation_twh > 0 ? s.yearData.total_generation_twh : null) },
  { key: 'emissions', label: 'Power sector emissions', encoding: 'absolute', higherIsBetter: false,
    format: formatEmissions, of: (s) => s.yearData.emissions?.total_mtco2 ?? null },
  /*
   * Derived, and worth its own row: raw emissions mostly measure how big a
   * country is, while intensity measures how dirty its grid is, and for the
   * same pair the two can point in opposite directions.
   */
  { key: 'carbon_intensity', label: 'Carbon intensity', encoding: 'absolute', higherIsBetter: false,
    format: formatIntensity, dp: 0, of: (s) => carbonIntensity(s.yearData) },
];

function scoreFor(sel: ResolvedSelection, fossilFuelData: FossilFuelData | null) {
  return calculateIndependenceScoreV2(
    sel.yearData,
    sel.iso3
      ? getFossilDataForYear(fossilFuelData?.countries[sel.iso3], sel.actualYear).data
      : null,
    sel.iso3 ?? undefined
  );
}

function Side({
  sel,
  type,
  id,
  border,
  countries,
  blocs,
  fossilFuelData,
  countryPages,
}: {
  sel: ResolvedSelection;
  type: SelectionType;
  id: string;
  border?: boolean;
  countries: CountriesData;
  blocs: BlocsData;
  fossilFuelData: FossilFuelData | null;
  countryPages: Set<string> | null;
}) {
  const { years, series } = seriesFor(sel, type, id, countries, blocs);
  const shares = fuelShares(sel.yearData);
  const score = scoreFor(sel, fossilFuelData);
  const yd = sel.yearData;

  return (
    <div
      style={{
        padding: '30px var(--gutter)',
        borderRight: border ? '1px solid var(--border-default)' : undefined,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-7)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--fs-h3)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-h3)',
            }}
          >
            {sel.iso3 && (
              <FlagImg iso3={sel.iso3} size={20} className="mr-2 align-middle" />
            )}
            {sel.label}
          </h2>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              color: 'var(--text-quiet)',
              marginTop: 'var(--space-3)',
            }}
          >
            {sel.subtitle} · {sel.actualYear}
          </div>
          {sel.iso3 && countryPagePath(sel.iso3, countryPages) && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <CountryProfileLink
                iso3={sel.iso3}
                source="compare"
                href={countryPagePath(sel.iso3, countryPages)!}
                style={{ fontSize: 'var(--fs-ui)', color: 'var(--green)' }}
              >
                Full profile →
              </CountryProfileLink>
            </div>
          )}
        </div>
        <DonutStat value={yd.aggregates.clean_pct} label="Clean" size={78} thickness={11} />
      </div>

      <StackedAreaChart series={series} years={years} height={180} />
      <FuelLegend
        shares={shares.filter((s) => s.pct >= 1).map((s) => ({ fuel: s.fuel, value: formatPercent(s.pct) }))}
        style={{ marginTop: 'var(--space-5)' }}
      />

      <div
        className="gg-stat-row"
        style={{
          display: 'flex',
          gap: 'var(--space-9)',
          flexWrap: 'wrap',
          marginTop: 'var(--space-8)',
          paddingTop: 'var(--space-7)',
          borderTop: '1px solid var(--border-default)',
        }}
      >
        <Stat label="Generation" value={formatTWh(yd.total_generation_twh)} />
        <Stat
          label="Independence"
          value={score ? formatIndependenceScore(score.score) : '-'}
          note={score?.missingFossilData ? 'Incomplete fuel data' : undefined}
        />
        <Stat label="Emissions" value={formatEmissions(yd.emissions.total_mtco2)} />
      </div>
    </div>
  );
};

function ComparePageContent() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [blocs, setBlocs] = useState<BlocsData | null>(null);
  const [fossilFuelData, setFossilFuelData] = useState<FossilFuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [defaultYear, setDefaultYear] = useState(2025);
  const [countryPages, setCountryPages] = useState<Set<string> | null>(null);

  // URL-driven state
  const { params, setSelectionA, setSelectionB, yearIsExplicit } = useCompareParams(defaultYear);

  useEffect(() => {
    loadCountryPages().then(setCountryPages).catch(() => {});
    Promise.all([loadCountries(), loadBlocs(), loadFossilFuelData()])
      .then(([countriesData, blocsData, fossilData]) => {
        setCountries(countriesData);
        setBlocs(blocsData);
        setFossilFuelData(fossilData);
        setDefaultYear(getLatestYear(countriesData));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Extract state from URL params
  const typeA = params.a.type;
  const typeB = params.b.type;
  const idA = params.a.id;
  const idB = params.b.id;
  const urlYear = params.year;

  // Calculate effective year: use URL year if explicitly set, otherwise find common year for both selections
  const effectiveYear = useMemo(() => {
    if (yearIsExplicit && urlYear) return urlYear;
    if (!countries || !blocs || !idA || !idB) return defaultYear;
    return getCommonLatestYear(typeA, idA, typeB, idB, countries, blocs, defaultYear);
  }, [yearIsExplicit, urlYear, countries, blocs, typeA, idA, typeB, idB, defaultYear]);

  const year = effectiveYear;

  // Handlers that update URL
  const handleSetIdA = useCallback((id: string) => {
    setSelectionA(typeA, id);
  }, [setSelectionA, typeA]);

  const handleSetIdB = useCallback((id: string) => {
    setSelectionB(typeB, id);
  }, [setSelectionB, typeB]);

  const handleSetTypeA = useCallback((t: SelectionType) => {
    setSelectionA(t, '');
  }, [setSelectionA]);

  const handleSetTypeB = useCallback((t: SelectionType) => {
    setSelectionB(t, '');
  }, [setSelectionB]);

  const resolvedA = useMemo(() => {
    if (!countries || !blocs || !idA) return null;
    return resolveSelection(typeA, idA, countries, blocs, year);
  }, [countries, blocs, typeA, idA, year]);

  const resolvedB = useMemo(() => {
    if (!countries || !blocs || !idB) return null;
    return resolveSelection(typeB, idB, countries, blocs, year);
  }, [countries, blocs, typeB, idB, year]);

  // The title is set on the server now, from ?a= and ?b=, so there is nothing to
  // do here. Setting it again after hydration would only mean the tab briefly
  // says one thing and then another, and would still leave every non-JavaScript
  // scraper reading the generic version.

  if (loading || !countries || !blocs) {
    return (
      <div className="gg-page min-h-screen flex items-center justify-center">
        <div className="text-secondary text-sm">Loading energy data...</div>
      </div>
    );
  }

  const hasComparison = resolvedA && resolvedB;

  return (
    <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav active="compare" />

      <div style={{ padding: 'var(--band-y) var(--gutter) 0' }}>
        <Eyebrow style={{ marginBottom: 'var(--space-6)' }}>Compare · side by side</Eyebrow>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-h2)',
            lineHeight: 'var(--lh-h2)',
            maxWidth: '26ch',
            textWrap: 'pretty',
          }}
        >
          {hasComparison
            ? `${subjectName(resolvedA.label)} and ${theName(resolvedB.label)}, side by side.`
            : 'Pick two countries or blocs and see how they compare.'}
        </h1>

        <div
          className="gg-card-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-6)',
            alignItems: 'end',
            margin: 'var(--space-9) 0 var(--space-6)',
          }}
        >
          <SelectionDropdown
            value={idA}
            onChange={handleSetIdA}
            countries={countries}
            type={typeA}
            onTypeChange={handleSetTypeA}
          />
          <SelectionDropdown
            value={idB}
            onChange={handleSetIdB}
            countries={countries}
            type={typeB}
            onTypeChange={handleSetTypeB}
          />
        </div>

        {/* Sharing waits until there is something to share, and then asks.
            It used to be a small chip in a third column beside the two
            selectors, permanently present and disabled most of the time -
            which put the least interesting control on the row at the moment
            it could do nothing, and hid it at the moment it could. */}
        {hasComparison && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              flexWrap: 'wrap',
              margin: '0 0 var(--space-8)',
            }}
          >
            <ShareButton itemId={`${idA}_${idB}`} />
            <p
              style={{
                margin: 0,
                maxWidth: '46ch',
                fontSize: 'var(--fs-ui)',
                lineHeight: 'var(--lh-body)',
                color: 'var(--text-secondary)',
              }}
            >
              Send it to someone who would have guessed wrong.
            </p>
          </div>
        )}
      </div>

      {hasComparison ? (
        <>
          <div
            className="gg-compare-split"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <Side sel={resolvedA} type={typeA} id={idA} border countries={countries} blocs={blocs} fossilFuelData={fossilFuelData} countryPages={countryPages} />
            <Side sel={resolvedB} type={typeB} id={idB} countries={countries} blocs={blocs} fossilFuelData={fossilFuelData} countryPages={countryPages} />
          </div>

          <div
            style={{
              padding: 'var(--space-8) var(--gutter) var(--space-10)',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <Eyebrow style={{ marginBottom: 'var(--space-6)' }}>Head to head</Eyebrow>
            {(() => {
              const indepA = scoreFor(resolvedA, fossilFuelData);
              const indepB = scoreFor(resolvedB, fossilFuelData);

              /*
               * A bloc has no rank among countries: it contains them. So the
               * median and the ranks appear only when both sides are countries.
               * The encoding is identical either way - switching blocs to a
               * second visual language would mean two of them in one section.
               */
              const bothCountries = Boolean(resolvedA.iso3 && resolvedB.iso3);
              const commonYear = Math.min(resolvedA.actualYear, resolvedB.actualYear);

              type Built = {
                spec: RowSpec;
                va: number;
                vb: number;
                median: number | null;
                rankA?: string;
                rankB?: string;
                noteA?: string;
                noteB?: string;
                medianNote?: string;
              };

              const ordinal = (n: number) => {
                const s = ['th', 'st', 'nd', 'rd'];
                const v = n % 100;
                return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
              };

              const build = (spec: RowSpec, va: number, vb: number): Built => {
                const dist =
                  bothCountries && countries
                    ? distributionFor(spec.key, commonYear, countries, fossilFuelData)
                    : null;
                if (!dist) return { spec, va, vb, median: null };

                const ra = rankOf(va, dist, spec.higherIsBetter);
                const rb = rankOf(vb, dist, spec.higherIsBetter);
                const word = spec.higherIsBetter ? 'of' : 'cleanest of';

                /*
                 * The line that does the teaching, derived rather than written
                 * per pair - the pairs are user-chosen and unbounded. Leading a
                 * row while sitting below the world median is the case worth
                 * naming, and it happens more often than it sounds.
                 */
                const noteFor = (v: number, other: number) => {
                  const leads = spec.higherIsBetter ? v > other : v < other;
                  const better = spec.higherIsBetter ? v > dist.median : v < dist.median;
                  if (leads && !better) return 'Wins this row and is still on the wrong side of the world median.';
                  const r = rankOf(v, dist, spec.higherIsBetter).rank;
                  if (r <= Math.ceil(dist.n / 10)) return 'In the top tenth of countries reporting.';
                  if (r > dist.n - Math.ceil(dist.n / 10)) return 'In the bottom tenth of countries reporting.';
                  return undefined;
                };

                return {
                  spec, va, vb,
                  median: dist.median,
                  rankA: `${ordinal(ra.rank)} ${word} ${ra.n}`,
                  rankB: `${ordinal(rb.rank)} ${word} ${rb.n}`,
                  noteA: noteFor(va, vb),
                  noteB: noteFor(vb, va),
                  medianNote: `Half of the ${dist.n} countries reporting in ${commonYear} sit on either side of this.`,
                };
              };

              const built: Built[] = [];
              for (const spec of ROWS) {
                const va = spec.of(resolvedA);
                const vb = spec.of(resolvedB);
                // A row where either side is missing is suppressed outright.
                // Rendering it as zero would state something untrue.
                if (va == null || vb == null) continue;
                built.push(build(spec, va, vb));
              }
              if (indepA && indepB) {
                built.push(
                  build(
                    {
                      key: 'independence', label: 'Energy independence', encoding: 'share',
                      higherIsBetter: true, format: formatIndependenceScore, dp: 0, of: () => null,
                    },
                    indepA.score,
                    indepB.score
                  )
                );
              }

              /*
               * Ordered by how far apart the two are, widest first, so the row
               * worth arguing about opens the block. Sorted within a block: a
               * point gap and a ratio are not comparable quantities.
               */
              const gapOf = (r: Built) =>
                r.spec.encoding === 'share'
                  ? Math.abs(r.va - r.vb)
                  : Math.min(r.va, r.vb) > 0
                    ? Math.max(r.va, r.vb) / Math.min(r.va, r.vb)
                    : Infinity;

              const blocks = [
                { title: 'Shares and scores · 0-100', rows: built.filter((r) => r.spec.encoding === 'share') },
                { title: 'Totals · each row scaled to its own maximum', rows: built.filter((r) => r.spec.encoding === 'absolute') },
              ];

              const codeA = resolvedA.iso3 ?? resolvedA.label;
              const codeB = resolvedB.iso3 ?? resolvedB.label;

              return (
                <div style={{ maxWidth: 900 }}>
                  <CompareLegend a={resolvedA.label} b={resolvedB.label} />
                  <div style={{ display: 'grid', gap: 'var(--space-10)' }}>
                    {blocks.map(({ title, rows }) =>
                      rows.length === 0 ? null : (
                        <div key={title}>
                          <Eyebrow style={{ marginBottom: 'var(--space-3)' }}>{title}</Eyebrow>
                          {[...rows].sort((x, y) => gapOf(y) - gapOf(x)).map((r) => (
                            <CompareRow
                              key={r.spec.key}
                              label={r.spec.label}
                              encoding={r.spec.encoding}
                              higherIsBetter={r.spec.higherIsBetter}
                              format={r.spec.format}
                              dp={r.spec.dp}
                              median={r.median}
                              medianNote={r.medianNote}
                              a={{
                                code: codeA, name: resolvedA.label, value: r.va,
                                rank: r.rankA, note: r.noteA,
                                suffix: r.spec.key === 'independence' && indepA?.missingFossilData ? '*' : undefined,
                              }}
                              b={{
                                code: codeB, name: resolvedB.label, value: r.vb,
                                rank: r.rankB, note: r.noteB,
                                suffix: r.spec.key === 'independence' && indepB?.missingFossilData ? '*' : undefined,
                              }}
                            />
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: 'var(--space-8)' }}>
              <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>Mix, this year</Eyebrow>
              {/* Two unlabelled bars are a quiz, not a comparison - nothing on
                  screen said which was which, and the order is not something a
                  reader should have to infer from the columns above. */}
              <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: 900 }}>
                {/* The label goes to MixBar rather than above it. Sat here it
                    left 38px of reserved readout lane between a name and its
                    own bar, against 16px to the next one down - so each name
                    read as belonging to the bar above it. */}
                {[resolvedA, resolvedB].map((sel, i) => (
                  <MixBar
                    key={`${sel.label}-${i}`}
                    shares={fuelShares(sel.yearData)}
                    height={14}
                    caption={sel.label}
                  />
                ))}
              </div>
            </div>

            <GorillaNote lead="Check the year before you quote this.">
              {resolvedA.actualYear === resolvedB.actualYear ? (
                <>
                  Both are shown for {resolvedA.actualYear}, the most recent year they
                  both report.
                </>
              ) : (
                <>
                  These two are not the same year - {resolvedA.label} is {resolvedA.actualYear} and{' '}
                  {resolvedB.label} is {resolvedB.actualYear}. National statistics offices publish
                  at different speeds, and a comparison across years is worth less than one within
                  a year.
                </>
              )}{' '}
              An asterisk means the independence score is built on incomplete fuel data.
            </GorillaNote>
          </div>
        </>
      ) : (
        <div style={{ padding: 'var(--space-11) var(--gutter)', borderTop: '1px solid var(--border-default)' }}>
          <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 'var(--fs-lead)', maxWidth: '46ch' }}>
            Choose a country or bloc on each side. Every comparison is pinned to the most recent
            year both of them report.
          </p>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}


export default function CompareClient() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="gg-page min-h-screen flex items-center justify-center">
          <div className="text-secondary text-sm">Loading...</div>
        </div>
      }>
        <ComparePageContent />
      </Suspense>
    </ToastProvider>
  );
}

