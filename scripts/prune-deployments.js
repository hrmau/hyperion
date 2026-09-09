#!/usr/bin/env node
/**
 * Delete preview deployments older than a cutoff.
 *
 * Usage:
 *   VERCEL_TOKEN=... node scripts/prune-deployments.js                 # list projects
 *   VERCEL_TOKEN=... node scripts/prune-deployments.js --all           # dry run, every project
 *   VERCEL_TOKEN=... node scripts/prune-deployments.js --project gridgorilla
 *   VERCEL_TOKEN=... node scripts/prune-deployments.js --all --days 14 --yes
 *
 * Scope is explicit and has no default. The first version defaulted to a project
 * name taken from the repo directory, which is a guess: the Vercel project can
 * be called anything, and a wrong name returns an empty list that reads exactly
 * like "nothing to prune". With no scope this now prints the account's projects
 * and stops.
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
const PROJECT = arg('project', process.env.VERCEL_PROJECT_ID || null);
const TEAM = arg('team', process.env.VERCEL_TEAM_ID || null);
const DAYS = Number(arg('days', 14));
const APPLY = process.argv.includes('--yes');
const ALL = process.argv.includes('--all');

if (!TOKEN) {
  console.error('VERCEL_TOKEN is not set. Create one at vercel.com/account/tokens.');
  process.exit(1);
}
if (!Number.isFinite(DAYS) || DAYS < 1) {
  console.error(`--days must be a positive number, got "${arg('days', 14)}".`);
  process.exit(1);
}
if (PROJECT && ALL) {
  console.error('Pass --project or --all, not both.');
  process.exit(1);
}

const team = TEAM ? `teamId=${encodeURIComponent(TEAM)}` : '';
const headers = { Authorization: `Bearer ${TOKEN}` };
const qs = (...parts) => parts.filter(Boolean).join('&');

async function api(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

const fmt = (n) => `${(n / 1024 ** 3).toFixed(2)} GB`;
const age = (ms) => `${Math.floor((Date.now() - ms) / DAY)}d`;

/** Every project on the account, or the team when one is given. */
async function listProjects() {
  const out = [];
  let until;
  for (;;) {
    const page = await api(`/v9/projects?${qs('limit=100', team, until && `until=${until}`)}`);
    out.push(...(page.projects ?? []));
    if (!page.pagination?.next) break;
    until = page.pagination.next;
  }
  return out;
}

/**
 * Deployments older than the cutoff, split into what may go and what may not.
 *
 * `until` filters to deployments created before a timestamp, so the cutoff is
 * applied by the API rather than by fetching everything and discarding most of
 * it. Paginated: `pagination.next` is the timestamp to continue from.
 */
async function staleFor(projectId, cutoff) {
  const found = [];
  let until = cutoff;
  for (;;) {
    const page = await api(
      `/v6/deployments?${qs(`projectId=${encodeURIComponent(projectId)}`, 'limit=100', `until=${until}`, team)}`
    );
    const batch = page.deployments ?? [];
    found.push(...batch);
    if (!page.pagination?.next || batch.length === 0) break;
    until = page.pagination.next;
  }

  const keep = [];
  const drop = [];
  for (const d of found) {
    // `target` is 'production' for a production build. An alias means something
    // points at this deployment by name - a domain, or a branch URL someone has
    // bookmarked - so it is not a spare copy even when it is old.
    const aliased = d.aliasAssigned || (Array.isArray(d.alias) && d.alias.length > 0);
    if (d.target === 'production' || aliased) keep.push(d);
    else drop.push(d);
  }
  return { keep, drop };
}

async function main() {
  const projects = await listProjects();

  if (!PROJECT && !ALL) {
    console.log(`Projects on this account${TEAM ? ` (team ${TEAM})` : ''}:\n`);
    for (const p of projects) console.log(`  ${p.name}`);
    console.log('\nPass --project <name> for one, or --all for every one of them.');
    return;
  }

  let targets = projects;
  if (PROJECT) {
    targets = projects.filter((p) => p.name === PROJECT || p.id === PROJECT);
    if (targets.length === 0) {
      // Rather than letting a typo return an empty deployment list, which reads
      // exactly like "nothing to prune".
      console.error(`No project named "${PROJECT}". Run with no arguments to list them.`);
      process.exit(1);
    }
  }

  const cutoff = Date.now() - DAYS * DAY;
  const plan = [];
  for (const project of targets) {
    const { keep, drop } = await staleFor(project.id, cutoff);
    plan.push({ project, keep, drop });
  }

  const totalDrop = plan.reduce((n, p) => n + p.drop.length, 0);
  const totalKeep = plan.reduce((n, p) => n + p.keep.length, 0);

  console.log(`Older than ${DAYS} days, across ${targets.length} project(s):\n`);
  for (const { project, keep, drop } of plan) {
    if (drop.length === 0 && keep.length === 0) continue;
    console.log(`  ${project.name.padEnd(28)} deletable ${String(drop.length).padStart(4)}   protected ${keep.length}`);
  }
  console.log(`\n  deletable total: ${totalDrop}   protected (production or aliased): ${totalKeep}`);

  if (totalDrop === 0) {
    console.log('\nNothing to do.');
    return;
  }

  // A rough figure, and said to be rough: the list endpoint does not report
  // build output size, so this is one measured build times a count, and that
  // measurement is this project's. Other projects will differ.
  console.log(`\nApproximate storage freed: ~${fmt(totalDrop * 160 * 1024 ** 2)} (at ~160MB a build)`);

  const oldest = plan
    .flatMap(({ project, drop }) => drop.map((d) => ({ ...d, project: project.name })))
    .sort((a, b) => a.created - b.created);
  console.log('\nOldest first:');
  for (const d of oldest.slice(0, 10)) {
    console.log(`  ${age(d.created).padStart(5)}  ${d.project.padEnd(20)} ${d.url}`);
  }
  if (oldest.length > 10) console.log(`  ... and ${oldest.length - 10} more`);

  if (!APPLY) {
    console.log('\nDry run. Re-run with --yes to delete.');
    return;
  }

  let ok = 0;
  const failed = [];
  for (const d of oldest) {
    const res = await fetch(`${API}/v13/deployments/${d.uid}${team ? `?${team}` : ''}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      ok += 1;
    } else {
      failed.push(`${d.project} ${d.uid} -> ${res.status} ${(await res.text()).slice(0, 120)}`);
    }
  }

  console.log(`\nDeleted ${ok} of ${oldest.length}.`);
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
