import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Grid Gorilla? | Grid Gorilla',
  description: 'Why we built Grid Gorilla - making global energy data accessible.',
  alternates: {
    canonical: '/why',
  },
};

export default function WhyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
