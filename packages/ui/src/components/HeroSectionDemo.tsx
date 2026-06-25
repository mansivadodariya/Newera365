'use client';

import { useState, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AuthModal, type AuthModalType } from './AuthModal';
import { SectionKicker } from './SectionKicker';
import { HeroChartCard } from './HeroChartCard';

/* ─── HeroSectionDemo ───────────────────────────────────────────────────
   Demo fork of HeroSection: elevated typographic hierarchy, an accent eyebrow,
   inline spec chips under the CTAs, and an animated chart card (HeroChartCard)
   in place of the static PNG. Theming/typography/CTAs unchanged from the live
   hero. */
export function HeroSectionDemo() {
  const t = useTranslations('home');
  const td = useTranslations('demo');
  const locale = useLocale();
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const tiltWrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Subtle pointer parallax on the chart card — desktop fine-pointers only, and
  // never under reduced motion. Mutates the transform directly (no per-frame
  // React render).
  const handleTilt = (e: MouseEvent<HTMLDivElement>) => {
    const wrap = tiltWrapRef.current;
    const tilt = tiltRef.current;
    if (!wrap || !tilt) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(pointer: fine)').matches
    )
      return;
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const max = 5; // degrees
    tilt.style.transform = `rotateY(${(px * max).toFixed(2)}deg) rotateX(${(-py * max).toFixed(2)}deg)`;
  };
  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = '';
  };

  // Entrance animation is CSS-driven (motion-safe:animate-rise-in + a staggered
  // animationDelay per element). This MUST stay visible-by-default: an earlier
  // version set inline `opacity: 0` and revealed it via a reduced-motion-gated
  // GSAP effect, which left the whole left column invisible for users with
  // "reduce motion" enabled (and if the gsap chunk failed to load). Never
  // re-introduce a base opacity:0 here without a no-JS/reduced-motion fallback.
  const RISE = 'motion-safe:animate-rise-in';

  const specs = [
    { label: t('heroSpreadLabel'), value: t('heroSpreadValue') },
    { label: t('heroLeverageLabel'), value: t('heroLeverageValue') },
    { label: t('heroExecutionLabel'), value: t('heroExecutionValue') },
  ];

  return (
    <>
      <section className="overflow-hidden bg-transparent px-5 pb-7 pt-9 xl:pb-10 xl:pt-16">
        <div className="mx-auto flex max-w-[390px] flex-col gap-7 md:max-w-2xl xl:max-w-[1200px] xl:flex-row xl:items-center xl:gap-16">
          {/* Left col */}
          <div className="flex flex-col gap-[18px] xl:w-[516px] xl:flex-shrink-0 xl:pb-10 xl:pt-4">
            <SectionKicker
              className={`text-accent [&>span:first-child]:bg-accent ${RISE}`}
              style={{ animationDelay: '80ms' }}
            >
              {td('heroEyebrow')}
            </SectionKicker>

            <h1
              className={`text-foreground font-sans text-[44px] font-semibold leading-[1.0] tracking-[-1.6px] xl:text-[56px] xl:tracking-[-2.2px] ${RISE}`}
              style={{ animationDelay: '200ms' }}
            >
              {t('heroLine1')}{' '}
              <span className="dark:text-accent text-[#0d7a3e]">{t('heroPremium')}</span>{' '}
              {t('heroLine2')}
            </h1>

            <p
              className={`font-body text-muted max-w-[360px] text-[15px] leading-[155%] ${RISE}`}
              style={{ animationDelay: '320ms' }}
            >
              {t('heroSubtitle')}
            </p>

            <div
              className={`flex flex-wrap items-center gap-3 ${RISE}`}
              style={{ animationDelay: '440ms' }}
            >
              {/* Primary CTA — deliberately the dominant element on the page:
                  larger, brighter green gradient + glow, lifts on hover. */}
              <button
                onClick={() => setAuthModal('register')}
                className="font-body from-accent to-accent-bright inline-flex flex-none items-center gap-2 rounded-full bg-gradient-to-r px-8 py-[18px] text-[16px] font-semibold tracking-[-0.075px] text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)]"
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
                className="font-body border-border text-foreground hover:border-accent hover:text-accent inline-flex flex-none items-center rounded-full border px-[22px] py-[18px] text-[15px] font-medium tracking-[-0.075px] transition-colors"
              >
                {t('heroCTADemo')}
              </button>
              {/* Tertiary — quiet text link, no visual weight. */}
              <Link
                href={`/${locale}/contact`}
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

            {/* Inline spec chips (restyle of the original specs row) */}
            <div
              className={`flex flex-wrap items-center gap-2 pt-1 ${RISE}`}
              style={{ animationDelay: '560ms' }}
            >
              {specs.map((spec) => (
                <span
                  key={spec.value}
                  className="border-border flex items-center gap-1.5 rounded-full border bg-black/[0.03] px-3 py-1.5 dark:bg-white/[0.05]"
                >
                  <span className="text-muted font-mono text-[9px] uppercase tracking-[0.1em]">
                    {spec.label}
                  </span>
                  <span className="text-foreground font-sans text-[12px] font-semibold">
                    {spec.value}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Right col: animated chart card with pointer parallax */}
          <div
            ref={tiltWrapRef}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
            className="animate-rise-in opacity-0 [perspective:1400px] motion-reduce:animate-none motion-reduce:opacity-100 xl:min-w-0 xl:flex-1"
            style={{ animationDelay: '0.2s' }}
          >
            <div
              ref={tiltRef}
              className="transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d]"
            >
              <HeroChartCard />
            </div>
          </div>
        </div>
      </section>
      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
