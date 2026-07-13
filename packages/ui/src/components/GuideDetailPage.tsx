'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

function countWords(nodes: SlateNode[]): number {
  let text = '';
  const walk = (n: SlateNode) => {
    if (n.text) text += ' ' + n.text;
    n.children?.forEach(walk);
  };
  nodes.forEach(walk);
  return text.split(/\s+/).filter(Boolean).length;
}

/** Page read percentage, mirrors the ReadingProgress bar as a mono readout. */
function useReadPercent() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setPct(
        total > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / total) * 100))) : 0,
      );
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return pct;
}

function TocItems({
  headings,
  activeId,
  onNavigate,
}: {
  headings: { id: string; text: string; level: number }[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="flex flex-col">
      {headings.map((item, i) => {
        const active = activeId === item.id;
        return (
          <button
            key={`${item.id}-${i}`}
            onClick={() => onNavigate(item.id)}
            className={`group flex items-baseline gap-3 border-s-2 py-[9px] pe-2 ps-4 text-start transition-colors ${
              active ? 'border-accent' : 'border-border hover:border-accent/40'
            } ${item.level >= 3 ? 'ms-4' : ''}`}
          >
            <span
              dir="ltr"
              className={`font-mono text-[11px] font-semibold tabular-nums transition-colors ${
                active
                  ? 'text-accent'
                  : 'text-muted dark:text-accent-bright/40 group-hover:text-accent/70 dark:group-hover:text-accent-bright/80'
              }`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`font-body text-[14px] leading-snug transition-colors ${
                active ? 'text-foreground font-medium' : 'text-muted group-hover:text-foreground'
              }`}
            >
              {item.text}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function GuideDetailPage({ slug: _slug, guide: cmsGuide }: GuideDetailProps) {
  const locale = useLocale();
  const t = useTranslations('guideDetail');
  const [activeId, setActiveId] = useState('');
  const readPct = useReadPercent();

  const guide: CmsGuideDetail | null =
    cmsGuide && cmsGuide.body && cmsGuide.body.length > 0 ? cmsGuide : null;

  const hasCmsGuide = Boolean(guide && guide.body && guide.body.length > 0);
  const cmsHeadings = useMemo(
    () => (hasCmsGuide ? extractHeadings(guide!.body) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasCmsGuide, guide?.body],
  );
  const displayTitle = hasCmsGuide ? guide!.title : t('notFoundTitle');
  const displayAuthor = guide?.author ?? null;
  const readMinutes = useMemo(
    () => (hasCmsGuide ? Math.max(1, Math.round(countWords(guide!.body) / 200)) : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasCmsGuide, guide?.body],
  );

  // Scroll-spy: highlight the section currently under the reading line.
  const headingsKey = cmsHeadings.map((h) => h.id).join('|');
  useEffect(() => {
    if (!headingsKey) return;
    const els = headingsKey
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headingsKey]);

  const navigateTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <>
      <ReadingProgress />
      {/* Top breadcrumb */}
      <section className="bg-transparent px-5 pb-0 pt-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-muted flex items-center gap-2">
            <Link
              href={`/${locale}/education`}
              className="hover:text-accent font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
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
              className="hover:text-accent font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
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
            <span className="text-foreground max-w-[140px] truncate font-mono text-[11px] uppercase tracking-[0.1em]">
              {displayTitle.replace('.', '')}
            </span>
          </div>
        </div>
      </section>

      {/* Header: title + meta ledger */}
      <section className="px-5 pb-8 pt-6">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground text-headline max-w-[22ch] font-sans">{displayTitle}</h1>

          {hasCmsGuide && (
            <div className="border-border mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y py-3">
              {displayAuthor && (
                <span className="flex items-center gap-2.5">
                  <span className="bg-accent/15 flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="text-accent font-sans text-[12px] font-semibold">
                      {displayAuthor[0]}
                    </span>
                  </span>
                  <span className="text-foreground font-sans text-[14px] font-semibold">
                    {displayAuthor}
                  </span>
                </span>
              )}
              <span className="text-muted font-mono text-[12px] uppercase tracking-[0.08em]">
                {t('minRead', { minutes: readMinutes })}
              </span>
              {cmsHeadings.length > 0 && (
                <span className="text-muted font-mono text-[12px] uppercase tracking-[0.08em]">
                  {t('sectionsCount', { count: cmsHeadings.length })}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Guide not found state */}
      {!hasCmsGuide && (
        <section className="px-5 pb-12">
          <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <p className="font-body text-muted py-8 text-center text-[15px]">{t('notFound')}</p>
            <Link
              href={`/${locale}/guides`}
              className="font-body text-accent flex items-center justify-center gap-2 text-[14px] font-medium"
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

      {/* Article: sticky editorial TOC rail + reading-measure body */}
      {hasCmsGuide && (
        <section className="px-5 pb-12">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:grid xl:max-w-[1200px] xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start xl:gap-14">
            {/* Mobile TOC: bordered card above the article */}
            {cmsHeadings.length > 0 && (
              <div className="border-border shadow-card motion-safe:animate-rise-in mb-8 rounded-[18px] border bg-white p-5 xl:hidden dark:bg-[#111318]">
                <p className="text-eyebrow text-muted mb-3 font-mono uppercase">{t('tocLabel')}</p>
                <TocItems headings={cmsHeadings} activeId={activeId} onNavigate={navigateTo} />
              </div>
            )}

            {/* Desktop TOC rail: sticky, scroll-spied, with a live read readout */}
            {cmsHeadings.length > 0 && (
              <aside className="hidden xl:sticky xl:top-28 xl:block">
                <p className="text-eyebrow text-muted mb-4 font-mono uppercase">{t('tocLabel')}</p>
                <TocItems headings={cmsHeadings} activeId={activeId} onNavigate={navigateTo} />
                <div className="border-border mt-6 border-t pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted font-mono text-[11px] uppercase tracking-[0.1em]">
                      {t('progressLabel')}
                    </span>
                    <span
                      dir="ltr"
                      className="text-accent font-mono text-[13px] font-semibold tabular-nums"
                    >
                      {readPct}%
                    </span>
                  </div>
                  <div className="bg-border mt-2 h-[3px] overflow-hidden rounded-full">
                    <div
                      className="bg-accent h-full rounded-full transition-[width] duration-200 ease-out rtl:ms-auto"
                      style={{ width: `${readPct}%` }}
                    />
                  </div>
                </div>
              </aside>
            )}

            {/* Body at a reading measure, not full page width */}
            <article
              className={`motion-safe:animate-rise-in max-w-[720px] ${cmsHeadings.length === 0 ? 'xl:col-span-2' : ''}`}
            >
              <RichText content={guide!.body} />
            </article>
          </div>
        </section>
      )}

      {/* CTA closer on ink */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-accent-bright [&>span:last-child]:text-accent-bright mb-4">
            {t('ctaKicker')}
          </SectionKicker>
          <h2 className="text-headline-sm mb-3 font-sans text-white">{t('ctaHeading')}</h2>
          <p className="font-body mb-7 max-w-[52ch] text-[15px] leading-relaxed text-white/[0.72]">
            {t('ctaDesc')}
          </p>
          <Link
            href={`/${locale}/guides`}
            className="font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/45 active:scale-[0.98] md:w-fit md:px-8"
          >
            {t('moreGuides')}
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="rtl:-scale-x-100"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
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
