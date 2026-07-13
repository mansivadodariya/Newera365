'use client';

import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';
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
      return cmsTerms.map((term) => ({
        term: term.glossaryTerm ?? '',
        category: term.glossaryCategory ?? 'GENERAL',
        definition: '',
        body: term.body,
      }));
    }
    return [];
  }, [cmsTerms]);

  const filtered = useMemo(() => {
    let result = allTerms;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (term) => term.term.toLowerCase().includes(q) || term.definition.toLowerCase().includes(q),
      );
    }
    if (activeLetter) {
      result = result.filter((term) => term.term.toUpperCase().startsWith(activeLetter));
    }
    if (activeCategory) {
      result = result.filter((term) => norm(term.category) === norm(activeCategory));
    }
    return result;
  }, [search, activeLetter, activeCategory, allTerms]);

  // Alphabetically sorted, grouped into letter sections: the dictionary spine.
  const groups = useMemo(() => {
    const sorted = [...filtered].sort((a, b) =>
      a.term.localeCompare(b.term, locale, { sensitivity: 'base' }),
    );
    const map = new Map<string, GlossaryTerm[]>();
    for (const term of sorted) {
      const letter = term.term?.[0]?.toUpperCase() ?? '#';
      const bucket = map.get(letter);
      if (bucket) bucket.push(term);
      else map.set(letter, [term]);
    }
    return Array.from(map, ([letter, terms]) => ({ letter, terms }));
  }, [filtered, locale]);

  const categoryList = useMemo(
    () => distinctCategories(allTerms, (term) => term.category),
    [allTerms],
  );

  const availableLetters = useMemo(
    () => new Set(allTerms.map((term) => term.term?.[0]?.toUpperCase() ?? '')),
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

  const statusLine = activeCategory
    ? `${translateGlossCat(activeCategory)} · ${filtered.length} ${t('statusTerms')}`
    : activeLetter
      ? `${t('statusLetter')} ${activeLetter} · ${filtered.length} ${t('statusTerms')}`
      : `${t('filterAll')} · ${filtered.length} ${t('statusTerms')}`;

  // Shared classing for an A-Z index key (rail + mobile strip).
  function letterClass(letter: string, size: string) {
    const available = availableLetters.has(letter);
    const active = activeLetter === letter;
    if (active) return `${size} bg-accent font-mono font-semibold tabular-nums text-white`;
    if (available)
      return `${size} font-mono font-semibold tabular-nums text-foreground transition-colors hover:text-accent`;
    // text-muted/25 is a no-op here (--muted is a hex var, not an RGB triple, so
    // slash-opacity is invalid and falls back to full foreground). Use the
    // opacity utility instead so unavailable letters actually read as faint.
    return `${size} font-mono font-medium tabular-nums text-muted opacity-30 cursor-default select-none`;
  }

  return (
    <>
      {/* Masthead: the reference cover */}
      <section className="bg-transparent px-5 pb-8 pt-9 xl:pb-10 xl:pt-12">
        <ScrollReveal>
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-4">{t('kickerLabel')}</SectionKicker>
            <h1 className="text-foreground text-display mb-3 font-sans">
              {t('heroLine1')} <span className="text-accent">{t('heroAccent')}</span>
            </h1>
            <p className="font-body text-muted text-body-lg mb-7 max-w-[46ch] leading-[1.55]">
              {t('heroSubtitle')}
            </p>

            {/* Search: a bordered reference field, not a gray fill */}
            <div className="relative xl:max-w-[560px]">
              <svg
                className="text-muted pointer-events-none absolute start-4 top-1/2 -translate-y-1/2"
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M11 11l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveLetter(null);
                }}
                className="font-body text-body border-border text-foreground placeholder:text-muted focus:border-accent focus:ring-accent/40 w-full rounded-full border bg-white py-3.5 pe-11 ps-11 outline-none transition-colors focus:ring-1 dark:border-white/[0.1] dark:bg-[#111318] dark:text-white dark:placeholder:text-white/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={t('filterAll')}
                  className="text-muted hover:text-foreground absolute end-4 top-1/2 -translate-y-1/2 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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
        </ScrollReveal>
      </section>

      {/* The dictionary: index rail beside definition rows */}
      <section className="px-5 pb-14 xl:pb-20">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="border-border mb-6 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-end md:justify-between">
            <SectionKicker>{t('indexKicker')}</SectionKicker>
            <span className="text-caption text-muted font-mono uppercase tabular-nums tracking-[0.14em]">
              {statusLine}
            </span>
          </div>

          {/* Category chips: bordered, signal-accent when active (no pastel) */}
          <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setActiveLetter(null);
              }}
              className={`text-caption flex-shrink-0 rounded-full border px-3.5 py-1.5 font-mono uppercase tracking-[0.1em] transition-colors ${
                !activeCategory
                  ? 'border-accent bg-accent/[0.08] text-accent'
                  : 'border-border text-muted hover:text-foreground hover:border-foreground/25 dark:border-white/[0.12] dark:text-white/55 dark:hover:text-white'
              }`}
            >
              {t('filterAll')}
            </button>
            {categoryList.map((cat) => {
              const active = norm(activeCategory ?? '') === norm(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-caption flex-shrink-0 rounded-full border px-3.5 py-1.5 font-mono uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? 'border-accent bg-accent/[0.08] text-accent'
                      : 'border-border text-muted hover:text-foreground hover:border-foreground/25 dark:border-white/[0.12] dark:text-white/55 dark:hover:text-white'
                  }`}
                >
                  {translateGlossCat(cat)}
                </button>
              );
            })}
          </div>

          {/* Mobile A-Z strip: sticky index key */}
          <div
            dir="ltr"
            className="bg-background/95 scrollbar-hide sticky top-16 z-20 -mx-5 mb-2 flex gap-1 overflow-x-auto px-5 py-2 backdrop-blur xl:hidden"
          >
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => availableLetters.has(letter) && handleLetterClick(letter)}
                disabled={!availableLetters.has(letter)}
                aria-disabled={!availableLetters.has(letter)}
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[13px] ${letterClass(letter, '')}`}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="xl:grid xl:grid-cols-[auto_minmax(0,1fr)] xl:gap-x-12">
            {/* Desktop sticky vertical index rail (start side; RTL-safe via grid order) */}
            <nav
              dir="ltr"
              aria-label="A to Z index"
              className="sticky top-24 hidden self-start xl:flex xl:flex-col xl:items-center xl:gap-0.5"
            >
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => availableLetters.has(letter) && handleLetterClick(letter)}
                  disabled={!availableLetters.has(letter)}
                  aria-disabled={!availableLetters.has(letter)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[12px] ${letterClass(letter, '')}`}
                >
                  {letter}
                </button>
              ))}
            </nav>

            {/* Definition rows */}
            <div className="min-w-0">
              {filtered.length === 0 ? (
                <p className="font-body text-muted text-body py-12 text-center">{t('noResults')}</p>
              ) : (
                <ScrollReveal>
                  <div className="flex flex-col gap-10">
                    {groups.map((group) => (
                      <section key={group.letter}>
                        {/* Oversized editorial letter marker */}
                        <header className="mb-4 flex items-baseline gap-4">
                          <span
                            id={`gl-${group.letter}`}
                            dir="ltr"
                            className="text-accent text-metric-sm scroll-mt-24 font-sans font-semibold leading-none"
                          >
                            {group.letter}
                          </span>
                          <span className="bg-border h-px flex-1" aria-hidden="true" />
                          <span className="text-caption text-muted font-mono tabular-nums">
                            {group.terms.length}
                          </span>
                        </header>

                        <dl className="list-dim divide-border divide-y">
                          {group.terms.map((term) => (
                            <div
                              key={term.term}
                              className="group grid gap-x-10 gap-y-2 py-5 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
                            >
                              <dt className="flex flex-col gap-1.5">
                                <span className="text-foreground link-underline text-body-lg group-hover:text-accent w-fit font-sans font-semibold leading-[1.25] transition-colors">
                                  {term.term}
                                </span>
                                <span className="text-muted flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                                  <span
                                    className="bg-accent h-1 w-1 flex-shrink-0 rounded-full"
                                    aria-hidden="true"
                                  />
                                  {translateGlossCat(term.category)}
                                </span>
                              </dt>
                              <dd className="min-w-0 max-w-[68ch]">
                                {term.body && term.body.length > 0 ? (
                                  <RichText
                                    content={term.body}
                                    className="font-body text-muted text-body leading-[1.7] [&>*:last-child]:mb-0"
                                  />
                                ) : null}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
