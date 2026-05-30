'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const GUIDES = [
  {
    id: 'leverage-and-margin',
    category: 'FOUNDATIONS',
    categoryClass: 'bg-accent/10 text-accent',
    title: 'Leverage and margin, without the panic.',
    desc: 'The single most misunderstood concept in retail trading. A clear, no-jargon guide to how leverage works and how to use it responsibly.',
    readTime: '9 min',
    author: 'Diego Romero',
    featured: true,
  },
  {
    id: 'risk-management',
    category: 'RISK',
    categoryClass: 'bg-[#EF4444]/15 text-[#EF4444]',
    title: 'Risk management essentials.',
    desc: 'Four frameworks that protect every account from outsized drawdowns. Includes position sizing, stop placement, and the 2% rule.',
    readTime: '8 min',
    author: 'Sofia Andrade',
    featured: false,
  },
  {
    id: 'position-sizing',
    category: 'RISK',
    categoryClass: 'bg-[#EF4444]/15 text-[#EF4444]',
    title: 'How to size a position correctly.',
    desc: 'A step-by-step formula for calculating lot size based on account balance, risk tolerance and stop-loss distance.',
    readTime: '6 min',
    author: 'Diego Romero',
    featured: false,
  },
  {
    id: 'candlestick-chart',
    category: 'TECHNICAL',
    categoryClass: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
    title: 'Reading a candlestick chart.',
    desc: 'From opening price to daily wick — every element of a candlestick and the story it tells about market sentiment.',
    readTime: '5 min',
    author: 'Lena Vasquez',
    featured: false,
  },
  {
    id: 'macro-outlook-2026',
    category: 'MACRO',
    categoryClass: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    title: 'The 2026 macro outlook.',
    desc: 'Rising inflation or rate cuts? A breakdown of every key scenario and what each means for equities, FX, and commodities.',
    readTime: '12 min',
    author: 'Sofia Andrade',
    featured: false,
  },
  {
    id: 'stop-loss',
    category: 'FOUNDATIONS',
    categoryClass: 'bg-accent/10 text-accent',
    title: "Stop-loss vs. stop-out: what's the difference?",
    desc: 'Two terms that every trader uses, but few distinguish correctly. Knowing both could save your account in a volatile market.',
    readTime: '4 min',
    author: 'Diego Romero',
    featured: false,
  },
] as const;

export function GuidesPage() {
  const locale = useLocale();

  const featured = GUIDES.find((g) => g.featured);
  const rest = GUIDES.filter((g) => !g.featured);

  return (
    <>
      {/* Hero */}
      <section className="bg-background px-5 pb-8 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.1]">
            Deep dives worth
            <br />
            <span className="text-accent">reading twice.</span>
          </h1>
          <p className="font-body text-muted max-w-[320px] text-[14px] leading-[1.55]">
            Long-form guides on the concepts that actually move the needle. Written by traders, for
            traders.
          </p>
        </div>
      </section>

      {/* Featured guide */}
      {featured && (
        <section className="bg-background px-5 pb-6">
          <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
            <SectionKicker className="mb-4">FEATURED</SectionKicker>
            <Link
              href={`/${locale}/guides/${featured.id}`}
              className="group block overflow-hidden rounded-[22px] bg-[#111111] p-6 shadow-card-dark"
            >
              <span
                className={`font-body mb-4 inline-flex rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${featured.categoryClass}`}
              >
                {featured.category}
              </span>
              <h2 className="group-hover:text-accent mb-3 font-sans text-[24px] font-semibold leading-[1.1] text-white transition-colors">
                {featured.title}
              </h2>
              <p className="font-body mb-4 text-[13px] leading-[1.6] text-white/60">
                {featured.desc}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-accent/20 flex h-6 w-6 items-center justify-center rounded-full">
                    <span className="text-accent font-sans text-[9px] font-semibold">
                      {featured.author[0]}
                    </span>
                  </div>
                  <span className="font-body text-[11px] text-white/50">{featured.author}</span>
                </div>
                <div className="text-accent flex items-center gap-1.5">
                  <span className="font-body text-[12px] font-medium">
                    {featured.readTime} read
                  </span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* All guides */}
      <section className="bg-background px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mt-5">ALL GUIDES</SectionKicker>
          <div className="flex flex-col gap-0">
            {rest.map((guide, i) => (
              <Link
                key={guide.id}
                href={`/${locale}/guides/${guide.id}`}
                className={`group flex flex-col gap-2 py-5 ${i < rest.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${guide.categoryClass}`}
                  >
                    {guide.category}
                  </span>
                  <span className="font-body text-muted text-[11px]">{guide.readTime} read</span>
                </div>
                <p className="text-foreground group-hover:text-accent font-sans text-[15px] font-semibold leading-[1.3] transition-colors">
                  {guide.title}
                </p>
                <p className="font-body text-muted text-[12px] leading-[1.55]">{guide.desc}</p>
                <div className="flex items-center gap-2">
                  <div className="border-border flex h-5 w-5 items-center justify-center rounded-full border">
                    <span className="text-muted font-sans text-[8px] font-semibold">
                      {guide.author[0]}
                    </span>
                  </div>
                  <span className="font-body text-muted text-[11px]">{guide.author}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            FREE RESOURCES
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            More ways to learn.
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Glossary, free e-books, video episodes and live webinars — all in one place.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/${locale}/education`}
              className="bg-accent hover:bg-accent/90 font-body flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
            >
              Education hub
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
              Trading glossary
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
