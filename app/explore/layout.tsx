import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore the Map | Grid Gorilla',
  description:
    'Every country on Earth, coloured by what keeps its lights on. Explore electricity generation, clean share and energy independence across 214 grids.',
  alternates: {
    canonical: '/explore',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
