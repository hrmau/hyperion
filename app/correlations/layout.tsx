import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energy and prosperity',
  description: 'Explore the relationship between electricity consumption and human development across 88 countries. Interactive scatter plots showing GDP, HDI, life expectancy, and manufacturing correlations.',
  alternates: {
    canonical: '/correlations',
  },
};

export default function CorrelationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
