import type { YearData } from './types';

/**
 * The three measures that sit under the hook on a country page, and the plain
 * English that goes with each.
 *
 * Every one of these is obvious to somebody who already knows the subject and
 * opaque to everybody else. "Carbon intensity", "net imports" and "energy
 * independence" are jargon, and a number with a jargon label attached teaches
 * nobody anything. The explanations are therefore part of the data, not a
 * tooltip: they render on the card, always, for every visitor.
 */

export interface GridMetric {
  key: 'intensity' | 'trade' | 'independence';
  label: string;
  value: string;
  unit?: string;
  /** One line about THIS country, comparative where possible. */
  verdict: string;
  /** What the measure is, for someone meeting it for the first time. */
  meaning: string;
  tone: 'default' | 'accent' | 'down';
}

/**
 * Grams of CO2-equivalent per kWh.
 *
 * Lifecycle, not stack — OWID's field counts methane and the rest of the chain,
 * which is why a gas grid can beat a coal one. See formatEmissions.
 */
export function carbonIntensity(d: YearData): number | null {
  const mt = d.emissions?.total_mtco2;
  if (mt == null || !(d.total_generation_twh > 0)) return null;
  const g = (mt * 1e12) / (d.total_generation_twh * 1e9);
  return g > 0 ? g : null;
}

export interface NetTrade {
  direction: 'imports' | 'exports' | 'balanced';
  /** Imports as a share of demand; exports as a share of what it generates. */
  pct: number;
}

/**
 * Net electricity trade, framed from whichever side the country is on.
 *
 * Exports are expressed against generation rather than demand on purpose.
 * OWID reports Bhutan's 2017 exports as -275% of demand, which is arithmetically
 * fine and means nothing to a reader; the same year is 73% of what it generated,
 * which is a sentence.
 */
export function netTrade(d: YearData): NetTrade | null {
  const pct = d.net_imports_pct;
  if (pct == null) return null;
  if (Math.abs(pct) < 1) return { direction: 'balanced', pct: 0 };
  if (pct > 0) return { direction: 'imports', pct };

  const exported = d.demand_twh != null ? d.total_generation_twh - d.demand_twh : null;
  if (exported == null || !(d.total_generation_twh > 0)) return null;
  return { direction: 'exports', pct: (exported / d.total_generation_twh) * 100 };
}

const round = (n: number) => Math.round(n);

/** "cleaner than 7 in 10 grids", from a rank within the whole set. */
function outOfTen(rank: number, of: number): number {
  return Math.round(((of - rank) / (of - 1)) * 10);
}

export function intensityMetric(
  d: YearData,
  rank: number | null,
  of: number | null
): GridMetric | null {
  const g = carbonIntensity(d);
  if (g == null) return null;

  const cleanerThan = rank != null && of != null && of > 1 ? outOfTen(rank, of) : null;
  const verdict =
    cleanerThan == null
      ? 'Grams of greenhouse gas for every unit of electricity.'
      : cleanerThan >= 9
        ? 'Among the cleanest electricity anywhere.'
        : cleanerThan <= 1
          ? 'Among the most carbon-heavy electricity anywhere.'
          : `Cleaner than ${cleanerThan} in 10 grids worldwide.`;

  return {
    key: 'intensity',
    label: 'Carbon intensity',
    value: round(g).toLocaleString('en-GB'),
    unit: 'g CO₂e per kWh',
    verdict,
    meaning:
      'How much planet-warming gas is released to make one unit of electricity. Two countries can make exactly the same amount of power and one of them can be ten times dirtier doing it. Lower is better.',
    tone: cleanerThan != null && cleanerThan >= 7 ? 'accent' : cleanerThan != null && cleanerThan <= 2 ? 'down' : 'default',
  };
}

export function tradeMetric(d: YearData, name: string): GridMetric | null {
  const t = netTrade(d);
  if (t == null) return null;

  if (t.direction === 'balanced') {
    return {
      key: 'trade',
      label: 'Electricity trade',
      value: 'Self-contained',
      verdict: `${name} makes about as much electricity as it uses.`,
      meaning:
        'Electricity can cross a border like anything else. A country that buys it in is leaning on its neighbours to keep the lights on; one that sells it is making more than it needs. This grid does neither to any real degree - often because it has no cables to anywhere else.',
      tone: 'default',
    };
  }

  if (t.direction === 'imports') {
    return {
      key: 'trade',
      label: 'Electricity imported',
      value: round(t.pct).toString(),
      unit: '% of what it uses',
      verdict:
        t.pct >= 25
          ? `${name} depends heavily on its neighbours for power.`
          : `${name} buys in more electricity than it sends out.`,
      meaning:
        'The share of the electricity people here use that was generated in another country and brought in over a cable. The higher it goes, the more this grid depends on somebody else producing power - and on staying on good terms with them.',
      tone: t.pct >= 25 ? 'down' : 'default',
    };
  }

  return {
    key: 'trade',
    label: 'Electricity exported',
    value: round(t.pct).toString(),
    unit: '% of what it makes',
    verdict: `${name} generates a surplus and sells it on.`,
    meaning:
      'The share of what this country generates that is sent abroad rather than used at home. Exporting means producing more than the country needs, which usually means abundant hydro, nuclear or wind - and it earns money from the surplus.',
    tone: 'accent',
  };
}

/**
 * Independence, stated as a fact and never as a verdict.
 *
 * The tone is always neutral, unlike the other two, and that is deliberate. A
 * high score is not a good grid: South Africa scores 98 because it mines the
 * coal it burns, while running the most carbon-heavy electricity in the set, and
 * France scores 31 because it buys the uranium behind one of the cleanest.
 * Colouring one green and the other clay would tell the reader those are a
 * success and a failure, which is the opposite of what the number says.
 *
 * The band label alone ("Critical Dependency") reads as a judgement too, so the
 * verdict states the mechanism instead, and the explanation names the tension
 * outright - otherwise France's page looks like a bug to anyone who knows what
 * France runs on.
 */
export function independenceMetric(score: number, bandLabel: string): GridMetric {
  const verdict =
    score >= 95
      ? 'Almost everything this grid runs on comes from inside the country.'
      : score >= 80
        ? 'Most of what this grid runs on is produced at home.'
        : score >= 60
          ? 'A mix of fuel produced at home and fuel bought in.'
          : score >= 40
            ? 'More of its fuel is bought in than produced at home.'
            : 'Most of the fuel behind this grid is bought from abroad.';

  return {
    key: 'independence',
    label: 'Energy independence',
    value: round(score).toString(),
    unit: `out of 100 · ${bandLabel}`,
    verdict,
    meaning:
      'How much of what this grid runs on the country can supply itself. Sun, wind and water count fully, because nobody can cut them off; coal, gas and oil only as far as the country digs them up. A high score is not the same as a good grid: mining your own coal scores well, importing uranium scores badly.',
    tone: 'default',
  };
}
