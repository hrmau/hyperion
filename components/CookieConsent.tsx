'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  saveConsent,
  acceptAll,
  rejectOptional,
  subscribeConsent,
  getConsentSnapshot,
  getServerConsentSnapshot,
  getDecidedSnapshot,
  getServerDecidedSnapshot,
  getSettingsOpenSnapshot,
  getServerSettingsOpenSnapshot,
  closeConsentSettings,
  type CookiePreferences,
} from '@/lib/cookies';

export default function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const [showSettingsView, setShowSettingsView] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Consent is read through an external store rather than an effect. The server
  // snapshot says "already decided" so the banner cannot flash on a page that
  // was never going to show it - which, outside the consent region, is every
  // page: `decided` is true there before anyone has clicked anything.
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
  // Reopened from "Cookie settings" in the footer. Goes straight to the
  // toggles, because someone who went looking for them wants to change one.
  const reopened = useSyncExternalStore(
    subscribeConsent,
    getSettingsOpenSnapshot,
    getServerSettingsOpenSnapshot
  );

  const [draft, setDraft] = useState<CookiePreferences | null>(null);
  const preferences = draft ?? stored;
  const showBanner = (!decided && !dismissed) || reopened;
  const showSettings = showSettingsView || reopened;

  // The footer link is at the bottom of a long page and the panel is fixed to
  // the viewport, so without this a keyboard user's focus stays on the link
  // while the thing it opened is somewhere else.
  useEffect(() => {
    if (reopened) panelRef.current?.focus();
  }, [reopened]);

  // No reload to turn analytics ON: GoogleAnalytics subscribes to the same
  // store, so the tag mounts the moment consent is granted. Turning it OFF
  // does reload - the tag cannot be unloaded once the page has it, so the only
  // honest way to stop it is a fresh document. That now covers every exit, not
  // just the settings panel, because a reopened banner can be answered with
  // "Essential Only" by someone whose analytics is already running.
  const finish = (next: CookiePreferences) => {
    const wasRunning = stored.analytics;
    setDraft(null);
    setDismissed(true);
    setShowSettingsView(false);
    if (wasRunning && !next.analytics) window.location.reload();
  };

  const handleAcceptAll = () => finish(acceptAll());
  const handleRejectOptional = () => finish(rejectOptional());
  const handleSavePreferences = () => {
    saveConsent(preferences);
    finish(preferences);
  };

  const handleBack = () => {
    setDraft(null);
    if (reopened) closeConsentSettings();
    else setShowSettingsView(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="region"
        aria-label="Cookie preferences"
        className="max-w-2xl mx-auto card p-4 md:p-6 outline-none"
      >
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
                onClick={() => setShowSettingsView(true)}
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
                    aria-label="Essential cookies (always on)"
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
                    aria-label="Analytics cookies"
                    onChange={(e) =>
                      setDraft({ ...preferences, analytics: e.target.checked })
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
                onClick={handleBack}
                className="px-4 py-2 text-xs font-medium text-muted hover:text-primary transition-colors"
              >
                {reopened ? 'Close' : 'Back'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
