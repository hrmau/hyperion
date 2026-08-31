#!/usr/bin/env node
/**
 * Gate + diff report for a data refresh.
 *
 * Usage:
 *   node scripts/check-data.js
 *   node scripts/check-data.js --baseline /tmp/baseline --report /tmp/report.md
 *
 * Exits non-zero when the regenerated data looks wrong. This is the last thing
 * standing between an upstream mistake and the live site, so it fails loudly
 * rather than warning: a refresh that drops half the countries should never
 * reach a reviewer as a mergeable PR.
 *
 * With --baseline (a copy of public/data from before the refresh) it also writes
 * a markdown summary of what actually changed, for the PR body.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'public', 'data');

const errors = [];
const warnings = [];
const notes = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function readJSON(dir, name) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    fail(`${name} is not valid JSON: ${err.message}`);
    return null;
  }
}

function latestYear(country) {
  const years = Object.keys(country.years || {}).map(Number);
  return years.length ? Math.max(...years) : null;
}

function main() {
  const argv = process.argv.slice(2);
  const baselineDir = argv.includes('--baseline') ? argv[argv.indexOf('--baseline') + 1] : null;
  const reportPath = argv.includes('--report') ? argv[argv.indexOf('--report') + 1] : null;

  const countries = readJSON(DATA, 'countries-yearly.json');
  const fossil = readJSON(DATA, 'fossil-fuel-independence.json');
  const socio = readJSON(DATA, 'socioeconomic.json');
  const questions = readJSON(DATA, 'questions.json');
  const facts = readJSON(DATA, 'country-facts.json');

  for (const [name, val] of Object.entries({ countries, fossil, socio, questions })) {
    if (!val) fail(`${name} is missing or unreadable`);
  }
  if (errors.length) return finish(reportPath);

  const isoCodes = Object.keys(countries);

  // --- Absolute sanity -----------------------------------------------------
  if (isoCodes.length < 200) {
    fail(`Only ${isoCodes.length} countries in countries-yearly.json (expected 200+)`);
  }

  let noYears = 0;
  let badShape = 0;
  for (const [iso, c] of Object.entries(countries)) {
    if (!c.years || Object.keys(c.years).length === 0) { noYears++; continue; }
    const ly = latestYear(c);
    const yd = c.years[String(ly)];
    if (!yd || typeof yd.total_generation_twh !== 'number' || !yd.generation || !yd.aggregates) {
      badShape++;
      if (badShape <= 3) fail(`${iso} latest year ${ly} has a malformed record`);
    }
  }
  if (noYears > 0) fail(`${noYears} countries have no year data at all`);

  // Source figures must add up to the reported total, or the choropleth and the
  // energy mix chart will disagree with each other.
  const SOURCES = ['coal','gas','nuclear','hydro','wind','solar','bioenergy','other_renewables','other_fossil'];
  let sumMismatches = 0;
  for (const [iso, c] of Object.entries(countries)) {
    const ly = latestYear(c);
    const yd = c.years?.[String(ly)];
    if (!yd || !(yd.total_generation_twh > 1)) continue;
    const sum = SOURCES.reduce((s, k) => s + (yd.generation[k]?.twh || 0), 0);
    const diffPct = Math.abs(yd.total_generation_twh - sum) / yd.total_generation_twh * 100;
    if (diffPct > 5) {
      sumMismatches++;
      if (sumMismatches <= 3) warn(`${iso} ${ly}: sources sum to ${sum.toFixed(1)} vs total ${yd.total_generation_twh} TWh (${diffPct.toFixed(1)}% off)`);
    }
  }
  if (sumMismatches > 10) fail(`${sumMismatches} countries have source sums more than 5% off their reported total`);

  // The question bank is what /play serves; below the spec floor it repeats.
  if (Array.isArray(questions) && questions.length < 40) {
    fail(`Only ${questions.length} curated questions (spec floor is 40)`);
  }
  const missingInsight = (questions || []).filter((q) => !q.insight || !q.insight.trim());
  if (missingInsight.length) {
    fail(`${missingInsight.length} questions have no insight line: ${missingInsight.slice(0,3).map(q=>q.id).join(', ')}`);
  }

  // Country facts lead the homepage and every /country page. A country with no
  // hook has no page worth publishing, so a collapse in coverage is a build
  // failure, not a note.
  if (facts) {
    const withFacts = Object.keys(facts).length;
    if (withFacts < 150) {
      fail(`Only ${withFacts} countries have a hook (floor is 150)`);
    }
    const noHero = Object.values(facts).filter((c) => !c.hero || !c.hero.headline);
    if (noHero.length) fail(`${noHero.length} countries have no hero fact`);
  }

  // --- Comparison with the previous data ----------------------------------
  const report = [];
  if (baselineDir) {
    const prevCountries = readJSON(baselineDir, 'countries-yearly.json');
    const prevFossil = readJSON(baselineDir, 'fossil-fuel-independence.json');
    const prevQuestions = readJSON(baselineDir, 'questions.json');
    const prevFacts = readJSON(baselineDir, 'country-facts.json');

    if (prevFacts && facts) {
      const lost = Object.keys(prevFacts).filter((i) => !facts[i]);
      // A country that had a hook and now has none loses the lead on its page.
      if (lost.length > 5) {
        fail(`${lost.length} countries lost their hook: ${lost.slice(0, 10).join(', ')}`);
      } else if (lost.length) {
        notes.push(`${lost.length} countries lost their hook: ${lost.join(', ')}`);
      }
    }

    if (prevCountries) {
      const prevIso = new Set(Object.keys(prevCountries));
      const dropped = [...prevIso].filter((i) => !countries[i]);
      const added = isoCodes.filter((i) => !prevIso.has(i));

      // Losing a country is never a normal refresh outcome.
      if (dropped.length) {
        fail(`${dropped.length} countries disappeared upstream: ${dropped.slice(0, 10).join(', ')}`);
      }
      if (added.length) notes.push(`${added.length} countries added: ${added.join(', ')}`);

      let advanced = 0, regressed = [];
      const yearHistogram = {};
      for (const iso of isoCodes) {
        const ly = latestYear(countries[iso]);
        yearHistogram[ly] = (yearHistogram[ly] || 0) + 1;
        const prev = prevCountries[iso] ? latestYear(prevCountries[iso]) : null;
        if (prev === null) continue;
        if (ly > prev) advanced++;
        // Data going backwards means upstream withdrew a year.
        if (ly < prev) regressed.push(`${iso} ${prev}->${ly}`);
      }
      if (regressed.length) {
        fail(`${regressed.length} countries lost their most recent year: ${regressed.slice(0, 8).join(', ')}`);
      }

      const prevHist = {};
      for (const iso of Object.keys(prevCountries)) {
        const ly = latestYear(prevCountries[iso]);
        prevHist[ly] = (prevHist[ly] || 0) + 1;
      }

      report.push(`### Coverage\n`);
      report.push(`- **${advanced}** countries gained newer data`);
      report.push(`- Countries in dataset: ${prevIso.size} → **${isoCodes.length}**`);
      report.push('');
      report.push(`| Latest year | Before | After |`);
      report.push(`|---|---|---|`);
      const allYears = [...new Set([...Object.keys(prevHist), ...Object.keys(yearHistogram)])].sort();
      for (const y of allYears) {
        report.push(`| ${y} | ${prevHist[y] || 0} | ${yearHistogram[y] || 0} |`);
      }
      report.push('');
    }

    // The independence score treats an absent country as fully import-dependent,
    // so a change to this set silently moves published scores.
    if (prevFossil && fossil) {
      const before = new Set(Object.keys(prevFossil.countries || {}));
      const after = new Set(Object.keys(fossil.countries || {}));
      const gained = [...after].filter((i) => !before.has(i));
      const lost = [...before].filter((i) => !after.has(i));
      if (gained.length || lost.length) {
        warn(
          `Fossil-fuel country set changed (${before.size} → ${after.size}). This moves independence ` +
          `scores: countries absent from that file are scored as fully import-dependent. ` +
          (gained.length ? `Gained: ${gained.slice(0,10).join(', ')}. ` : '') +
          (lost.length ? `Lost: ${lost.slice(0,10).join(', ')}.` : '')
        );
      }
    }

    if (prevQuestions && Array.isArray(questions)) {
      const prevIds = new Set(prevQuestions.map((q) => q.id));
      const nowIds = new Set(questions.map((q) => q.id));
      const goneKeys = prevQuestions.filter((q) => !nowIds.has(q.id));
      report.push(`### Question bank\n`);
      report.push(`- Curated questions: ${prevQuestions.length} → **${questions.length}**`);
      if (goneKeys.length) {
        report.push(`- ${goneKeys.length} question(s) changed id or dropped out — usually the common year moved:`);
        for (const q of goneKeys.slice(0, 10)) report.push(`  - \`${q.id}\``);
      }
      const newOnes = questions.filter((q) => !prevIds.has(q.id));
      if (newOnes.length) report.push(`- ${newOnes.length} question(s) regenerated at a new year`);
      report.push('');
    }
  }

  finish(reportPath, report);
}

function finish(reportPath, report = []) {
  const lines = [];
  if (report.length) lines.push(...report);

  if (notes.length) {
    lines.push('### Notes\n');
    for (const n of notes) lines.push(`- ${n}`);
    lines.push('');
  }
  if (warnings.length) {
    lines.push('### ⚠️ Needs a look\n');
    for (const w of warnings) lines.push(`- ${w}`);
    lines.push('');
  }
  if (errors.length) {
    lines.push('### ❌ Validation failed\n');
    for (const e of errors) lines.push(`- ${e}`);
    lines.push('');
  }

  const md = lines.join('\n');
  if (reportPath) fs.writeFileSync(reportPath, md);

  console.log(md || 'No changes to report.');
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);

  if (errors.length) {
    console.error('\nData check FAILED — refusing to propose this refresh.');
    process.exit(1);
  }
  console.log('Data check passed.');
}

main();
