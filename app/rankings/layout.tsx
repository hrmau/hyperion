import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Country Rankings | Grid Gorilla',
  description: 'Rank countries by electricity generation, clean energy share, and emissions.',
  alternates: {
    canonical: '/rankings',
  },
};

export default function RankingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
