import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'Learn how Grid Gorilla calculates energy independence scores, data sources, and methodology behind our global electricity visualizations.',
  alternates: {
    canonical: '/methodology',
  },
};

export default function MethodologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
