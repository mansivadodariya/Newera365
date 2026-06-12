'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { RichText } from './RichText';
import type { SlateNode } from './RichText';

type FaqItem = { q: string; a: string; popular: boolean };
type FaqGroup = { section: string; items: FaqItem[] };

export interface CmsFaqItem {
  id: number;
  question: string;
  answer: SlateNode[];
  category: string;
  sortOrder?: number | null;
}

const CAT_TAG_STYLE: Record<string, string> = {
  Platform: 'bg-[#3B82F6]/10 text-[#3B82F6]',
  Platforms: 'bg-[#3B82F6]/10 text-[#3B82F6]',
  Security: 'bg-[#EF4444]/10 text-[#EF4444]',
  Regulation: 'bg-[#EF4444]/10 text-[#EF4444]',
  Funding: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  Deposits: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  Withdrawals: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  Trading: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  Accounts: 'bg-accent/10 text-accent',
  Account: 'bg-accent/10 text-accent',
  General: 'bg-[#6B7280]/10 text-[#6B7280]',
};
const DEFAULT_CAT_TAG = 'bg-accent/10 text-accent';

const CATEGORY_STYLES: Record<string, { dot: string; activePill: string }> = {
  Platform: { dot: 'bg-[#3B82F6]', activePill: 'bg-[#3B82F6] text-white' },
  Security: { dot: 'bg-accent', activePill: 'bg-accent text-white' },
  Funding: { dot: 'bg-[#F59E0B]', activePill: 'bg-[#F59E0B] text-white' },
  Trading: { dot: 'bg-[#8B5CF6]', activePill: 'bg-[#8B5CF6] text-white' },
  Accounts: { dot: 'bg-accent', activePill: 'bg-accent text-white' },
  Deposits: { dot: 'bg-[#F59E0B]', activePill: 'bg-[#F59E0B] text-white' },
  Withdrawals: { dot: 'bg-[#F59E0B]', activePill: 'bg-[#F59E0B] text-white' },
  Platforms: { dot: 'bg-[#3B82F6]', activePill: 'bg-[#3B82F6] text-white' },
  Regulation: { dot: 'bg-[#EF4444]', activePill: 'bg-[#EF4444] text-white' },
  General: { dot: 'bg-[#6B7280]', activePill: 'bg-[#6B7280] text-white' },
};

const CMS_CATEGORY_LABELS: Record<string, string> = {
  trading: 'Trading',
  accounts: 'Accounts',
  deposits: 'Deposits',
  withdrawals: 'Withdrawals',
  platforms: 'Platforms',
  regulation: 'Regulation',
  general: 'General',
};

function cmsFaqsToGroups(faqs: CmsFaqItem[]): FaqGroup[] {
  const seen = new Set<string>();
  const grouped = new Map<string, FaqItem[]>();
  for (const faq of faqs) {
    if (!faq.question?.trim()) continue;
    if (seen.has(faq.question)) continue;
    seen.add(faq.question);
    const label = CMS_CATEGORY_LABELS[faq.category] ?? faq.category;
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push({
      q: faq.question,
      a: (faq.answer ?? []).map((n) => extractPlainText(n)).join(''),
      popular: (faq.sortOrder ?? 100) < 5,
    });
  }
  return Array.from(grouped, ([section, items]) => ({ section, items }));
}

function extractPlainText(node: SlateNode): string {
  if (node.text !== undefined) return node.text;
  return node.children?.map(extractPlainText).join('') ?? '';
}

function AccordionItem({
  question,
  answer,
  answerRichText,
  id,
  section,
  openIdx,
  setOpenIdx,
}: {
  question: string;
  answer: string;
  answerRichText?: SlateNode[] | null;
  id: string;
  section: string;
  openIdx: string | null;
  setOpenIdx: (v: string | null) => void;
}) {
  const isOpen = openIdx === id;
  return (
    <div className="rounded-[16px] bg-[#fafaf9] dark:bg-[#1a1c22]">
      <button
        onClick={() => setOpenIdx(isOpen ? null : id)}
        className="flex w-full items-center justify-between gap-[14px] px-5 py-[18px] text-left"
        aria-expanded={isOpen}
      >
        {/* Category tag — color matches category per Figma */}
        <span
          className={`flex-shrink-0 rounded-full px-[10px] py-[5px] font-mono text-[10px] tracking-[1.2px] ${CAT_TAG_STYLE[section] ?? DEFAULT_CAT_TAG}`}
        >
          {section.toUpperCase()}
        </span>
        <span className="text-foreground flex-1 font-sans text-[15px] font-semibold leading-normal tracking-[-0.15px]">
          {question}
        </span>
        {/* Plus/X toggle button */}
        <div className="flex-shrink-0 rounded-full bg-[#f2f2f4] p-[8px] dark:bg-[#22252e]">
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            className={`text-foreground transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
          >
            <path
              d="M6.5 1v11M1 6.5h11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="pb-5 pl-5 pr-5">
          <p className="font-body text-muted text-[14px] leading-[1.65]">{answer}</p>
        </div>
      )}
    </div>
  );
}

interface FaqPageProps {
  faqs?: CmsFaqItem[];
}

export function FaqPage({ faqs }: FaqPageProps) {
  const locale = useLocale();
  const t = useTranslations('faq');
  const [openIdx, setOpenIdx] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allGroups = useMemo(() => (faqs && faqs.length > 0 ? cmsFaqsToGroups(faqs) : []), [faqs]);

  const cmsFaqMap = useMemo(() => {
    if (!faqs) return null;
    const map = new Map<string, SlateNode[]>();
    for (const faq of faqs) {
      map.set(faq.question, faq.answer);
    }
    return map;
  }, [faqs]);

  const filteredGroups = useMemo(() => {
    const groups = activeCategory
      ? allGroups.filter((g) => g.section === activeCategory)
      : allGroups;

    if (!search.trim()) return groups;

    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [search, activeCategory, allGroups]);

  const popularItems = useMemo(
    () =>
      allGroups
        .flatMap((g) =>
          g.items.filter((item) => item.popular).map((item) => ({ ...item, section: g.section })),
        )
        .slice(0, 6),
    [allGroups],
  );

  const totalResults = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);
  const showPopular = !search && !activeCategory;

  return (
    <>
      {/* Hero + Search */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05]">
            {t('heroHeading')}
          </h1>
          <p className="font-body text-muted mb-6 max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>

          {/* Search bar — bg-[#fafaf9] rounded-[16px] per Figma */}
          <div className="flex items-center gap-[10px] rounded-[16px] bg-[#fafaf9] px-4 py-[14px] dark:bg-[#1a1c22]">
            <svg
              className="text-muted flex-shrink-0"
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
                setOpenIdx(null);
              }}
              className="font-body text-foreground placeholder:text-muted flex-1 bg-transparent text-[14px] outline-none"
            />
            <div className="rounded-[6px] bg-[#f2f2f4] px-[7px] py-[3px] dark:bg-[#22252e]">
              <span className="text-muted font-mono text-[10px]">⌘ K</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category filter tabs — matches Figma pills */}
      <section className="px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div
            className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {[t('filterAll'), ...Object.keys(CATEGORY_STYLES)].map((cat) => {
              const isAll = cat === t('filterAll');
              const isActive = isAll ? !activeCategory : activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(isAll ? null : activeCategory === cat ? null : cat)
                  }
                  className={`font-body flex-shrink-0 rounded-full px-3 py-[7px] text-[12px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                      : 'bg-[#f2f2f4] text-[#6b7280] hover:bg-[#e5e5e5] dark:bg-[#1a1c22] dark:text-white/50 dark:hover:bg-[#22252e]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular questions — shown only when no search/filter active */}
      {showPopular && (
        <section className="px-5 pb-6">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
              {t('sectionPopular')}
            </SectionKicker>
            {/* Flat rounded-[14px] cards per Figma with category tag */}
            <div className="flex flex-col gap-[8px]">
              {popularItems.map((item, idx) => {
                const style = CATEGORY_STYLES[item.section];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-[10px] rounded-[14px] bg-[#fafaf9] px-4 py-[14px] dark:bg-[#1a1c22]"
                  >
                    <span
                      className={`flex-shrink-0 rounded-full px-[10px] py-[5px] font-mono text-[9px] tracking-[1.2px] ${CAT_TAG_STYLE[item.section] ?? DEFAULT_CAT_TAG}`}
                    >
                      {item.section.toUpperCase()}
                    </span>
                    <span className="font-body text-foreground flex-1 text-[13.5px] font-medium leading-snug">
                      {item.q}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-muted ml-1 flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 12L12 2M12 2H7M12 2v5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search result count */}
      {search && (
        <section className="px-5 pb-2">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="xl:mx-auto xl:max-w-[730px]">
              <p className="font-body text-muted text-[12px]">
                {totalResults !== 1
                  ? t('resultsForPlural', { count: totalResults, query: search })
                  : t('resultsFor', { count: totalResults, query: search })}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ALL FAQs section — Figma: bg-white rounded-[16px] cards, gap-[10px] */}
      <section className="px-5 pb-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('sectionAll')}
          </SectionKicker>
          {filteredGroups.length > 0 ? (
            <div className="flex flex-col gap-[10px]">
              {filteredGroups.flatMap((group) =>
                group.items.map((item, idx) => (
                  <AccordionItem
                    key={`${group.section}-${idx}`}
                    id={`${group.section}-${idx}`}
                    question={item.q}
                    answer={item.a}
                    section={group.section}
                    openIdx={openIdx}
                    setOpenIdx={setOpenIdx}
                  />
                )),
              )}
            </div>
          ) : (
            <p className="font-body text-muted py-8 text-center text-[14px]">{t('noResults')}</p>
          )}
        </div>
      </section>

      {/* Still stuck CTA — matches Figma: 26px h2, no kicker, green pill button */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] tracking-[-0.52px] text-white">
            {t('stuckHeading')}
            <br />
            {t('stuckSubheading')}
          </h2>
          <p className="font-body mb-[18px] max-w-[280px] text-[14px] leading-[1.55] text-white/60">
            {t('stuckDesc')}
          </p>
          <Link
            href={`/${locale}/live-chat`}
            className="bg-accent font-body hover:bg-accent/90 flex items-center justify-center gap-2 rounded-full px-[22px] py-4 text-[15px] font-medium text-white transition-colors"
          >
            {t('openChat')}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M2.5 7.5h10M8 3.5l4 4-4 4"
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
