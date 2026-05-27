'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type Tab = 'ALL' | 'STRATEGY' | 'MARKET' | 'EDUCATION';

const TABS: Tab[] = ['ALL', 'STRATEGY', 'MARKET', 'EDUCATION'];

const EPISODES = [
  {
    id: 'fed-trader',
    tag: 'MACRO' as Tab,
    tagDisplay: 'MARKET',
    duration: '42 min',
    title: "Inside the Fed: a former trader's view",
    desc: 'Ex-Goldman macro desk head on reading Fed minutes, rate expectations and what the bond market is pricing.',
    type: 'VIDEO',
    featured: true,
  },
  {
    id: 'cot-report',
    tag: 'STRATEGY' as Tab,
    tagDisplay: 'STRATEGY',
    duration: '18 min',
    title: 'Reading the COT report',
    desc: 'How institutional positioning data can give retail traders a real edge.',
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'why-moves',
    tag: 'MARKET' as Tab,
    tagDisplay: 'MARKET',
    duration: '24 min',
    title: 'Why oil moves on Tuesday',
    desc: 'EIA inventory data, production caps and the weekly cycle that drives crude.',
    type: 'AUDIO',
    featured: false,
  },
  {
    id: 'carry-trade',
    tag: 'STRATEGY' as Tab,
    tagDisplay: 'STRATEGY',
    duration: '31 min',
    title: 'The carry trade explained',
    desc: 'Currency pairs, interest rate differentials and how to run a carry position through volatility.',
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'boe',
    tag: 'MARKET' as Tab,
    tagDisplay: 'MARKET',
    duration: '15 min',
    title: 'Live BOE rate decision',
    desc: "Real-time breakdown of the Bank of England's rate decision and market reaction.",
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'london',
    tag: 'EDUCATION' as Tab,
    tagDisplay: 'EDUCATION',
    duration: '22 min',
    title: 'Interview: a London market maker',
    desc: 'What actually happens on the other side of your trade — a rare look inside market making.',
    type: 'AUDIO',
    featured: false,
  },
  {
    id: 'position',
    tag: 'EDUCATION' as Tab,
    tagDisplay: 'EDUCATION',
    duration: '19 min',
    title: 'Position sizing without the guesswork',
    desc: 'A practical framework for calculating lot size based on account risk, not gut feel.',
    type: 'VIDEO',
    featured: false,
  },
  {
    id: 'tech-analysis',
    tag: 'STRATEGY' as Tab,
    tagDisplay: 'STRATEGY',
    duration: '27 min',
    title: 'Technical analysis that actually works',
    desc: 'Which chart setups have a statistical edge — and which ones traders just like the look of.',
    type: 'VIDEO',
    featured: false,
  },
] as const;

const TAG_COLORS: Record<string, string> = {
  MACRO: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  MARKET: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  STRATEGY: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  EDUCATION: 'bg-accent/10 text-accent',
};

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" />
      <path d="M8 7l6 3-6 3V7z" fill="white" />
    </svg>
  );
}

function AudioIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" />
      <path d="M7 12V9a3 3 0 016 0v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 11h2v3H5zM13 11h2v3h-2z" fill="white" />
    </svg>
  );
}

export function MediaListingPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  const [search, setSearch] = useState('');

  const featured = EPISODES.find((e) => e.featured);
  const rest = EPISODES.filter((e) => !e.featured);

  const filtered = rest.filter((ep) => {
    const matchTab = activeTab === 'ALL' || ep.tagDisplay === activeTab;
    const matchSearch =
      !search ||
      ep.title.toLowerCase().includes(search.toLowerCase()) ||
      ep.desc.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">Media</SectionKicker>
          <h1 className="text-foreground mb-4 font-sans text-[40px] font-semibold leading-[1.08]">
            Watch.
            <br />
            Listen.
            <br />
            <span className="text-accent">Learn.</span>
          </h1>
          <p className="font-body text-muted mb-6 max-w-[320px] text-[14px] leading-[1.55]">
            Lessons, interviews, breakdowns and discussions from our trading desk and partners.
          </p>

          {/* Search */}
          <div className="relative">
            <svg
              className="text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search episodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border font-body text-foreground placeholder-muted focus:border-accent w-full rounded-full border bg-[#f9f9f9] py-3 pl-10 pr-4 text-[13px] outline-none dark:bg-[#1c1c1c]"
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="dark:bg-background bg-white px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body flex-shrink-0 rounded-full px-4 py-[7px] text-[12px] font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-accent text-white'
                    : 'border-border text-muted hover:border-foreground border bg-transparent'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured episode */}
      {featured &&
        (activeTab === 'ALL' || activeTab === (featured.tagDisplay as Tab)) &&
        !search && (
          <section className="dark:bg-background bg-white px-5 pb-6">
            <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
              <div className="flex flex-col gap-4 overflow-hidden rounded-[22px] bg-[#0d0d0d] p-5">
                {/* Thumbnail placeholder */}
                <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-[14px] bg-[#1a1a1a]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="text-accent absolute bottom-4 left-4">
                    <PlayIcon size={40} />
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
                    <span className="font-body text-[10px] text-white/80">{featured.duration}</span>
                  </div>
                  <svg
                    className="opacity-10"
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                  >
                    <circle cx="40" cy="40" r="38" stroke="white" strokeWidth="2" />
                    <path d="M30 25l30 15-30 15V25z" fill="white" />
                  </svg>
                </div>
                {/* Meta */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`font-body rounded-full px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.1em] ${TAG_COLORS[featured.tagDisplay]}`}
                    >
                      {featured.tagDisplay}
                    </span>
                    <span className="font-body text-[11px] text-white/40">{featured.type}</span>
                  </div>
                  <p className="mb-1 font-sans text-[17px] font-semibold text-white">
                    {featured.title}
                  </p>
                  <p className="font-body text-[12px] leading-[1.55] text-white/60">
                    {featured.desc}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* Episode grid */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {filtered.length === 0 ? (
            <p className="font-body text-muted py-8 text-center text-[14px]">
              No episodes match your search.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-[10px]">
              {filtered.map((ep) => (
                <div
                  key={ep.id}
                  className="flex flex-col gap-3 overflow-hidden rounded-[18px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]"
                >
                  {/* Thumbnail */}
                  <div className="relative flex h-[90px] items-center justify-center rounded-[11px] bg-[#e5e5e5] dark:bg-[#2a2a2a]">
                    <div className="opacity-50">
                      {ep.type === 'VIDEO' ? <PlayIcon size={28} /> : <AudioIcon size={28} />}
                    </div>
                    <div className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-[2px]">
                      <span className="font-body text-[9px] text-white">{ep.duration}</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span
                        className={`font-body rounded-full px-2 py-[2px] text-[8px] font-semibold uppercase tracking-[0.08em] ${TAG_COLORS[ep.tagDisplay]}`}
                      >
                        {ep.tagDisplay}
                      </span>
                    </div>
                    <p className="text-foreground font-sans text-[12px] font-semibold leading-[1.4]">
                      {ep.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:first-child]:bg-white/50 [&>span:last-child]:text-white/50">
            MORE LEARNING
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Prefer to read?
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            In-depth guides and a complete trading glossary — all free.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/${locale}/guides`}
              className="font-body flex h-[50px] items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
            >
              Browse guides
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href={`/${locale}/glossary`}
              className="font-body flex h-[50px] items-center justify-center gap-2 rounded-full border border-white/20 text-[14px] font-medium text-white transition-colors hover:border-white/40"
            >
              Trading glossary
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
