'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { RevealDemo } from './RevealDemo';
import { CountUp, CountUpGroup } from './CountUp';
import { AuthModal, type AuthModalType } from './AuthModal';
import { Spotlight } from './Spotlight';

/* ─── "Why Newera" proof band ────────────────────────────────────────────────
   The site's signature section (client feedback: the USPs existed but were
   invisible). A full-bleed ink band — identical in light and dark mode — that
   states the reasons to choose Newera365 as four oversized, verifiable
   numbers instead of four small feature cards. Numbers are the product;
   numbers get the stage. */

// The client's six — "The Newera Edge" (USP pitch deck, 2026-07).
// value = the oversized metric; title/desc = its label and one-line proof.
// i18n fallback — used only when the CMS `uspMetrics` array is empty (this is
// a homepage-critical band, not optional content).
const METRICS = [
  { valueKey: 'whyExecution', titleKey: 'whyExecutionTitle', descKey: 'whyExecutionDesc' },
  { valueKey: 'whyWithdraw', titleKey: 'whyWithdrawTitle', descKey: 'whyWithdrawDesc' },
  { valueKey: 'whyABook', titleKey: 'whyABookTitle', descKey: 'whyABookDesc' },
  { valueKey: 'whyManager', titleKey: 'whyManagerTitle', descKey: 'whyManagerDesc' },
  { valueKey: 'whySegregated', titleKey: 'whySegregatedTitle', descKey: 'whySegregatedDesc' },
  { valueKey: 'whyBuilt', titleKey: 'whyBuiltTitle', descKey: 'whyBuiltDesc' },
] as const;

export interface CmsUspMetric {
  valueEn: string;
  valueAr: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  id?: string | null;
}

// Hairline lattice: 1-col mobile, 2-col sm, 3-col xl (logical borders — RTL-safe).
const TILE_BORDERS = [
  '',
  'border-white/10 border-t sm:border-t-0 sm:border-s xl:border-s',
  'border-white/10 border-t xl:border-t-0 xl:border-s',
  'border-white/10 border-t sm:border-s xl:border-s-0',
  'border-white/10 border-t xl:border-s',
  'border-white/10 border-t sm:border-s',
] as const;

// "Beyond the headline six" (deck slide 6).
const USPS = ['usp1', 'usp2', 'usp3', 'usp4', 'usp5', 'usp6'] as const;

export interface FeaturesSectionProps {
  metrics?: CmsUspMetric[];
}

export function FeaturesSection({ metrics }: FeaturesSectionProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  // CMS-driven metrics when present; otherwise fall back to the i18n METRICS
  // constant (this band is homepage-critical, so it always renders 6 tiles).
  const resolvedMetrics =
    metrics && metrics.length > 0
      ? metrics.map((m, i) => ({
          key: m.id ?? `cms-${i}`,
          value: locale === 'ar' ? m.valueAr : m.valueEn,
          title: locale === 'ar' ? m.titleAr : m.titleEn,
          desc: locale === 'ar' ? m.descAr : m.descEn,
        }))
      : METRICS.map(({ valueKey, titleKey, descKey }) => ({
          key: valueKey,
          value: t(valueKey),
          title: t(titleKey),
          desc: t(descKey),
        }));

  return (
    <>
      <section className="ink-band relative overflow-hidden">
        {/* The band answers the cursor: the signal glow spans the FULL bleed
            (padding lives on the Spotlight, not the section, so the overlay
            reaches the band edges instead of clipping at the content column). */}
        <Spotlight size={460} className="px-5 py-14 xl:py-20">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            {/* Header row */}
            <div className="xl:flex xl:items-end xl:justify-between xl:gap-16">
              <div>
                <SectionKicker className="mb-5">
                  {t('whyKicker')}
                </SectionKicker>
                <h2 className="text-headline font-sans text-white [text-wrap:balance]">
                  {t('whyTitle')}
                </h2>
              </div>
              <p className="font-body text-lead mt-4 max-w-[440px] text-white/60 xl:mt-0 xl:flex-shrink-0">
                {t('whySubtitle')}
              </p>
            </div>

            {/* Metric quadrant — the four reasons, stated as numbers */}
            <RevealDemo>
              <CountUpGroup>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:mt-14 xl:grid-cols-3">
                  {resolvedMetrics.map(({ key, value, title, desc }, i) => (
                    <div
                      key={key}
                      className={`group relative flex flex-col gap-4 px-1 py-8 transition-colors duration-300 hover:bg-accent/[0.08] sm:px-8 sm:py-9 xl:px-10 ${TILE_BORDERS[i]}`}
                    >
                      {/* Accent rule draws across the hovered tile: the lattice
                        marks which metric you are reading. */}
                      <span
                        aria-hidden="true"
                        className="bg-accent-bright/80 absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 rtl:origin-right"
                      />
                      {/* dir=ltr keeps "< 12 ms" glyph order in Arabic; w-fit lets the
                      flex column place it at the logical start in both directions */}
                      <span
                        dir="ltr"
                        className="text-sheen text-metric w-fit font-sans tabular-nums"
                      >
                        <CountUp value={value} />
                      </span>
                      <div>
                        <p className="text-body-lg group-hover:text-accent-bright font-sans font-semibold text-white transition-colors duration-300">
                          {title}
                        </p>
                        <p className="font-body text-body mt-1.5 max-w-[36ch] text-white/55 transition-colors duration-300 group-hover:text-white/70">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CountUpGroup>
            </RevealDemo>

            <p className="font-body text-caption mt-2 text-white/35">{t('whyMetricsNote')}</p>

            {/* USP proof strip */}
            <div className="mt-10 border-t border-white/10 pt-8 xl:mt-14">
              <p className="text-eyebrow font-mono font-medium uppercase text-white/45">
                {t('uspHeading')}
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {USPS.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="bg-accent/20 text-accent-bright mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 6.4l2.3 2.3L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="font-body text-body font-medium text-white/85">{t(key)}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs — same hierarchy as the hero: one dominant action */}
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setAuthModal('register')}
                  className="font-body from-accent to-accent-bright inline-flex flex-none items-center gap-2 rounded-full bg-gradient-to-r px-7 py-4 text-[15px] font-semibold text-white shadow-[0_16px_44px_-12px_rgba(0,176,80,0.85)] transition-all duration-300 hover:shadow-[0_22px_52px_-12px_rgba(26,217,102,0.95)] active:scale-[0.98]"
                >
                  {t('heroCTALive')}
                  <svg
                    width="15"
                    height="15"
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
                <Link
                  href={`/${locale}/trade/accounts`}
                  className="font-body hover:border-accent-bright/60 inline-flex flex-none items-center gap-1.5 rounded-full border border-white/15 px-6 py-4 text-[15px] font-medium text-white/85 transition-colors hover:text-white"
                >
                  {t('whyCtaCompare')}
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
          </div>
        </Spotlight>
      </section>
      <AuthModal type={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
}
