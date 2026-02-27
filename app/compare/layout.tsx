import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Countries | Grid Gorilla',
  description: 'Compare electricity generation and energy mix between countries and blocs.',
  alternates: {
    canonical: '/compare',
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
