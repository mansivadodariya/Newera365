'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { RichText } from './RichText';
import type { SlateNode } from './RichText';
import { norm, humanize, distinctCategories } from './filterUtils';

export interface CmsGlossaryTerm {
  id: number;
  glossaryTerm: string;
  alphabeticalIndex?: string | null;
  glossaryCategory?: string | null;
  body?: SlateNode[] | null;
}

type GlossaryTerm = {
  term: string;
  category: string;
  definition: string;
  body?: SlateNode[] | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  PRICING: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  FOREX: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  STRATEGY: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  RISK: 'bg-[#EF4444]/15 text-[#EF4444]',
  'ORDER/EXEC': 'bg-accent/10 text-accent',
  ANALYSIS: 'bg-[#06B6D4]/15 text-[#06B6D4]',
  'CHART/PATTERN': 'bg-[#F97316]/15 text-[#F97316]',
  TECHNICAL: 'bg-[#EC4899]/15 text-[#EC4899]',
  GENERAL: 'bg-[#6b7280]/15 text-[#6b7280]',
};

const glossColor = (cat: string): string =>
  CATEGORY_COLORS[(cat ?? '').toUpperCase()] ?? 'bg-accent/10 text-accent';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface GlossaryPageProps {
  terms?: CmsGlossaryTerm[];
}

export function GlossaryPage({ terms: cmsTerms }: GlossaryPageProps) {
  const locale = useLocale();
  const t = useTranslations('glossary');

  const CAT_I18N_KEYS: Record<string, string> = {
    PRICING: 'catPricing',
    FOREX: 'catForex',
    STRATEGY: 'catStrategy',
    RISK: 'catRisk',
    'ORDER/EXEC': 'catOrderExec',
    ANALYSIS: 'catAnalysis',
    'CHART/PATTERN': 'catChartPattern',
    TECHNICAL: 'catTechnical',
    GENERAL: 'catGeneral',
  };
  function translateGlossCat(cat: string) {
    const key = CAT_I18N_KEYS[(cat ?? '').toUpperCase()];
    return key ? t(key as Parameters<typeof t>[0]) : humanize(cat);
  }
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allTerms: GlossaryTerm[] = useMemo(() => {
    if (cmsTerms && cmsTerms.length > 0) {
      return cmsTerms.map((t) => ({
        term: t.glossaryTerm ?? '',
        category: t.glossaryCategory ?? 'GENERAL',
        definition: '',
        body: t.body,
      }));
    }
    return [];
  }, [cmsTerms]);

  const filtered = useMemo(() => {
    let result = allTerms;

    if (search) {
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.definition.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (activeLetter) {
      result = result.filter((t) => t.term.toUpperCase().startsWith(activeLetter));
    }
    if (activeCategory) {
      result = result.filter((t) => norm(t.category) === norm(activeCategory));
    }
    return result;
  }, [search, activeLetter, activeCategory, allTerms]);

  const categoryList = useMemo(
    () => distinctCategories(allTerms, (term) => term.category),
    [allTerms],
  );

  const availableLetters = useMemo(
    () => new Set(allTerms.map((t) => t.term?.[0]?.toUpperCase() ?? '')),
    [allTerms],
  );

  function handleLetterClick(letter: string) {
    setActiveLetter((prev) => (prev === letter ? null : letter));
    setSearch('');
  }

  function handleCategoryClick(cat: string) {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setSearch('');
    setActiveLetter(null);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('kickerLabel')}</SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted mb-6 max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>

          {/* Search */}
          <div className="relative xl:max-w-[600px]">
            <svg
              className="text-muted pointer-events-none absolute start-4 top-1/2 -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveLetter(null);
              }}
              className="font-body focus:ring-accent/50 w-full rounded-[14px] bg-[#fafaf9] px-4 py-[14px] text-[14px] text-[#111] placeholder-[#9ca3af] outline-none focus:ring-1 dark:bg-[#1a1c22] dark:text-white dark:placeholder-white/30"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-muted absolute end-4 top-1/2 -translate-y-1/2"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 1L11 11M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category filter pills */}
      <section className="px-5 pb-3">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveLetter(null);
              }}
              className={`font-body flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'bg-[#f0f0f0] text-[#6b7280] hover:bg-[#e5e5e5] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e] dark:hover:text-white/80'
              }`}
            >
              {t('filterAll')}
            </button>
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`font-body flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  activeCategory === cat
                    ? glossColor(cat)
                    : 'hover:text-foreground dark:hover:text-foreground dark:bg-surface dark:text-muted bg-[#f0f0f0] text-[#6b7280]'
                }`}
              >
                {translateGlossCat(cat)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Alphabet filter */}
      <section className="px-5 pb-4">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto">
            {ALPHABET.map((letter) => {
              const available = availableLetters.has(letter);
              const active = activeLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => available && handleLetterClick(letter)}
                  disabled={!available}
                  className={`font-body h-8 w-8 flex-shrink-0 rounded-full text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-accent text-white'
                      : available
                        ? 'text-foreground hover:bg-accent/10 hover:text-accent'
                        : 'text-muted/30 cursor-default'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terms list */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">
            {activeCategory
              ? `${translateGlossCat(activeCategory)} · ${filtered.length} ${t('statusTerms')}`
              : activeLetter
                ? `${t('statusLetter')} ${activeLetter} · ${filtered.length} ${t('statusTerms')}`
                : `${t('statusAz')} · ${filtered.length} ${t('statusTerms')}`}
          </SectionKicker>
          {filtered.length === 0 ? (
            <p className="font-body text-muted py-8 text-center text-[14px]">{t('noResults')}</p>
          ) : (
            <>
              {/* Mobile: flat divider list */}
              <div className="flex flex-col xl:hidden">
                {filtered.map((term, i) => {
                  const prevTerm = i > 0 ? filtered[i - 1] : undefined;
                  const showLetter =
                    i === 0 || term.term?.[0]?.toUpperCase() !== prevTerm?.term?.[0]?.toUpperCase();
                  return (
                    <div key={`m-${term.term}`}>
                      {showLetter && (
                        <div className="bg-background sticky top-16 z-10 py-2">
                          <span className="text-accent font-sans text-[11px] font-semibold uppercase tracking-[0.1em]">
                            {term.term?.[0]?.toUpperCase() ?? ''}
                          </span>
                        </div>
                      )}
                      <div
                        className={`py-4 ${i < filtered.length - 1 ? 'border-b border-[#e5e7eb] dark:border-white/[0.07]' : ''}`}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="text-foreground font-sans text-[15px] font-semibold">
                            {term.term}
                          </span>
                          <span
                            className={`font-body rounded-full px-2 py-[2px] text-[8px] font-semibold uppercase tracking-[0.1em] ${CATEGORY_COLORS[term.category] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {translateGlossCat(term.category)}
                          </span>
                        </div>
                        {term.body && term.body.length > 0 ? (
                          <RichText
                            content={term.body}
                            className="font-body text-muted text-[13px] leading-[1.6]"
                          />
                        ) : (
                          <p className="font-body text-muted text-[13px] leading-[1.6]">
                            {term.definition}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: 3-column card grid */}
              <div className="hidden xl:grid xl:grid-cols-3 xl:gap-[14px]">
                {filtered.map((term) => (
                  <div
                    key={`d-${term.term}`}
                    className="hover:border-accent/25 dark:hover:border-accent/20 group flex flex-col gap-2 rounded-[18px] border border-[#e9e9e6] bg-[#f7f7f5] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-[#16181d] dark:hover:bg-[#1c1f28]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-foreground font-sans text-[15px] font-semibold leading-[1.2]">
                        {term.term}
                      </span>
                      <span
                        className={`font-body mt-0.5 flex-shrink-0 rounded-full px-2 py-[2px] text-[8px] font-semibold uppercase tracking-[0.1em] ${CATEGORY_COLORS[term.category] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {term.category}
                      </span>
                    </div>
                    {term.body && term.body.length > 0 ? (
                      <RichText
                        content={term.body}
                        className="font-body text-muted text-[12px] leading-[1.65]"
                      />
                    ) : (
                      <p className="font-body text-muted text-[12px] leading-[1.65]">
                        {term.definition}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            {t('ctaHeading')}
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">{t('ctaDesc')}</p>
          <Link
            href={`/${locale}/guides`}
            className="bg-accent hover:bg-accent/90 font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors"
          >
            {t('ctaBtn')}
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              className="rtl:-scale-x-100"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
