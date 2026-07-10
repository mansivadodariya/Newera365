'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ScrollReveal } from './ScrollReveal';
import { Pagination } from './Pagination';

const GUIDES_PER_PAGE = 9;

export interface CmsGuide {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  author?: string | null;
  featured?: boolean;
}

interface GuidesPageProps {
  guides?: CmsGuide[];
}

/** Small forward arrow — nudges toward the reading edge on row hover; RTL-mirrored. */
function ReadArrow({ className = '' }: { className?: string }) {
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
        d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Estimated reading time for an index row. The CMS list ships only title +
    excerpt (no body/word count), so we derive a stable estimate from the
    available text length and clamp it to a sensible guide range. Deterministic
    for a given guide — never random. */
function readingMinutes(guide: CmsGuide): number {
  const chars = guide.title.length + (guide.summary?.length ?? 0);
  return Math.min(14, Math.max(4, Math.round(chars / 20)));
}

export function GuidesPage({ guides: cmsGuides }: GuidesPageProps) {
  const locale = useLocale();
  const t = useTranslations('guides');
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const guides: CmsGuide[] = cmsGuides ?? [];
  const featured = guides.find((g) => g.featured) ?? null;
  // The featured guide is the shelf's cover, shown above the index — exclude it from the list.
  const rest = featured ? guides.filter((g) => g !== featured) : guides;
  const totalPages = Math.ceil(rest.length / GUIDES_PER_PAGE);
  const paged = rest.slice((page - 1) * GUIDES_PER_PAGE, page * GUIDES_PER_PAGE);

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">{t('heroKicker')}</SectionKicker>
          <h1 className="text-foreground text-display mb-4 font-sans">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="text-muted text-lead max-w-[46ch] font-sans">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Featured guide — the shelf's cover: editorial lead on an ink band, no imagery (guides are prose) */}
      {featured && (
        <section className="px-5 pb-5">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <ScrollReveal>
              <Link
                href={`/${locale}/guides/${featured.slug}`}
                className="ink-band hover:border-accent/40 group block overflow-hidden rounded-[24px] border border-white/[0.08] ring-1 ring-inset ring-white/[0.05] transition-colors duration-200"
              >
                <div className="p-6 xl:p-9">
                  <SectionKicker className="[&>span:first-child]:bg-accent-bright [&>span:last-child]:text-accent-bright mb-4">
                    {t('featuredLabel')}
                  </SectionKicker>
                  <h2 className="text-title xl:text-headline-sm group-hover:text-accent-bright max-w-[26ch] font-sans font-semibold leading-[1.12] text-white transition-colors duration-200">
                    {featured.title}
                  </h2>
                  {featured.summary && (
                    <p className="text-body mt-3 max-w-[64ch] font-sans leading-relaxed text-white/70">
                      {featured.summary}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                    <div className="flex items-center gap-3">
                      <span className="text-eyebrow inline-flex items-center rounded-full border border-white/[0.14] bg-white/[0.08] px-2.5 py-1 font-mono uppercase text-white/70 backdrop-blur">
                        {t('rowTag')}
                      </span>
                      {featured.author && (
                        <span className="text-caption inline-flex items-center gap-2 font-sans text-white/60">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.1] text-[11px] font-semibold text-white/80">
                            {featured.author[0]}
                          </span>
                          {featured.author}
                        </span>
                      )}
                    </div>
                    <span className="text-caption inline-flex items-center gap-1.5 font-sans font-medium text-white">
                      <span className="link-underline group-hover:[background-size:100%_1px]">
                        {t('featuredRead')}
                      </span>
                      <ReadArrow className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* All guides — the index: numbered ghost-numeral rows on ruled shelves */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mt-5">{t('allGuidesLabel')}</SectionKicker>
          <div ref={listRef} className="border-border mt-6 border-t">
            {rest.length === 0 && !featured && (
              <p className="text-muted text-body py-12 text-center font-sans">{t('noGuides')}</p>
            )}
            {paged.map((guide, i) => {
              const index = (page - 1) * GUIDES_PER_PAGE + i + 1;
              return (
                <ScrollReveal key={guide.id} index={i}>
                  <Link
                    href={`/${locale}/guides/${guide.slug}`}
                    className="border-border hover:border-s-accent group grid grid-cols-[auto_1fr] items-baseline gap-4 border-b border-s-2 border-s-transparent py-6 ps-3 transition-colors duration-200 xl:gap-6 xl:py-7 xl:ps-4"
                  >
                    <span
                      dir="ltr"
                      aria-hidden="true"
                      className="text-foreground/[0.08] group-hover:text-accent/30 w-[46px] shrink-0 font-sans text-[46px] font-semibold tabular-nums leading-none tracking-tight transition-colors duration-200 xl:w-[64px] xl:text-[60px]"
                    >
                      {String(index).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-foreground group-hover:text-accent text-body-lg font-sans font-semibold leading-snug transition-colors duration-200">
                        {guide.title}
                      </h3>
                      {guide.summary && (
                        <p className="text-muted text-body mt-2 max-w-[70ch] font-sans leading-relaxed">
                          {guide.summary}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-eyebrow border-border text-muted inline-flex items-center rounded-full border bg-white px-2.5 py-1 font-mono uppercase dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
                          {t('rowTag')}
                        </span>
                        <span className="text-eyebrow text-muted inline-flex items-center font-mono uppercase tabular-nums">
                          {t('minRead', { minutes: readingMinutes(guide) })}
                        </span>
                        {guide.author && (
                          <span className="text-caption text-muted inline-flex items-center gap-1.5 font-sans">
                            <span className="border-border text-muted flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-semibold dark:border-white/20 dark:text-white/60">
                              {guide.author[0]}
                            </span>
                            {guide.author}
                          </span>
                        )}
                        <span className="text-caption text-foreground ms-auto inline-flex items-center gap-1.5 font-sans font-medium">
                          <span className="link-underline group-hover:[background-size:100%_1px]">
                            {t('readLink')}
                          </span>
                          <ReadArrow className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            listRef={listRef}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-accent-bright [&>span:last-child]:text-accent-bright mb-4">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="text-headline-sm mb-3 font-sans text-white">{t('ctaHeading')}</h2>
          <p className="text-body mb-7 font-sans leading-relaxed text-white/60">{t('ctaDesc')}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/${locale}/education`}
              className="bg-accent hover:bg-accent/90 text-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full px-6 font-sans font-medium text-white transition-colors active:scale-[0.98] sm:w-auto sm:px-8"
            >
              {t('ctaEducation')}
              <ReadArrow />
            </Link>
            <Link
              href={`/${locale}/glossary`}
              className="text-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 font-sans font-medium text-white transition-colors hover:border-white/40 active:scale-[0.98] sm:w-auto sm:px-8"
            >
              {t('ctaGlossary')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
