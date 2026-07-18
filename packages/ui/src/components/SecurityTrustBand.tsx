'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

const ITEMS = [
  { titleKey: 'security1Title', subKey: 'security1Sub' },
  { titleKey: 'security2Title', subKey: 'security2Sub' },
  { titleKey: 'security3Title', subKey: 'security3Sub' },
  { titleKey: 'security4Title', subKey: 'security4Sub' },
] as const;

/* One safeguard glyph per row (shield, encryption lock, segregated layers,
   downside protection). pathLength=1 normalizes every stroke so the draw-in
   below needs no per-path measurements. */
const ICONS = [
  <svg
    key="0"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[22px] w-[22px]"
    aria-hidden="true"
  >
    <path pathLength={1} d="M9 1.6 3 4.1v4.4c0 3.6 2.5 6.2 6 7.5 3.5-1.3 6-3.9 6-7.5V4.1L9 1.6Z" />
    <path pathLength={1} d="m6.4 8.7 1.8 1.8 3.4-3.6" />
  </svg>,
  <svg
    key="1"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[22px] w-[22px]"
    aria-hidden="true"
  >
    <rect pathLength={1} x="3.4" y="8" width="11.2" height="7.6" rx="1.6" />
    <path pathLength={1} d="M5.6 8V6.1a3.4 3.4 0 0 1 6.8 0V8" />
  </svg>,
  <svg
    key="2"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[22px] w-[22px]"
    aria-hidden="true"
  >
    <path pathLength={1} d="M9 2 2.6 5 9 8l6.4-3L9 2Z" />
    <path pathLength={1} d="m2.6 9 6.4 3 6.4-3" />
    <path pathLength={1} d="m2.6 12.6 6.4 3 6.4-3" />
  </svg>,
  <svg
    key="3"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[22px] w-[22px]"
    aria-hidden="true"
  >
    <path pathLength={1} d="M2.6 15.4h12.8" />
    <path pathLength={1} d="M5 11.8 8 8.8l2.4 2.4L15 6.6" />
  </svg>,
] as const;

/**
 * "How your capital is protected" — a bare editorial ledger (proof content is
 * never a card grid): intro rail beside four numbered hairline rows, ghost
 * numerals carrying the index, and each safeguard glyph drawing its strokes in
 * as the ledger arrives. Static info: no hover states.
 */
export function SecurityTrustBand() {
  const t = useTranslations('home');
  const locale = useLocale();
  const ledgerRef = useRef<HTMLDivElement>(null);
  // 'static' (SSR / reduced motion: strokes fully drawn) → 'armed' → 'drawn'.
  const [phase, setPhase] = useState<'static' | 'armed' | 'drawn'>('static');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ledgerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    setPhase('armed');
    // Same bail-out as SectionKicker: a healthy IO always delivers an initial
    // callback; if it never does, draw everything rather than stay hidden.
    let sawCallback = false;
    const io = new IntersectionObserver(
      (entries) => {
        sawCallback = true;
        if (entries.some((e) => e.isIntersecting)) {
          setPhase('drawn');
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    const bail = window.setTimeout(() => {
      if (!sawCallback) setPhase('drawn');
    }, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(bail);
    };
  }, []);

  return (
    <section className="px-5 pb-10 pt-2 xl:pb-12">
      {/* Stroke draw-in: armed hides strokes (JS is running, so nothing can be
          trapped invisible), drawn traces them; rows stagger via --d. */}
      <style>{`
        .ne-sec-glyph path, .ne-sec-glyph rect {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: var(--d, 0ms);
        }
        .ne-sec-glyph.ne-sec-drawn path, .ne-sec-glyph.ne-sec-drawn rect {
          stroke-dashoffset: 0;
        }
      `}</style>
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div className="grid gap-9 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-14">
          {/* Intro rail */}
          <ScrollReveal>
            <SectionKicker className="mb-4">{t('securityKicker')}</SectionKicker>
            <h2 className="text-foreground text-headline whitespace-pre-line font-sans">
              {t('securityHeading')}
            </h2>
            <p className="font-body text-muted text-body mt-4 max-w-[42ch]">{t('securityIntro')}</p>
            <Link
              href={`/${locale}/legal`}
              className="font-body text-foreground hover:text-accent group mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium transition-colors"
            >
              <span className="link-underline group-hover:[background-size:100%_1px]">
                {t('securityLegalLink')}
              </span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 rtl:-scale-x-100"
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
          </ScrollReveal>

          {/* Safeguard ledger — numbered hairline rows, no cards */}
          <div ref={ledgerRef} className="border-border border-t dark:border-white/[0.08]">
            {ITEMS.map(({ titleKey, subKey }, i) => (
              <ScrollReveal key={titleKey} index={i}>
                <div className="border-border row-hover group grid grid-cols-[auto_1fr_auto] items-start gap-5 border-b py-6 xl:gap-7 xl:py-7 dark:border-white/[0.08]">
                  <span
                    dir="ltr"
                    aria-hidden="true"
                    className="text-foreground group-hover:text-accent dark:text-accent-bright w-[46px] shrink-0 font-sans text-[40px] font-semibold tabular-nums leading-none tracking-tight opacity-[0.08] transition-[color,opacity] duration-200 group-hover:opacity-40 xl:w-[56px] xl:text-[46px] dark:opacity-[0.28] dark:group-hover:opacity-70"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-foreground text-body-lg font-sans font-semibold leading-snug">
                      {t(titleKey)}
                    </h3>
                    <p className="font-body text-muted text-body mt-1.5 max-w-[52ch]">
                      {t(subKey)}
                    </p>
                  </div>
                  <span
                    className={`text-accent group-hover:text-accent-bright mt-1 shrink-0 transition-colors duration-300 ${
                      phase === 'static'
                        ? ''
                        : `ne-sec-glyph${phase === 'drawn' ? 'ne-sec-drawn' : ''}`
                    }`}
                    style={{ '--d': `${i * 140}ms` } as React.CSSProperties}
                  >
                    {ICONS[i]}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
