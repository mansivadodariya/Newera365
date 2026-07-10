'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';
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

interface RecognitionPageProps {
  awards?: AwardCardItem[];
  pressItems?: MediaPressItem[];
}

const YEAR_FILTERS = ['ALL', '2026', '2025', '2024', '2023'] as const;
const FALLBACK_CATS = ['Execution', 'Service', 'Innovation'];
type YearFilter = (typeof YEAR_FILTERS)[number];

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

// One container width, shared by every section so the ledger stays on a rail.
const WRAP = 'mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]';
// Accent tick on the section kicker (the page's chapter marker), per DESIGN.md.
const KICKER_TICK = '[&>span:first-child]:!bg-accent';

function formatDate(dateStr: string, locale: string) {
  try {
    // Locale-aware: Arabic month names + numerals on /ar, day-first English on /en.
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// External-link mark (diagonal arrow). Mirrors in RTL.
function ExternalArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={`rtl:-scale-x-100 ${className}`}
    >
      <path
        d="M2 12L12 2M12 2H6M12 2v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Forward chevron for newsroom rows. Mirrors in RTL.
function ChevronArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`rtl:-scale-x-100 ${className}`}
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden="true">
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

function DownloadGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 2v7.5M3.75 6.75 7 10l3.25-3.25M2.5 12h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RecognitionPage({ awards, pressItems }: RecognitionPageProps) {
  const t = useTranslations('recognition');
  const tAwards = useTranslations('awards');
  const tPress = useTranslations('mediaPress');
  const locale = useLocale();

  // Awards data + filter state
  const CAT_I18N: Record<string, string> = {
    Execution: tAwards('catExecution'),
    Service: tAwards('catService'),
    Innovation: tAwards('catInnovation'),
  };
  const translateCat = (c: string) =>
    c === 'ALL' ? tAwards('filterAll') : (CAT_I18N[c] ?? humanize(c));

  const [yearFilter, setYearFilter] = useState<YearFilter>('ALL');
  const [catFilter, setCatFilter] = useState<string>('ALL');

  const allItems = awards ?? [];
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

  // Press data
  const pressAll = pressItems ?? [];
  const sorted = [...pressAll].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  // External press coverage = not featured; newsroom press releases = featured
  const coverageItems = sorted.filter((i) => !i.isFeatured);
  const newsroomItems = sorted.filter((i) => i.isFeatured);
  // "Featured in" wordmarks derive from the real coverage publications (already
  // locale-resolved upstream), not a hardcoded list, so they stay in sync and localize.
  const featuredPublications = [...new Set(coverageItems.map((i) => i.publication))];

  // Terminal-chip filter styles (mono, bordered, never gray fills).
  const chip = (active: boolean) =>
    `tap-scale flex-shrink-0 rounded-full border px-3.5 py-1.5 text-eyebrow font-mono font-medium uppercase transition-colors ${
      active
        ? 'border-accent bg-accent/[0.06] text-accent'
        : 'border-border text-muted hover:border-foreground/30 hover:text-foreground'
    }`;

  return (
    <>
      {/* Hero: the claim, on the record */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className={`motion-safe:animate-rise-in ${WRAP}`}>
          <SectionKicker className={`mb-5 ${KICKER_TICK}`}>{tAwards('kicker')}</SectionKicker>
          <h1 className="text-foreground text-display font-sans">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted text-lead mt-4 max-w-xl">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Award ledger */}
      <section className="bg-transparent px-5 py-12">
        <div className={WRAP}>
          <SectionKicker className={`mb-4 ${KICKER_TICK}`}>{tAwards('awardsKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-7 font-sans">
            {tAwards('awardsHeading')}
          </h2>

          {/* Filter chips: year, then category */}
          <div className="mb-3 flex flex-wrap gap-2">
            {YEAR_FILTERS.map((y) => (
              <button key={y} onClick={() => setYearFilter(y)} className={chip(yearFilter === y)}>
                {y === 'ALL' ? tAwards('filterAll') : <span dir="ltr">{y}</span>}
              </button>
            ))}
          </div>
          <div className="mb-8 flex flex-wrap gap-2">
            {catFilters.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} className={chip(catFilter === c)}>
                {translateCat(c)}
              </button>
            ))}
          </div>

          {/* The ledger */}
          {items.length === 0 ? (
            <p className="font-body text-muted text-body border-border border-t py-14 text-center">
              {tAwards('noAwards')}
            </p>
          ) : (
            <div className="border-border border-t">
              {items.map((award, i) => {
                const meta = [
                  award.category ? translateCat(award.category) : null,
                  award.organisation,
                ].filter(Boolean) as string[];
                const inner = (
                  <>
                    {/* Year spine */}
                    <span
                      dir="ltr"
                      className="text-accent text-title w-[58px] flex-shrink-0 font-mono font-semibold tabular-nums md:w-[76px]"
                    >
                      {award.year ?? ''}
                    </span>
                    {/* Record body */}
                    <div className="min-w-0 flex-1">
                      {meta.length > 0 && (
                        <p className="text-muted text-eyebrow mb-1.5 font-mono uppercase">
                          {meta.join(' · ')}
                        </p>
                      )}
                      <h3 className="text-foreground text-body-lg group-hover:text-accent font-sans font-semibold leading-snug transition-colors">
                        {award.title}
                      </h3>
                      {award.description && (
                        <p className="font-body text-muted text-body mt-2 max-w-2xl leading-relaxed">
                          {award.description}
                        </p>
                      )}
                    </div>
                    {/* Trailing external mark */}
                    {award.externalUrl && (
                      <span className="text-muted group-hover:text-accent mt-1 flex flex-shrink-0 items-center gap-1.5 self-start transition-colors">
                        <span className="text-eyebrow hidden font-mono uppercase md:inline">
                          {tAwards('viewAnnouncement')}
                        </span>
                        <ExternalArrow className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </>
                );
                const rowClass = 'border-border flex gap-5 border-b py-6 md:gap-8';
                return (
                  <ScrollReveal key={award.id} index={i} margin="-40px">
                    {award.externalUrl ? (
                      <Link
                        href={award.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group ${rowClass}`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className={`group ${rowClass}`}>{inner}</div>
                    )}
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Press coverage ledger */}
      <section className="bg-transparent px-5 py-12">
        <div className={WRAP}>
          <SectionKicker className={`mb-4 ${KICKER_TICK}`}>{tPress('pressKicker')}</SectionKicker>
          <h2 className="text-foreground text-headline mb-7 font-sans">{tPress('pressHeading')}</h2>

          {coverageItems.length === 0 ? (
            <p className="font-body text-muted text-body border-border border-t py-14 text-center">
              {tPress('noCoverage')}
            </p>
          ) : (
            <div className="border-border border-t">
              {coverageItems.map((item, i) => {
                const inner = (
                  <>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-accent text-eyebrow font-mono uppercase">
                        {item.publication}
                      </span>
                      <span className="font-body text-muted text-caption flex-shrink-0 tabular-nums">
                        {formatDate(item.date, locale)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-4">
                      <h3 className="text-foreground text-body-lg group-hover:text-accent font-sans font-semibold leading-snug transition-colors">
                        {item.headline}
                      </h3>
                      {item.url && (
                        <ExternalArrow className="text-muted group-hover:text-accent mt-1.5 flex-shrink-0 transition-all group-hover:translate-x-0.5" />
                      )}
                    </div>
                    {item.excerpt && (
                      <p className="font-body text-muted text-body mt-2 max-w-2xl leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </>
                );
                const rowClass = 'border-border block border-b py-6';
                return (
                  <ScrollReveal key={item.id} index={i} margin="-40px">
                    {item.url ? (
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group ${rowClass}`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className={`group ${rowClass}`}>{inner}</div>
                    )}
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          {/* Featured-in bare-wordmark strip */}
          {featuredPublications.length > 0 && (
            <div className="border-border mt-10 border-t pt-8">
              <p className="font-body text-muted/60 text-eyebrow mb-5 text-center font-mono uppercase">
                {tPress('featuredInLabel')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {featuredPublications.map((pub) => (
                  <span
                    key={pub}
                    className="font-body text-muted text-caption font-medium uppercase tracking-[0.08em]"
                  >
                    {pub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsroom / press releases */}
      {newsroomItems.length > 0 && (
        <section className="bg-transparent px-5 py-12">
          <div className={WRAP}>
            <SectionKicker className={`mb-4 ${KICKER_TICK}`}>
              {tPress('newsroomKicker')}
            </SectionKicker>
            <h2 className="text-foreground text-title mb-6 font-sans">
              {tPress('newsroomHeading')}
            </h2>
            <div className="border-border border-t">
              {newsroomItems.map((item, i) => {
                const inner = (
                  <>
                    <div className="min-w-0">
                      <p className="font-body text-muted text-caption mb-1 tabular-nums">
                        {formatDate(item.date, locale)}
                      </p>
                      <h3 className="text-foreground text-body-lg group-hover:text-accent font-sans font-semibold leading-snug transition-colors">
                        {item.headline}
                      </h3>
                    </div>
                    <ChevronArrow className="text-accent mt-1 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </>
                );
                const rowClass =
                  'border-border flex items-center justify-between gap-4 border-b py-5';
                return (
                  <ScrollReveal key={item.id} index={i} margin="-40px">
                    {item.url ? (
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group ${rowClass}`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className={`group ${rowClass}`}>{inner}</div>
                    )}
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* By the numbers: fact strip */}
      <section className="bg-transparent px-5 py-12">
        <div className={WRAP}>
          <SectionKicker className={`mb-7 ${KICKER_TICK}`}>{tPress('statsLabel')}</SectionKicker>
          <div className="border-border grid grid-cols-2 gap-x-6 gap-y-9 border-y py-10 md:grid-cols-3 md:gap-y-11">
            {STATS.map(({ valueKey, labelKey }, i) => (
              <ScrollReveal key={valueKey} index={i} margin="-40px">
                <div className="flex flex-col gap-1.5">
                  <span
                    dir="ltr"
                    className="text-foreground text-metric-sm w-fit font-sans font-semibold tabular-nums leading-none"
                  >
                    {tPress(valueKey as 'statsMT5')}
                  </span>
                  <span className="font-body text-muted text-eyebrow font-mono uppercase">
                    {tPress(labelKey as 'statsMT5Label')}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Media kit: newsroom assets as clean bordered tiles */}
      <section className="bg-transparent px-5 py-12">
        <div className={WRAP}>
          <SectionKicker className={`mb-4 ${KICKER_TICK}`}>{tPress('assetsKicker')}</SectionKicker>
          <h2 className="text-foreground text-title mb-7 font-sans">{tPress('assetsHeading')}</h2>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {BRAND_ASSETS.map(({ nameKey, formatKey, color }, i) => (
              <ScrollReveal key={nameKey} index={i} margin="-40px">
                <div className="border-border hover-lift shadow-card dark:shadow-card-dark flex h-full flex-col gap-4 rounded-[18px] border bg-white p-5 dark:bg-[#111316]">
                  <FileIcon color={color} />
                  <div className="flex-1">
                    <p className="text-foreground text-body font-sans font-semibold">
                      {tPress(nameKey as 'logoPack')}
                    </p>
                    <p className="font-body text-muted text-caption font-mono uppercase">
                      {tPress(formatKey as 'logoPackFormat')}
                    </p>
                  </div>
                  <button
                    className="tap-scale border-border text-foreground/70 hover:border-accent hover:text-accent text-eyebrow inline-flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono font-medium uppercase transition-colors"
                    aria-label={`${tPress('downloadBtn')} ${tPress(nameKey as 'logoPack')}`}
                  >
                    {tPress('downloadBtn')}
                    <DownloadGlyph />
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Media inquiries: press desk */}
      <section className="bg-transparent px-5 pb-16 pt-4">
        <div className={WRAP}>
          <div className="border-border shadow-card dark:shadow-card-dark rounded-[24px] border bg-white p-7 md:flex md:items-center md:justify-between md:gap-10 md:p-9 dark:bg-[#111316]">
            <div className="max-w-md">
              <SectionKicker className={`mb-4 ${KICKER_TICK}`}>
                {tPress('inquiriesKicker')}
              </SectionKicker>
              <h2 className="text-foreground text-title mb-3 font-sans">
                {tPress('inquiriesHeading')}
              </h2>
              <p className="font-body text-muted text-body leading-relaxed">
                {tPress('inquiriesDesc')}
              </p>
            </div>
            <div className="border-border mt-7 border-t pt-6 md:mt-0 md:w-auto md:flex-shrink-0 md:border-s md:border-t-0 md:ps-10 md:pt-0 md:text-end">
              <a
                href={`mailto:${tPress('inquiriesEmail')}`}
                dir="ltr"
                className="text-accent link-underline text-title inline-block font-sans font-semibold"
              >
                {tPress('inquiriesEmail')}
              </a>
              <a
                href={`tel:${tPress('inquiriesPhone')}`}
                dir="ltr"
                className="text-foreground/80 hover:text-foreground font-body text-body mt-1.5 block font-medium tabular-nums transition-colors md:text-end"
              >
                {tPress('inquiriesPhone')}
              </a>
              <p className="font-body text-muted/60 text-eyebrow mt-4 font-mono uppercase">
                {tPress('inquiriesAlt')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
