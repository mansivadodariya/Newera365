'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

export interface MediaPressItem {
  id: number | string;
  headline: string;
  publication: string;
  date: string;
  url?: string | null;
  excerpt?: string | null;
  logoUrl?: string | null;
  isFeatured?: boolean | null;
  sortOrder?: number | null;
}

interface MediaPressPageProps {
  items?: MediaPressItem[];
}

const FEATURED_IN = ['Bloomberg', 'Reuters', 'Finance Magnates', 'FX Empire', 'Investing.com'];

const BRAND_ASSETS = [
  { nameKey: 'logoPack', formatKey: 'logoPackFormat', color: '#00B050' },
  { nameKey: 'brandGuidelines', formatKey: 'brandGuidelinesFormat', color: '#3B82F6' },
  { nameKey: 'factSheet', formatKey: 'factSheetFormat', color: '#F59E0B' },
  { nameKey: 'headshots', formatKey: 'headshotsFormat', color: '#8B5CF6' },
] as const;

const STATS = [
  { valueKey: 'statsMT5', labelKey: 'statsMT5Label' },
  { valueKey: 'statsInstruments', labelKey: 'statsInstrumentsLabel' },
  { valueKey: 'statsInsurance', labelKey: 'statsInsuranceLabel' },
  { valueKey: 'statsSupport', labelKey: 'statsSupportLabel' },
  { valueKey: 'statsOptions', labelKey: 'statsOptionsLabel' },
  { valueKey: 'statsFunds', labelKey: 'statsFundsLabel' },
] as const;

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function FileIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
      <rect width="28" height="34" rx="5" fill={color} fillOpacity="0.12" />
      <path
        d="M7 8h9l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M16 8v5h5" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 18h10M9 22h7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MediaPressPage({ items: cmsItems }: MediaPressPageProps) {
  const t = useTranslations('mediaPress');

  const items = cmsItems ?? [];
  const sorted = [...items].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  // External press coverage = not featured; newsroom press releases = featured
  const coverageItems = sorted.filter((i) => !i.isFeatured);
  const newsroomItems = sorted.filter((i) => i.isFeatured);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-accent/20 [&>span:last-child]:text-accent mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[38px] font-semibold leading-[1.05] tracking-[-1.14px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[310px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── Press coverage list ── */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-accent/10 [&>span:last-child]:text-accent mb-5">
            {t('pressKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px]">
            {t('pressHeading')}
          </h2>
          <div className="flex flex-col">
            {coverageItems.length === 0 && (
              <p className="font-body text-muted py-12 text-center text-[14px]">
                {t('noCoverage')}
              </p>
            )}
            {coverageItems.map((item, i) => (
              <div
                key={item.id}
                className={`py-5 ${i < coverageItems.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#1a1c22]' : ''}`}
              >
                {/* Publication label */}
                <span className="font-body text-accent mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em]">
                  {item.publication.toUpperCase().replace(/\s+/g, '.')}
                </span>
                {/* Headline */}
                {item.url ? (
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <p className="text-foreground group-hover:text-accent font-sans text-[15px] font-semibold leading-[1.35] transition-colors">
                      {item.headline}
                    </p>
                  </Link>
                ) : (
                  <p className="text-foreground font-sans text-[15px] font-semibold leading-[1.35]">
                    {item.headline}
                  </p>
                )}
                {/* Excerpt */}
                {item.excerpt && (
                  <p className="font-body text-muted mt-1.5 text-[13px] leading-[1.5]">
                    {item.excerpt}
                  </p>
                )}
                {/* Date + read link */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-body text-muted/70 text-[12px]">
                    {formatDate(item.date)}
                  </span>
                  {item.url && (
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent font-body text-[12px] font-medium transition-opacity hover:opacity-80"
                    >
                      {t('readMore')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured in strip ── */}
      <section className="border-y border-[#e5e7eb] px-5 py-6 dark:border-[#1a1c22]">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body text-muted/50 mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em]">
            — {t('featuredInLabel')} —
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {FEATURED_IN.map((pub) => (
              <span key={pub} className="font-body text-muted text-[13px] font-medium">
                {pub}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Media kit ── */}
      <section className="rounded-[32px] bg-[#f2f2f7] px-5 pb-9 pt-10 dark:bg-[#0f0f14]">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-[#d0d0d8] dark:[&>span:first-child]:bg-[#1a1c22] [&>span:last-child]:text-[#6B7280]">
            {t('assetsKicker')}
          </SectionKicker>
          <h2 className="text-foreground mb-6 font-sans text-[24px] font-semibold leading-[1.1] tracking-[-0.48px]">
            {t('assetsHeading')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {BRAND_ASSETS.map(({ nameKey, formatKey, color }) => (
              <div
                key={nameKey}
                className="bg-surface hover-lift flex flex-col gap-3 rounded-[18px] p-4"
              >
                <FileIcon color={color} />
                <div className="flex-1">
                  <p className="text-foreground font-sans text-[13px] font-semibold">
                    {t(nameKey as 'logoPack')}
                  </p>
                  <p className="font-body text-muted text-[11px]">
                    {t(formatKey as 'logoPackFormat')}
                  </p>
                </div>
                <button
                  className="font-body text-foreground/70 dark:border-border hover:border-foreground/40 rounded-full border border-[#d0d0d8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors"
                  aria-label={`Download ${t(nameKey as 'logoPack')}`}
                >
                  {t('downloadBtn')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── By the numbers ── */}
      <section className="px-5 py-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body text-muted/50 mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.2em]">
            — {t('statsLabel')} —
          </p>
          <div className="grid grid-cols-3 gap-y-6">
            {STATS.map(({ valueKey, labelKey }) => (
              <div key={valueKey} className="flex flex-col items-center gap-1">
                <p className="text-foreground font-sans text-[26px] font-bold leading-none">
                  {t(valueKey as 'statsMT5')}
                </p>
                <p className="font-body text-muted text-center text-[9px] font-semibold uppercase tracking-[0.1em]">
                  {t(labelKey as 'statsMT5Label')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest from the newsroom ── */}
      {newsroomItems.length > 0 && (
        <section className="px-5 pb-10">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="[&>span:first-child]:bg-accent/10 [&>span:last-child]:text-accent mb-5">
              {t('newsroomKicker')}
            </SectionKicker>
            <h2 className="text-foreground mb-6 font-sans text-[24px] font-semibold leading-[1.1] tracking-[-0.48px]">
              {t('newsroomHeading')}
            </h2>
            <div className="flex flex-col">
              {newsroomItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-4 py-4 ${i < newsroomItems.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#1a1c22]' : ''}`}
                >
                  <div className="min-w-0">
                    <p className="font-body text-muted mb-1 text-[11px]">{formatDate(item.date)}</p>
                    {item.url ? (
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                      >
                        <p className="text-foreground group-hover:text-accent font-sans text-[14px] font-semibold leading-[1.3] transition-colors">
                          {item.headline}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-foreground font-sans text-[14px] font-semibold leading-[1.3]">
                        {item.headline}
                      </p>
                    )}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-accent flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Media inquiries ── */}
      <section className="px-5 pb-12">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="rounded-[22px] bg-[#f2f2f7] px-6 py-8 text-center dark:bg-[#0f0f14]">
            <SectionKicker className="[&>span:first-child]:bg-accent/20 [&>span:last-child]:text-accent mb-4 justify-center">
              {t('inquiriesKicker')}
            </SectionKicker>
            <h2 className="text-foreground mb-3 font-sans text-[22px] font-semibold">
              {t('inquiriesHeading')}
            </h2>
            <p className="font-body text-muted mb-5 text-[13px] leading-[1.55]">
              {t('inquiriesDesc')}
            </p>
            <a
              href={`mailto:${t('inquiriesEmail')}`}
              className="text-accent mb-2 block font-sans text-[18px] font-semibold transition-opacity hover:opacity-80"
            >
              {t('inquiriesEmail')}
            </a>
            <a
              href={`tel:${t('inquiriesPhone')}`}
              className="text-foreground font-body mb-4 block text-[14px] font-medium transition-opacity hover:opacity-70"
            >
              {t('inquiriesPhone')}
            </a>
            <p className="font-body text-muted/60 text-[11px] font-semibold uppercase tracking-[0.12em]">
              {t('inquiriesAlt')}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-11">
        <div className="mx-auto flex max-w-[390px] flex-col items-center md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 text-center font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] text-white">
            {t('ctaHeading')}
            <br />
            <span className="text-accent">{t('ctaAccent')}</span>
          </h2>
          <p className="font-body mb-6 max-w-[280px] text-center text-[13px] text-white/60">
            {t('ctaSubtitle')}
          </p>
        </div>
      </section>
    </>
  );
}
