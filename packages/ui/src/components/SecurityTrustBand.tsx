'use client';

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

/* Hairline dividers for the 2×2 ledger: single column on mobile (border-b on
   all but the last), 2×2 from `sm` (inner column + row rules only). Logical
   `border-e` keeps the rules correct under RTL. */
const CELL_BORDERS = [
  'border-b sm:border-e',
  'border-b',
  'border-b sm:border-b-0 sm:border-e',
  '',
] as const;

/* One safeguard glyph per cell (shield, encryption lock, segregated layers,
   downside protection). Inline SVG keeps the ledger imagery-free but alive. */
const ICONS = [
  <svg
    key="0"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    <path d="M9 1.6 3 4.1v4.4c0 3.6 2.5 6.2 6 7.5 3.5-1.3 6-3.9 6-7.5V4.1L9 1.6Z" />
    <path d="m6.4 8.7 1.8 1.8 3.4-3.6" />
  </svg>,
  <svg
    key="1"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    <rect x="3.4" y="8" width="11.2" height="7.6" rx="1.6" />
    <path d="M5.6 8V6.1a3.4 3.4 0 0 1 6.8 0V8" />
  </svg>,
  <svg
    key="2"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    <path d="M9 2 2.6 5 9 8l6.4-3L9 2Z" />
    <path d="m2.6 9 6.4 3 6.4-3" />
    <path d="m2.6 12.6 6.4 3 6.4-3" />
  </svg>,
  <svg
    key="3"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    <path d="M2.6 15.4h12.8" />
    <path d="M5 11.8 8 8.8l2.4 2.4L15 6.6" />
  </svg>,
] as const;

/**
 * "How your capital is protected" — a split panel: intro column (kicker,
 * heading, link to the legal library) beside a numbered 2×2 ledger of the four
 * safeguards, separated by hairline rules instead of floating icon cards.
 * Sits under the stats so numbers are immediately followed by safeguards
 * (client feedback round 2, #3; redesigned round 3, #4).
 */
export function SecurityTrustBand() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="px-5 pb-10 pt-2 xl:pb-12">
      <ScrollReveal className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div className="border-border overflow-hidden rounded-[24px] border bg-white dark:bg-[#101318]">
          <div className="grid xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Intro column */}
            <div className="border-border flex flex-col justify-between gap-8 border-b p-7 xl:border-b-0 xl:border-e xl:p-9">
              <div>
                <SectionKicker className="text-foreground [&>span:first-child]:bg-accent mb-4">
                  {t('securityKicker')}
                </SectionKicker>
                <h2 className="text-foreground text-headline-sm whitespace-pre-line font-sans">
                  {t('securityHeading')}
                </h2>
                <p className="font-body text-muted text-body mt-4 max-w-[42ch]">
                  {t('securityIntro')}
                </p>
              </div>
              <Link
                href={`/${locale}/legal`}
                className="font-body text-foreground hover:text-accent inline-flex items-center gap-1.5 text-[14px] font-medium transition-colors"
              >
                {t('securityLegalLink')}
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

            {/* Numbered safeguard ledger */}
            <div className="grid sm:grid-cols-2">
              {ITEMS.map(({ titleKey, subKey }, i) => (
                <div
                  key={titleKey}
                  className={`border-border hover:bg-accent/[0.04] p-7 transition-colors ${CELL_BORDERS[i]}`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="bg-accent/[0.10] text-accent flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]">
                      {ICONS[i]}
                    </span>
                    <span className="text-accent font-mono text-[11px] font-medium tracking-[0.18em]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-foreground font-sans text-[17px] font-semibold leading-snug">
                    {t(titleKey)}
                  </h3>
                  <p className="font-body text-muted text-body mt-1.5">{t(subKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
