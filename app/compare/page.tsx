import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';

import CompareClient from './CompareClient';

/**
 * A server shell around the client comparison, so the page's title comes from
 * the URL rather than from JavaScript.
 *
 * The whole route used to be a client component that set document.title after
 * hydration. Google renders JavaScript and usually caught it, but nothing else
 * does: every social scraper, chat unfurler and link preview read the generic
 * "Compare countries" no matter which two countries the link was about. Country
 * pages now link into this route, so those URLs get shared.
 */

/** ISO3 and bloc labels, from a 4KB index rather than the 6MB dataset. */
const loadNames = cache(async (): Promise<Record<string, string>> => {
  const file = path.join(process.cwd(), 'public', 'data', 'country-names.json');
  return JSON.parse(await fs.readFile(file, 'utf8')) as Record<string, string>;
});

const loadBlocLabels = cache(async (): Promise<Record<string, string>> => {
  const file = path.join(process.cwd(), 'public', 'data', 'blocs.json');
  const raw = JSON.parse(await fs.readFile(file, 'utf8'));
  const out: Record<string, string> = {};
  for (const group of ['ember', 'custom']) {
    for (const [id, def] of Object.entries<{ name?: string }>(raw[group]?.blocs ?? {})) {
      if (def?.name) out[id] = def.name;
    }
  }
  return out;
});

/** `IRL` or `bloc:EU` as it should read in a sentence. */
async function labelFor(param: string | undefined): Promise<string | null> {
  if (!param) return null;
  if (param.startsWith('bloc:')) {
    const id = param.slice(5);
    if (!id) return null;
    return (await loadBlocLabels())[id] ?? id;
  }
  return (await loadNames())[param.toUpperCase()] ?? null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const [a, b] = await Promise.all([labelFor(one(params.a)), labelFor(one(params.b))]);

  const paired = a && b;
  const title = paired ? `${a} vs ${b}` : 'Compare countries';
  const description = paired
    ? `${a} and ${b} side by side: what each grid runs on, how clean it is, and how much of its own fuel it produces.`
    : 'Put any two countries or blocs side by side: generation mix, clean share, emissions and energy independence.';

  return {
    title,
    description,
    // Canonical stays on the bare route on purpose. Two hundred countries make
    // forty thousand pairings, and none of them should compete with each other
    // in an index. The dynamic title is for the person who shares the link, not
    // for the crawler.
    alternates: { canonical: '/compare' },
    openGraph: {
      title: `${title} | Grid Gorilla`,
      description,
      url: '/compare',
      siteName: 'Grid Gorilla',
    },
    twitter: { card: 'summary', title: `${title} | Grid Gorilla`, description },
  };
}

export default function ComparePage() {
  return <CompareClient />;
}
