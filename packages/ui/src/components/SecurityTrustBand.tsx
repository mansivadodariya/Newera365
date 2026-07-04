'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

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
    <section className="px-5 pb-12 pt-2 xl:pb-16">
      <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <div className="border-border overflow-hidden rounded-[24px] border bg-white dark:bg-[#101318]">
          <div className="grid xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Intro column */}
            <div className="border-border flex flex-col justify-between gap-8 border-b p-7 xl:border-b-0 xl:border-e xl:p-9">
              <div>
                <SectionKicker className="text-foreground [&>span:first-child]:bg-accent mb-4">
                  {t('securityKicker')}
                </SectionKicker>
                <h2 className="text-foreground whitespace-pre-line font-sans text-[28px] font-semibold leading-[110%] tracking-[-0.56px] xl:text-[32px]">
                  {t('securityHeading')}
                </h2>
                <p className="font-body text-muted mt-4 max-w-[42ch] text-[14px] leading-[1.6]">
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
                <div key={titleKey} className={`border-border p-7 ${CELL_BORDERS[i]}`}>
                  <span className="text-accent font-mono text-[11px] font-medium tracking-[0.18em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-foreground mt-3 font-sans text-[16px] font-semibold leading-snug">
                    {t(titleKey)}
                  </h3>
                  <p className="font-body text-muted mt-1.5 text-[13px] leading-[1.55]">
                    {t(subKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
