#!/usr/bin/env node
/**
 * Build the Higher/Lower question bank.
 *
 * Input:  public/data/countries-yearly.json
 *         public/data/socioeconomic.json
 *         public/data/fossil-fuel-independence.json
 *         scripts/question-insights.json  (hand-written editorial layer)
 *
 * Output: public/data/questions.json    (shipped bank — curated questions only)
 *         scripts/question-candidates.json (ranked candidates awaiting an insight line)
 *
 * Usage:
 *   node scripts/generate-questions.js
 *   node scripts/generate-questions.js --candidates 25   # candidates listed per metric
 *
 * Why build-time: a question and its insight line are a curated unit. Random
 * runtime pairs from 214 countries produce rounds nobody can reason about, and
 * an insight line can only be written by a human who has looked at the numbers.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DATA = path.join(ROOT, 'public', 'data');
const INSIGHTS_PATH = path.join(__dirname, 'question-insights.json');
const OUT_QUESTIONS = path.join(PUBLIC_DATA, 'questions.json');
const OUT_CANDIDATES = path.join(__dirname, 'question-candidates.json');

// ---------------------------------------------------------------------------
// Filters (see docs/higher-lower-spec.md §4.3)
// ---------------------------------------------------------------------------

/** Below this ratio the two values are too close to be defensible given data uncertainty. */
const MIN_RATIO = 1.15;
/** Above this ratio the answer is obvious and the round carries no tension. */
const MAX_RATIO = 5.0;
/** Questions older than this stop feeling like a claim about the world today. */
const MIN_YEAR = 2018;

// ---------------------------------------------------------------------------
// Energy independence score
//
// Ported from lib/independence.ts (calculateIndependenceScoreV2). KEEP IN SYNC:
// if the scoring model changes there, mirror it here and re-run this script.
// ---------------------------------------------------------------------------

const URANIUM_INDEPENDENCE = {
  KAZ: 100, CAN: 100, NAM: 100, AUS: 100, UZB: 100, NER: 100, RUS: 100,
  CHN: 50, UKR: 50, IND: 30,
  USA: 1, ZAF: 5, BRA: 5, CZE: 5, PAK: 5,
};

function getFossilDataForYear(countryFossil, targetYear) {
  if (!countryFossil || !countryFossil.years) return null;
  if (countryFossil.years[String(targetYear)]) return countryFossil.years[String(targetYear)];
  const years = Object.keys(countryFossil.years).map(Number).sort((a, b) => b - a);
  for (const y of years) if (y <= targetYear) return countryFossil.years[String(y)];
  return years.length ? countryFossil.years[String(years[years.length - 1])] : null;
}

function independenceScore(yearData, fossilData, iso3) {
  const generation = yearData.total_generation_twh;
  const demand = yearData.demand_twh;
  const denominator = demand > 0 ? demand : generation;
  if (denominator <= 0) return null;

  const gen = yearData.generation;
  const pct = (twh) => ((twh || 0) / denominator) * 100;

  const renewablePct =
    pct(gen.hydro?.twh) + pct(gen.wind?.twh) + pct(gen.solar?.twh) + pct(gen.bioenergy?.twh);
  const nuclearPct = pct(gen.nuclear?.twh);
  const coalPct = pct(gen.coal?.twh);
  const gasPct = pct(gen.gas?.twh);
  const oilPct = pct(gen.other_fossil?.twh);

  const uraniumIndep = (URANIUM_INDEPENDENCE[iso3] ?? 0) / 100;

  // Mirrors lib/independence.ts. A null consumption means OWID does not track
  // the figure, and unknown cannot count as evidence of self-sufficiency; a
  // measured zero means they burn none of it, which genuinely is independence
  // of that fuel (and multiplies against a zero share anyway).
  const fuelIndependence = (fuel) => {
    if (!fuel) return { ratio: 0, known: false };
    const { production, consumption } = fuel;
    if (consumption == null) return { ratio: 0, known: false };
    if (consumption === 0) return { ratio: 1, known: true };
    return { ratio: Math.min((production ?? 0) / consumption, 1.0), known: true };
  };

  const coal = fuelIndependence(fossilData?.coal);
  const gas = fuelIndependence(fossilData?.gas);
  const oil = fuelIndependence(fossilData?.oil);

  let unknownShare = 0;
  if (!coal.known && coalPct > 0.5) unknownShare += coalPct;
  if (!gas.known && gasPct > 0.5) unknownShare += gasPct;
  if (!oil.known && oilPct > 0.5) unknownShare += oilPct;

  const raw =
    renewablePct +
    nuclearPct * uraniumIndep +
    coalPct * coal.ratio +
    gasPct * gas.ratio +
    oilPct * oil.ratio;

  return {
    score: Math.min(raw, 100),
    missingFossilData: !fossilData || unknownShare > 0,
  };
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/**
 * `kind` drives the surprise proxy:
 *   'absolute'   — intuition is "the bigger electricity producer wins"
 *   'total'      — intuition is "the bigger economy wins"
 *   'per_capita' — intuition is "the richer country per head wins"
 *   'share'      — intuition is "the bigger electricity producer wins"
 */
const METRICS = [
  {
    key: 'total_generation',
    label: 'Total electricity generation',
    prompt: 'Which generates more electricity in total?',
    unit: ' TWh',
    kind: 'total',
    decimals: 0,
    floor: 20,
    value: (yd) => yd.total_generation_twh,
  },
  {
    key: 'generation_per_capita',
    label: 'Electricity generation per person',
    prompt: 'Which generates more electricity per person?',
    unit: ' kWh',
    kind: 'per_capita',
    decimals: 0,
    floor: 500,
    // TWh -> kWh (x1e9) over population (millions x1e6) simplifies to x1000.
    value: (yd, ctx) => (yd.total_generation_twh * 1_000) / ctx.population_millions,
  },
  {
    key: 'solar',
    label: 'Solar generation',
    prompt: 'Which generates more solar power?',
    unit: ' TWh',
    kind: 'absolute',
    decimals: 1,
    floor: 2,
    value: (yd) => yd.generation.solar?.twh ?? 0,
  },
  {
    key: 'wind',
    label: 'Wind generation',
    prompt: 'Which generates more wind power?',
    unit: ' TWh',
    kind: 'absolute',
    decimals: 1,
    floor: 2,
    value: (yd) => yd.generation.wind?.twh ?? 0,
  },
  {
    key: 'emissions',
    label: 'Power sector emissions',
    prompt: 'Whose electricity produces more CO2?',
    unit: ' MtCO2',
    kind: 'absolute',
    decimals: 0,
    floor: 5,
    value: (yd) => yd.emissions?.total_mtco2 ?? 0,
  },
  {
    key: 'nuclear_pct',
    label: 'Nuclear share of electricity',
    prompt: 'Which gets a bigger share of its electricity from nuclear?',
    unit: '%',
    kind: 'share',
    decimals: 1,
    floor: 3,
    value: (yd) => yd.generation.nuclear?.pct ?? 0,
  },
  {
    key: 'coal_pct',
    label: 'Coal share of electricity',
    prompt: 'Which gets a bigger share of its electricity from coal?',
    unit: '%',
    kind: 'share',
    decimals: 1,
    floor: 3,
    value: (yd) => yd.generation.coal?.pct ?? 0,
  },
  {
    key: 'clean_pct',
    label: 'Clean electricity share',
    prompt: 'Which gets a bigger share of its electricity from clean sources?',
    unit: '%',
    kind: 'share',
    decimals: 1,
    floor: 5,
    value: (yd) => yd.aggregates.clean_pct ?? 0,
  },
  {
    key: 'independence',
    label: 'Energy independence score',
    prompt: 'Which is more energy independent?',
    unit: '',
    kind: 'share',
    decimals: 1,
    floor: 10,
    value: (yd, ctx) => ctx.independence?.score ?? null,
    // Never quiz on a score built from known-incomplete fossil fuel data.
    exclude: (ctx) => !ctx.independence || ctx.independence.missingFossilData,
  },
];

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function round(value, decimals) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** Stable, year-independent key for the editorial layer. Countries sorted so
 *  the key doesn't change if the pair is emitted in the other order. */
function insightKey(metricKey, isoA, isoB) {
  const [x, y] = [isoA, isoB].sort();
  return `${metricKey}-${x}-${y}`;
}

function main() {
  const argv = process.argv.slice(2);
  const perMetricCandidates = Number(
    argv[argv.indexOf('--candidates') + 1] || 20
  );

  const countries = readJSON(path.join(PUBLIC_DATA, 'countries-yearly.json'));
  const socio = readJSON(path.join(PUBLIC_DATA, 'socioeconomic.json'));
  const fossil = readJSON(path.join(PUBLIC_DATA, 'fossil-fuel-independence.json'));
  const insights = fs.existsSync(INSIGHTS_PATH) ? readJSON(INSIGHTS_PATH) : {};

  // Pool: countries with socioeconomic data. This is the curated 88-country set
  // — they all have population and GDP (needed for per-capita metrics and the
  // surprise proxy) and they are countries a player can reason about. Quizzing
  // on Niue vs Aruba is not a fair round.
  const pool = Object.keys(countries)
    .filter((iso3) => socio.countries[iso3])
    .sort();

  console.log(`Pool: ${pool.length} countries with socioeconomic data\n`);

  const candidates = [];
  let pairsConsidered = 0;

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const isoA = pool[i];
      const isoB = pool[j];
      const a = countries[isoA];
      const b = countries[isoB];

      // Common year: the most recent year for which BOTH have data. Comparing
      // Germany-2025 against Japan-2023 makes the claim indefensible.
      const yearsB = new Set(Object.keys(b.years));
      const commonYears = Object.keys(a.years)
        .filter((y) => yearsB.has(y))
        .map(Number)
        .sort((x, y) => y - x);
      if (!commonYears.length) continue;
      const year = commonYears[0];
      if (year < MIN_YEAR) continue;

      pairsConsidered++;

      const ydA = a.years[String(year)];
      const ydB = b.years[String(year)];

      const ctxA = {
        population_millions: socio.countries[isoA].population_millions,
        gdp_per_capita_ppp: socio.countries[isoA].gdp_per_capita_ppp,
        independence: independenceScore(ydA, getFossilDataForYear(fossil.countries[isoA], year), isoA),
      };
      const ctxB = {
        population_millions: socio.countries[isoB].population_millions,
        gdp_per_capita_ppp: socio.countries[isoB].gdp_per_capita_ppp,
        independence: independenceScore(ydB, getFossilDataForYear(fossil.countries[isoB], year), isoB),
      };

      for (const metric of METRICS) {
        if (metric.exclude && (metric.exclude(ctxA) || metric.exclude(ctxB))) continue;

        const rawA = metric.value(ydA, ctxA);
        const rawB = metric.value(ydB, ctxB);
        if (rawA == null || rawB == null || !isFinite(rawA) || !isFinite(rawB)) continue;

        const valA = round(rawA, metric.decimals);
        const valB = round(rawB, metric.decimals);

        const lo = Math.min(valA, valB);
        const hi = Math.max(valA, valB);

        // Noise floor — below this the difference is measurement noise, not a fact.
        if (lo < metric.floor) continue;
        // Tie after rounding: the round would be unwinnable.
        if (lo === hi) continue;

        const ratio = hi / lo;
        if (ratio < MIN_RATIO || ratio > MAX_RATIO) continue;

        const winner = valA > valB ? isoA : isoB;

        // Surprise proxy: is the winner NOT the country intuition points at?
        let intuitionWinner;
        if (metric.kind === 'total') {
          const gdpA = ctxA.gdp_per_capita_ppp * ctxA.population_millions;
          const gdpB = ctxB.gdp_per_capita_ppp * ctxB.population_millions;
          intuitionWinner = gdpA >= gdpB ? isoA : isoB;
        } else if (metric.kind === 'per_capita') {
          intuitionWinner =
            ctxA.gdp_per_capita_ppp >= ctxB.gdp_per_capita_ppp ? isoA : isoB;
        } else {
          intuitionWinner =
            ydA.total_generation_twh >= ydB.total_generation_twh ? isoA : isoB;
        }
        const surprising = winner !== intuitionWinner;

        candidates.push({
          key: insightKey(metric.key, isoA, isoB),
          id: `${metric.key}-${isoA}-${isoB}-${year}`,
          metric: metric.key,
          metricLabel: metric.label,
          prompt: metric.prompt,
          year,
          unit: metric.unit,
          a: { iso3: isoA, name: a.name, value: valA },
          b: { iso3: isoB, name: b.name, value: valB },
          winner,
          surprising,
          ratio: round(ratio, 2),
        });
      }
    }
  }

  // Surprising pairs first, then the tightest (most tense) rounds.
  candidates.sort((x, y) => {
    if (x.surprising !== y.surprising) return x.surprising ? -1 : 1;
    return x.ratio - y.ratio;
  });

  console.log(`Pairs considered: ${pairsConsidered}`);
  console.log(`Candidates passing filters: ${candidates.length}`);
  const byMetric = {};
  for (const c of candidates) {
    byMetric[c.metric] = byMetric[c.metric] || { total: 0, surprising: 0 };
    byMetric[c.metric].total++;
    if (c.surprising) byMetric[c.metric].surprising++;
  }
  console.log('\nBy metric (total / surprising):');
  for (const m of METRICS) {
    const s = byMetric[m.key] || { total: 0, surprising: 0 };
    console.log(`  ${m.key.padEnd(24)} ${String(s.total).padStart(6)} / ${s.surprising}`);
  }

  // --- Editorial merge ---------------------------------------------------
  const byKey = new Map();
  for (const c of candidates) if (!byKey.has(c.key)) byKey.set(c.key, c);

  const questions = [];
  const problems = [];
  const flipped = [];
  const dropped = [];

  for (const [key, entry] of Object.entries(insights)) {
    if (key.startsWith('_')) continue; // documentation keys
    const c = byKey.get(key);
    if (!c) {
      problems.push(`DROPPED  ${key} — no longer passes the filters (data refresh?)`);
      dropped.push(key);
      continue;
    }
    if (entry.winner !== c.winner) {
      problems.push(
        `FLIPPED  ${key} — insight assumes ${entry.winner} wins, data now says ${c.winner}. Rewrite the insight.`
      );
      flipped.push({ key, was: entry.winner, now: c.winner, insight: entry.insight });
      continue;
    }
    questions.push({
      id: c.id,
      metric: c.metric,
      metricLabel: c.metricLabel,
      prompt: c.prompt,
      year: c.year,
      unit: c.unit,
      a: c.a,
      b: c.b,
      insight: entry.insight,
      surprising: c.surprising,
    });
  }

  questions.sort((x, y) => {
    if (x.surprising !== y.surprising) return x.surprising ? -1 : 1;
    return x.id.localeCompare(y.id);
  });

  // --- Candidate list for curation --------------------------------------
  const curated = new Set(Object.keys(insights));
  const uncurated = [];
  const seenPerMetric = {};
  for (const c of candidates) {
    if (curated.has(c.key)) continue;
    seenPerMetric[c.metric] = (seenPerMetric[c.metric] || 0) + 1;
    if (seenPerMetric[c.metric] > perMetricCandidates) continue;
    uncurated.push(c);
  }

  fs.writeFileSync(OUT_CANDIDATES, JSON.stringify(uncurated, null, 2) + '\n');
  fs.writeFileSync(OUT_QUESTIONS, JSON.stringify(questions, null, 2) + '\n');

  console.log(`\nCurated questions written: ${questions.length} -> ${path.relative(ROOT, OUT_QUESTIONS)}`);
  console.log(`Candidates awaiting insight: ${uncurated.length} -> ${path.relative(ROOT, OUT_CANDIDATES)}`);

  const mix = {};
  for (const q of questions) mix[q.metric] = (mix[q.metric] || 0) + 1;
  console.log('\nShipped mix:');
  for (const m of METRICS) if (mix[m.key]) console.log(`  ${m.key.padEnd(24)} ${mix[m.key]}`);
  const surprisingCount = questions.filter((q) => q.surprising).length;
  console.log(`  ${'surprising'.padEnd(24)} ${surprisingCount}/${questions.length}`);

  if (problems.length) {
    console.log('\nEditorial problems:');
    for (const p of problems) console.log(`  ${p}`);
  }

  const reportIdx = argv.indexOf('--report');
  if (reportIdx !== -1 && argv[reportIdx + 1]) {
    const md = [];
    if (flipped.length) {
      md.push('### \u274c Insight lines now contradict the data\n');
      md.push('These questions were dropped rather than shipped. The data moved and the');
      md.push('hand-written line is now false — it needs rewriting, not just re-approving.\n');
      for (const f of flipped) {
        md.push(`- **\`${f.key}\`** — line assumes **${f.was}** wins, data now says **${f.now}**`);
        md.push(`  > ${f.insight}`);
      }
      md.push('');
    }
    if (dropped.length) {
      md.push('### Questions dropped by the filters\n');
      md.push(`${dropped.length} curated pair(s) no longer pass the ratio/floor/common-year filters.`);
      md.push('Their insight lines are still in `scripts/question-insights.json` and will come');
      md.push('back automatically if a future refresh brings the pair back into range.\n');
      for (const k of dropped) md.push(`- \`${k}\``);
      md.push('');
    }
    md.push(`### Bank size\n`);
    md.push(`**${questions.length}** curated questions shipped (${surprisingCount} surprising). Spec floor is 40.\n`);
    fs.appendFileSync(argv[reportIdx + 1], md.join('\n'));
  }

  if (questions.length < 40) {
    console.log(
      `\nWARNING: ${questions.length} curated questions. The spec floor is 40 — below that, repetition shows within one sitting.`
    );
    process.exitCode = 1;
  }
}

main();
