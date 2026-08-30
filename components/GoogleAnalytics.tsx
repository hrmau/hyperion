'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';
import {
  subscribeConsent,
  getConsentSnapshot,
  getServerConsentSnapshot,
} from '@/lib/cookies';

const GA_MEASUREMENT_ID = 'G-H89L3VC5L3';

export default function GoogleAnalytics() {
  // Read through an external store rather than an effect, so consent is never
  // assumed during hydration and the tag mounts the moment it is granted.
  const prefs = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  );

  if (!prefs.analytics) return null;

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
