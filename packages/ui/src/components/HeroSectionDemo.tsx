'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from './AuthModal';

/* ─── HeroSectionDemo ───────────────────────────────────────────────────
   Full-width typographic hero. Three visual concepts were rejected in client
   review (static 4K terminal PNG, TradingView panel, code-built SVG terminal)
   — the lesson is that ANY chart-in-a-box reads as broker wallpaper here. The
   hero now carries the claim itself: display type at full measure, the two
   CTAs, and a hairline "Edge bar" with the three headline numbers (same
   lattice voice as the Why-band below). The live-market ticker sits directly
   above and the ink Edge band directly below — the hero doesn't need to
   re-explain the market, it needs to state the offer.

   When premium hero imagery lands (Magnify connector, pending), it enters as
   a framed art slot UNDER this type block — never as another fake UI. */
export function HeroSectionDemo() {
  const t = useTranslations('home');
  const td = useTranslations('demo');
  const locale = useLocale();
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  // Entrance animation is CSS-driven (motion-safe:animate-rise-in + a staggered
  // animationDelay per element). This MUST stay visible-by-default: an earlier
  // version set inline `opacity: 0` and revealed it via a reduced-motion-gated
  // GSAP effect, which left the whole hero invisible for users with "reduce
  // motion" enabled (and if the gsap chunk failed to load). Never re-introduce
  // a base opacity:0 here without a no-JS/reduced-motion fallback.
  const RISE = 'motion-safe:animate-rise-in';

  const specs = [
    { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
    { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
    { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
  ];

  // Headline split into words for a staggered reveal on load. Each word carries
  // motion-safe:animate-rise-in with an incremental delay; reduced motion leaves
  // them plain-visible (never a base opacity:0 — see the note above).
  const headlineWords = [
    ...t('heroLine1')
      .split(' ')
      .filter(Boolean)
      .map((text) => ({ text, premium: false })),
    ...t('heroPremium')
      .split(' ')
      .filter(Boolean)
      .map((text) => ({ text, premium: true })),
    ...t('heroLine2')
      .split(' ')
      .filter(Boolean)
      .map((text) => ({ text, premium: false })),
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-transparent px-5 pb-8 pt-28 md:pt-32 xl:pb-12 xl:pt-40">
        {/* Signal aurora — a slow-drifting signal-green gradient backdrop
            (.hero-aurora in globals.css) that replaces the earlier terminal
            photo plate. It bleeds down from the dark ticker strip above and
            dissolves into the page canvas BEFORE the type block, so the
            headline keeps its theme colours in both modes. The dissolve is
            double-insured: an alpha mask (radial, anchored to the top edge)
            plus a gradient landing into var(--background). The .dark override
            brightens the green over ink; drift is motion-safe (reduced motion
            keeps it static — visibility is never gated on motion). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px] select-none [mask-image:radial-gradient(140%_110%_at_50%_-14%,#000_52%,transparent_92%)] md:h-[640px] xl:h-[800px]"
        >
          <div className="hero-aurora absolute inset-0">
            <div className="hero-aurora__blobs">
              <span className="hero-blob hero-blob-1" />
              <span className="hero-blob hero-blob-2" />
              <span className="hero-blob hero-blob-3" />
              <span className="hero-blob hero-blob-4" />
              <span className="hero-blob hero-blob-5" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
          {/* Per-theme pocket behind the type block — paper in light, ink in
              dark — keeps the type crisp while the flanks stay punchy. */}
          <div className="absolute inset-0 bg-[radial-gradient(58%_54%_at_50%_48%,rgba(242,245,243,0.6),transparent_82%)] dark:hidden" />
          <div className="absolute inset-0 hidden bg-[radial-gradient(58%_54%_at_50%_48%,rgba(7,9,13,0.52),transparent_82%)] dark:block" />
        </div>

        <div className="relative mx-auto flex max-w-[390px] flex-col items-center text-center md:max-w-2xl xl:max-w-[1200px]">
          {/* Eyebrow */}
          <div className={`flex items-center gap-2 ${RISE}`} style={{ animationDelay: '80ms' }}>
            <span className="bg-accent block h-px w-[18px] flex-shrink-0" />
            <span className="text-accent text-eyebrow font-mono font-medium uppercase">
              {td('heroEyebrow')}
            </span>
            <span className="bg-accent block h-px w-[18px] flex-shrink-0" />
          </div>

          <h1 className="text-foreground text-display mt-6 max-w-[840px] font-sans [text-wrap:balance]">
            {headlineWords.map((w, i) => (
              <span
                key={i}
                className={`${RISE} me-[0.26em] inline-block ${w.premium ? 'dark:text-accent text-[#0d7a3e]' : ''}`}
                style={{ animationDelay: `${180 + i * 55}ms` }}
              >
                {w.text}
              </span>
            ))}
          </h1>

          <p
            className={`font-body text-muted text-lead mt-5 max-w-[620px] dark:text-white/[0.78] ${RISE}`}
            style={{ animationDelay: '320ms' }}
          >
            {t('heroSubtitle')}
          </p>

          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-3 ${RISE}`}
            style={{ animationDelay: '440ms' }}
          >
            {/* Primary CTA — deliberately the dominant element on the page:
                larger, brighter green gradient + glow, presses on click. */}
            <button
              onClick={() => setAuthModal('register')}
              data-primary-cta="hero"
              className="font-body from-accent to-accent-bright inline-flex flex-none items-center gap-2 rounded-full bg-gradient-to-r px-8 py-[18px] text-[16px] font-semibold tracking-[-0.075px] text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all duration-300 hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)] active:scale-[0.98]"
            >
              {t('heroCTALive')}
              <svg
                width="16"
                height="16"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="rtl:-scale-x-100"
              >
                <path
                  d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Secondary — clearly subordinate to the primary CTA. */}
            <button
              onClick={() => setAuthModal('demo')}
              className="font-body border-border text-foreground hover:border-accent hover:text-accent inline-flex flex-none items-center rounded-full border bg-white/60 px-[22px] py-[18px] text-[15px] font-medium tracking-[-0.075px] transition-colors dark:bg-transparent"
            >
              {t('heroCTADemo')}
            </button>
            {/* Tertiary — quiet text link, no visual weight. */}
            <Link
              href={`/${locale}/support`}
              className="font-body text-muted hover:text-accent inline-flex flex-none items-center gap-1 px-2 py-[18px] text-[14px] font-medium transition-colors"
            >
              {t('heroCTAContact')}
              <svg
                width="13"
                height="13"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="rtl:-scale-x-100"
              >
                <path
                  d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* Edge bar — the three headline claims in the house hairline lattice.
              Same voice as the Why-band quadrants; check = claim held. */}
          <div
            className={`border-border mt-10 inline-flex max-w-full flex-col overflow-hidden rounded-[18px] border bg-white/75 backdrop-blur-sm sm:flex-row dark:bg-white/[0.04] ${RISE}`}
            style={{ animationDelay: '560ms' }}
          >
            {specs.map((spec, i) => (
              <span
                key={spec.value}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 ${
                  i > 0 ? 'border-border border-t sm:border-s sm:border-t-0' : ''
                }`}
              >
                <span className="bg-accent/[0.12] text-accent flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px]">
                  {spec.label}
                </span>
                <span className="text-foreground whitespace-nowrap font-sans text-[14px] font-semibold">
                  {spec.value}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
