import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Higher or Lower',
  description:
    'Two countries, one energy metric. Guess which is higher and build a streak. Every round comes with the story behind the number.',
  alternates: {
    canonical: '/play',
  },
};

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
