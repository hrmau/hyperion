import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CountriesHub from '../../CountriesHub';
import { HUB_SLUGS, SLUG_REGION } from '@/lib/regions';

/**
 * The `/countries` variants, one per Ember region plus the world.
 *
 * Never linked and never navigated to directly: middleware rewrites `/countries`
 * here, so the URL a reader sees is always `/countries`. Six pages rather than
 * one per country, because the only thing that varies is which six cards sit
 * under "Worth a look" - the index of 200 links below them is identical.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return HUB_SLUGS.map((region) => ({ region }));
}

/**
 * Deliberately identical for every variant, and canonical to `/countries`.
 *
 * Same reasoning as `/home/*`: this metadata is what `/countries` serves, and
 * `/countries` must not describe itself differently depending on where the
 * reader is sitting. The canonical is what stops the variants being indexed
 * alongside the page they render, and they are not in the sitemap either.
 */
export const metadata: Metadata = {
  title: 'Electricity by country, A to Z',
  description:
    'Every country with a grid worth describing, one page each: what it burns, how clean it is, and the one thing about it worth knowing.',
  alternates: { canonical: '/countries' },
};

export default async function CountriesRegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  if (!HUB_SLUGS.includes(region)) notFound();
  return <CountriesHub region={SLUG_REGION[region] ?? null} />;
}
