'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
export interface AwardCardItem {
  id: number | string;
  title: string;
  organisation?: string | null;
  year?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  externalUrl?: string | null;
}

interface AwardsPageProps {
  awards?: AwardCardItem[];
}

// Card background gradients — cycle through for visual variety
const CARD_GRADIENTS = [
  'from-[#0d2a1a] to-[#0a1510]',
  'from-[#1a1a0a] to-[#0f0f08]',
  'from-[#0a1a2a] to-[#060d18]',
  'from-[#1a0a1a] to-[#0f060f]',
  'from-[#1a0f0a] to-[#100806]',
  'from-[#0a1a1a] to-[#060f0f]',
];

export function AwardsPage({ awards: cmsAwards }: AwardsPageProps) {
  const locale = useLocale();
  const t = useTranslations('awards');

  const items = cmsAwards ?? [];

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[38px] font-semibold leading-[1.05] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Award cards */}
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto flex max-w-[390px] flex-col gap-[14px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-2">
          {items.length === 0 && (
            <p className="font-body text-muted col-span-2 py-12 text-center text-[14px]">
              {t('noAwards')}
            </p>
          )}
          {items.map((award, idx) => {
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]!;
            return (
              <div
                key={award.id}
                className={`flex flex-col overflow-hidden rounded-[22px] bg-gradient-to-br ${gradient} shadow-card dark:shadow-none`}
              >
                {/* Image / illustration area */}
                {award.imageUrl ? (
                  <img
                    src={award.imageUrl}
                    alt={award.title}
                    className="h-[180px] w-full object-cover"
                  />
                ) : (
                  /* Decorative placeholder — green grid pattern */
                  <div className="relative h-[160px] w-full overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, #00b050 0, #00b050 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #00b050 0, #00b050 1px, transparent 0, transparent 50%)',
                        backgroundSize: '32px 32px',
                      }}
                    />
                    {/* Award trophy icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M24 8L28 18H40L30 24L34 36L24 30L14 36L18 24L8 18H20L24 8Z"
                          fill="#00b050"
                          opacity="0.3"
                        />
                        <path
                          d="M24 12L27 20H37L29 25.5L32 34L24 28.5L16 34L19 25.5L11 20H21L24 12Z"
                          stroke="#00b050"
                          strokeWidth="1.5"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Card body */}
                <div className="p-5">
                  {award.year && (
                    <span className="mb-3 inline-flex rounded-full bg-white/10 px-2.5 py-[3px] font-mono text-[10px] tracking-[1.2px] text-white/60">
                      {award.year}
                    </span>
                  )}
                  <h2 className="mb-1 font-sans text-[18px] font-semibold leading-[1.2] text-white">
                    {award.title}
                  </h2>
                  {award.organisation && (
                    <p className="font-body mb-3 text-[12px] text-white/50">{award.organisation}</p>
                  )}
                  {award.description && (
                    <p className="font-body text-[13px] leading-[1.5] text-white/60">
                      {award.description}
                    </p>
                  )}
                  {award.externalUrl && (
                    <Link
                      href={award.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body mt-4 flex items-center gap-1.5 text-[12px] text-white/40 transition-colors hover:text-white/70"
                    >
                      View announcement
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 12L12 2M12 2H6M12 2v6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-transparent px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[18px] bg-[#e5e7eb] dark:bg-[#1a1c22]">
            {[
              { value: '$34M+', label: t('statsSegregated') },
              { value: '2,000+', label: t('statsActiveTraders') },
              { value: '24/7', label: t('statsSupportLabel') },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-[4px] bg-[#f2f2f7] px-4 py-5 dark:bg-[#0f0f14]"
              >
                <span className="text-foreground font-sans text-[20px] font-semibold">{value}</span>
                <span className="font-body text-muted text-center text-[11px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-11">
        <div className="mx-auto flex max-w-[390px] flex-col items-center gap-0 md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 text-center font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] text-white">
            {t('ctaHeading')}
            <br />
            <span className="text-accent">{t('ctaAccent')}</span>
          </h2>
          <p className="font-body mb-6 max-w-[280px] text-center text-[13px] text-white/60">
            {t('ctaSubtitle')}
          </p>
          <Link
            href={`/${locale}/register`}
            className="bg-accent hover:bg-accent/90 font-body mb-3 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-white transition-colors"
          >
            {t('ctaBtn')}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href={`/${locale}/register?type=demo`}
            className="font-body text-[14px] font-medium text-white/60 transition-opacity hover:opacity-80"
          >
            {t('ctaDemo')}
          </Link>
        </div>
      </section>
    </>
  );
}
