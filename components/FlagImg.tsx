'use client';

import { useState } from 'react';
import { getFlagUrl, getIso2 } from '@/lib/flags';

interface FlagImgProps {
  iso3: string;
  size?: number;
  className?: string;
}

/**
 * Country flag from flagcdn.com, with an ISO2 fallback.
 *
 * A deliberate deviation from the design system, which says country identity is
 * an ISO 3166 two-letter code in mono and never a flag. That rule was followed
 * through the redesign and then overruled by the product owner on the strongest
 * argument available: people recognise a flag instantly and have to decode a
 * code. See docs/backlog.md.
 *
 * Two of the system's three objections are handled rather than ignored:
 * illegibility is addressed by never rendering below 16px, and payload by
 * lazy-loading from a CDN so only the flags actually on screen are fetched.
 * The third — that flags are politically loaded — stands, and is the owner's
 * call to make.
 *
 * A hairline keeps full-colour images from floating on the dark ground; without
 * it, pale flags bleed into the page and dark ones vanish.
 */
export default function FlagImg({ iso3, size = 20, className = '' }: FlagImgProps) {
  const [imgError, setImgError] = useState(false);
  const url = getFlagUrl(iso3, size <= 20 ? 20 : 40);
  const iso2 = getIso2(iso3);
  const containerWidth = Math.round(size * 1.33);

  if (!url || imgError) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{
          width: containerWidth,
          height: size,
          borderRadius: 3,
          background: 'var(--bg-card-strong)',
          border: '1px solid var(--line)',
          fontFamily: 'var(--font-mono)',
          fontSize: Math.max(9, size * 0.45),
          letterSpacing: '0.04em',
          color: 'var(--text-tertiary)',
        }}
      >
        {iso2 || iso3.slice(0, 2)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: containerWidth, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- third-party CDN, sized and lazy already */}
      <img
        src={url}
        alt={iso2 ? `${iso2} flag` : ''}
        onError={() => setImgError(true)}
        loading="lazy"
        style={{
          maxHeight: size,
          maxWidth: containerWidth,
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: 3,
          border: '1px solid var(--line)',
        }}
      />
    </span>
  );
}
