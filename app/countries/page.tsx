import type { Metadata } from 'next';
import CountriesHub from './CountriesHub';

/**
 * Never rendered in normal use: middleware rewrites `/countries` to a
 * prerendered `/countries/r/<slug>` variant, exactly as it does for `/`.
 *
 * It exists as the honest fallback for a request that reaches the route without
 * passing the middleware, and it renders the world set - which is also what a
 * visitor from an unrecognised region gets.
 */

export const metadata: Metadata = {
  title: 'Electricity by country, A to Z',
  description:
    'Every country with a grid worth describing, one page each: what it burns, how clean it is, and the one thing about it worth knowing.',
  alternates: { canonical: '/countries' },
};

export default function CountriesPage() {
  return <CountriesHub region={null} />;
}
