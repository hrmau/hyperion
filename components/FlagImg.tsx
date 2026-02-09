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
 * Uses a fixed container with 4:3 aspect ratio to ensure consistent sizing
 * across all flags regardless of their natural aspect ratio.
 */
export default function FlagImg({ iso3, size = 20, className = '' }: FlagImgProps) {
  const url = getFlagUrl(iso3, size <= 20 ? 20 : 40);
  if (!url) return null;

  // Use 4:3 aspect ratio for consistent container width (most flags fit well)
  const containerWidth = Math.round(size * 1.33);

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
        alt=""
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
