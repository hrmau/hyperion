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

  localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({
    necessary: true,
    analytics: preferences.analytics,
  }));
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
