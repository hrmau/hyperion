'use client';

import { getFlagUrl } from '@/lib/flags';

interface FlagImgProps {
  iso3: string;
  size?: number;
  className?: string;
}

/**
 * Renders a country flag as an <img> from flagcdn.com.
 * Works cross-platform (Windows doesn't render flag emoji).
 * Uses a fixed height with auto width to preserve aspect ratios.
 * Most flags are 3:2 or 2:1, so width will typically be 1.5x-2x the height.
 */
export default function FlagImg({ iso3, size = 20, className = '' }: FlagImgProps) {
  const url = getFlagUrl(iso3, size <= 20 ? 20 : 40);
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      height={size}
      style={{
        height: size,
        width: 'auto',
        maxHeight: size,
        objectFit: 'contain'
      }}
      className={`inline-block shrink-0 rounded-sm ${className}`}
      loading="lazy"
    />
  );
}
