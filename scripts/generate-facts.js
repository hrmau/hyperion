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
const BUILD_YEAR = new Date().getUTCFullYear();

function latestOf(c) {
  const years = Object.keys(c.years).map(Number).sort((a, b) => b - a);
  for (const y of years) {
    const d = c.years[String(y)];
    if (d && d.total_generation_twh > 0) return { year: y, data: d };
  }
  return null;
}

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
        headline = `${subject} is ${ordinal(rank)} ${where} for ${SOURCE_LABEL[metric]}.`;
        detail = `${cap(SOURCE_LABEL[metric])} supplies ${pctStr(r[metric])} of its electricity.`;
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
      headline: `${subj(r)} runs almost entirely on ${SOURCE_LABEL[dom]}.`,
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
          headline: `${cap(SOURCE_LABEL[hi])} overtook ${SOURCE_LABEL[lo]} on ${possessive(r.name)} grid in ${year}.`,
          detail: `Today ${SOURCE_LABEL[hi]} supplies ${pctStr(r[hi])} and ${SOURCE_LABEL[lo]} ${pctStr(r[lo])}.`,
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
        ? `${subj(r)} generates no ${SOURCE_LABEL[s]} electricity at all, in a region built on it.`
        : `${subj(r)} gets next to none of its electricity from ${SOURCE_LABEL[s]}, in a region built on it.`,
      detail: `${Math.round(prevalence * 100)}% of grids ${REGION_PHRASE[r.region] || `in ${r.region}`} draw more than a tenth of their power from ${SOURCE_LABEL[s]}.`,
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
  let hero = kept[0];
  const challenger = kept.find((f) => STORY_FAMILIES.has(f.family) && f.score >= hero.score - 0.1);
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
console.log(`Wrote public/data/country-facts.json, country-pages.json and scripts/fact-candidates.json`);
