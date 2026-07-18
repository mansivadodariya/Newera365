'use client';

import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'risk-banner-dismissed';

interface RiskBannerProps {
  enabled?: boolean;
  message?: string | null;
}

/**
 * Dismissible sticky risk-warning banner driven by site-settings.
 * Dismiss state is stored in sessionStorage so it hides for the
 * current session but reappears on a fresh visit.
 */
export function RiskBanner({ enabled, message }: RiskBannerProps) {
  // Visible by default so the banner is in the server-rendered HTML — it sits
  // at the top of every page and was the LCP element, so a client-only reveal
  // (previous behaviour) pushed first paint out to hydration. Dismissal is
  // re-applied after mount; the brief flash for already-dismissed sessions is
  // the cheaper trade-off.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISSED_KEY)) setVisible(false);
    } catch {
      // sessionStorage unavailable (private mode, etc.) — keep banner shown
    }
  }, []);

  if (!enabled || !visible || !message) return null;

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  }

  return (
    <div role="alert" className="relative z-50 w-full bg-[#FFF7ED] px-5 py-2.5 dark:bg-[#2a1a00]">
      <div className="mx-auto flex max-w-[1200px] items-start gap-3">
        {/* Warning icon */}
        <svg
          className="mt-[1px] flex-shrink-0 text-[#F59E0B]"
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 2L1 14h14L8 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8 6v4M8 11.5v.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Message */}
        <p className="font-body flex-1 hyphens-auto text-justify text-[11px] leading-[1.6] text-[#92400E] dark:text-[#F59E0B]/80">
          {message}
        </p>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss risk warning"
          className="flex-shrink-0 text-[#92400E]/60 transition-opacity hover:opacity-100 dark:text-[#F59E0B]/50"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
