import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Energy Story | Grid Gorilla',
  description: 'The story of global electricity generation - from coal to clean energy.',
  alternates: {
    canonical: '/story',
  },
};

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
