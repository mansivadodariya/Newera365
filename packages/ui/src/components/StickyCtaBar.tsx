'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AuthModal, type AuthModalType } from './AuthModal';
import { NO_CTA_SUFFIXES } from './SmartCtaBanner';

/** Fallback for pages with no tagged primary CTA. */
const SCROLL_THRESHOLD = 300;
/** How long to wait for a late-mounting `[data-primary-cta]` before falling
    back to the scroll threshold. */
const CTA_QUERY_RETRY_MS = 600;

/**
 * Floating bottom-center conversion pill. Appears only once the page's own
 * "open account" button (`[data-primary-cta]` — hero CTA, first account card,
 * IB register) has scrolled completely out of view, so it never competes with
 * the on-page CTA; pages without a tagged CTA fall back to a scroll threshold.
 *
 * Entrance is a single rise+fade (350ms) — deliberately NOT the circle→pill
 * morph (client feedback round 3: too animated + resembled a competitor).
 * Reduced motion gets a plain fade. Width is capped so the bottom-end corner
 * stays clear for FloatingContactWidget (which also lifts itself while this
 * bar is visible). CookieConsent (z-50) wins the bottom edge over this (z-30).
 */
export function StickyCtaBar() {
  const locale = useLocale();
  const t = useTranslations('home');
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  useEffect(() => {
    let cta: Element | null = null;
    setVisible(false);

    // Plain scroll listener rather than an IntersectionObserver: rect reads
    // are cheap, the logic stays inspectable, and IO callbacks proved
    // unreliable under throttled/background rendering.
    const evaluate = () => {
      // Re-query lazily — the tagged CTA may mount late or be swapped out by
      // a client-side navigation.
      if (!cta || !cta.isConnected) cta = document.querySelector('[data-primary-cta]');
      if (cta) {
        // Visible only once the CTA is fully ABOVE the viewport (scrolled
        // past), not merely off-screen below it before the user reaches it.
        setVisible(cta.getBoundingClientRect().bottom < 0);
      } else {
        setVisible(window.scrollY > SCROLL_THRESHOLD);
      }
    };

    // Late-mount grace: a page whose CTA streams in after this effect would
    // otherwise briefly use the fallback threshold.
    const retryTimer = setTimeout(evaluate, CTA_QUERY_RETRY_MS);

    evaluate();
    window.addEventListener('scroll', evaluate, { passive: true });
    window.addEventListener('resize', evaluate, { passive: true });
    return () => {
      clearTimeout(retryTimer);
      window.removeEventListener('scroll', evaluate);
      window.removeEventListener('resize', evaluate);
    };
  }, [pathname]);

  if (NO_CTA_SUFFIXES.some((s) => pathname.endsWith(s))) return null;

  return (
    <>
      <div
        aria-hidden={!visible}
        className={[
          'fixed inset-x-0 bottom-4 z-30 flex justify-center px-11 md:px-5',
          'transition-[transform,opacity] duration-300 ease-out motion-reduce:transform-none',
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        ].join(' ')}
      >
        <div className="pointer-events-auto flex h-[56px] w-full max-w-[560px] items-center justify-between gap-3 rounded-full border border-black/[0.08] bg-white/85 p-2 ps-5 shadow-[0_16px_44px_-12px_rgba(0,0,0,0.3)] backdrop-blur-md dark:border-white/[0.1] dark:bg-[#0f1114]/85 dark:shadow-[0_16px_44px_-12px_rgba(0,0,0,0.7)]">
          <Link
            href={`/${locale}/support`}
            tabIndex={visible ? 0 : -1}
            className="font-body text-muted hover:text-foreground hidden items-center gap-2 text-[13px] font-medium transition-colors md:flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7m0 3h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {t('stickyCtaSupport')}
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4 md:flex-none">
            <button
              onClick={() => setAuthModal('demo')}
              tabIndex={visible ? 0 : -1}
              className="font-body text-foreground hidden text-[13px] font-medium transition-opacity hover:opacity-70 md:block"
            >
              {t('stickyCtaDemo')}
            </button>
            <button
              onClick={() => setAuthModal('register')}
              tabIndex={visible ? 0 : -1}
              className="font-body bg-accent hover:bg-accent-hover focus-visible:ring-accent flex h-[42px] flex-1 items-center justify-center rounded-full px-6 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,176,80,0.8)] transition-colors focus-visible:outline-none focus-visible:ring-2 md:min-w-[180px] md:flex-none"
            >
              {t('stickyCtaLive')}
            </button>
          </div>
        </div>
      </div>

      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
