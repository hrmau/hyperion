'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { hasConsented, getPreferences } from '@/lib/cookies';

const GA_MEASUREMENT_ID = 'G-H89L3VC5L3';

export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check if user has consented to analytics
    if (hasConsented()) {
      const prefs = getPreferences();
      setEnabled(prefs.analytics);
    }
  }, []);

  if (!enabled) return null;

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
