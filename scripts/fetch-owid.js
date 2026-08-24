#!/usr/bin/env node
/**
 * Download the OWID energy dataset.
 *
 * Usage:
 *   node scripts/fetch-owid.js                    # -> data/owid-energy-data.csv
 *   node scripts/fetch-owid.js --out /tmp/owid.csv
 *
 * The file is ~16MB and is deliberately NOT committed: the refresh workflow
 * fetches it on every run, and committing it would add 16MB of binary churn to
 * the repo each time upstream publishes. Everything the site serves is derived
 * from it by scripts/transform-owid.js and checked into public/data instead.
 *
 * Alongside the CSV this writes data/owid-source.json, recording when OWID last
 * published. transform-owid.py stamps the generated files with that date rather
 * than with today's, so a run against unchanged upstream data produces no diff
 * at all. Stamping "today" made every scheduled run look like a data change and
 * would have opened a pull request every week forever.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://owid-public.owid.io/data/energy/owid-energy-data.csv';

// A truncated or error-page response must never reach the transform step, where
// it would silently produce a JSON file with most countries missing.
const MIN_BYTES = 10_000_000;
const REQUIRED_COLUMNS = [
  'iso_code',
  'year',
  'electricity_generation',
  'coal_production',
  'coal_consumption',
  'gas_production',
  'gas_consumption',
  'oil_production',
  'oil_consumption',
];

async function main() {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf('--out');
  const outPath = path.resolve(
    outIdx !== -1 ? argv[outIdx + 1] : path.join(__dirname, '..', 'data', 'owid-energy-data.csv')
  );

  console.log(`Fetching ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }

  const lastModified = res.headers.get('last-modified');
  if (lastModified) console.log(`Upstream last modified: ${lastModified}`);

  const body = Buffer.from(await res.arrayBuffer());

  if (body.length < MIN_BYTES) {
    throw new Error(
      `Downloaded only ${body.length} bytes, expected at least ${MIN_BYTES}. ` +
        `Refusing to overwrite ${path.basename(outPath)} with a likely truncated or error response.`
    );
  }

  const header = body.subarray(0, 8192).toString('utf8').split('\n')[0];
  const columns = new Set(header.split(',').map((c) => c.trim()));
  const missing = REQUIRED_COLUMNS.filter((c) => !columns.has(c));
  if (missing.length) {
    throw new Error(
      `Upstream CSV is missing expected columns: ${missing.join(', ')}. ` +
        `The schema has probably changed — update scripts/transform-owid.py before refreshing.`
    );
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, body);
  console.log(`Wrote ${outPath} (${(body.length / 1_000_000).toFixed(1)} MB, ${columns.size} columns)`);

  // Record the upstream vintage next to the CSV. Only the date is used, so the
  // stamp moves when OWID publishes and stays put when it doesn't.
  const sourceMetaPath = path.join(path.dirname(outPath), 'owid-source.json');
  fs.writeFileSync(
    sourceMetaPath,
    JSON.stringify(
      {
        url: SOURCE_URL,
        lastModified: lastModified || null,
        lastModifiedDate: lastModified
          ? new Date(lastModified).toISOString().slice(0, 10)
          : null,
        bytes: body.length,
      },
      null,
      2
    ) + '\n'
  );
  console.log(`Wrote ${sourceMetaPath}`);

  if (process.env.GITHUB_OUTPUT && lastModified) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `last_modified=${lastModified}\n`);
  }
}

main().catch((err) => {
  console.error(`\nERROR: ${err.message}`);
  process.exit(1);
});
