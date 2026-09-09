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
const WHY = process.argv.includes('--why');
const KEEP_PROD = Number(arg('keep-production', 3));

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
if (!Number.isFinite(KEEP_PROD) || KEEP_PROD < 1) {
  console.error(`--keep-production must be at least 1, got "${arg('keep-production', 3)}".`);
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
/**
 * An alias only protects a deployment if a *custom* domain points at it.
 *
 * Vercel assigns every deployment a `<project>-<hash>-<scope>.vercel.app` URL
 * and a `<project>-git-<branch>-<scope>.vercel.app` one, so `aliasAssigned` is
 * true for effectively everything. Trusting it protected 370 deployments out of
 * 370 across 13 projects and reported nothing to delete, which is how the
 * mistake surfaced. Only a hostname the account actually owns means someone is
 * pointing at this build on purpose.
 */
const CUSTOM_DOMAIN = (host) => typeof host === 'string' && !host.endsWith('.vercel.app');
const customDomains = (d) => (Array.isArray(d.alias) ? d.alias.filter(CUSTOM_DOMAIN) : []);

/**
 * The production deployments to keep whatever their age: the live one, plus a
 * few behind it, because Vercel's instant rollback needs the previous builds to
 * still exist. Deleting them does not break the site but does remove the
 * one-click way back.
 */
async function protectedProduction(project) {
  const page = await api(
    `/v6/deployments?${qs(`projectId=${encodeURIComponent(project.id)}`, 'limit=40', team)}`
  );
  const newest = (page.deployments ?? [])
    .filter((d) => d.target === 'production')
    .sort((a, b) => b.created - a.created)
    .slice(0, KEEP_PROD)
    .map((d) => d.uid);

  /*
   * The live deployment is read from the project rather than inferred as "the
   * newest production build", because those are not the same thing after a
   * rollback: rolling back promotes an older build, and the newest three would
   * then be three builds nobody is serving while the one actually answering the
   * domain sits outside the window and gets deleted. That is the only failure
   * here that takes a site down, so it is looked up rather than reasoned about.
   */
  const live = project.targets?.production?.id;
  return { ids: new Set([...newest, live].filter(Boolean)), live };
}

async function staleFor(projectId, cutoff, keepIds, live) {
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
    const domains = customDomains(d);
    const reason = d.uid === live
      ? 'LIVE production'
      : keepIds.has(d.uid)
        ? 'recent production'
      : domains.length > 0
        ? `custom domain: ${domains.join(', ')}`
        : null;
    if (reason) keep.push({ ...d, reason });
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
    const { ids: keepIds, live } = await protectedProduction(project);
    const { keep, drop } = await staleFor(project.id, cutoff, keepIds, live);
    plan.push({ project, keep, drop });
  }

  const totalDrop = plan.reduce((n, p) => n + p.drop.length, 0);
  const totalKeep = plan.reduce((n, p) => n + p.keep.length, 0);

  console.log(`Older than ${DAYS} days, across ${targets.length} project(s):\n`);
  for (const { project, keep, drop } of plan) {
    if (drop.length === 0 && keep.length === 0) continue;
    console.log(`  ${project.name.padEnd(28)} deletable ${String(drop.length).padStart(4)}   protected ${keep.length}`);
  }
  console.log(`\n  deletable total: ${totalDrop}   protected: ${totalKeep}`);

  if (WHY) {
    console.log('\nWhy each protected deployment was kept:');
    for (const { project, keep } of plan) {
      for (const d of keep) {
        console.log(`  ${project.name.padEnd(20)} ${d.url.padEnd(46)} ${d.reason}`);
      }
    }
  }

  if (totalDrop === 0) {
    console.log('\nNothing to do.');
    return;
  }

  /*
   * The list endpoint does not report build output size, so the only figure
   * available is a count times a measured build. 160MB is this repo's build,
   * and it does not transfer: multiplying it across thirteen mixed projects
   * produced "52.34 GB" against an account total of 15.65 GB, which is not an
   * estimate, it is a number that makes the rest of the output look unreliable.
   * Quoted for one project, withheld for many.
   */
  if (targets.length === 1 && targets[0].name === 'gridgorilla') {
    console.log(`\nApproximate storage freed: ~${fmt(totalDrop * 160 * 1024 ** 2)} (at ~160MB a build)`);
  } else {
    console.log('\nStorage freed is not estimated: build size differs per project and the API does not report it.');
  }

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
