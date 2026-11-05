'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';
import {
  subscribeConsent,
  getConsentSnapshot,
  getServerConsentSnapshot,
} from '@/lib/cookies';

// Set in the Vercel production environment only. Unset - a local checkout, a
// preview deployment, anybody's fork - means no tag at all, so a copy of this
// repo can never report its traffic into gridgorilla.app's property. Inlined at
// build time, as every NEXT_PUBLIC_ variable is.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  // Read through an external store rather than an effect, so consent is never
  // assumed during hydration and the tag mounts the moment it is granted.
  const prefs = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  );

  if (!GA_MEASUREMENT_ID || !prefs.analytics) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
