'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

/**
 * EN ↔ AR manual locale switcher.
 *
 * On click:
 *  1. Writes NEXT_LOCALE cookie so next-intl middleware persists the choice.
 *  2. Replaces the locale segment in the current URL and navigates.
 *
 * Cookie max-age: 1 year. SameSite=lax so it survives normal navigation.
 */
interface LanguageToggleProps {
  /** Expands to full width — use inside the mobile menu CTA section */
  fullWidth?: boolean;
}

export function LanguageToggle({ fullWidth = false }: LanguageToggleProps) {
  const locale = useLocale();
  const pathname = usePathname(); // e.g. "/en/trade/accounts"

  const next = locale === 'en' ? 'ar' : 'en';
  const label = locale === 'en' ? 'عربي' : 'EN';
  // Accessible name must contain the visible label (WCAG 2.5.3 label-in-name),
  // so voice-control users can activate the button by its on-screen text.
  const ariaLabel = locale === 'en' ? 'عربي، switch to Arabic' : 'EN, switch to English';

  const toggle = useCallback(() => {
    // Persist through refreshes / new tabs (1 year)
    document.cookie = `NEXT_LOCALE=${next}; path=/; SameSite=lax; max-age=31536000`;

    // Swap the locale segment: /en/foo → /ar/foo
    const newPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${next}$1`);
    // Full page navigation ensures the server receives the new locale cookie
    // and re-renders all Server Components in the correct locale.
    window.location.href = newPath;
  }, [next, pathname]);

  if (fullWidth) {
    return (
      <button
        onClick={toggle}
        aria-label={ariaLabel}
        className="border-border text-muted font-body hover:text-foreground flex h-[40px] w-full items-center justify-center gap-2 rounded-full border text-[13px] font-medium transition-colors"
      >
        {/* Globe icon */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="8" cy="8" rx="2.8" ry="6.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="1.5" y1="6" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.2" />
          <line x1="1.5" y1="10" x2="14.5" y2="10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="font-body text-foreground dark:bg-surface hover:bg-accent/[0.10] dark:hover:bg-accent/[0.10] flex h-[38px] min-w-[38px] flex-shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#f4f4f5] px-2.5 text-[12px] font-semibold tracking-wide transition-[background-color,transform] active:scale-[0.94]"
    >
      {/* Globe icon */}
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <ellipse cx="8" cy="8" rx="2.8" ry="6.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="1.5" y1="6" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.4" />
        <line x1="1.5" y1="10" x2="14.5" y2="10" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {label}
    </button>
  );
}
