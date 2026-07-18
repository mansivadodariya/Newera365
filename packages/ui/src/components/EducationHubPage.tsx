'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';

// Glyph tiles live only on the ink-art media cards; the paper reading index is
// purely typographic (ghost numeral + level), so guides/glossary/ebooks glyphs
// are intentionally not defined here.
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  videos: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.5l5 2.5-5 2.5V7.5z" fill="currentColor" />
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

type CatId = 'guides' | 'glossary' | 'webinars' | 'ebooks' | 'videos' | 'audio';
type LevelKey = 'levelBeginner' | 'levelIntermediate' | 'levelAdvanced';

interface CatDef {
  id: CatId;
  track: 'read' | 'media';
  level?: LevelKey;
  href: string;
  /** objectPosition slice for the shared ink plate (media track only). */
  crop?: string;
  /**
   * Matching CMS education-content `contentType` (singular), used for the live
   * count. The plural `id` still drives the type and count i18n keys, so the two
   * must not be conflated. `webinars` has no education-content type (separate
   * collection), so it has no live count and keeps the static fallback.
   */
  cmsType?: 'guide' | 'glossary' | 'ebook' | 'video' | 'audio';
}

// The curriculum path: three reading chapters climbing Beginner -> Advanced,
// then three media formats. Order IS the syllabus. `id` drives the type and
// count i18n keys; `cmsType` drives the live CMS count filter.
const CATEGORIES: CatDef[] = [
  { id: 'glossary', track: 'read', level: 'levelBeginner', href: '/glossary', cmsType: 'glossary' },
  { id: 'guides', track: 'read', level: 'levelIntermediate', href: '/guides', cmsType: 'guide' },
  { id: 'ebooks', track: 'read', level: 'levelAdvanced', href: '/ebooks', cmsType: 'ebook' },
  { id: 'videos', track: 'media', href: '/education/media', crop: '20% 40%', cmsType: 'video' },
  { id: 'webinars', track: 'media', href: '/education/media', crop: '50% 30%' },
  { id: 'audio', track: 'media', href: '/education/media', crop: '82% 45%', cmsType: 'audio' },
];

const LEVEL_DOT: Record<LevelKey, string> = {
  levelBeginner: 'bg-accent/40',
  levelIntermediate: 'bg-accent/70',
  levelAdvanced: 'bg-accent',
};

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
  /** Live count from the separate `webinars` collection (webinars aren't education-content). */
  webinarCount?: number;
}

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export function EducationHubPage({ content: cmsContent, webinarCount }: EducationHubPageProps) {
  const locale = useLocale();
  const t = useTranslations('education');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Real CMS count whenever the source is reachable (shown even when it's 0, so
  // the card never lies). Falls back to the localized static count only when the
  // data source is entirely absent (CMS unreachable) — the static keys are
  // per-type so they never render raw English in AR. Webinars live in their own
  // collection, so their count comes in via the `webinarCount` prop.
  const cats = CATEGORIES.map((cat) => {
    let count: number | null = null;
    if (cat.id === 'webinars') {
      count = webinarCount ?? null;
    } else if (cmsContent && cat.cmsType) {
      count = cmsContent.filter((c) => c.contentType === cat.cmsType).length;
    }
    return {
      ...cat,
      title: t(`type${cap(cat.id)}Title` as 'typeGuidesTitle'),
      desc: t(`type${cap(cat.id)}Desc` as 'typeGuidesDesc'),
      count: count != null ? `${count}` : t(`count${cap(cat.id)}` as 'countGuides'),
    };
  });

  const readingTrack = cats.filter((c) => c.track === 'read');
  const mediaTrack = cats.filter((c) => c.track === 'media');

  // Localize the featured-article tag (NEW / POPULAR / UPDATED / GUIDE) for AR.
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

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  const chevron = (
    <svg
      width="7"
      height="12"
      viewBox="0 0 7 12"
      fill="none"
      className="flex-shrink-0 rtl:-scale-x-100"
      aria-hidden="true"
    >
      <path
        d="M1 1L6 6L1 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      {/* Hero — the curriculum framing */}
      <section className="px-5 pb-9 pt-9 xl:pt-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">
            {t('heroKicker')}
          </SectionKicker>
          <h1 className="text-foreground text-display font-sans">
            {t('heroLine1')} {t('heroLine2')}
            <br />
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-lead text-muted mt-5 max-w-[520px]">{t('heroDesc')}</p>
        </div>
      </section>

      {/* Reading path — numbered editorial index inside a syllabus card */}
      <section className="px-5 pb-12">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">
              {t('readingKicker')}
            </SectionKicker>
            <h2 className="text-foreground text-headline mb-6 max-w-[640px] font-sans">
              {t('readingHeading')}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="border-border shadow-card overflow-hidden rounded-[24px] border bg-white dark:border-white/[0.06] dark:bg-[#12141a]">
              {readingTrack.map((row, i) => (
                <Link
                  key={row.id}
                  href={`/${locale}${row.href}`}
                  className="group flex items-center gap-4 border-b border-[#E6ECE8] px-5 py-6 transition-colors last:border-b-0 hover:bg-accent/[0.05] xl:gap-7 xl:px-8 xl:py-7 dark:border-white/[0.05] dark:hover:bg-accent/[0.06]"
                >
                  {/* Ghost numeral — latin figure, reads LTR in both directions */}
                  <span
                    dir="ltr"
                    className="text-metric-sm text-foreground group-hover:text-accent dark:text-accent-bright w-[42px] flex-shrink-0 font-sans font-semibold tabular-nums leading-none tracking-tight opacity-[0.08] transition-[color,opacity] duration-200 group-hover:opacity-40 xl:w-[62px] dark:opacity-[0.28] dark:group-hover:opacity-70"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {row.level && (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${LEVEL_DOT[row.level]}`}
                          />
                          <span className="text-eyebrow text-muted font-mono">
                            {t(row.level as 'levelBeginner')}
                          </span>
                        </span>
                      )}
                      <span className="text-caption text-muted/70 font-mono tabular-nums">
                        {row.count}
                      </span>
                    </div>
                    <p className="link-underline text-title group-hover:text-accent text-foreground w-fit font-sans transition-colors">
                      {row.title}
                    </p>
                    <p className="font-body text-body text-muted line-clamp-1 max-w-[560px]">
                      {row.desc}
                    </p>
                  </div>

                  <span className="text-muted group-hover:text-accent transition-colors">
                    {chevron}
                  </span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Watch and listen — media formats as ink-art cards */}
      <section className="px-5 pb-12">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">
              {t('mediaKicker')}
            </SectionKicker>
            <h2 className="text-foreground text-headline mb-6 font-sans">{t('mediaHeading')}</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {mediaTrack.map((row, j) => (
              <ScrollReveal key={row.id} index={j}>
                <Link
                  href={`/${locale}${row.href}`}
                  className="hover:border-accent/45 group relative block h-[188px] overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0A130E] shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)] ring-1 ring-inset ring-white/[0.06] transition-colors xl:h-[212px]"
                >
                  <img
                    src="/images/edge-flow.jpg"
                    alt=""
                    aria-hidden="true"
                    style={{ objectPosition: row.crop }}
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.5] transition-opacity duration-300 group-hover:opacity-[0.72]"
                  />
                  {/* Green-black scrim anchoring the text zone */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03130B]/[0.92] via-[#03130B]/[0.38] to-[#03130B]/[0.12]" />

                  {/* Ghost numeral bleeding off the top corner (04..06) */}
                  <span
                    dir="ltr"
                    className="text-accent-bright/[0.14] group-hover:text-accent-bright/30 pointer-events-none absolute end-4 top-1 select-none font-mono text-[84px] font-bold leading-none transition-colors duration-300"
                  >
                    {String(readingTrack.length + j + 1).padStart(2, '0')}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/[0.16] bg-white/[0.08] text-white backdrop-blur">
                      {CATEGORY_ICONS[row.id]}
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-sans text-[17px] font-semibold leading-tight text-white">
                          {row.title}
                        </p>
                        <p className="font-body text-caption mt-1 text-white/[0.72]">{row.desc}</p>
                      </div>
                      <span className="text-caption inline-flex flex-shrink-0 items-center rounded-full border border-white/[0.14] bg-white/[0.09] px-2.5 py-1 font-mono tabular-nums text-white/80 backdrop-blur">
                        {row.count}
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured this week — editorial divider rows */}
      <section className="px-5 pb-12 pt-2">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-5">
              {t('featuredKicker')}
            </SectionKicker>
          </ScrollReveal>
          <div className="flex flex-col divide-y divide-[#E6ECE8] dark:divide-white/[0.06]">
            {(cmsFeatured ?? FEATURED).map((article, idx) => (
              <ScrollReveal key={article.id} index={idx}>
                <Link
                  href={`/${locale}${article.href}`}
                  className="group flex items-start gap-4 py-5 xl:gap-6 xl:py-6"
                >
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-eyebrow inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono ${
                          article.tag === 'NEW'
                            ? 'border-accent/30 text-accent'
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
                    <p className="link-underline text-title group-hover:text-accent text-foreground w-fit font-sans transition-colors">
                      {article.title}
                    </p>
                    <p className="font-body text-body text-muted line-clamp-2 max-w-[640px]">
                      {article.desc}
                    </p>
                  </div>

                  <span className="text-muted group-hover:text-accent mt-1.5 transition-colors">
                    {chevron}
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA — ink-band dark closer */}
      <section className="ink-band relative overflow-hidden rounded-t-[32px] px-5 pb-12 pt-10 xl:pb-16 xl:pt-14">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-4">
              {t('inboxKicker')}
            </SectionKicker>
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
