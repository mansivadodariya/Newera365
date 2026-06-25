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
  const featured = guides.find((g) => g.featured) ?? guides[0] ?? null;
  const rest = guides.filter((g) => g !== featured);
  const totalPages = Math.ceil(rest.length / GUIDES_PER_PAGE);
  const pagedRest = rest.slice((page - 1) * GUIDES_PER_PAGE, page * GUIDES_PER_PAGE);

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

      {/* Featured guide */}
      {featured && (
        <section className="px-5 pb-6">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-4">{t('featuredLabel')}</SectionKicker>
            <Link
              href={`/${locale}/guides/${featured.slug}`}
              className="shadow-card-dark group block overflow-hidden rounded-[22px] bg-[#111111] p-6"
            >
              <h2 className="group-hover:text-accent mb-3 font-sans text-[24px] font-semibold leading-[1.1] text-white transition-colors">
                {featured.title}
              </h2>
              <p className="font-body mb-4 text-[13px] leading-[1.6] text-white/60">
                {featured.summary ?? ''}
              </p>
              {featured.author && (
                <div className="flex items-center gap-2">
                  <div className="bg-accent/20 flex h-6 w-6 items-center justify-center rounded-full">
                    <span className="text-accent font-sans text-[9px] font-semibold">
                      {featured.author[0]}
                    </span>
                  </div>
                  <span className="font-body text-[11px] text-white/50">{featured.author}</span>
                </div>
              )}
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
            {pagedRest.map((guide, i) => (
              <Link
                key={guide.id}
                href={`/${locale}/guides/${guide.slug}`}
                className={`group flex flex-col gap-2 py-5 ${i < pagedRest.length - 1 ? 'border-b border-[#e5e7eb] dark:border-white/[0.07]' : ''}`}
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
