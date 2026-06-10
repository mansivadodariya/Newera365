'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { RichText } from './RichText';
import type { SlateNode } from './RichText';

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

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface GlossaryPageProps {
  terms?: CmsGlossaryTerm[];
}

export function GlossaryPage({ terms: cmsTerms }: GlossaryPageProps) {
  const t = useTranslations('glossary');
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
      result = result.filter((t) => t.category === activeCategory);
    }
    return result;
  }, [search, activeLetter, activeCategory, allTerms]);

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
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
              className="text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
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
              className="border-border font-body text-foreground placeholder-muted focus:border-accent bg-surface w-full rounded-[14px] px-4 py-[14px] text-[14px] outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-muted absolute right-4 top-1/2 -translate-y-1/2"
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
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveLetter(null);
              }}
              className={`font-body flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'hover:text-foreground dark:bg-surface dark:text-muted bg-[#f0f0f0] text-[#6b7280]'
              }`}
            >
              {t('filterAll')}
            </button>
            {Object.entries(CATEGORY_COLORS).map(([cat, colorClass]) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`font-body flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  activeCategory === cat
                    ? colorClass
                    : 'hover:text-foreground dark:hover:text-foreground dark:bg-surface dark:text-muted bg-[#f0f0f0] text-[#6b7280]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Alphabet filter */}
      <section className="px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
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
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">
            {activeCategory
              ? `${activeCategory} · ${filtered.length} TERMS`
              : activeLetter
                ? `LETTER ${activeLetter} · ${filtered.length} TERMS`
                : `A–Z · ${filtered.length} TERMS`}
          </SectionKicker>
          {filtered.length === 0 ? (
            <p className="font-body text-muted py-8 text-center text-[14px]">{t('noResults')}</p>
          ) : (
            <div className="flex flex-col xl:grid xl:grid-cols-2 xl:gap-x-10">
              {filtered.map((term, i) => {
                const prevTerm = i > 0 ? filtered[i - 1] : undefined;
                const showLetter =
                  i === 0 || term.term?.[0]?.toUpperCase() !== prevTerm?.term?.[0]?.toUpperCase();
                return (
                  <div key={term.term}>
                    {showLetter && (
                      <div className="bg-background sticky top-16 z-10 py-2">
                        <span className="text-accent font-sans text-[11px] font-semibold uppercase tracking-[0.1em]">
                          {term.term?.[0]?.toUpperCase() ?? ''}
                        </span>
                      </div>
                    )}
                    <div
                      className={`py-4 ${i < filtered.length - 1 ? 'dark:border-border border-b border-[#e5e7eb]' : ''}`}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-foreground font-sans text-[15px] font-semibold">
                          {term.term}
                        </span>
                        <span
                          className={`font-body rounded-full px-2 py-[2px] text-[8px] font-semibold uppercase tracking-[0.1em] ${CATEGORY_COLORS[term.category] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {term.category}
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
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            {t('ctaHeading')}
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">{t('ctaDesc')}</p>
          <a
            href="/guides"
            className="bg-accent hover:bg-accent/90 font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors"
          >
            {t('ctaBtn')}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
