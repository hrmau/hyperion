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
 */
export default function FlagImg({ iso3, size = 20, className = '' }: FlagImgProps) {
  const url = getFlagUrl(iso3, size <= 20 ? 20 : 40);
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      style={{ height: size, width: 'auto' }}
      className={`inline-block rounded-sm ${className}`}
      loading="lazy"
    />
  );
}
