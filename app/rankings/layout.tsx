import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Country rankings',
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
