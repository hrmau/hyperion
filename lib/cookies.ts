// Cookie consent management
//
// Two inputs decide whether analytics runs. A choice the visitor has saved
// always wins, in either direction. Without one, the default depends on where
// they are: middleware.ts writes `gg_consent_region`, and a visitor whose
// region does not require consent starts with analytics on and never sees the
// banner - see lib/consentRegion.ts for where the line is and why. Everyone can
// still change it from "Cookie settings" in the footer.

import { CONSENT_REGION_COOKIE, type ConsentRegion } from '@/lib/consentRegion';

export type CookiePreferences = {
  necessary: true; // Always true, cannot be changed
  analytics: boolean;
};

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

export const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
};

const impliedPreferences: CookiePreferences = {
  necessary: true,
  analytics: true,
};

/**
 * The region middleware classified this visitor into. Missing - local dev, or
 * any response the middleware did not touch - reads as `required`, so the
 * failure mode is a banner and never an unasked-for tag.
 */
function consentRegion(): ConsentRegion {
  if (typeof document === 'undefined') return 'required';
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_REGION_COOKIE}=([^;]*)`));
  return match?.[1] === 'implied' ? 'implied' : 'required';
}

export function hasConsented(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
}

export function getPreferences(): CookiePreferences {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        necessary: true, // Always enforce
        analytics: Boolean(parsed.analytics),
      };
    }
  } catch {
    // Invalid JSON, return defaults
  }

  return defaultPreferences;
}

export function saveConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;

  const next: CookiePreferences = { necessary: true, analytics: preferences.analytics };
  localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(next));
  publish(next);
}

export function acceptAll(): CookiePreferences {
  const prefs: CookiePreferences = {
    necessary: true,
    analytics: true,
  };
  saveConsent(prefs);
  return prefs;
}

export function rejectOptional(): CookiePreferences {
  const prefs: CookiePreferences = {
    necessary: true,
    analytics: false,
  };
  saveConsent(prefs);
  return prefs;
}


/**
 * Consent as an external store.
 *
 * Both GoogleAnalytics and CookieConsent used to read localStorage inside an
 * effect and call setState, which the React compiler flags as a cascading
 * render. This is the same shape lib/questions.ts uses for the best streak: a
 * subscribable snapshot, with a server snapshot of "not consented" so hydration
 * never assumes consent that has not been given.
 */
type Listener = () => void;
const listeners = new Set<Listener>();
let cached: CookiePreferences | null = null;

export function subscribeConsent(onChange: Listener): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * Current preferences: the saved choice, else the region's default.
 *
 * Cached for the life of the document, so a region cookie that changes during
 * a visit - middleware re-derives it on client navigations too - never starts
 * or stops the tag halfway through a page. It applies from the next load.
 */
export function getConsentSnapshot(): CookiePreferences {
  if (cached === null) {
    cached = hasConsented()
      ? getPreferences()
      : consentRegion() === 'implied'
        ? impliedPreferences
        : defaultPreferences;
  }
  return cached;
}

/** Server and first-hydration snapshot: never assume consent. */
export function getServerConsentSnapshot(): CookiePreferences {
  return defaultPreferences;
}

let cachedDecided: boolean | null = null;

/**
 * Whether the banner has nothing to ask: the visitor has answered it, or they
 * are somewhere that does not require the question.
 */
export function getDecidedSnapshot(): boolean {
  if (cachedDecided === null) cachedDecided = hasConsented() || consentRegion() === 'implied';
  return cachedDecided;
}

/** Assume undecided until hydration proves otherwise, so the banner never flashes. */
export function getServerDecidedSnapshot(): boolean {
  return true;
}

/**
 * Whether the settings panel has been reopened from the footer.
 *
 * The footer is a server component and the banner lives in the root layout, so
 * they share this flag rather than a prop. It is the only way a visitor who was
 * never asked - anyone outside the consent region - can say no.
 */
let settingsOpen = false;

export function openConsentSettings(): void {
  settingsOpen = true;
  notify();
}

export function closeConsentSettings(): void {
  settingsOpen = false;
  notify();
}

export function getSettingsOpenSnapshot(): boolean {
  return settingsOpen;
}

export function getServerSettingsOpenSnapshot(): boolean {
  return false;
}

function publish(prefs: CookiePreferences) {
  cached = prefs;
  cachedDecided = true;
  settingsOpen = false;
  notify();
}

function notify() {
  for (const listener of listeners) listener();
}
