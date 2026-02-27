import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Grid Gorilla',
  description: 'Privacy policy for Grid Gorilla - how we handle your data.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
