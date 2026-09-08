#!/usr/bin/env node
/**
 * Delete preview deployments older than a cutoff.
 *
 * Usage:
 *   VERCEL_TOKEN=... node scripts/prune-deployments.js                 # dry run
 *   VERCEL_TOKEN=... node scripts/prune-deployments.js --days 14 --yes
 *
 * Vercel keeps the build output of every deployment forever, and this project
 * stores roughly 160MB per build - 401 prerendered pages, their RSC payloads
 * and 200 generated share cards. At the rate this repo merges, that is a couple
 * of gigabytes a week of previews nobody will open again.
 *
 * Dry run is the default and `--yes` is required to delete anything, because a
 * deletion here is not recoverable: the build output is gone and the only way
 * back is to redeploy the commit.
 *
 * Two deployments are never touched, whatever their age:
 *   - the current production deployment
 *   - anything with an alias pointing at it, which includes a custom domain and
 *     any preview someone has linked to a branch URL
 *
 * Those are skipped by inspection rather than by trusting the API to refuse.
 */

const DAY = 24 * 60 * 60 * 1000;
const API = 'https://api.vercel.com';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT = arg('project', process.env.VERCEL_PROJECT_ID || 'hyperion');
const TEAM = arg('team', process.env.VERCEL_TEAM_ID || null);
const DAYS = Number(arg('days', 14));
const APPLY = process.argv.includes('--yes');

if (!TOKEN) {
  console.error('VERCEL_TOKEN is not set. Create one at vercel.com/account/tokens.');
  process.exit(1);
}
if (!Number.isFinite(DAYS) || DAYS < 1) {
  console.error(`--days must be a positive number, got "${arg('days', 14)}".`);
  process.exit(1);
}

const scope = TEAM ? `&teamId=${encodeURIComponent(TEAM)}` : '';
const headers = { Authorization: `Bearer ${TOKEN}` };

async function api(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

const fmt = (n) => `${(n / 1024 ** 3).toFixed(2)} GB`;
const age = (ms) => `${Math.floor((Date.now() - ms) / DAY)}d`;

async function main() {
  const cutoff = Date.now() - DAYS * DAY;

  /*
   * `until` filters to deployments created before a timestamp, so the cutoff is
   * applied by the API rather than by fetching everything and discarding most of
   * it. Paginated: `pagination.next` is the timestamp to continue from.
   */
  const stale = [];
  let until = cutoff;
  for (;;) {
    const page = await api(
      `/v6/deployments?projectId=${encodeURIComponent(PROJECT)}&limit=100&until=${until}${scope}`
    );
    const batch = page.deployments ?? [];
    stale.push(...batch);
    if (!page.pagination?.next || batch.length === 0) break;
    until = page.pagination.next;
  }

  const keep = [];
  const drop = [];
  for (const d of stale) {
    // `target` is 'production' for a production build. An alias means something
    // points at this deployment by name - a domain, or a branch URL someone has
    // bookmarked - so it is not a spare copy even when it is old.
    const aliased = d.aliasAssigned || (Array.isArray(d.alias) && d.alias.length > 0);
    if (d.target === 'production' || aliased) keep.push(d);
    else drop.push(d);
  }

  console.log(`Project ${PROJECT}${TEAM ? ` (team ${TEAM})` : ''}`);
  console.log(`Older than ${DAYS} days: ${stale.length} deployments`);
  console.log(`  protected (production or aliased): ${keep.length}`);
  console.log(`  deletable:                         ${drop.length}`);

  if (drop.length === 0) {
    console.log('\nNothing to do.');
    return;
  }

  // A rough figure, and said to be rough: the list endpoint does not report
  // build output size, so this is the measured size of one build times the
  // count. It is here to make the decision, not to reconcile against a bill.
  console.log(`\nApproximate storage freed: ~${fmt(drop.length * 160 * 1024 ** 2)} (at ~160MB a build)`);

  const preview = drop.slice(0, 10);
  console.log('\nOldest first:');
  for (const d of [...drop].sort((a, b) => a.created - b.created).slice(0, 10)) {
    console.log(`  ${age(d.created).padStart(5)}  ${d.uid}  ${d.url}`);
  }
  if (drop.length > preview.length) console.log(`  ... and ${drop.length - preview.length} more`);

  if (!APPLY) {
    console.log('\nDry run. Re-run with --yes to delete.');
    return;
  }

  let ok = 0;
  const failed = [];
  for (const d of drop) {
    const res = await fetch(`${API}/v13/deployments/${d.uid}?${scope.slice(1)}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      ok += 1;
    } else {
      failed.push(`${d.uid} -> ${res.status} ${(await res.text()).slice(0, 120)}`);
    }
  }

  console.log(`\nDeleted ${ok} of ${drop.length}.`);
  if (failed.length) {
    console.log('Failed:');
    for (const f of failed) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
