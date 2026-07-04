'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { norm, humanize, distinctCategories } from './filterUtils';

export interface AwardCardItem {
  id: number | string;
  title: string;
  organisation?: string | null;
  year?: string | null;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  externalUrl?: string | null;
}

interface AwardsPageProps {
  awards?: AwardCardItem[];
}

// Inline medal icon (Lucide "award"), drawn with currentColor so it inverts
// with the theme — matches the inline-SVG icon idiom used across the site.
function IconAward() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

const YEAR_FILTERS = ['ALL', '2026', '2025', '2024', '2023'] as const;
const FALLBACK_CATS = ['Execution', 'Service', 'Innovation'];
type YearFilter = (typeof YEAR_FILTERS)[number];

export function AwardsPage({ awards: cmsAwards }: AwardsPageProps) {
  const t = useTranslations('awards');

  const CAT_I18N: Record<string, string> = {
    Execution: t('catExecution'),
    Service: t('catService'),
    Innovation: t('catInnovation'),
  };
  const translateCat = (c: string) => (c === 'ALL' ? t('filterAll') : (CAT_I18N[c] ?? humanize(c)));

  const [yearFilter, setYearFilter] = useState<YearFilter>('ALL');
  const [catFilter, setCatFilter] = useState<string>('ALL');

  const allItems = cmsAwards ?? [];
  // Filter tabs reflect the real CMS awardCategory values; fall back to the
  // canonical set for legacy awards that have none.
  const dataCats = distinctCategories(allItems, (a) => a.category);
  const catFilters = ['ALL', ...(dataCats.length ? dataCats : FALLBACK_CATS)];
  const items = allItems.filter((a) => {
    const yearOk = yearFilter === 'ALL' || a.year === yearFilter;
    const catOk =
      catFilter === 'ALL' ||
      (a.category
        ? norm(a.category) === norm(catFilter)
        : `${a.description ?? ''} ${a.title ?? ''}`
            .toLowerCase()
            .includes(catFilter.toLowerCase()));
    return yearOk && catOk;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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

      {/* Filter tabs */}
      <section className="bg-transparent px-5 pb-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Year filter */}
          <div className="mb-3 flex flex-wrap gap-2">
            {YEAR_FILTERS.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`font-body flex-shrink-0 rounded-full px-3 py-[7px] text-[12px] font-medium transition-colors ${
                  yearFilter === y
                    ? 'bg-[#111] text-white dark:bg-white dark:text-[#111]'
                    : 'bg-[#f2f2f4] text-[#6b7280] hover:bg-[#e5e5e5] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e]'
                }`}
              >
                {y === 'ALL' ? t('filterAll') : y}
              </button>
            ))}
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {catFilters.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`font-body flex-shrink-0 rounded-full px-3 py-[7px] text-[12px] font-medium transition-colors ${
                  catFilter === c
                    ? 'bg-accent text-white'
                    : 'bg-accent/10 text-accent hover:bg-accent/15'
                }`}
              >
                {translateCat(c)}
              </button>
            ))}
          </div>
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
          {items.map((award) => (
            <div
              key={award.id}
              className="border-border hover-lift shadow-card dark:shadow-card-dark group relative flex flex-col overflow-hidden rounded-[20px] border bg-white p-6 dark:bg-[#111316]"
            >
              {/* Photographic header — real imagery from the CMS (never the old
                  placeholder text-banners). Falls back to a plain header row
                  when no image is set. */}
              {award.imageUrl && (
                <img
                  src={award.imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="mb-5 h-[150px] w-full rounded-[14px] object-cover"
                />
              )}

              {/* Header: issuer medal + year/category micro-labels */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="bg-accent/[0.12] text-accent flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]">
                  <IconAward />
                </span>
                <span className="text-muted font-mono text-[11px] font-medium uppercase tracking-[0.14em]">
                  {[award.year, award.category ? translateCat(award.category) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>

              {award.organisation && (
                <p className="text-accent mb-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">
                  {award.organisation}
                </p>
              )}
              <h2 className="text-foreground mb-2 font-sans text-[18px] font-semibold leading-[1.2]">
                {award.title}
              </h2>
              {award.description && (
                <p className="font-body text-muted text-[13px] leading-[1.55]">
                  {award.description}
                </p>
              )}
              {award.externalUrl && (
                <Link
                  href={award.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent border-border mt-4 inline-flex items-center gap-1.5 border-t pt-4 text-[12px] font-medium transition-colors"
                >
                  {t('viewAnnouncement')}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="rtl:-scale-x-100"
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
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-transparent px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
    </>
  );
}
