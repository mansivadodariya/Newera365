'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RichText, extractHeadings } from '../primitives/RichText';
import type { SlateNode } from '../primitives/RichText';
import { SectionKicker } from '../primitives/SectionKicker';
import { ReadingProgress } from '../motion/ReadingProgress';

export interface CmsLegalDocument {
  id: number;
  pageType: string;
  title: string;
  body: SlateNode[];
  effectiveDate?: string | null;
  version?: string | null;
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  terms: 'Terms & Conditions',
  'privacy-policy': 'Privacy Policy',
  'risk-disclosure': 'Risk Warning',
  'aml-policy': 'AML Policy',
  'cookie-policy': 'Cookie Policy',
  'website-terms': 'Website Terms',
  'anti-fraud-policy': 'Anti-Fraud Policy',
  'conflicts-of-interest': 'Conflicts of Interest',
  'complaint-handling': 'Complaint Handling',
  'deposit-withdrawal': 'Deposit & Withdrawal',
  'order-execution': 'Order Execution',
  'suspicious-activity-reporting': 'SAR Policy',
};

// Deterministic so server and client render identically (no hydration mismatch):
// fixed UTC timezone + Latin digits regardless of locale.
function formatLegalDate(iso: string, locale: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

interface LegalPageProps {
  documents?: CmsLegalDocument[];
}

// Legal copy is CMS-only by design: no hardcoded fallback text may ship here
// (regulatory wording is owned by compliance, not the codebase).
export function LegalPage({ documents }: LegalPageProps) {
  const t = useTranslations('legal');
  const locale = useLocale();

  const docLabel = (id: string) => {
    switch (id) {
      case 'terms':
        return t('docTerms');
      case 'privacy-policy':
        return t('docPrivacy');
      case 'risk-disclosure':
        return t('docRisk');
      case 'aml-policy':
        return t('docAml');
      case 'cookie-policy':
        return t('docCookies');
      case 'website-terms':
        return t.has('docWebsiteTerms') ? t('docWebsiteTerms') : 'Website Terms';
      case 'anti-fraud-policy':
        return t.has('docAntiFraud') ? t('docAntiFraud') : 'Anti-Fraud Policy';
      case 'conflicts-of-interest':
        return t.has('docConflicts') ? t('docConflicts') : 'Conflicts of Interest';
      case 'complaint-handling':
        return t.has('docComplaintHandling') ? t('docComplaintHandling') : 'Complaint Handling';
      case 'deposit-withdrawal':
        return t.has('docDepositWithdrawal') ? t('docDepositWithdrawal') : 'Deposit & Withdrawal';
      case 'order-execution':
        return t.has('docOrderExecution') ? t('docOrderExecution') : 'Order Execution';
      case 'suspicious-activity-reporting':
        return t.has('docSar') ? t('docSar') : 'SAR Policy';
      default:
        return id;
    }
  };

  const uniqueDocs = (documents ?? [])
    .filter((d) => Boolean(d.title?.trim()))
    .filter((d, i, arr) => arr.findIndex((x) => x.pageType === d.pageType) === i);
  const hasCms = uniqueDocs.length > 0;

  const cmsDocList = uniqueDocs.map((d) => ({
    id: d.pageType,
    label: PAGE_TYPE_LABELS[d.pageType] ? docLabel(d.pageType) : d.title,
  }));

  const [activeDoc, setActiveDoc] = useState<string>(() => {
    if (typeof window !== 'undefined' && uniqueDocs.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam =
        searchParams.get('tab') ||
        searchParams.get('doc') ||
        searchParams.get('type') ||
        window.location.hash.replace('#', '');

      if (tabParam) {
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = norm(tabParam);

        const matched = uniqueDocs.find((d) => {
          const typeNorm = norm(d.pageType);
          const titleNorm = norm(d.title || '');
          return (
            typeNorm === target ||
            typeNorm.includes(target) ||
            target.includes(typeNorm) ||
            titleNorm.includes(target)
          );
        });

        if (matched) return matched.pageType;
      }
    }
    return uniqueDocs[0]?.pageType ?? '';
  });

  // Synchronize active tab with URL query parameter or hash on navigation
  useEffect(() => {
    if (typeof window === 'undefined' || uniqueDocs.length === 0) return;
    const syncDocFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam =
        searchParams.get('tab') ||
        searchParams.get('doc') ||
        searchParams.get('type') ||
        window.location.hash.replace('#', '');

      if (!tabParam) return;

      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const target = norm(tabParam);

      const matched = uniqueDocs.find((d) => {
        const typeNorm = norm(d.pageType);
        const titleNorm = norm(d.title || '');
        return (
          typeNorm === target ||
          typeNorm.includes(target) ||
          target.includes(typeNorm) ||
          titleNorm.includes(target)
        );
      });

      if (matched) {
        setActiveDoc(matched.pageType);
      }
    };

    syncDocFromUrl();
    window.addEventListener('popstate', syncDocFromUrl);
    window.addEventListener('hashchange', syncDocFromUrl);
    return () => {
      window.removeEventListener('popstate', syncDocFromUrl);
      window.removeEventListener('hashchange', syncDocFromUrl);
    };
  }, [uniqueDocs]);

  const selectTab = (id: string) => {
    setActiveDoc(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const cmsDoc = uniqueDocs.find((d) => d.pageType === activeDoc) ?? null;
  const tocItems = cmsDoc
    ? extractHeadings(cmsDoc.body).map((h, idx) => ({
        num: String(idx + 1),
        title: h.text,
        id: h.id,
      }))
    : [];

  // Scroll-spy: highlight the TOC anchor for the section currently in view.
  // A pure observer (no animation), so it stays on for reduced-motion users.
  const [activeId, setActiveId] = useState<string>('');
  const tocKey = tocItems.map((it) => it.id).join('|');
  useEffect(() => {
    const ids = tocKey ? tocKey.split('|') : [];
    if (ids.length === 0) {
      setActiveId('');
      return;
    }
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    setActiveId(ids[0] ?? '');

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (top) setActiveId(top.target.id);
      },
      { rootMargin: '-88px 0px -66% 0px', threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocKey]);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const checkScrollability = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability, { passive: true });

    // Enable horizontal scroll via mouse wheel
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [checkScrollability, cmsDocList.length]);

  // Center active tab in view on change
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      const elRect = el.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const targetScroll =
        el.scrollLeft + (btnRect.left - elRect.left) - elRect.width / 2 + btnRect.width / 2;
      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [activeDoc]);

  const scrollByAmount = (amount: number) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftPos(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = tabsContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftPos - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const hasToc = tocItems.length > 0;

  return (
    <>
      <ReadingProgress />

      {/* Hero */}
      <section className="bg-transparent px-5 pb-6 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground text-display font-sans">
            {t('heroLine1')}
            <br />
            <span>{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted max-w-[340px] text-[15px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Document selector: terminal chips with horizontal scrolling */}
      {hasCms && (
        <section className="px-5 pb-6">
          <div className="motion-safe:animate-rise-in relative mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollByAmount(-240)}
                className="border-border text-foreground absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-transform hover:scale-110 md:flex dark:border-white/10 dark:bg-[#1a1c22]/90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={tabsContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              className={`scrollbar-hide flex select-none gap-2 overflow-x-auto scroll-smooth py-1 ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab md:cursor-auto'
              }`}
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {cmsDocList.map((doc) => (
                <button
                  key={doc.id}
                  data-active={activeDoc === doc.id ? 'true' : 'false'}
                  onClick={() => selectTab(doc.id)}
                  className={`flex-shrink-0 rounded-full border px-4 py-[7px] font-mono text-[12px] uppercase tracking-[0.06em] transition-all active:scale-[0.98] ${
                    activeDoc === doc.id
                      ? 'bg-accent border-transparent text-white shadow-sm'
                      : 'border-border text-muted hover:border-accent/50 hover:text-foreground dark:hover:border-accent/50 bg-white dark:border-white/10 dark:bg-[#111318] dark:text-white/55 dark:hover:text-white'
                  }`}
                >
                  {doc.label}
                </button>
              ))}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollByAmount(240)}
                className="border-border text-foreground absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-transform hover:scale-110 md:flex dark:border-white/10 dark:bg-[#1a1c22]/90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Sticky TOC rail + document body */}
      <section className="px-5 pb-12">
        <div
          className={`mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px] ${
            hasToc ? 'xl:grid xl:grid-cols-[260px_1fr] xl:gap-12' : ''
          }`}
        >
          {/* Table of contents: collapses above the body on mobile, sticky rail on xl */}
          {hasToc && (
            <aside className="motion-safe:animate-rise-in mb-8 xl:mb-0">
              <nav
                aria-label={t('tocHeading')}
                className="border-border rounded-[16px] border bg-white p-4 xl:sticky xl:top-[88px] xl:p-5 dark:border-white/10 dark:bg-[#1a1c22]"
              >
                <SectionKicker className="mb-4">{t('tocHeading')}</SectionKicker>
                <ol className="list-dim flex flex-col gap-0.5">
                  {tocItems.map((item) => {
                    const active = item.id === activeId;
                    return (
                      <li key={item.num}>
                        <a
                          href={`#${item.id}`}
                          aria-current={active ? 'true' : undefined}
                          className={`group flex items-baseline gap-3 border-s-2 py-1.5 ps-3 text-[13px] transition-colors ${
                            active
                              ? 'border-accent text-foreground font-medium dark:text-white'
                              : 'text-foreground/60 hover:text-foreground border-transparent dark:text-white/55 dark:hover:text-white'
                          }`}
                        >
                          <span
                            className={`font-mono text-[11px] tabular-nums transition-colors ${
                              active ? 'text-accent' : 'text-muted'
                            }`}
                          >
                            {item.num.padStart(2, '0')}
                          </span>
                          <span className="link-underline">{item.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </aside>
          )}

          {/* Document body: CMS content only */}
          <div className="flex min-w-0 flex-col gap-6">
            {cmsDoc ? (
              <>
                {(cmsDoc.effectiveDate || cmsDoc.version) && (
                  <p className="text-muted font-mono text-[11px] uppercase tracking-[1.54px]">
                    {[
                      cmsDoc.effectiveDate
                        ? `${t('effectivePrefix')} ${formatLegalDate(cmsDoc.effectiveDate, locale)}`
                        : null,
                      cmsDoc.version || null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                <RichText
                  content={cmsDoc.body}
                  className="[&_a]:link-underline flex flex-col gap-3 [&_h2]:scroll-mt-[88px] [&_h3]:scroll-mt-[88px]"
                />
              </>
            ) : (
              <p className="font-body text-muted py-10 text-center text-[15px]">
                {t('emptyState')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="ink-band rounded-t-[32px] px-5 pb-12 pt-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <p className="font-body text-caption mb-5 hyphens-auto text-justify leading-[1.7] text-white/60">
            {t('footerDisclaimer')}
          </p>
          {hasCms && (
            <div className="flex flex-wrap gap-3">
              {cmsDocList
                .filter((d) => d.id !== activeDoc)
                .map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    className="hover:border-accent-bright/60 rounded-full border border-white/20 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.06em] text-white/70 transition-colors hover:text-white active:scale-[0.98]"
                  >
                    {doc.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
