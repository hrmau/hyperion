'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { trackCountryProfileOpen, type ProfileSource } from '@/lib/analytics';

/**
 * A link to a country profile that says where it was clicked from.
 *
 * A client component because most of the surfaces that link to a profile are
 * server components — the homepage, the country pages, the /countries hub — and
 * an onClick cannot live in one. Keeping the handler in a leaf like this is what
 * lets those pages stay server-rendered, which is the whole reason the 200
 * profiles are worth publishing.
 *
 * Also usable as `Button`'s `as`, which is how the homepage hero keeps its
 * button styling and still reports where the click came from.
 */
export interface CountryProfileLinkProps
  extends Omit<ComponentProps<typeof Link>, 'href' | 'children'> {
  iso3: string;
  source: ProfileSource;
  /** Defaults to the profile path for `iso3`. */
  href?: string;
  children?: ReactNode;
}

export default function CountryProfileLink({
  iso3,
  source,
  href,
  children,
  onClick,
  ...rest
}: CountryProfileLinkProps) {
  return (
    <Link
      href={href ?? `/country/${iso3.toLowerCase()}`}
      onClick={(e) => {
        trackCountryProfileOpen(source, iso3);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
