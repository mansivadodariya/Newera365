'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { RichText, extractHeadings } from './RichText';
import type { SlateNode } from './RichText';

export interface CmsGuideDetail {
  title: string;
  body: SlateNode[];
  author?: string | null;
}

export type GuideDetailProps = {
  slug: string;
  guide?: CmsGuideDetail | null;
};

const GUIDES_DATA: Record<
  string,
  {
    category: string;
    categoryClass: string;
    title: string;
    subtitle: string;
    author: string;
    readTime: string;
    date: string;
    toc: string[];
    sections: { heading: string; body: string; insight?: string }[];
  }
> = {
  'leverage-and-margin': {
    category: 'FOUNDATIONS',
    categoryClass: 'bg-accent/10 text-accent',
    title: 'Leverage and margin, without the panic.',
    subtitle:
      'The single most misunderstood concept in retail trading. A clear, no-jargon explanation of how leverage actually works.',
    author: 'Diego Romero',
    readTime: '9 min',
    date: 'Posted May 2026',
    toc: [
      'What is leverage?',
      'How margin works',
      'Position sizing',
      'The 5% rule applied',
      'Common mistakes',
      'Understanding stop-out',
    ],
    sections: [
      {
        heading: 'What is leverage?',
        body: "Leverage is the ratio of the exposure you control to the capital you actually put down. A 1:100 leverage ratio means that for every $1 in your account, you control $100 of market exposure. It's a multiplier — works both ways.\n\nIf you hold a $100,000 position with $1,000 of your own money, a 1% move in your favour returns $1,000 — doubling your stake. A 1% move against you wipes it entirely. This isn't exotic — it's arithmetic, and it means both position sizing and account leverage need to be understood before you place a single trade.",
        insight:
          'Leverage does not increase risk per se — it amplifies the result of every price move. Two traders with the same position size have the same risk, regardless of how much leverage their accounts permit.',
      },
      {
        heading: 'How margin works',
        body: "Margin is the deposit required to open and maintain a leveraged position. It's not a fee — it's collateral held while the trade is open.\n\nFree margin is the buffer between your equity and the margin in use. Two levers control it: how much you've staked on open trades and what the market has done to those positions since you opened them.\n\nWhen free margin hits zero, you can't open new positions. When equity falls below the margin requirement (typically 50% at NewEra365), automatic position closure begins — this is the stop-out.",
      },
      {
        heading: 'Position sizing',
        body: "The correct lot size isn't the biggest your account allows — it's the size where your stop-loss represents an acceptable percentage of your account.\n\nFormula:\n\nLot size = (Account risk in $) ÷ (Stop distance in pips × pip value)\n\nFor a $10,000 account risking 1% per trade with a 20-pip stop on EUR/USD:\n• Account risk = $100\n• Pip value on 1 standard lot = $10\n• Lot size = $100 ÷ (20 × $10) = 0.5 lots\n\nThis gives you a position where being wrong by 20 pips costs exactly $100 — 1% of your account.",
      },
      {
        heading: 'Common mistakes',
        body: "Most leverage-related blowups aren't from bad market calls — they're from poor position sizing on correct ones.\n\nThe two most common errors:\n\n1. Using maximum available leverage on every trade. A 1:500 account doesn't mean you should trade 500:1 — it means you have the option to. Most professionals run effective leverage well below 1:10.\n\n2. Not adjusting size when adding positions. Each new position uses more margin and increases overall exposure. Track your total notional exposure, not just individual trade risk.",
      },
    ],
  },
  default: {
    category: 'FOUNDATIONS',
    categoryClass: 'bg-accent/10 text-accent',
    title: 'Guide not found.',
    subtitle: 'This guide may have moved or is not yet published.',
    author: 'NewEra365',
    readTime: '—',
    date: '',
    toc: [],
    sections: [],
  },
};

export function GuideDetailPage({ slug, guide: cmsGuide }: GuideDetailProps) {
  const locale = useLocale();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const guide = (GUIDES_DATA[slug] ?? GUIDES_DATA['default'])!;
  const [activeSection, setActiveSection] = useState(0);

  const hasCmsGuide = cmsGuide && cmsGuide.body && cmsGuide.body.length > 0;
  const cmsHeadings = hasCmsGuide ? extractHeadings(cmsGuide.body) : [];
  const displayTitle = hasCmsGuide ? cmsGuide.title : guide.title;
  const displayAuthor = hasCmsGuide ? (cmsGuide.author ?? guide.author) : guide.author;

  return (
    <>
      {/* Top breadcrumb */}
      <section className="dark:bg-background bg-white px-5 pb-0 pt-6">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="text-muted flex items-center gap-2">
            <Link
              href={`/${locale}/education`}
              className="font-body hover:text-accent text-[11px] uppercase tracking-[0.1em] transition-colors"
            >
              Education Hub
            </Link>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
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
              Guides
            </Link>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
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
      <section className="dark:bg-background bg-white px-5 pb-6 pt-5">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {!hasCmsGuide && (
            <span
              className={`font-body mb-3 inline-flex rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${guide.categoryClass}`}
            >
              {guide.category}
            </span>
          )}
          <h1 className="text-foreground mb-3 font-sans text-[30px] font-semibold leading-[1.1]">
            {displayTitle}
          </h1>
          {!hasCmsGuide && (
            <p className="font-body text-muted mb-5 text-[14px] leading-[1.6]">{guide.subtitle}</p>
          )}

          {/* Author row */}
          {displayAuthor && (
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 flex h-8 w-8 items-center justify-center rounded-full">
                <span className="text-accent font-sans text-[12px] font-semibold">
                  {displayAuthor[0]}
                </span>
              </div>
              <div>
                <p className="text-foreground font-sans text-[13px] font-semibold">
                  {displayAuthor}
                </p>
                {!hasCmsGuide && (
                  <p className="font-body text-muted text-[11px]">
                    {guide.date} · {guide.readTime} read
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TOC + Article body — stacked on mobile, 2-column on xl */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:flex xl:max-w-[1200px] xl:flex-row xl:items-start xl:gap-10">
          {/* Sidebar TOC */}
          {(hasCmsGuide ? cmsHeadings.length > 0 : guide.toc.length > 0) && (
            <div className="mb-6 xl:sticky xl:top-[88px] xl:mb-0 xl:w-[260px] xl:flex-shrink-0">
              <div className="rounded-[18px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]">
                <p className="font-body text-muted mb-3 text-[9px] uppercase tracking-[0.12em]">
                  TABLE OF CONTENTS
                </p>
                <div className="flex flex-col gap-0">
                  {hasCmsGuide
                    ? cmsHeadings.map((h, i) => (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className={`flex items-center gap-2 py-[9px] text-left ${i < cmsHeadings.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]' : ''}`}
                        >
                          <span className="font-body text-muted text-[10px] font-semibold">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="font-body text-muted hover:text-foreground text-[13px]">
                            {h.text}
                          </span>
                        </a>
                      ))
                    : guide.toc.map((item, i) => (
                        <button
                          key={item}
                          onClick={() => setActiveSection(i)}
                          className={`flex items-center gap-2 py-[9px] text-left ${i < guide.toc.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]' : ''}`}
                        >
                          <span
                            className={`font-body text-[10px] font-semibold ${activeSection === i ? 'text-accent' : 'text-muted'}`}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`font-body text-[13px] ${activeSection === i ? 'text-foreground font-medium' : 'text-muted'}`}
                          >
                            {item}
                          </span>
                        </button>
                      ))}
                </div>
              </div>
            </div>
          )}

          {/* Article body */}
          <div className="xl:max-w-[900px] xl:flex-1">
            {hasCmsGuide ? (
              <RichText content={cmsGuide.body} />
            ) : (
              <div className="flex flex-col gap-8">
                {guide.sections.map((section, i) => (
                  <div key={section.heading}>
                    <h2 className="text-foreground mb-3 font-sans text-[20px] font-semibold leading-[1.2]">
                      {section.heading}
                    </h2>
                    {section.body.split('\n\n').map((para, j) => (
                      <p
                        key={j}
                        className="font-body text-foreground mb-4 text-[14px] leading-[1.7] opacity-80"
                      >
                        {para}
                      </p>
                    ))}
                    {section.insight && (
                      <div className="border-accent bg-accent/5 dark:bg-accent/10 rounded-r-[14px] border-l-[3px] p-4">
                        <p className="font-body text-accent mb-1 text-[9px] uppercase tracking-[0.12em]">
                          THE KEY INSIGHT
                        </p>
                        <p className="font-body text-foreground text-[13px] leading-[1.6]">
                          {section.insight}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            READY TO APPLY IT?
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Ready to put it into practice?
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Apply the concepts in a risk-free demo account. No deposit required.
          </p>
          <Link
            href={`/${locale}/demo-account`}
            className="bg-accent hover:bg-accent/90 font-body mb-3 flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-medium text-white transition-colors"
          >
            Open demo account
          </Link>
          <Link
            href={`/${locale}/guides`}
            className="font-body flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
          >
            More guides
          </Link>
        </div>
      </section>
    </>
  );
}
