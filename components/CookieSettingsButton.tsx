'use client';

import type { CSSProperties } from 'react';
import { openConsentSettings } from '@/lib/cookies';

/**
 * Reopens the consent panel from the footer.
 *
 * Its own client component so SiteFooter can stay a server component. It is
 * the only way to say no for a visitor outside the consent region, who starts
 * with analytics on and is never shown the banner - so it is on every page.
 */
export default function CookieSettingsButton({ style }: { style?: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      style={{
        background: 'none',
        border: 0,
        padding: 0,
        cursor: 'pointer',
        font: 'inherit',
        textAlign: 'left',
        ...style,
      }}
    >
      Cookie settings
    </button>
  );
}
