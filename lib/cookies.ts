// Cookie consent management

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

/** Current preferences, or defaults when nothing has been stored. */
export function getConsentSnapshot(): CookiePreferences {
  if (cached === null) cached = hasConsented() ? getPreferences() : defaultPreferences;
  return cached;
}

/** Server and first-hydration snapshot: never assume consent. */
export function getServerConsentSnapshot(): CookiePreferences {
  return defaultPreferences;
}

let cachedDecided: boolean | null = null;

/** Whether the visitor has answered the banner at all. */
export function getDecidedSnapshot(): boolean {
  if (cachedDecided === null) cachedDecided = hasConsented();
  return cachedDecided;
}

/** Assume undecided until hydration proves otherwise, so the banner never flashes. */
export function getServerDecidedSnapshot(): boolean {
  return true;
}

function publish(prefs: CookiePreferences) {
  cached = prefs;
  cachedDecided = true;
  for (const listener of listeners) listener();
}
