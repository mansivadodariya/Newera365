'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { RichText, extractHeadings } from './RichText';
import type { SlateNode } from './RichText';
import { ReadingProgress } from './ReadingProgress';

export interface CmsGuideDetail {
  title: string;
  body: SlateNode[];
  author?: string | null;
}

export type GuideDetailProps = {
  slug: string;
  guide?: CmsGuideDetail | null;
};

export function GuideDetailPage({ slug: _slug, guide: cmsGuide }: GuideDetailProps) {
  const locale = useLocale();
  const t = useTranslations('guideDetail');
  const [activeSection, setActiveSection] = useState(0);

  const guide: CmsGuideDetail | null =
    cmsGuide && cmsGuide.body && cmsGuide.body.length > 0 ? cmsGuide : null;

  const hasCmsGuide = Boolean(guide && guide.body && guide.body.length > 0);
  const cmsHeadings = hasCmsGuide ? extractHeadings(guide!.body) : [];
  const displayTitle = hasCmsGuide ? guide!.title : t('notFoundTitle');
  const displayAuthor = guide?.author ?? null;

  return (
    <>
      <ReadingProgress />
      {/* Top breadcrumb */}
      <section className="bg-transparent px-5 pb-0 pt-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-muted flex items-center gap-2">
            <Link
              href={`/${locale}/education`}
              className="font-body hover:text-accent text-[11px] uppercase tracking-[0.1em] transition-colors"
            >
              {t('backEducation')}
            </Link>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none" className="rtl:-scale-x-100">
              <path
                d="M1 1l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Link
              href={`/${locale}/guides`}
              className="font-body hover:text-accent text-[11px] uppercase tracking-[0.1em] transition-colors"
            >
              {t('backGuides')}
            </Link>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none" className="rtl:-scale-x-100">
              <path
                d="M1 1l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-body text-foreground max-w-[120px] truncate text-[11px] uppercase tracking-[0.1em]">
              {displayTitle.replace('.', '')}
            </span>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="px-5 pb-6 pt-5">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[30px] font-semibold leading-[1.1] tracking-[-0.6px]">
            {displayTitle}
          </h1>

          {/* Author row */}
          {displayAuthor && (
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 flex h-8 w-8 items-center justify-center rounded-full">
                <span className="text-accent font-sans text-[12px] font-semibold">
                  {displayAuthor[0]}
                </span>
              </div>
              <p className="text-foreground font-sans text-[13px] font-semibold">{displayAuthor}</p>
            </div>
          )}
        </div>
      </section>

      {/* Guide not found state */}
      {!hasCmsGuide && (
        <section className="px-5 pb-12">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <p className="font-body text-muted py-8 text-center text-[14px]">{t('notFound')}</p>
            <Link
              href={`/${locale}/guides`}
              className="font-body text-accent flex items-center justify-center gap-2 text-[13px] font-medium"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="rtl:-scale-x-100"
              >
                <path
                  d="M11.5 7h-9M5 3.5L1.5 7l3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t('backGuides')}
            </Link>
          </div>
        </section>
      )}

      {/* Table of contents — built from CMS headings */}
      {hasCmsGuide && cmsHeadings.length > 0 && (
        <section className="px-5 pb-6">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <div className="bg-surface rounded-[18px] p-4">
              <p className="font-body text-muted mb-3 text-[9px] uppercase tracking-[0.12em]">
                {t('tocLabel')}
              </p>
              <div className="flex flex-col gap-0">
                {cmsHeadings.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(i)}
                    className={`flex items-center gap-2 py-[9px] text-start ${i < cmsHeadings.length - 1 ? 'dark:border-border border-b border-[#e5e7eb]' : ''}`}
                  >
                    <span
                      className={`font-body text-[10px] font-semibold ${activeSection === i ? 'text-accent' : 'text-muted'}`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-body text-[13px] ${activeSection === i ? 'text-foreground font-medium' : 'text-muted'}`}
                    >
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article body — rendered from CMS Slate content */}
      {hasCmsGuide && (
        <section className="px-5 pb-10">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <RichText content={guide!.body} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="text-headline-sm mb-3 font-sans text-white">{t('ctaHeading')}</h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">{t('ctaDesc')}</p>
          <Link
            href={`/${locale}/guides`}
            className="font-body flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
          >
            {t('moreGuides')}
          </Link>
        </div>
      </section>
    </>
  );
}
