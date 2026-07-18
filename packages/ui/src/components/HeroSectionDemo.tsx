'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from './AuthModal';

/* ─── HeroSectionDemo ───────────────────────────────────────────────────
   Ink-plate hero (client art drop, 2026-07-13). The whole section rides on a
   full-bleed signal-peak artwork (hero-signal-peak.jpg: glowing price apex +
   faint candles, atmosphere not UI). The end column carries the STATIC global-
   markets artwork (hero-globe-orbit.png: globe + five asset tiles on green
   rings, one flat PNG — client asked to keep it static). Desktop-only: hidden
   below xl so the mobile hero is the ink plate + copy alone.

   The standing rule holds: no fake terminal/chart UI in the hero, ever. Both
   plates are brand art, not simulated interfaces. */

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
  let wordCount = 0;
  const headlineLines = [
    { text: t('heroLine1'), premium: false },
    { text: t('heroLine2'), premium: false },
    { text: t('heroPremium'), premium: true },
  ]
    .filter((l) => l.text.trim().length > 0)
    .map((l) => ({
      premium: l.premium,
      words: l.text
        .split(' ')
        .filter(Boolean)
        .map((text) => ({ text, i: wordCount++ })),
    }));

  return (
    <>
      <section className="relative overflow-hidden bg-[#050B07] px-5 pb-14 pt-12 md:pt-14 xl:pb-16 xl:pt-20">
        {/* Signal-peak plate — full-bleed ink artwork in both themes. A soft
            uniform veil keeps the type crisp over the glow, an xl-only
            start-side scrim deepens the text column (flipped for RTL), and a
            bottom seam lands the section into the Edge ink band below. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
          <Image
            src="/images/hero-signal-peak.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-contain object-center xl:object-cover"
          />
          <div className="absolute inset-0 bg-black/45 xl:bg-black/30" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#020704]/[0.72] via-[#020704]/[0.28] to-transparent xl:block rtl:bg-gradient-to-l" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--ink)]" />
        </div>

        <div className="relative mx-auto w-full max-w-[1200px]">
          <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-start xl:gap-6">
            <div className="flex flex-col items-center text-center xl:items-start xl:text-start">
              {/* Eyebrow */}
              <div className={`flex items-center gap-2 ${RISE}`} style={{ animationDelay: '80ms' }}>
                <span className="bg-accent block h-px w-[22px] flex-shrink-0" />
                <span className="text-accent text-eyebrow font-mono font-medium uppercase">
                  {td('heroEyebrow')}
                </span>
              </div>

              <h1 className="text-display mt-6 max-w-[900px] font-sans text-white">
                {headlineLines.map((line, li) => (
                  <span key={li} className="block">
                    {line.words.map((w) => (
                      <span
                        key={w.i}
                        className={`${RISE} me-[0.22em] inline-block`}
                        style={{ animationDelay: `${180 + w.i * 55}ms` }}
                      >
                        {w.text}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>

              <p
                className={`font-body text-lead mt-5 max-w-[620px] text-white/[0.78] ${RISE}`}
                style={{ animationDelay: '320ms' }}
              >
                {t('heroSubtitle')}
              </p>

              <div
                className={`mt-8 flex flex-wrap items-center justify-center gap-3 xl:justify-start ${RISE}`}
                style={{ animationDelay: '440ms' }}
              >
                {/* Primary CTA — deliberately the dominant element on the page:
                    larger, brighter green gradient + glow, presses on click. */}
                <button
                  onClick={() => setAuthModal('register')}
                  data-primary-cta="hero"
                  className="font-body bg-accent hover:bg-accent-hover inline-flex flex-none items-center gap-2 rounded-full px-8 py-[18px] text-[16px] font-semibold tracking-[-0.075px] text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all duration-300 hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)] active:scale-[0.98]"
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
                  className="font-body hover:border-accent-bright hover:text-accent-bright inline-flex flex-none items-center rounded-full border border-white/[0.22] bg-white/[0.06] px-[22px] py-[18px] text-[15px] font-medium tracking-[-0.075px] text-white backdrop-blur-sm transition-colors"
                >
                  {t('heroCTADemo')}
                </button>
                {/* Tertiary — quiet text link, no visual weight. */}
                <Link
                  href={`/${locale}/support`}
                  className="font-body hover:text-accent-bright inline-flex flex-none items-center gap-1 px-2 py-[18px] text-[14px] font-medium text-white/[0.66] transition-colors"
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
            </div>

            {/* Global-markets artwork — the STATIC flat orbit PNG (globe + five
                asset tiles on green rings, baked into one image; client asked to
                keep it static). Nudged toward the page edge on xl (flips in RTL).
                Desktop-only: hidden below xl so the mobile hero is the ink plate
                + copy alone; no priority, so it is never fetched on mobile.
                Decorative → empty alt. */}
            <div
              className={`relative mx-auto hidden w-[min(82vw,400px)] xl:block xl:w-full ${RISE}`}
              style={{ animationDelay: '380ms' }}
            >
              <Image
                src="/images/hero-globe-orbit.png"
                alt=""
                width={1062}
                height={997}
                sizes="520px"
                className="h-auto w-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.5)] xl:translate-x-6 xl:rtl:-translate-x-6"
              />
            </div>
          </div>

          {/* Edge bar — the three headline claims in the house hairline lattice,
              on ink glass. Its OWN full-width row below the grid so it never
              competes with the globe column for width (earlier it clipped). */}
          <div
            className={`mt-10 flex justify-center xl:mt-12 ${RISE}`}
            style={{ animationDelay: '560ms' }}
          >
            <div className="inline-flex max-w-full flex-col overflow-hidden rounded-[18px] border border-white/[0.14] bg-white/[0.05] backdrop-blur-sm sm:flex-row">
              {specs.map((spec, i) => (
                <span
                  key={spec.value}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 ${
                    i > 0 ? 'border-t border-white/[0.14] sm:border-s sm:border-t-0' : ''
                  }`}
                >
                  <span className="bg-accent/[0.22] text-accent-bright flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px]">
                    {spec.label}
                  </span>
                  <span className="whitespace-nowrap font-sans text-[14px] font-semibold text-white">
                    {spec.value}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
