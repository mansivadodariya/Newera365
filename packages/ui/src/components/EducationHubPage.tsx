'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  guides: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  glossary: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 5h12M4 10h8M4 15h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  webinars: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15 8l3-2v8l-3-2V8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ebooks: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3v10M6 9l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  videos: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.5l5 2.5-5 2.5V7.5z" fill="currentColor" />
    </svg>
  ),
  audio: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M6 8a4 4 0 018 0v5a4 4 0 01-8 0V8zM10 17v2M7 19h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const CATEGORIES = [
  {
    id: 'guides',
    title: 'Guides',
    desc: '5 in-depth articles on core trading concepts.',
    count: '4x GUIDES',
    href: '/guides',
  },
  {
    id: 'glossary',
    title: 'Glossary',
    desc: 'Every trading term, defined in plain English.',
    count: '430 TERMS',
    href: '/glossary',
  },
  {
    id: 'webinars',
    title: 'Webinars',
    desc: 'Live sessions from market experts.',
    count: 'LIVE + 8',
    href: '/education/media',
  },
  {
    id: 'ebooks',
    title: 'E-Books',
    desc: 'Free downloadable trading guides.',
    count: '4x EBOOKS',
    href: '/ebooks',
  },
  {
    id: 'videos',
    title: 'Videos',
    desc: 'Short-form analysis and market breakdowns.',
    count: '30+ VIDEOS',
    href: '/education/media',
  },
  {
    id: 'audio',
    title: 'Audio',
    desc: 'Podcast episodes from trading experts.',
    count: '20+ EPISODES',
    href: '/education/media',
  },
] as const;

const FEATURED = [
  {
    id: 'macro',
    tag: 'NEW',
    tagClass: 'bg-accent/10 text-accent',
    title: 'The 2026 macro outlook',
    desc: 'Rising inflation or rate cuts? We break down what every scenario means for your positions.',
    readTime: '6 min',
    href: '/guides/macro-outlook-2026',
  },
  {
    id: 'risk',
    tag: 'POPULAR',
    tagClass: 'bg-[#6B7280]/10 text-[#6B7280]',
    title: 'Risk management essentials',
    desc: 'Four frameworks that protect every account from outsized drawdowns.',
    readTime: '8 min',
    href: '/guides/risk-management',
  },
  {
    id: 'candle',
    tag: 'UPDATED',
    tagClass: 'bg-[#3B82F6]/10 text-[#3B82F6]',
    title: 'Reading a candlestick chart',
    desc: 'From opening price to daily wick — everything you need to parse a chart.',
    readTime: '5 min',
    href: '/guides/candlestick-chart',
  },
] as const;

const PINNED_GUIDES = [
  { title: 'What is leverage, and how does it work?', href: '/guides/leverage-and-margin' },
  { title: 'How to size a position correctly', href: '/guides/position-sizing' },
  { title: 'The difference between a stop-loss and stop-out', href: '/guides/stop-loss' },
  { title: "Beginner's guide to reading economic data", href: '/guides/economic-data' },
] as const;

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
}

export function EducationHubPage({ content: cmsContent }: EducationHubPageProps) {
  const locale = useLocale();
  const t = useTranslations('education');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const cmsCounts = cmsContent
    ? CATEGORIES.map((cat) => {
        const count = cmsContent.filter((c) => c.contentType === cat.id).length;
        return { ...cat, count: count > 0 ? `${count}` : cat.count };
      })
    : null;

  // Derive featured articles and pinned guides from CMS guide content
  const cmsGuides = cmsContent ? cmsContent.filter((c) => c.contentType === 'guide') : [];
  const FEATURED_TAGS = [
    { tag: 'NEW', tagClass: 'bg-accent/10 text-accent' },
    { tag: 'POPULAR', tagClass: 'bg-[#6B7280]/10 text-[#6B7280]' },
    { tag: 'UPDATED', tagClass: 'bg-[#3B82F6]/10 text-[#3B82F6]' },
  ] as const;
  const cmsFeatured =
    cmsGuides.length > 0
      ? cmsGuides.slice(0, 3).map((g, i) => ({
          id: g.id,
          tag: FEATURED_TAGS[i]?.tag ?? 'GUIDE',
          tagClass: FEATURED_TAGS[i]?.tagClass ?? 'bg-muted/10 text-muted',
          title: g.title,
          desc: g.description ?? '',
          href: `/guides/${g.slug}`,
        }))
      : null;
  const cmsPinned =
    cmsGuides.length > 3
      ? cmsGuides.slice(3, 7).map((g) => ({ title: g.title, href: `/guides/${g.slug}` }))
      : null;

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[42px] font-semibold leading-[1.05] tracking-[-1.26px]">
            {t('heroLine1')}
            <br />
            {t('heroLine2')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Category grid */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('browseKicker')}
          </SectionKicker>
          <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-3">
            {(cmsCounts ?? CATEGORIES).map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}${cat.href}`}
                className="bg-surface dark:hover:bg-surface-elevated group flex flex-col gap-3 rounded-[18px] p-4 transition-colors hover:bg-[#f0f0ee]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-accent bg-accent/10 flex h-9 w-9 items-center justify-center rounded-[11px]">
                    {CATEGORY_ICONS[cat.id]}
                  </div>
                  <span className="font-body text-accent bg-accent/10 rounded-full px-2 py-[3px] text-[8px] font-semibold uppercase tracking-[0.1em]">
                    {cat.count}
                  </span>
                </div>
                <div>
                  <p className="text-foreground mb-1 font-sans text-[14px] font-semibold">
                    {t(
                      `type${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}Title` as 'typeGuidesTitle',
                    )}
                  </p>
                  <p className="font-body text-muted text-[11px] leading-[1.5]">
                    {t(
                      `type${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}Desc` as 'typeGuidesDesc',
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured this week */}
      <section className="bg-surface px-5 pb-10 pt-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('featuredKicker')}
          </SectionKicker>
          <div className="dark:divide-border flex flex-col divide-y divide-[#e5e7eb]">
            {(cmsFeatured ?? FEATURED).map((article) => (
              <Link
                key={article.id}
                href={`/${locale}${article.href}`}
                className="group flex flex-col gap-2 py-5 first:pt-0 last:pb-0 xl:px-6 xl:py-0 xl:first:pl-0 xl:last:pr-0"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${article.tagClass}`}
                  >
                    {article.tag}
                  </span>
                </div>
                <p className="text-foreground group-hover:text-accent font-sans text-[15px] font-semibold leading-[1.3] transition-colors">
                  {article.title}
                </p>
                <div className="flex items-end justify-between gap-4">
                  <p className="font-body text-muted flex-1 text-[12px] leading-[1.55]">
                    {article.desc}
                  </p>
                  <svg
                    width="7"
                    height="12"
                    viewBox="0 0 7 12"
                    fill="none"
                    className="text-muted group-hover:text-accent mb-0.5 flex-shrink-0 transition-colors"
                  >
                    <path
                      d="M1 1L6 6L1 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pinned guides */}
      <section className="px-5 pb-10 pt-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-5">
            {t('pinnedKicker')}
          </SectionKicker>
          <div className="flex flex-col">
            {(cmsPinned ?? PINNED_GUIDES).map((guide, i) => (
              <Link
                key={guide.href}
                href={`/${locale}${guide.href}`}
                className={`group flex items-center justify-between py-4 ${i < (cmsPinned ?? PINNED_GUIDES).length - 1 ? 'dark:border-border border-b border-[#e5e7eb]' : ''}`}
              >
                <span className="text-foreground font-body group-hover:text-accent pr-4 text-[14px] font-medium transition-colors">
                  {guide.title}
                </span>
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                  className="text-muted group-hover:text-accent flex-shrink-0 transition-colors"
                >
                  <path
                    d="M1 1L6 6L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            {t('inboxKicker')}
          </SectionKicker>
          <h2 className="mb-2 font-sans text-[28px] font-semibold leading-[1.1] text-white">
            {t('inboxHeading')}
          </h2>
          <p className="font-body mb-6 text-[13px] leading-relaxed text-white/60">
            {t('inboxDesc')}
          </p>
          {submitted ? (
            <div className="bg-accent/20 flex items-center gap-3 rounded-[14px] px-4 py-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="text-accent flex-shrink-0"
              >
                <path
                  d="M4 10l4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-body text-[14px] text-white">{t('inboxSuccess')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder={t('inboxPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-body focus:border-accent flex-1 rounded-full border border-white/20 bg-white/[0.07] px-4 py-3 text-[13px] text-white placeholder-white/40 outline-none"
              />
              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 font-body flex-shrink-0 rounded-full px-5 py-3 text-[13px] font-medium text-white transition-colors"
              >
                {t('inboxBtn')}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
