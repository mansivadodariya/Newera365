'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
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

export function GuidesPage({ guides: cmsGuides }: GuidesPageProps) {
  const locale = useLocale();
  const t = useTranslations('guides');
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const guides: CmsGuide[] = cmsGuides ?? [];
  const featured = guides.find((g) => g.featured) ?? null;
  // The featured guide gets its own card above the list, so the list excludes it.
  const rest = featured ? guides.filter((g) => g !== featured) : guides;
  const totalPages = Math.ceil(rest.length / GUIDES_PER_PAGE);
  const paged = rest.slice((page - 1) * GUIDES_PER_PAGE, page * GUIDES_PER_PAGE);

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Featured guide — dark editorial panel, no imagery (guides are prose) */}
      {featured && (
        <section className="px-5 pb-4">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <Link
              href={`/${locale}/guides/${featured.slug}`}
              className="group block overflow-hidden rounded-[22px] border border-transparent bg-[#111111] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)] dark:border-white/[0.08] dark:bg-[#15171c]"
            >
              <div className="p-6 xl:p-9">
                <p className="text-accent-bright mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em]">
                  {t('featuredLabel')}
                </p>
                <h2 className="group-hover:text-accent-bright max-w-[26ch] font-sans text-[22px] font-semibold leading-[1.15] text-white transition-colors duration-200 xl:text-[28px]">
                  {featured.title}
                </h2>
                {featured.summary && (
                  <p className="font-body mt-3 max-w-[64ch] text-[13.5px] leading-[1.6] text-white/60">
                    {featured.summary}
                  </p>
                )}
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                  {featured.author ? (
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] font-sans text-[11px] font-semibold text-white/80">
                        {featured.author[0]}
                      </span>
                      <span className="font-body text-[12px] text-white/60">{featured.author}</span>
                    </div>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  <span className="font-body inline-flex items-center gap-1.5 text-[13px] font-medium text-white">
                    {t('featuredRead')}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                      className="rtl:-scale-x-100"
                    >
                      <path
                        d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* All guides */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mt-5">{t('allGuidesLabel')}</SectionKicker>
          <div ref={listRef} className="flex flex-col gap-0">
            {rest.length === 0 && !featured && (
              <p className="font-body text-muted py-12 text-center text-[14px]">{t('noGuides')}</p>
            )}
            {paged.map((guide, i) => (
              <Link
                key={guide.id}
                href={`/${locale}/guides/${guide.slug}`}
                className={`group flex flex-col gap-2 py-5 ${i < paged.length - 1 ? 'border-b border-[#e5e7eb] dark:border-white/[0.07]' : ''}`}
              >
                <p className="text-foreground group-hover:text-accent font-sans text-[15px] font-semibold leading-[1.3] transition-colors">
                  {guide.title}
                </p>
                <p className="font-body text-muted text-[12px] leading-[1.55]">
                  {guide.summary ?? ''}
                </p>
                {guide.author && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e5e7eb] dark:border-white/20">
                      <span className="text-muted font-sans text-[8px] font-semibold">
                        {guide.author[0]}
                      </span>
                    </div>
                    <span className="font-body text-muted text-[11px]">{guide.author}</span>
                  </div>
                )}
              </Link>
            ))}
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
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            {t('ctaHeading')}
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">{t('ctaDesc')}</p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/${locale}/education`}
              className="bg-accent hover:bg-accent/90 font-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
            >
              {t('ctaEducation')}
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
            <Link
              href={`/${locale}/glossary`}
              className="font-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
            >
              {t('ctaGlossary')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
