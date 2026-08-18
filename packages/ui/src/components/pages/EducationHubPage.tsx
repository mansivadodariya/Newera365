'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { GlossaryPage, type CmsGlossaryTerm } from './GlossaryPage';
import { GuidesPage, type CmsGuide } from './GuidesPage';
import { EbooksPage, type CmsEbookItem } from './EbooksPage';

const FEATURED = [
  {
    id: 'macro',
    tag: 'NEW',
    title: 'The 2026 macro outlook',
    desc: 'Rising inflation or rate cuts? We break down what every scenario means for your positions.',
    readTime: '6 min',
    href: '/guides/macro-outlook-2026',
  },
  {
    id: 'risk',
    tag: 'POPULAR',
    title: 'Risk management essentials',
    desc: 'Four frameworks that protect every account from outsized drawdowns.',
    readTime: '8 min',
    href: '/guides/risk-management-essentials',
  },
  {
    id: 'candle',
    tag: 'UPDATED',
    title: 'Reading a candlestick chart',
    desc: 'From opening price to daily wick, everything you need to parse a chart.',
    readTime: '5 min',
    href: '/guides/reading-candlestick-charts',
  },
] as const;

const DEFAULT_GLOSSARY_TERMS: CmsGlossaryTerm[] = [
  {
    id: 101,
    glossaryTerm: 'Ask Price',
    glossaryCategory: 'PRICING',
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'The price at which a seller is willing to accept for a security, currency, or commodity.',
          },
        ],
      },
    ],
  },
  {
    id: 102,
    glossaryTerm: 'Bid Price',
    glossaryCategory: 'PRICING',
    body: [
      {
        type: 'paragraph',
        children: [
          { text: 'The price a buyer is willing to pay for a security or financial instrument.' },
        ],
      },
    ],
  },
  {
    id: 103,
    glossaryTerm: 'Spread',
    glossaryCategory: 'PRICING',
    body: [
      {
        type: 'paragraph',
        children: [{ text: 'The difference between the bid price and the ask price of an asset.' }],
      },
    ],
  },
  {
    id: 104,
    glossaryTerm: 'Leverage',
    glossaryCategory: 'RISK',
    body: [
      {
        type: 'paragraph',
        children: [
          { text: 'Using borrowed funds to increase trading position beyond cash balance.' },
        ],
      },
    ],
  },
  {
    id: 105,
    glossaryTerm: 'Pips',
    glossaryCategory: 'FOREX',
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Percentage in Point: the smallest price move that a given exchange rate can make.',
          },
        ],
      },
    ],
  },
  {
    id: 106,
    glossaryTerm: 'Margin Call',
    glossaryCategory: 'RISK',
    body: [
      {
        type: 'paragraph',
        children: [{ text: 'Notification requiring additional funds to maintain open positions.' }],
      },
    ],
  },
  {
    id: 107,
    glossaryTerm: 'Stop Loss',
    glossaryCategory: 'STRATEGY',
    body: [
      {
        type: 'paragraph',
        children: [{ text: "An order placed to limit a trader's loss on a position." }],
      },
    ],
  },
  {
    id: 108,
    glossaryTerm: 'Take Profit',
    glossaryCategory: 'STRATEGY',
    body: [
      {
        type: 'paragraph',
        children: [{ text: 'An order placed to close a position once a target price is reached.' }],
      },
    ],
  },
];

const DEFAULT_GUIDES: CmsGuide[] = [
  {
    id: 201,
    slug: 'macro-outlook-2026',
    title: 'The 2026 Macro Outlook',
    summary:
      'Rising inflation or rate cuts? We break down what every scenario means for your positions.',
    featured: true,
  },
  {
    id: 202,
    slug: 'risk-management-essentials',
    title: 'Risk Management Essentials',
    summary: 'Four frameworks that protect every account from outsized drawdowns.',
    featured: false,
  },
  {
    id: 203,
    slug: 'reading-candlestick-charts',
    title: 'Reading a Candlestick Chart',
    summary: 'From opening price to daily wick, everything you need to parse a chart.',
    featured: false,
  },
  {
    id: 204,
    slug: 'understanding-leverage-margin',
    title: 'Understanding Leverage & Margin',
    summary:
      'How leverage amplifies gains and losses, and how to manage margin requirements safely.',
    featured: false,
  },
  {
    id: 205,
    slug: 'technical-analysis-fundamentals',
    title: 'Technical Analysis Fundamentals',
    summary: 'A comprehensive introduction to support, resistance, trend lines, and indicators.',
    featured: false,
  },
];

const DEFAULT_EBOOKS: CmsEbookItem[] = [
  {
    id: 301,
    slug: 'ultimate-trading-guide-2026',
    title: 'The Ultimate Trading Guide 2026',
    summary:
      'Master market mechanics, risk management, and trading psychology with our complete handbook.',
    isGated: true,
  },
  {
    id: 302,
    slug: 'candlestick-patterns-mastery',
    title: 'Candlestick Patterns Mastery',
    summary: 'Identify high-probability price patterns across forex, stocks, and commodities.',
    isGated: true,
  },
  {
    id: 303,
    slug: 'risk-management-blueprint',
    title: 'Risk Management Blueprint',
    summary: 'Step-by-step risk management strategies used by institutional traders.',
    isGated: true,
  },
  {
    id: 304,
    slug: 'the-5-percent-rule',
    title: 'The 5% Rule',
    summary:
      'A 56-page framework for never losing more than 5% on a single trade — used by our desk every day.',
    isGated: true,
  },
];

export interface CmsEducationItem {
  id: number;
  slug: string;
  title: string;
  contentType: string;
  isGated?: boolean | null;
  thumbnailUrl?: string | null;
  description?: string | null;
}

interface EducationHubPageProps {
  content?: CmsEducationItem[];
  webinarCount?: number;
  glossaryTerms?: CmsGlossaryTerm[];
  guides?: CmsGuide[];
  ebooks?: CmsEbookItem[];
}

export function EducationHubPage({
  content: cmsContent,
  glossaryTerms,
  guides,
  ebooks,
}: EducationHubPageProps) {
  const t = useTranslations('education');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tagLabel = (tag: string): string =>
    ({
      NEW: t('tagNew'),
      POPULAR: t('tagPopular'),
      UPDATED: t('tagUpdated'),
      GUIDE: t('tagGuide'),
    })[tag] ?? tag;

  const cmsGuides = cmsContent
    ? cmsContent.filter((c) => c.contentType === 'guide' && /^[a-z0-9-]+$/.test(c.slug))
    : [];
  const FEATURED_TAGS = ['NEW', 'POPULAR', 'UPDATED'] as const;
  const cmsFeatured =
    cmsGuides.length > 0
      ? cmsGuides.slice(0, 3).map((g, i) => ({
          id: g.id,
          tag: FEATURED_TAGS[i] ?? 'GUIDE',
          title: g.title,
          desc: g.description ?? '',
          href: `/guides/${g.slug}`,
        }))
      : null;

  const [subscribing, setSubscribing] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || subscribing) return;
    setSubscribing(true);
    const cmsBase = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001';
    try {
      const res = await fetch(`${cmsBase}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <>
      {/* Hero — the curriculum framing */}
      <section className="px-5 pb-9 pt-9 xl:pt-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">{t('heroKicker')}</SectionKicker>
          <h1 className="text-foreground text-display font-sans">
            {t('heroLine1')} {t('heroLine2')}
            <br />
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-lead text-muted mt-5 max-w-[520px]">{t('heroDesc')}</p>
        </div>
      </section>

      {/* Extracted Sections — Listed One By One (No Tabs, No Redirection) */}
      <section className="px-5 pb-16 pt-2">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="flex flex-col gap-14">
            {/* Section 01: Trading Glossary */}
            <div className="rounded-[24px] border border-[#E6ECE8] bg-white p-6 shadow-sm sm:p-9 dark:border-white/[0.08] dark:bg-[#12141a]">
              <div className="mb-6 flex items-center gap-4 border-b border-[#E6ECE8] pb-4 dark:border-white/[0.08]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00b050] font-mono text-lg font-extrabold text-white shadow-sm">
                  01
                </span>
                <h2 className="text-foreground text-headline font-sans font-extrabold">
                  Trading Glossary
                </h2>
              </div>
              <GlossaryPage
                terms={
                  glossaryTerms && glossaryTerms.length > 0 ? glossaryTerms : DEFAULT_GLOSSARY_TERMS
                }
              />
            </div>

            {/* Section 02: In-Depth Guides */}
            <div className="rounded-[24px] border border-[#E6ECE8] bg-white p-6 shadow-sm sm:p-9 dark:border-white/[0.08] dark:bg-[#12141a]">
              <div className="mb-6 flex items-center gap-4 border-b border-[#E6ECE8] pb-4 dark:border-white/[0.08]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00b050] font-mono text-lg font-extrabold text-white shadow-sm">
                  02
                </span>
                <h2 className="text-foreground text-headline font-sans font-extrabold">
                  In-Depth Trading Guides
                </h2>
              </div>
              <GuidesPage guides={guides && guides.length > 0 ? guides : DEFAULT_GUIDES} />
            </div>

            {/* Section 03: Trading E-Books */}
            <div className="rounded-[24px] border border-[#E6ECE8] bg-white p-6 shadow-sm sm:p-9 dark:border-white/[0.08] dark:bg-[#12141a]">
              <div className="mb-6 flex items-center gap-4 border-b border-[#E6ECE8] pb-4 dark:border-white/[0.08]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00b050] font-mono text-lg font-extrabold text-white shadow-sm">
                  03
                </span>
                <h2 className="text-foreground text-headline font-sans font-extrabold">
                  Downloadable E-Books
                </h2>
              </div>
              <EbooksPage ebooks={ebooks && ebooks.length > 0 ? ebooks : DEFAULT_EBOOKS} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured this week — editorial divider rows */}
      <section className="px-5 pb-12 pt-0">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-5">{t('featuredKicker')}</SectionKicker>
          </ScrollReveal>
          <div className="flex flex-col divide-y divide-[#E6ECE8] dark:divide-white/[0.06]">
            {(cmsFeatured ?? FEATURED).map((article, idx) => (
              <ScrollReveal key={article.id} index={idx}>
                <div className="group flex items-start gap-4 py-5 xl:gap-6 xl:py-6">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-eyebrow inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono ${
                          article.tag === 'NEW'
                            ? 'border-accent text-accent'
                            : 'border-border text-muted dark:border-white/15'
                        }`}
                      >
                        {article.tag === 'NEW' && (
                          <span className="bg-accent h-1 w-1 rounded-full" />
                        )}
                        {tagLabel(article.tag)}
                      </span>
                      {'readTime' in article && (
                        <span className="text-caption text-muted/70 font-mono tabular-nums">
                          {(article as (typeof FEATURED)[0]).readTime}
                        </span>
                      )}
                    </div>
                    <p className="link-underline text-title text-foreground w-fit font-sans font-bold transition-colors group-hover:text-[#00b050]">
                      {article.title}
                    </p>
                    <p className="font-body text-body text-muted line-clamp-2 max-w-[640px]">
                      {article.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA — ink-band dark closer */}
      <section className="ink-band relative overflow-hidden rounded-t-[32px] px-5 pb-12 pt-10 xl:pb-16 xl:pt-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">{t('inboxKicker')}</SectionKicker>
            <h2 className="text-headline mb-2 font-sans text-white">{t('inboxHeading')}</h2>
            <p className="font-body text-body mb-6 text-white/60">{t('inboxDesc')}</p>
            {submitted ? (
              <div className="bg-accent/20 flex max-w-[560px] items-center gap-3 rounded-[14px] px-4 py-4">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-accent-bright flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10l4 4 8-8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-body text-body text-white">{t('inboxSuccess')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-[560px] gap-2">
                <input
                  type="email"
                  required
                  placeholder={t('inboxPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-body text-body flex-1 rounded-full border border-white/20 bg-white/[0.07] px-4 py-3 text-white placeholder-white/40 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-bright font-body text-body flex-shrink-0 rounded-full px-5 py-3 font-medium text-white transition-all active:scale-[0.98]"
                >
                  {t('inboxBtn')}
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
