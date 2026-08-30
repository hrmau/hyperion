'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  saveConsent,
  acceptAll,
  rejectOptional,
  subscribeConsent,
  getConsentSnapshot,
  getServerConsentSnapshot,
  getDecidedSnapshot,
  getServerDecidedSnapshot,
  type CookiePreferences,
} from '@/lib/cookies';

export default function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Consent is read through an external store rather than an effect. The server
  // snapshot says "already decided" so the banner cannot flash on a page that
  // was never going to show it.
  const stored = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  );
  const decided = useSyncExternalStore(
    subscribeConsent,
    getDecidedSnapshot,
    getServerDecidedSnapshot
  );

  const [draft, setDraft] = useState<CookiePreferences | null>(null);
  const preferences = draft ?? stored;
  const setPreferences = setDraft;
  const showBanner = !decided && !dismissed;

  // No reload any more: GoogleAnalytics subscribes to the same store, so the
  // tag mounts the moment consent is granted. Reloading the page to start
  // analytics was a jarring way to answer a cookie banner.
  const handleAcceptAll = () => {
    setPreferences(acceptAll());
    setDismissed(true);
    setShowSettings(false);
  };

  const handleRejectOptional = () => {
    setPreferences(rejectOptional());
    setDismissed(true);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setDismissed(true);
    setShowSettings(false);
    // Turning analytics OFF still reloads: the tag cannot be unloaded once the
    // page has it, so the only honest way to stop it is a fresh document.
    if (!preferences.analytics) window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto card p-4 md:p-6">
        {!showSettings ? (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-primary mb-2">
                Cookie Preferences
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                We use cookies to ensure the website functions properly (essential)
                and to understand how you interact with it (analytics). You can
                accept all cookies or customize your preferences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-card hover:opacity-90 transition-opacity"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-inset transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-xs font-medium text-muted hover:text-primary transition-colors"
              >
                Manage Preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-primary mb-2">
                Cookie Settings
              </h3>
              <p className="text-xs text-secondary mb-4">
                Customize which cookies you allow. Essential cookies cannot be
                disabled as they are required for the website to function.
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {/* Essential cookies - always enabled */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-inset">
                <div>
                  <div className="text-xs font-medium text-primary">
                    Essential Cookies
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Required for the website to function. Cannot be disabled.
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 rounded border-border accent-positive opacity-60"
                  />
                </div>
              </div>

              {/* Analytics cookies - optional */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-inset">
                <div>
                  <div className="text-xs font-medium text-primary">
                    Analytics Cookies
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Help us understand how visitors interact with the website.
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-border accent-positive cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-card hover:opacity-90 transition-opacity"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-xs font-medium text-muted hover:text-primary transition-colors"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
