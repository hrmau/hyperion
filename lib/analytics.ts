// Thin wrapper over GA4's gtag.
//
// GoogleAnalytics.tsx only injects gtag once the visitor has consented to
// analytics cookies, so `window.gtag` is simply absent otherwise and every call
// here becomes a no-op. That is the intended behaviour: never queue events for
// a visitor who declined.

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: GtagParams) => void;
  }
}

export function trackEvent(eventName: string, params?: GtagParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params);
  } catch {
    // Analytics must never break the page.
  }
}
