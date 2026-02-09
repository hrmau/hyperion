'use client';

import { useState } from 'react';
import { getFlagUrl, getIso2 } from '@/lib/flags';

interface FlagImgProps {
  iso3: string;
  size?: number;
  className?: string;
}

/**
 * Renders a country flag as an <img> from flagcdn.com.
 * Falls back to a styled ISO2 code if the image fails to load
 * (e.g., due to content blockers or Safari ITP).
 * Uses a fixed container with 4:3 aspect ratio for consistent sizing.
 */
export default function FlagImg({ iso3, size = 20, className = '' }: FlagImgProps) {
  const [imgError, setImgError] = useState(false);
  const url = getFlagUrl(iso3, size <= 20 ? 20 : 40);
  const iso2 = getIso2(iso3);

  // Use 4:3 aspect ratio for consistent container width
  const containerWidth = Math.round(size * 1.33);

  // Fallback: show ISO2 code in a styled box
  if (!url || imgError) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 bg-inset rounded-sm ${className}`}
        style={{
          width: containerWidth,
          height: size,
          fontSize: Math.max(8, size * 0.45),
          fontWeight: 600,
          color: '#6B7280',
          letterSpacing: '-0.02em',
        }}
      >
        {iso2 || iso3.slice(0, 2)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: containerWidth,
        height: size,
      }}
    >
      <img
        src={url}
        alt={iso2 || ''}
        onError={() => setImgError(true)}
        style={{
          maxHeight: size,
          maxWidth: containerWidth,
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
        }}
        className="rounded-sm"
        loading="lazy"
      />
    </span>
  );
}
