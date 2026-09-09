#!/usr/bin/env node
/**
 * Country fact engine.
 *
 * Generates the hook that leads the personalised homepage and every
 * /country/[iso3] page, for all 214 countries, from the shipped data.
 *
 *   in   public/data/countries-yearly.json
 *   out  public/data/country-facts.json     the shipped facts
 *        scripts/fact-candidates.json       worst-first, for a human to read
 *
 * Spec: docs/country-hook-engine-spec.md. Plan: docs/country-pages-plan.md.
 *
 * The point is NOT to state a number about each country. "Norway generated 154
 * TWh" x 214 is a database with a URL scheme, and 214 pages of it is a
 * doorway-page farm. The point is that each country leads with a different KIND
 * of claim: Bhutan on running entirely off one river system, Germany on the year
 * wind passed coal, Tanzania on having France's population and a fortieth of its
 * electricity. Families exist to make that structurally true rather than
 * hoped-for.
 *
 * Two invariants worth not breaking:
 *
 * 1. Every numeral in the copy must appear in `values`. Enforced, and the script
 *    exits non-zero otherwise. This is what makes the output auditable, what
 *    lets a data refresh invalidate a claim loudly, and what would make an
 *    optional LLM rephrasing pass safe. Same guarantee question-insights.json
 *    gives the game.
 * 2. A fact that would make an informed reader from that country wince must not
 *    ship. Most of the suppression rules below exist because a prototype
 *    produced exactly such a fact. They are commented with the one they killed.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'public', 'data');

const argv = process.argv.slice(2);
const argOf = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};
const REPORT = argOf('--report');
const BASELINE = argOf('--baseline');

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

/**
 * Copy templates live here, apart from the computation, so the sentences can be
 * rewritten (or one day translated) without touching any scoring.
 */
const SOURCE_LABEL = {
  coal: 'coal',
  gas: 'gas',
  other_fossil: 'oil',
  nuclear: 'nuclear',
  hydro: 'hydro',
  wind: 'wind',
  solar: 'solar',
  bioenergy: 'bioenergy',
  // Deliberately not "geothermal": OWID publishes no geothermal column, and this
  // bucket is geothermal plus wave/tidal. See the note in transform-owid.py.
  other_renewables: 'other renewables',
};

const SOURCES = Object.keys(SOURCE_LABEL);

/**
 * Countries where "other renewables" is geothermal, and may be called that.
 *
 * OWID publishes no geothermal column, so the bucket is geothermal plus wave,
 * tidal and some non-biogenic waste - which is why the label is cautious by
 * default. It is not geothermal everywhere: Switzerland has 1.04 TWh in it and
 * no geothermal industry, and France's is the La Rance tidal barrage.
 *
 * The listed grids cover 97.6% of world other-renewables generation, so almost
 * every sentence that mentions the source gets to name it properly, and the
 * handful that cannot stay honestly vague. See data/geothermal-grids.json for
 * the reasoning and the exclusions.
 */
const GEOTHERMAL_GRIDS = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data/geothermal-grids.json'), 'utf8')).geothermal
);

/** Source name as it should read for a given country. */
const label = (source, iso3) =>
  source === 'other_renewables' && GEOTHERMAL_GRIDS.has(iso3)
    ? 'geothermal'
    : SOURCE_LABEL[source];

/**
 * Comparison blocs, and how each reads mid-sentence.
 *
 * Restricted to groupings a reader already knows. blocs.json also carries the
 * site's own coinages — Electrostates, Petrostates, The West, Global South — and
 * those are editorial: "second among Petrostates" asserts a grouping the reader
 * never agreed to, which is a bad way to open a country page. They stay a
 * filter on /explore, not a comparison set for a published claim.
 *
 * The G7 is excluded by the eight-country floor, at 7 members. That is the floor
 * doing its job rather than a special case to write around.
 */
const BLOC_PHRASE = {
  EU: 'in the EU',
  G20: 'in the G20',
  OECD: 'in the OECD',
  NATO: 'in NATO',
  ASEAN: 'in ASEAN',
  BRICS: 'among the BRICS+ countries',
};

const REGION_PHRASE = {
  world: 'in the world',
  Africa: 'in Africa',
  Asia: 'in Asia',
  Europe: 'in Europe',
  'Latin America and Caribbean': 'in Latin America and the Caribbean',
  'North America': 'in North America',
  Oceania: 'in Oceania',
};

const ORDINAL = ['', 'first', 'second', 'third', 'fourth', 'fifth'];
const ordinal = (n) => ORDINAL[n] || `${n}th`;

const round = (n, dp = 0) => Number(n.toFixed(dp));
const pctStr = (n) => `${round(n)}%`;
const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);
/** Countries whose names read as plurals take "the" and a bare apostrophe. */
const THE_NAMES = /^(United States|Netherlands|Philippines|Bahamas|Maldives|Comoros|Seychelles|Marshall Islands|Solomon Islands|Cayman Islands|Falkland Islands|Faroe Islands|Cook Islands|Turks and Caicos Islands|United Arab Emirates|Czechia|Gambia|Democratic Republic of Congo|Republic of Congo|Congo)$/;
const theName = (n) => (THE_NAMES.test(n) ? `the ${n}` : n);
const possessive = (n) => (n.endsWith('s') ? `${theName(n)}'` : `${theName(n)}'s`);
/** Sentence-initial form of a country's name. */
const subj = (r) => cap(theName(r.name));
/**
 * Millions, to one decimal below 20m. At whole millions "5.3 against 4.6" both
 * print as "5", and the sentence reads as though the engine is broken.
 */
const popM = (p) => (p / 1e6 < 20 ? round(p / 1e6, 1) : round(p / 1e6, 0));

// ---------------------------------------------------------------------------
// Quality floors (spec section 5)
// ---------------------------------------------------------------------------

/** Below this a grid is too small for shares to mean anything. */
const MIN_TWH = 0.1;
/** A source below this is rounding, not a fuel mix. */
const MIN_SOURCE_PCT = 5;
/** A ranking needs a set worth ranking in. */
const MIN_SET = 8;
/**
 * Bottom-end ranks need a much bigger set than top-end ones. "13th of 14" is
 * not a fact, and the prototype emitted exactly that for Cuba.
 */
const MIN_SET_BOTTOM = 20;
/** Facts below this are not worth a reader's attention. */
const MIN_SCORE = 0.4;
/**
 * Beyond this a country's figures are flagged `stale` rather than stated flatly.
 *
 * Not an exclusion. Ukraine's series ends in 2022 and it generates 111 TWh —
 * dropping it entirely is a worse answer than dating it, and the spec's actual
 * concern is stale claims stated in the present tense. The flag is there so the
 * page can say which year it is talking about.
 */
const MAX_DATA_AGE_YEARS = 3;

/**
 * Which end of a ranking is publishable, per metric.
 *
 * The spec's "both ends are interesting" rule is wrong for fuel shares. The
 * prototype's worst output was "Iceland is last in Europe for wind and solar" —
 * true, and grossly misleading, because Iceland runs on hydro and geothermal and
 * is one of the cleanest grids on earth. Being last for a fuel you have no need
 * of is not a finding.
 *
 * Being last for clean share or for electricity per person IS the finding, so
 * those keep both ends.
 */
const RANK_ENDS = {
  clean_pct: 'both',
  percap: 'both',
  total: 'top',
};
for (const s of SOURCES) RANK_ENDS[s] = 'top';

// ---------------------------------------------------------------------------
// Load and shape
// ---------------------------------------------------------------------------

const countries = read('countries-yearly.json');
/**
 * Income bands and the world aggregate. Both are comparison bases rather than
 * subjects: a fact here is always about electricity, and these only say what to
 * measure it against. `income_level` covers 88 countries, so the family that
 * uses it simply does not fire for the rest.
 */
const socio = read('socioeconomic.json').countries;
const worldAgg = read('owid-aggregates.json').aggregates.World;
const BUILD_YEAR = new Date().getUTCFullYear();

function latestOf(c) {
  const years = Object.keys(c.years).map(Number).sort((a, b) => b - a);
  for (const y of years) {
    const d = c.years[String(y)];
    if (d && d.total_generation_twh > 0) return { year: y, data: d };
  }
  return null;
}

/** Grams of CO2e a kilowatt-hour. Lifecycle, per the note in lib/gridMetrics. */
const intensityOf = (d) =>
  d && d.emissions && d.emissions.total_mtco2 != null && d.total_generation_twh > 0
    ? (d.emissions.total_mtco2 * 1e12) / (d.total_generation_twh * 1e9)
    : null;

/**
 * The world figure every intensity fact is measured against.
 *
 * A rank alone reads as trivia in the middle of the table - "177th lowest of
 * 200" tells a reader nothing they can use. A world average is a number they
 * can place themselves against, and it is the only anchor that works for all
 * 200 rather than just the two ends.
 */
const WORLD_INTENSITY = (() => {
  const years = Object.keys(worldAgg.years).map(Number).sort((a, b) => b - a);
  for (const y of years) {
    const g = intensityOf(worldAgg.years[String(y)]);
    if (g) return { g, year: y };
  }
  return null;
})();

/** One flat row per country at its latest usable year. */
const rows = {};
for (const [iso3, c] of Object.entries(countries)) {
  const l = latestOf(c);
  if (!l || l.data.total_generation_twh < MIN_TWH) continue;

  const g = l.data.generation;
  const r = {
    iso3,
    name: c.name,
    region: c.emberRegion && c.emberRegion !== 'Other' ? c.emberRegion : null,
    year: l.year,
    total: l.data.total_generation_twh,
    clean_pct: l.data.aggregates.clean_pct,
    fossil_pct: l.data.aggregates.fossil_pct,
    ws_pct: l.data.aggregates.wind_solar_pct,
    population: l.data.population,
  };
  for (const s of SOURCES) r[s] = (g[s] && g[s].pct) || 0;
  r.percap = r.population ? (r.total * 1e9) / r.population : null;
  // Demand, not generation: a heavy exporter generates far more than it uses,
  // and "uses more than its income peers" has to mean what it says.
  r.percapDemand =
    r.population && l.data.demand_twh > 0 ? (l.data.demand_twh * 1e9) / r.population : null;
  r.intensity = intensityOf(l.data);
  r.trade = l.data.net_imports_pct;
  r.band = (socio[iso3] && socio[iso3].income_level) || null;
  rows[iso3] = r;
}

const ALL = Object.values(rows);

/** Bloc membership, for the comparison sets the spec asks for. */
const blocsFile = read('blocs.json');
const byBloc = {};
for (const group of ['ember', 'custom']) {
  const defs = (blocsFile[group] && blocsFile[group].blocs) || {};
  for (const [id, def] of Object.entries(defs)) {
    if (!BLOC_PHRASE[id] || !def.members) continue;
    const members = def.members.map((i) => rows[i]).filter(Boolean);
    if (members.length >= MIN_SET) byBloc[id] = members;
  }
}

const byRegion = {};
for (const r of ALL) {
  if (!r.region) continue;
  (byRegion[r.region] = byRegion[r.region] || []).push(r);
}

/** rank tables: sets['world'|region][metric] -> { iso3: [rank, n] } */
function rankTable(pool, metric) {
  const vals = pool.filter((r) => r[metric] != null).sort((a, b) => b[metric] - a[metric]);
  const t = {};
  vals.forEach((r, i) => (t[r.iso3] = [i + 1, vals.length]));
  return t;
}
const RANKS = { world: {} };
const RANK_METRICS = ['clean_pct', 'percap', 'total', ...SOURCES];
for (const m of RANK_METRICS) {
  RANKS.world[m] = rankTable(ALL, m);
  for (const [set, pool] of [...Object.entries(byRegion), ...Object.entries(byBloc)]) {
    RANKS[set] = RANKS[set] || {};
    RANKS[set][m] = rankTable(pool, m);
  }
}

/** Which comparison sets a country belongs to, widest first. */
function setsFor(r) {
  const sets = [['world', ALL]];
  if (r.region && byRegion[r.region]) sets.push([r.region, byRegion[r.region]]);
  for (const [id, pool] of Object.entries(byBloc)) {
    if (pool.some((p) => p.iso3 === r.iso3)) sets.push([id, pool]);
  }
  return sets;
}

// ---------------------------------------------------------------------------
// Fact construction
// ---------------------------------------------------------------------------

let factSeq = 0;
function fact({ iso3, family, score, headline, detail, metric, year, comparisonSet, values }) {
  return {
    id: `${family}-${metric}-${iso3}-${comparisonSet}-${factSeq++}`,
    iso3,
    family,
    score: Math.max(0, Math.min(1, score)),
    headline,
    detail: detail || null,
    metric,
    year,
    comparisonSet,
    values,
    source: 'generated',
  };
}

const families = {};

// --- rank ------------------------------------------------------------------
families.rank = (r) => {
  const out = [];
  for (const [setName] of setsFor(r)) {
    for (const metric of RANK_METRICS) {
      if (r[metric] == null) continue;
      if (SOURCES.includes(metric) && r[metric] < MIN_SOURCE_PCT) continue;

      const t = RANKS[setName][metric];
      if (!t || !t[r.iso3]) continue;
      const [rank, n] = t[r.iso3];
      if (n < MIN_SET) continue;

      const fromTop = rank <= 3;
      const fromBottom = rank > n - 3;
      const ends = RANK_ENDS[metric];
      if (fromTop && ends === 'bottom') continue;
      if (fromBottom && ends === 'top') continue;
      if (!fromTop && !fromBottom) continue;
      if (fromBottom && n < MIN_SET_BOTTOM) continue;
      // A bottom rank in a set the country also tops is a contradiction, not a
      // rank; leave it to that family.
      if (fromBottom && metric === 'clean_pct' && r.clean_pct > 50) continue;

      const extremity = 1 - (Math.min(rank, n - rank + 1) - 1) / (n / 2);
      const score = extremity * Math.min(1, Math.log10(n) / 2.5);
      const where = REGION_PHRASE[setName] || BLOC_PHRASE[setName] || `in ${setName}`;

      const subject = subj(r);
      let headline, detail, values;
      if (metric === 'percap') {
        const kwh = Math.round(r.percap);
        values = { rank, of: n, kwh_per_person: kwh };
        // Phrased to avoid printing arithmetic on the rank. An earlier version
        // said "all but ${rank - 1}", and the values check rejected it: the
        // printed number existed nowhere in the data behind the sentence.
        if (rank === 1) {
          headline = `${subject} uses more electricity per person than any country ${where}.`;
        } else if (rank === n) {
          headline = `${subject} uses less electricity per person than any other country ${where}.`;
        } else if (fromTop) {
          headline = `${subject} is ${ordinal(rank)} ${where} for electricity used per person.`;
        } else {
          headline = `${subject} is close to the bottom ${where} for electricity used per person.`;
        }
        detail = `${kwh.toLocaleString('en-GB')} kWh per person per year, ${ordinal(rank)} of ${n}.`;
      } else if (metric === 'clean_pct') {
        values = { rank, of: n, clean_pct: round(r.clean_pct) };
        headline = fromTop
          ? `${subject} runs one of the cleanest grids ${where}.`
          : `${subject} runs one of the most fossil-dependent grids ${where}.`;
        detail = `${pctStr(r.clean_pct)} of its electricity is low-carbon, ${ordinal(rank)} of ${n}.`;
      } else if (metric === 'total') {
        values = { rank, of: n, twh: round(r.total) };
        headline = `${subject} is ${ordinal(rank)} ${where} for how much electricity it makes.`;
        detail = `${round(r.total).toLocaleString('en-GB')} TWh a year.`;
      } else {
        values = { rank, of: n, share_pct: round(r[metric]) };
        headline = `${subject} is ${ordinal(rank)} ${where} for ${label(metric, r.iso3)}.`;
        detail = `${cap(label(metric, r.iso3))} supplies ${pctStr(r[metric])} of its electricity.`;
      }
      out.push(fact({ iso3: r.iso3, family: 'rank', score, headline, detail,
        metric, year: r.year, comparisonSet: setName, values }));
    }
  }
  return out;
};

// --- concentration ---------------------------------------------------------
const hhiOf = (r) => SOURCES.reduce((s, k) => s + Math.pow(r[k] / 100, 2), 0);
const HHIS = Object.fromEntries(ALL.map((r) => [r.iso3, hhiOf(r)]));
const HHI_MEDIAN = (() => {
  const v = Object.values(HHIS).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
})();

families.concentration = (r) => {
  const hhi = HHIS[r.iso3];
  const dom = SOURCES.reduce((a, b) => (r[a] > r[b] ? a : b));
  const score = Math.min(1, Math.abs(hhi - HHI_MEDIAN) / 0.45);
  if (hhi > HHI_MEDIAN && r[dom] >= 50) {
    return [fact({ iso3: r.iso3, family: 'concentration', score, metric: dom, year: r.year,
      comparisonSet: 'self',
      headline: `${subj(r)} runs almost entirely on ${label(dom, r.iso3)}.`,
      detail: `${pctStr(r[dom])} of its electricity comes from one source.`,
      values: { share_pct: round(r[dom]) } })];
  }
  const biggest = Math.max(...SOURCES.map((s) => r[s]));
  if (hhi < HHI_MEDIAN && biggest < 40) {
    return [fact({ iso3: r.iso3, family: 'concentration', score, metric: 'mix', year: r.year,
      comparisonSet: 'self',
      headline: `${subj(r)} has no dominant fuel at all.`,
      detail: `Its largest single source supplies just ${pctStr(biggest)} of the grid.`,
      values: { largest_share_pct: round(biggest) } })];
  }
  return [];
};

// --- trajectory ------------------------------------------------------------
families.trajectory = (r) => {
  const c = countries[r.iso3];
  for (const win of [5, 10, 20]) {
    const y0 = String(r.year - win);
    const a = c.years[y0], b = c.years[String(r.year)];
    if (!a || !b) continue;
    const from = a.aggregates.clean_pct, to = b.aggregates.clean_pct;
    const change = to - from;
    if (Math.abs(change) < 10) continue;
    const crossed = [10, 25, 50, 75].some((t) => (from < t && to >= t) || (to < t && from >= t));
    const score = Math.min(1, Math.abs(change) / 40 + (crossed ? 0.15 : 0));
    const rising = change > 0;
    return [fact({ iso3: r.iso3, family: 'trajectory', score, metric: 'clean_pct',
      year: r.year, comparisonSet: `${win}y`,
      headline: rising
        ? `${subj(r)} has cleaned up its grid faster than most people realise.`
        : `${possessive(r.name)} grid has been getting dirtier, not cleaner.`,
      detail: `Low-carbon electricity went from ${pctStr(from)} to ${pctStr(to)} in ${win} years.`,
      values: { from_pct: round(from), to_pct: round(to), years: win } })];
  }
  return [];
};

// --- crossover -------------------------------------------------------------
families.crossover = (r) => {
  const c = countries[r.iso3];
  const years = Object.keys(c.years).map(Number).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < SOURCES.length; i++) {
    for (let j = i + 1; j < SOURCES.length; j++) {
      const A = SOURCES[i], B = SOURCES[j];
      for (let k = years.length - 1; k > 0; k--) {
        const now = c.years[String(years[k])].generation;
        const prev = c.years[String(years[k - 1])].generation;
        const na = (now[A] || {}).pct || 0, nb = (now[B] || {}).pct || 0;
        const pa = (prev[A] || {}).pct || 0, pb = (prev[B] || {}).pct || 0;
        // Two small sources swapping places is noise; wind passing coal is not.
        if ((na - nb) * (pa - pb) >= 0 || Math.min(na, nb) < MIN_SOURCE_PCT) continue;
        const year = years[k];
        const [hi, lo] = na > nb ? [A, B] : [B, A];
        // The crossover must still hold today.
        //
        // Israel's oil passed gas in 2012 and gas passed it back later, while
        // oil was under the 5% floor — so the re-crossing was never detected and
        // the engine announced "oil overtook gas" beside "today oil supplies 0%
        // and gas 80%". A reversed crossover is not a fact about the present.
        if (r[hi] <= r[lo]) break;
        const recency = Math.max(0, 1 - (r.year - year) / 35);
        const score = recency * Math.min(1, (r[A] + r[B]) / 50);
        out.push(fact({ iso3: r.iso3, family: 'crossover', score, metric: `${hi}_over_${lo}`,
          year, comparisonSet: 'self',
          headline: `${cap(label(hi, r.iso3))} overtook ${label(lo, r.iso3)} on ${possessive(r.name)} grid in ${year}.`,
          detail: `Today ${label(hi, r.iso3)} supplies ${pctStr(r[hi])} and ${label(lo, r.iso3)} ${pctStr(r[lo])}.`,
          // headline opens on the fuel name, so capitalise there instead
          values: { crossover_year: year, winner_pct: round(r[hi]), loser_pct: round(r[lo]) } }));
        break;
      }
    }
  }
  return out;
};

// --- contradiction ---------------------------------------------------------
families.contradiction = (r) => {
  const t = RANKS.world.ws_pct || rankTable(ALL, 'ws_pct');
  const e = t[r.iso3];
  if (!e) return [];
  const [rank, n] = e;
  const percentile = 1 - (rank - 1) / n;
  if (percentile < 0.75 || r.fossil_pct < 45) return [];
  const score = Math.min(1, percentile * (r.fossil_pct / 100) * 1.6);
  return [fact({ iso3: r.iso3, family: 'contradiction', score, metric: 'ws_vs_fossil',
    year: r.year, comparisonSet: 'world',
    headline: `${subj(r)} is among the world's biggest wind and solar producers and still burns fossil fuels for most of its power.`,
    detail: `${pctStr(r.ws_pct)} of its electricity is wind and solar; ${pctStr(r.fossil_pct)} is still fossil. Both are true at once, and that tension is the whole story of the transition.`,
    values: { wind_solar_pct: round(r.ws_pct), fossil_pct: round(r.fossil_pct) } })];
};

// --- absence ---------------------------------------------------------------
families.absence = (r) => {
  if (!r.region) return [];
  const pool = byRegion[r.region];
  if (pool.length < MIN_SET) return [];
  const out = [];
  for (const s of SOURCES) {
    if (r[s] >= 1) continue;
    const prevalence = pool.filter((p) => p[s] > 10).length / pool.length;
    if (prevalence < 0.4) continue;
    const none = r[s] === 0;
    out.push(fact({ iso3: r.iso3, family: 'absence', score: prevalence, metric: s,
      year: r.year, comparisonSet: r.region,
      headline: none
        ? `${subj(r)} generates no ${label(s, r.iso3)} electricity at all, in a region built on it.`
        : `${subj(r)} gets next to none of its electricity from ${label(s, r.iso3)}, in a region built on it.`,
      detail: `${Math.round(prevalence * 100)}% of grids ${REGION_PHRASE[r.region] || `in ${r.region}`} draw more than a tenth of their power from ${label(s, r.iso3)}.`,
      values: { prevalence_pct: Math.round(prevalence * 100) } }));
  }
  return out;
};

// --- peer ------------------------------------------------------------------
/**
 * Same population, wildly different amounts of electricity.
 *
 * The highest-yield family, and the one that rescues the thin tail. Thin
 * countries are not micro-states — they are ordinary mid-size countries with
 * stable, unremarkable grids. Tanzania has 68 million people and produced
 * exactly one other fact. "The same population as France and a fortieth of the
 * electricity" needs no ranking to land, and it is the site's own argument.
 */
const PEER_POOL = ALL.filter((r) => r.population && r.population > 1e6 && r.percap);

families.peer = (r) => {
  if (!PEER_POOL.includes(r)) return [];
  const peers = PEER_POOL.filter(
    (p) => p.iso3 !== r.iso3 && Math.abs(p.population - r.population) / r.population <= 0.15
  );
  if (!peers.length) return [];

  const ratioOf = (p) => Math.max(p.percap / r.percap, r.percap / p.percap);
  const maxRatio = Math.max(...peers.map(ratioOf));
  if (maxRatio < 2) return [];
  // Among peers that make nearly as sharp a point, prefer the one a reader is
  // likelier to have heard of. Total output is a decent proxy, and it is the
  // difference between "the same population as France" and "as Chad".
  const contenders = peers.filter((p) => ratioOf(p) >= maxRatio * 0.8);
  const peer = contenders.reduce((a, b) => (a.total > b.total ? a : b));

  const ratio = ratioOf(peer);
  // Only the country with less electricity gets this fact.
  //
  // Ireland-and-CAR and CAR-and-Ireland are one fact seen from two sides, and
  // only one side is worth reading. Stated from below it is about scarcity,
  // which is the site's whole argument; stated from above it is a boast, and it
  // led Ireland's page with "215 times more electricity than Central African
  // Republic" while demoting the actual hook.
  if (r.percap >= peer.percap) return [];
  // Log-scaled. Twice the electricity is mildly interesting; sixty times is
  // astonishing, and a linear score treated those as far more alike than they
  // are. With the family floor this keeps only gaps of roughly 5x and up.
  const score = Math.min(1, Math.log10(ratio) / Math.log10(50));
  const mine = popM(r.population), theirs = popM(peer.population);
  return [fact({ iso3: r.iso3, family: 'peer', score, metric: 'percap_vs_peer',
    year: r.year, comparisonSet: peer.iso3,
    headline: `${subj(r)} has about as many people as ${theName(peer.name)}, and ${round(ratio)} times less electricity to share between them.`,
    detail: `${mine} million people against ${theirs} million, but ${Math.round(r.percap).toLocaleString('en-GB')} kWh per person a year against ${Math.round(peer.percap).toLocaleString('en-GB')}.`,
    values: {
      ratio: round(ratio),
      population_m: mine,
      peer_population_m: theirs,
      kwh_per_person: Math.round(r.percap),
      peer_kwh_per_person: Math.round(peer.percap),
    } })];
};

// ---------------------------------------------------------------------------
// The values guarantee
// ---------------------------------------------------------------------------

/**
 * Every number printed in the copy must be present in `values`.
 *
 * Without this the copy is unauditable, a refresh cannot tell you a claim went
 * stale, and no rephrasing step could ever be trusted. Comparison is by printed
 * precision, so a value of 38.04 satisfies a printed "38".
 */
function checkValues(f) {
  const text = `${f.headline} ${f.detail || ''}`;
  // A digit preceded by a letter belongs to a name, not to a statistic — "the
  // G20", "CO2". Digits are excluded from the lookbehind too, or the scan simply
  // resumes one character along and pulls the "0" out of "G20".
  const literals = text.replace(/,/g, '').match(/(?<![A-Za-z0-9])\d+(?:\.\d+)?/g) || [];
  const vals = Object.values(f.values).filter((v) => typeof v === 'number');
  const bad = [];
  for (const lit of literals) {
    const dp = lit.includes('.') ? lit.split('.')[1].length : 0;
    const n = Number(lit);
    if (!vals.some((v) => Number(v.toFixed(dp)) === n)) bad.push(lit);
  }
  return bad;
}

// --- trade -----------------------------------------------------------------
/**
 * Where a grid's power comes from when it does not come from its own stations.
 *
 * `net_imports_pct` was on every country-year and read by nothing in here, which
 * is a large part of why 66 pages had an empty "Also true of": a small grid that
 * runs on one fuel has no crossover, no absence and no trajectory, but it very
 * often has a striking trade balance. Paraguay's whole story is that it exports.
 *
 * The floor is 8% of demand. Below that the flow is real but not a fact about
 * the country - every interconnected grid trades a little in both directions.
 */
const MIN_TRADE_PCT = 8;

families.trade = (r) => {
  if (r.trade == null || Math.abs(r.trade) < MIN_TRADE_PCT) return [];
  const pct = Math.abs(r.trade);
  const importing = r.trade > 0;
  // Saturates around half of demand: past that it is simply "most of it".
  const score = Math.min(1, pct / 50);
  return [
    fact({
      iso3: r.iso3,
      family: 'trade',
      score,
      metric: 'trade',
      year: r.year,
      comparisonSet: 'world',
      headline: importing
        ? `${subj(r)} brings in ${pctStr(pct)} of the electricity it uses.`
        : `${subj(r)} sends abroad the equivalent of ${pctStr(pct)} of what it uses.`,
      detail: importing
        ? `Its own power stations cover the rest.`
        : `A net exporter, on the year's balance.`,
      values: { net_imports_pct: round(pct) },
    }),
  ];
};

// --- intensity -------------------------------------------------------------
/**
 * How much carbon a kilowatt-hour carries, against the world.
 *
 * The only family here that fires for every country, which is deliberate: it is
 * what keeps a page from having nothing to say. Emissions were the other field
 * on every country-year that nothing in this file read.
 *
 * Lifecycle CO2e, not stack CO2 - the copy says CO2e for the reason
 * lib/gridMetrics and /methodology both spell out, that a gas-only grid can
 * carry a higher figure than a coal one.
 *
 * Within 12% of the world figure the honest sentence is "about the same", and
 * saying so is better than dressing a middling number as a finding.
 */
families.intensity = (r) => {
  if (r.intensity == null || !WORLD_INTENSITY) return [];
  const w = WORLD_INTENSITY.g;
  const pct = (r.intensity / w - 1) * 100;
  const level = Math.abs(pct);
  /*
   * The base has to clear MIN_SCORE after normalisation, or the family fails at
   * exactly the countries it exists for: Mexico at 3% above the world figure and
   * Bolivia at 5% both scored under the floor and were dropped, leaving two of
   * the emptiest pages empty. "About the same as the world" is the least
   * interesting version of this fact, not an unpublishable one.
   */
  const score = Math.min(1, 0.5 + level / 150);

  let headline;
  if (level < 12) headline = `${possessive(r.name)} electricity is about as carbon-heavy as the world's.`;
  else if (pct < 0) headline = `${possessive(r.name)} electricity is cleaner than the world average.`;
  else headline = `${possessive(r.name)} electricity is dirtier than the world average.`;

  const detail =
    level < 12
      ? `${round(r.intensity)} grams of CO2e a kilowatt-hour, against a world figure of ${round(w)}.`
      : `${round(r.intensity)} grams of CO2e a kilowatt-hour against a world figure of ${round(w)} — ${pctStr(level)} ${pct < 0 ? 'below' : 'above'}.`;

  return [
    fact({ iso3: r.iso3, family: 'intensity', score, metric: 'intensity',
      year: r.year, comparisonSet: 'world', headline, detail,
      values: { g_per_kwh: round(r.intensity), world_g_per_kwh: round(w), diff_pct: round(level) } }),
  ];
};

// --- intensity trend -------------------------------------------------------
/**
 * The same measure over a decade, which is a different claim from where a
 * country sits today: a grid can be dirty and improving, or clean and slipping.
 *
 * Deliberately asymmetric. Getting dirtier is rarer and more surprising, so it
 * publishes at 10%; cleaning up is the general direction of travel and has to
 * clear 25% to be worth a card. Grids starting under 40g are excluded - a hydro
 * country going from 10g to 20g doubles its intensity and means nothing.
 */
families.intensityTrend = (r) => {
  const c = countries[r.iso3];
  const y0 = String(r.year - 10);
  const a = c.years[y0];
  const b = c.years[String(r.year)];
  if (!a || !b) return [];
  const from = intensityOf(a);
  const to = intensityOf(b);
  if (from == null || to == null || from < 40) return [];

  const pct = (to / from - 1) * 100;
  const dirtier = pct >= 10;
  const cleaner = pct <= -25;
  if (!dirtier && !cleaner) return [];

  const score = Math.min(1, Math.abs(pct) / 60);
  return [
    fact({ iso3: r.iso3, family: 'intensityTrend', score, metric: 'intensity_trend',
      year: r.year, comparisonSet: '10y',
      headline: dirtier
        ? `${possessive(r.name)} grid has been getting more carbon-heavy, not less.`
        : `${subj(r)} has taken the carbon out of its electricity fast.`,
      detail: `${round(from)} grams of CO2e a kilowatt-hour in ${r.year - 10}, ${round(to)} in ${r.year}.`,
      values: { from_g: round(from), to_g: round(to), from_year: r.year - 10, to_year: r.year } }),
  ];
};

// --- peer by income --------------------------------------------------------
/**
 * Electricity per person against countries at the same income level.
 *
 * The subject is still electricity; income only supplies a fairer comparison
 * group than region does. Vietnam next to Bangladesh says more than Vietnam
 * next to Japan.
 *
 * The set is named rather than implied. The World Bank classifies roughly fifty
 * lower-middle-income countries and this file holds eighteen, so "the typical
 * lower-middle-income country" would be a claim about a population we do not
 * have. The copy says how many are actually being compared.
 *
 * Shares the `percap` metric with the rank family on purpose: the selection step
 * bars two facts on one metric, and "third in the world per person" beside "more
 * than its income peers" is one fact told twice.
 */
const BAND_LABEL = {
  high: 'high-income',
  'upper-middle': 'upper-middle-income',
  'lower-middle': 'lower-middle-income',
  low: 'low-income',
};

const BAND_MEDIAN = (() => {
  const by = {};
  for (const r of ALL) if (r.band && r.percapDemand) (by[r.band] = by[r.band] || []).push(r.percapDemand);
  const out = {};
  for (const [band, list] of Object.entries(by)) {
    const sorted = list.sort((a, b) => a - b);
    out[band] = { median: sorted[Math.floor(sorted.length / 2)], n: sorted.length };
  }
  return out;
})();

families.peerIncome = (r) => {
  if (!r.band || !r.percapDemand) return [];
  const band = BAND_MEDIAN[r.band];
  if (!band || band.n < MIN_SET) return [];
  const pct = (r.percapDemand / band.median - 1) * 100;
  if (Math.abs(pct) < 25) return [];

  const score = Math.min(1, Math.abs(pct) / 150);
  return [
    fact({ iso3: r.iso3, family: 'peerIncome', score, metric: 'percap',
      year: r.year, comparisonSet: r.band,
      headline: `${subj(r)} uses ${pct > 0 ? 'far more' : 'far less'} electricity per person than countries at its income level.`,
      detail: `${round(r.percapDemand).toLocaleString('en-GB')} kWh a year, against a median of ${round(band.median).toLocaleString('en-GB')} across the ${band.n} ${BAND_LABEL[r.band]} countries here.`,
      values: { kwh: round(r.percapDemand), median_kwh: round(band.median), peers: band.n } }),
  ];
};

// ---------------------------------------------------------------------------
// Selection (spec section 4)
// ---------------------------------------------------------------------------

/**
 * Families that read as a story rather than a statistic get first refusal on the
 * hero slot, per spec section 4.
 *
 * `peer` is deliberately NOT in here despite being the strongest family. It was,
 * briefly, and it took 137 of 198 hero slots — which would have given two thirds
 * of the site the same sentence with the nouns swapped, the exact failure this
 * engine exists to prevent. It still wins plenty of heroes on raw score.
 */
const STORY_FAMILIES = new Set(['contradiction', 'crossover']);

/**
 * Families barred from the hero slot unless a country has nothing else.
 *
 * `intensity` fires for all 200 by design - that is what stops a page having
 * nothing to say - and the same universality makes it a bad lead. Left to
 * compete it took 27 heroes, which is 27 pages opening on one sentence with the
 * numbers swapped, the failure this engine exists to prevent. Switzerland led on
 * "cleaner than the world average" while first in the world for hydro sat below
 * it.
 *
 * Not deleted from the hero pool outright: a country whose only publishable
 * fact is its carbon intensity should lead with that rather than with nothing.
 */
const SUPPORTING_ONLY = new Set(['intensity']);

/**
 * Normalise each family's scores against its own distribution across ALL
 * countries, so families are comparable before they compete for a hero slot.
 *
 * Against the 95th percentile rather than the maximum: one freak country
 * otherwise compresses an entire family into the low scores and it never wins
 * anything again.
 */
function normaliseFamilies(byFamily) {
  for (const facts of Object.values(byFamily)) {
    const sorted = facts.map((f) => f.score).sort((a, b) => a - b);
    if (!sorted.length) continue;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1];
    if (!(p95 > 0)) continue;
    for (const f of facts) f.score = Math.min(1, f.score / p95);
  }
}

function selectFrom(r, raw) {
  const kept = raw.filter((f) => f.score >= MIN_SCORE).sort((a, b) => b.score - a.score);
  if (!kept.length) return { facts: null };

  // Hero: the leader, unless a story-shaped fact is within 0.1 of it.
  // Supporting-only families step aside while anything else is available.
  const heroPool = kept.filter((f) => !SUPPORTING_ONLY.has(f.family));
  let hero = (heroPool.length ? heroPool : kept)[0];
  const challenger = (heroPool.length ? heroPool : kept).find(
    (f) => STORY_FAMILIES.has(f.family) && f.score >= hero.score - 0.1
  );
  if (challenger) hero = challenger;

  // At most two per family, and never two facts about the same measure.
  //
  // The spec says one per family, to stop three rank facts in a row. Taken
  // literally it made France thin: its interest is almost entirely rank-shaped
  // (first in the world for nuclear, first in Europe, second for output), so
  // after the hero every remaining fact was barred and the page had one line.
  // Capping the metric rather than the family is what actually prevents
  // repetition — it still blocks "third in Europe for wind" next to "third in
  // the world for wind", which is one fact told twice.
  const supporting = [];
  const perFamily = { [hero.family]: 1 };
  const usedMetrics = new Set([hero.metric]);
  for (const f of kept) {
    if (f === hero) continue;
    if (usedMetrics.has(f.metric)) continue;
    if ((perFamily[f.family] || 0) >= 2) continue;
    perFamily[f.family] = (perFamily[f.family] || 0) + 1;
    usedMetrics.add(f.metric);
    supporting.push(f);
    if (supporting.length === 4) break;
  }

  const total = 1 + supporting.length;
  const dataQuality = total >= 4 ? 'full' : total >= 2 ? 'partial' : 'thin';
  return {
    facts: {
      iso3: r.iso3,
      name: r.name,
      year: r.year,
      stale: BUILD_YEAR - r.year > MAX_DATA_AGE_YEARS,
      hero,
      supporting,
      dataQuality,
    },
    pool: kept,
  };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

// Pass 1: every family against every country.
const rawByCountry = new Map();
const byFamily = {};
for (const r of ALL) {
  const raw = [];
  for (const fn of Object.values(families)) {
    for (const f of fn(r)) {
      raw.push(f);
      (byFamily[f.family] = byFamily[f.family] || []).push(f);
    }
  }
  rawByCountry.set(r.iso3, raw);
}

// Pass 2: the values guarantee, before anything is selected or discarded.
const allErrors = [];
for (const raw of rawByCountry.values()) {
  for (const f of raw) {
    const bad = checkValues(f);
    if (bad.length) allErrors.push({ id: f.id, bad, headline: f.headline });
  }
}

// Pass 3: make families comparable, then choose.
normaliseFamilies(byFamily);

const out = {};
const candidates = [];
let skipped = 0;

for (const r of ALL) {
  const { facts, pool } = selectFrom(r, rawByCountry.get(r.iso3));
  if (!facts) { skipped++; continue; }
  out[r.iso3] = facts;
  candidates.push({
    iso3: r.iso3,
    name: r.name,
    region: r.region,
    dataQuality: facts.dataQuality,
    year: facts.year,
    stale: facts.stale,
    heroScore: round(facts.hero.score, 3),
    hero: `[${facts.hero.family}] ${facts.hero.headline}`,
    heroDetail: facts.hero.detail,
    supporting: facts.supporting.map((f) => `[${f.family}] ${f.headline}`),
    runnersUp: (pool || []).filter((f) => f !== facts.hero && !facts.supporting.includes(f))
      .slice(0, 3).map((f) => `[${f.family}] ${round(f.score, 2)} ${f.headline}`),
  });
}

if (allErrors.length) {
  console.error(`\nFAIL: ${allErrors.length} fact(s) print a number absent from values:\n`);
  for (const e of allErrors.slice(0, 10)) {
    console.error(`  ${e.id}\n    unmatched: ${e.bad.join(', ')}\n    "${e.headline}"`);
  }
  process.exit(1);
}

// Worst first: the review file exists to be skimmed in one sitting, and the
// weakest copy is what needs a human most.
candidates.sort((a, b) => a.heroScore - b.heroScore);

const q = { full: 0, partial: 0, thin: 0 };
const heroFam = {};
for (const c of Object.values(out)) {
  q[c.dataQuality]++;
  heroFam[c.hero.family] = (heroFam[c.hero.family] || 0) + 1;
}

// ---------------------------------------------------------------------------
// What changed since the shipped version
// ---------------------------------------------------------------------------
//
// A refresh moves facts. The same discipline the question bank already gets:
// quote what changed into the PR body so a person reads it, rather than letting
// a rewritten hook ship because the diff was 6MB of JSON.

function diffAgainst(baselineDir) {
  const file = path.join(baselineDir, 'country-facts.json');
  if (!fs.existsSync(file)) return null;
  let prev;
  try { prev = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }

  const added = [], removed = [], reframed = [], rewritten = [];
  for (const iso of Object.keys(out)) {
    if (!prev[iso]) { added.push(out[iso]); continue; }
    const a = prev[iso].hero, b = out[iso].hero;
    if (a.family !== b.family) reframed.push({ iso, name: out[iso].name, from: a, to: b });
    else if (a.headline !== b.headline) rewritten.push({ iso, name: out[iso].name, from: a, to: b });
  }
  for (const iso of Object.keys(prev)) if (!out[iso]) removed.push(prev[iso]);
  return { added, removed, reframed, rewritten };
}

function writeReport(file, d) {
  const L = [];
  L.push('### Country facts');
  L.push('');
  L.push(`${Object.keys(out).length} countries have a hook. Quality: full ${q.full} · partial ${q.partial} · thin ${q.thin}.`);
  L.push('');
  if (!d) {
    L.push('_No baseline to compare against._');
  } else if (!d.added.length && !d.removed.length && !d.reframed.length && !d.rewritten.length) {
    L.push('No hook changed.');
  } else {
    if (d.removed.length) {
      L.push(`**${d.removed.length} country now has no hook at all** — these pages lose their lead.`);
      for (const c of d.removed.slice(0, 10)) L.push(`- ~~${c.name}~~ — was: ${c.hero.headline}`);
      L.push('');
    }
    if (d.reframed.length) {
      L.push(`**${d.reframed.length} hook changed to a different kind of claim.** Worth reading — the page now leads on something else.`);
      for (const c of d.reframed.slice(0, 15)) {
        L.push(`- **${c.name}** \`${c.from.family}\` → \`${c.to.family}\``);
        L.push(`  - was: ${c.from.headline}`);
        L.push(`  - now: ${c.to.headline}`);
      }
      L.push('');
    }
    if (d.rewritten.length) {
      L.push(`**${d.rewritten.length} hook kept its shape but changed its numbers.**`);
      for (const c of d.rewritten.slice(0, 10)) L.push(`- **${c.name}** — now: ${c.to.headline}`);
      L.push('');
    }
    if (d.added.length) {
      L.push(`**${d.added.length} country gained a hook.**`);
      for (const c of d.added.slice(0, 10)) L.push(`- **${c.name}** — ${c.hero.headline}`);
      L.push('');
    }
  }
  fs.writeFileSync(file, L.join('\n') + '\n');
}

fs.writeFileSync(path.join(DATA, 'country-facts.json'), JSON.stringify(out, null, 1));

// A ~2KB index of which countries actually have a page.
//
// The client surfaces (/explore, /rankings, /compare) need to know whether to
// offer a profile link, and 14 countries deliberately have no page. Fetching the
// 330KB fact file to answer that would be absurd, and linking unconditionally
// would send readers to a 404.
fs.writeFileSync(
  path.join(DATA, 'country-pages.json'),
  JSON.stringify(Object.keys(out).sort())
);

// ISO3 -> Ember region, for the countries that have a page.
//
// ~4KB, and it exists so middleware can resolve a visitor's country to a region
// without touching the 6MB dataset - it runs on every /countries request and has
// to answer before anything else does. Regenerated here rather than hand-written
// because CLAUDE.md is emphatic that region assignment is keyed by ISO3 in the
// transform, and a second copy of that mapping would be a second thing to drift.
fs.writeFileSync(
  path.join(DATA, 'country-regions.json'),
  JSON.stringify(
    Object.fromEntries(
      Object.keys(out)
        .sort()
        .map((iso) => [iso, countries[iso].emberRegion || null])
        .filter(([, r]) => r && r !== 'Other')
    )
  )
);

// ISO3 -> name for every country in the dataset, not only the ones with a page.
//
// ~5KB. /compare builds its title on the server from ?a= and ?b=, and that route
// is dynamic, so it needs to resolve a code to a name per request. Reading the
// 6MB dataset to print two words would be absurd.
fs.writeFileSync(
  path.join(DATA, 'country-names.json'),
  JSON.stringify(
    Object.fromEntries(
      Object.entries(countries)
        .map(([iso, c]) => [iso, c.name])
        .sort(([a], [b]) => a.localeCompare(b))
    )
  )
);
fs.writeFileSync(path.join(__dirname, 'fact-candidates.json'), JSON.stringify(candidates, null, 1));


const stale = Object.values(out).filter((c) => c.stale);
console.log(`Countries with facts: ${Object.keys(out).length} of ${ALL.length} eligible (${skipped} produced nothing)`);
if (stale.length) {
  console.log(`Flagged stale (data older than ${MAX_DATA_AGE_YEARS}y, page must date them): ${stale.map((c) => `${c.iso3} ${c.year}`).join(', ')}`);
}
console.log(`Data quality: full ${q.full} · partial ${q.partial} · thin ${q.thin}`);
console.log(`Hero families: ${Object.entries(heroFam).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
if (REPORT) {
  writeReport(REPORT, BASELINE ? diffAgainst(BASELINE) : null);
  console.log(`Wrote report to ${REPORT}`);
}
console.log(`Wrote public/data/country-facts.json, country-pages.json, country-regions.json, country-names.json and scripts/fact-candidates.json`);
