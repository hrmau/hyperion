import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why energy matters',
  description:
    'Electricity per person decides what a country can build, what it costs when the price moves, and who has leverage over it. The argument, with every figure read from the data.',
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
