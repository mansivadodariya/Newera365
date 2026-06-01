'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
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
      a: faq.answer.map((n) => extractPlainText(n)).join(''),
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
  dotClass,
  openIdx,
  setOpenIdx,
}: {
  question: string;
  answer: string;
  answerRichText?: SlateNode[] | null;
  id: string;
  dotClass: string;
  openIdx: string | null;
  setOpenIdx: (v: string | null) => void;
}) {
  const isOpen = openIdx === id;
  return (
    <div className="dark:bg-surface bg-white">
      <button
        onClick={() => setOpenIdx(isOpen ? null : id)}
        className="flex w-full items-start gap-3 px-4 py-[15px] text-left"
        aria-expanded={isOpen}
      >
        <span className={`mt-[7px] h-2 w-2 flex-shrink-0 rounded-full ${dotClass}`} />
        <span className="text-foreground mr-2 flex-1 font-sans text-[14px] font-semibold leading-snug">
          {question}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-muted mt-0.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
        >
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="font-body text-muted pb-[15px] pl-[35px] pr-4 text-[13px] leading-relaxed">
          {answerRichText && answerRichText.length > 0 ? (
            <RichText content={answerRichText} />
          ) : (
            <p>{answer}</p>
          )}
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
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05]">
            Got questions?
          </h1>
          <p className="font-body text-muted mb-6 max-w-[300px] text-[14px] leading-[1.55]">
            We&apos;ve answered hundreds of them. Search or browse by category below.
          </p>

          {/* Search */}
          <div className="relative xl:max-w-full">
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
              placeholder="Search 100+ FAQs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenIdx(null);
              }}
              className="border-border font-body text-foreground placeholder-muted focus:border-accent w-full rounded-full bg-[#f9f9f9] py-3 pl-10 pr-10 text-[14px] font-medium outline-none dark:bg-[#1c1c1c]"
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

      {/* Category filter tabs */}
      <section className="dark:bg-background bg-white px-5 pb-5 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={`font-body flex-shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'hover:text-foreground bg-[#f0f0f0] text-[#6b7280] dark:bg-[#1e1e1e] dark:text-[#9ca3af]'
              }`}
            >
              All
            </button>
            {allGroups.map(({ section }) => {
              const style = CATEGORY_STYLES[section];
              return (
                <button
                  key={section}
                  onClick={() => setActiveCategory(activeCategory === section ? null : section)}
                  className={`font-body flex-shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                    activeCategory === section
                      ? (style?.activePill ?? 'bg-accent text-white')
                      : 'hover:text-foreground bg-[#f0f0f0] text-[#6b7280] dark:bg-[#1e1e1e] dark:text-[#9ca3af]'
                  }`}
                >
                  {section}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular questions — shown only when no search/filter active */}
      {showPopular && (
        <section className="dark:bg-background bg-white px-5 pb-6 xl:px-[80px]">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="xl:mx-auto xl:max-w-[730px]">
              <SectionKicker className="mb-3">POPULAR QUESTIONS</SectionKicker>
              <div className="flex flex-col gap-px overflow-hidden rounded-[18px] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
                {popularItems.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    id={`popular-${idx}`}
                    question={item.q}
                    answer={item.a}
                    answerRichText={cmsFaqMap?.get(item.q)}
                    dotClass={CATEGORY_STYLES[item.section]?.dot ?? 'bg-accent'}
                    openIdx={openIdx}
                    setOpenIdx={setOpenIdx}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search result count */}
      {search && (
        <section className="dark:bg-background bg-white px-5 pb-2 xl:px-[80px]">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="xl:mx-auto xl:max-w-[730px]">
              <p className="font-body text-muted text-[12px]">
                {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ accordion groups */}
      {filteredGroups.length > 0 ? (
        filteredGroups.map((group) => {
          const catStyle = CATEGORY_STYLES[group.section];
          return (
            <section
              key={group.section}
              className="dark:bg-background bg-white px-5 pb-6 xl:px-[80px]"
            >
              <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
                <div className="xl:mx-auto xl:max-w-[730px]">
                  <SectionKicker className="mb-3">{group.section.toUpperCase()}</SectionKicker>
                  <div className="flex flex-col gap-px overflow-hidden rounded-[18px] bg-[#f0f0f0] dark:bg-[#2a2a2a]">
                    {group.items.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        id={`${group.section}-${idx}`}
                        question={item.q}
                        answer={item.a}
                        answerRichText={cmsFaqMap?.get(item.q)}
                        dotClass={catStyle?.dot ?? 'bg-accent'}
                        openIdx={openIdx}
                        setOpenIdx={setOpenIdx}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })
      ) : (
        <section className="dark:bg-background bg-white px-5 pb-6 xl:px-[80px]">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="xl:mx-auto xl:max-w-[730px]">
              <p className="font-body text-muted py-8 text-center text-[14px]">
                No questions match your search.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Still stuck CTA */}
      <section className="bg-black px-5 pb-12 pt-10 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="xl:flex xl:items-center xl:gap-8">
            {/* Left: heading + subtitle */}
            <div className="xl:flex-1">
              <SectionKicker className="mb-4 [&>span:last-child]:text-white/50 [&>span]:bg-white/40">
                STILL STUCK?
              </SectionKicker>
              <h2 className="mb-3 font-sans text-[32px] font-semibold leading-[1.1] text-white">
                Talk to us.
              </h2>
              <p className="font-body mb-6 max-w-[280px] text-[14px] leading-relaxed text-white/60 xl:mb-0">
                Our support team is available 24/5. Average reply time under 90 seconds.
              </p>
            </div>
            {/* Right: buttons + stat */}
            <div className="xl:flex xl:flex-shrink-0 xl:flex-col xl:items-end xl:gap-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-3">
                <Link
                  href={`/${locale}/live-chat`}
                  className="bg-accent font-body hover:bg-accent/90 flex h-[50px] w-full items-center justify-center gap-2 rounded-full px-6 text-[14px] font-medium text-white transition-colors xl:w-auto"
                >
                  Open live chat
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
                  href={`/${locale}/contact`}
                  className="font-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-[14px] font-medium text-white transition-colors hover:border-white/40 xl:w-auto"
                >
                  Email support
                </Link>
              </div>
              <p className="font-body mt-3 text-center text-[11px] text-white/30 xl:mt-0 xl:text-right">
                Avg reply under 2 min · 24/5
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
