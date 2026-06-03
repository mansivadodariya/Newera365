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
  const grouped = new Map<string, FaqItem[]>();
  for (const faq of faqs) {
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

const FAQ_GROUPS: FaqGroup[] = [
  {
    section: 'Security',
    items: [
      {
        q: 'How do I verify my identity?',
        a: 'Submit a government-issued photo ID (passport or national ID) and proof of address. Verification is automated and typically completes within minutes during business hours.',
        popular: true,
      },
      {
        q: 'What documents do I need to register?',
        a: 'A government-issued photo ID (passport or national ID) and proof of address (utility bill or bank statement dated within 3 months).',
        popular: false,
      },
      {
        q: 'Is my money safe?',
        a: 'Yes. Client funds are held in segregated accounts at tier-1 banks, fully separated from company operating capital. We are PCI-DSS Level 1 certified.',
        popular: true,
      },
      {
        q: 'Can I open a demo account?',
        a: 'Yes. A demo account gives you $10,000 in virtual funds to practise trading with real market conditions and zero risk.',
        popular: false,
      },
      {
        q: 'Do I need a separate Islamic account?',
        a: 'Yes. Swap-free Islamic accounts are available upon request. Submit your application through the client portal and our team will activate it within 24 hours.',
        popular: true,
      },
    ],
  },
  {
    section: 'Trading',
    items: [
      {
        q: 'What markets can I trade?',
        a: 'Forex, indices, commodities, stocks, ETFs and crypto — over 200 instruments across 6 asset classes on MetaTrader 5.',
        popular: false,
      },
      {
        q: 'What leverage is available?',
        a: 'Up to 1:500 on forex, 1:200 on indices, 1:100 on commodities, and 1:10 on crypto. Leverage depends on your account type and regulatory jurisdiction.',
        popular: true,
      },
      {
        q: 'What is the minimum trade size?',
        a: 'The minimum trade size is 0.01 lots (1 micro-lot) across all instruments.',
        popular: true,
      },
      {
        q: 'Do you charge commissions?',
        a: 'Standard accounts have no commissions — the cost is built into the spread. Raw accounts charge $3.50 per lot per side with raw spreads from 0.0 pip.',
        popular: false,
      },
      {
        q: 'Can I use automated strategies (EAs)?',
        a: 'Yes. MT5 supports Expert Advisors, algorithmic strategies, and custom scripts. Scalping and hedging are permitted.',
        popular: true,
      },
      {
        q: 'Can I change my account type later?',
        a: 'Yes. You can upgrade or change your account type at any time from your client portal. Changes take effect from the next trading session.',
        popular: false,
      },
    ],
  },
  {
    section: 'Funding',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'Visa/Mastercard, bank wire (SWIFT), Skrill, Neteller, crypto (USDT, BTC), and local bank transfers in supported regions.',
        popular: false,
      },
      {
        q: 'How long do withdrawals take?',
        a: 'Card withdrawals: 1–3 business days. E-wallets (Skrill, Neteller): within 24 hours. Bank wire: 2–5 business days. Crypto: within 30 minutes.',
        popular: true,
      },
      {
        q: 'Is there a minimum deposit?',
        a: 'Standard accounts require a $100 minimum. Raw accounts require $500, and VIP accounts require $10,000.',
        popular: true,
      },
      {
        q: 'Are there any withdrawal fees?',
        a: 'We charge no withdrawal fees. However, your bank or payment provider may charge network or processing fees on their end.',
        popular: false,
      },
    ],
  },
  {
    section: 'Platform',
    items: [
      {
        q: 'Which trading platforms do you offer?',
        a: 'MetaTrader 5 (desktop, iOS, Android), a browser-based Web Trader, and a mobile app for iOS and Android. All sync to the same account.',
        popular: false,
      },
      {
        q: 'How fast is order execution?',
        a: 'Average execution speed is under 12 milliseconds with no dealing desk intervention.',
        popular: false,
      },
      {
        q: 'Do you offer a VPS?',
        a: 'Yes. Raw and VIP account holders receive free VPS hosting to run Expert Advisors 24/7 without needing a local machine.',
        popular: false,
      },
      {
        q: 'What happens during a margin call?',
        a: 'When your equity falls below 50% of required margin, we issue a margin call alert. At 20% (stop-out level), positions are automatically closed to protect your remaining balance.',
        popular: true,
      },
    ],
  },
];

const POPULAR_ITEMS = FAQ_GROUPS.flatMap((g) =>
  g.items.filter((item) => item.popular).map((item) => ({ ...item, section: g.section })),
);

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
    <div className="bg-background rounded-[16px]">
      <button
        onClick={() => setOpenIdx(isOpen ? null : id)}
        className="flex w-full items-center justify-between gap-[14px] px-5 py-[18px] text-left"
        aria-expanded={isOpen}
      >
        {/* Category tag — mono tracking-[1.2px] per Figma */}
        <span className="bg-accent/10 text-accent flex-shrink-0 rounded-full px-[10px] py-[5px] font-mono text-[10px] tracking-[1.2px]">
          {section.toUpperCase()}
        </span>
        <span className="text-foreground flex-1 font-sans text-[15px] font-semibold leading-normal tracking-[-0.15px]">
          {question}
        </span>
        {/* Plus/X toggle button — bg-[#fafaf9] rounded-[99px] p-[8px] */}
        <div className="bg-surface dark:bg-surface-elevated flex-shrink-0 rounded-full p-[8px]">
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

  const allGroups = useMemo(
    () => (faqs && faqs.length > 0 ? cmsFaqsToGroups(faqs) : FAQ_GROUPS),
    [faqs],
  );

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
      allGroups.flatMap((g) =>
        g.items.filter((item) => item.popular).map((item) => ({ ...item, section: g.section })),
      ),
    [allGroups],
  );

  const totalResults = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);
  const showPopular = !search && !activeCategory;

  return (
    <>
      {/* Hero + Search */}
      <section className="bg-background px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05]">
            {t('heroHeading')}
          </h1>
          <p className="font-body text-muted mb-6 max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>

          {/* Search bar — bg-[#fafaf9] rounded-[16px] per Figma */}
          <div className="bg-surface dark:bg-surface flex items-center gap-[10px] rounded-[16px] px-4 py-[14px]">
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
            <div className="dark:bg-surface-elevated rounded-[6px] bg-[#f2f2f4] px-[7px] py-[3px]">
              <span className="text-muted font-mono text-[10px]">⌘ K</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category filter tabs — matches Figma pills */}
      <section className="bg-background px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
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
                      : 'text-muted dark:bg-surface-elevated dark:hover:bg-surface bg-[#f2f2f4] hover:bg-[#e5e5e5]'
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
        <section className="bg-background px-5 pb-6">
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
                    className="bg-[#fafaf9] dark:bg-surface flex items-center gap-[10px] rounded-[14px] px-4 py-[14px]"
                  >
                    <span className="flex-shrink-0 rounded-full bg-[rgba(0,176,80,0.1)] px-[10px] py-[5px] font-mono text-[9px] tracking-[1.2px] text-[#00b050]">
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
        <section className="bg-background px-5 pb-2">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="xl:mx-auto xl:max-w-[730px]">
              <p className="font-body text-muted text-[12px]">
                {totalResults !== 1 ? t('resultsForPlural', { count: totalResults, query: search }) : t('resultsFor', { count: totalResults, query: search })}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ALL FAQs section — Figma: bg-white rounded-[16px] cards, gap-[10px] */}
      <section className="bg-background px-5 pb-6">
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
            <p className="font-body text-muted py-8 text-center text-[14px]">
              {t('noResults')}
            </p>
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
