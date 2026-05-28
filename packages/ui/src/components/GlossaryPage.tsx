'use client';

import { useState, useMemo } from 'react';
import { SectionKicker } from './SectionKicker';

type GlossaryTerm = {
  term: string;
  category: string;
  definition: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  PRICING: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  FOREX: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  STRATEGY: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  RISK: 'bg-[#EF4444]/15 text-[#EF4444]',
  'ORDER/EXEC': 'bg-accent/10 text-accent',
  ANALYSIS: 'bg-[#06B6D4]/15 text-[#06B6D4]',
  'CHART/PATTERN': 'bg-[#F97316]/15 text-[#F97316]',
  TECHNICAL: 'bg-[#EC4899]/15 text-[#EC4899]',
  GENERAL: 'bg-[#6b7280]/15 text-[#6b7280]',
};

const TERMS: GlossaryTerm[] = [
  // A
  {
    term: 'Ask',
    category: 'PRICING',
    definition:
      'The price at which a market maker is willing to sell a financial instrument. Always higher than the bid.',
  },
  {
    term: 'At the Market',
    category: 'ORDER/EXEC',
    definition: 'An instruction to buy or sell immediately at the best available current price.',
  },
  // B
  {
    term: 'Base Currency',
    category: 'FOREX',
    definition:
      'In a currency pair, the first currency listed. In EUR/USD, EUR is the base currency.',
  },
  {
    term: 'Bid',
    category: 'PRICING',
    definition:
      'The price at which a market maker is willing to buy a financial instrument. Always lower than the ask.',
  },
  {
    term: 'Breakout',
    category: 'CHART/PATTERN',
    definition:
      'When price moves decisively beyond a defined support or resistance level with increased volume.',
  },
  // C
  {
    term: 'Carry Trade',
    category: 'STRATEGY',
    definition:
      'A trading strategy where a market borrows a low-interest currency to invest in a higher-yielding one.',
  },
  {
    term: 'CFD',
    category: 'GENERAL',
    definition:
      'Contract For Difference — a derivative that lets you speculate on price movements without owning the underlying asset.',
  },
  {
    term: 'Consolidation',
    category: 'CHART/PATTERN',
    definition:
      'A period where price trades within a tight range after a significant move, before the next directional move.',
  },
  // D
  {
    term: 'Drawdown',
    category: 'RISK',
    definition:
      'The peak-to-trough decline of an account during a specific period, expressed as a percentage.',
  },
  // E
  {
    term: 'ECN',
    category: 'ORDER/EXEC',
    definition:
      'Electronic Communication Network — connects traders directly to liquidity providers without a dealing desk.',
  },
  {
    term: 'Equity',
    category: 'RISK',
    definition:
      'The real-time value of your account — balance plus or minus unrealised profit/loss on open positions.',
  },
  // F
  {
    term: 'Free Margin',
    category: 'RISK',
    definition:
      'The available margin not currently used as collateral — the amount you can use to open new positions.',
  },
  {
    term: 'Fundamental Analysis',
    category: 'ANALYSIS',
    definition:
      'Evaluating an asset by analysing economic factors — interest rates, GDP, inflation, employment data.',
  },
  // G
  {
    term: 'Gap',
    category: 'CHART/PATTERN',
    definition:
      'A break in price action where no trading occurred between two sessions, often appearing on Monday open.',
  },
  // H
  {
    term: 'Hedging',
    category: 'RISK',
    definition: 'Opening positions to offset existing market exposure and reduce potential losses.',
  },
  // I
  {
    term: 'Indicator',
    category: 'TECHNICAL',
    definition:
      'A mathematical calculation applied on price or volume data used in technical analysis.',
  },
  // L
  {
    term: 'Leverage',
    category: 'RISK',
    definition:
      'The ratio of exposure to the actual capital used. 1:100 leverage means $1,000 controls a $100,000 position.',
  },
  {
    term: 'Liquidity',
    category: 'GENERAL',
    definition:
      'The ease with which an asset can be bought or sold without significantly affecting its price.',
  },
  {
    term: 'Long',
    category: 'GENERAL',
    definition: 'A buy position — you profit when the asset rises in price.',
  },
  // M
  {
    term: 'Margin',
    category: 'RISK',
    definition:
      'The deposit required to open and maintain a leveraged position. Expressed as a percentage of full trade value.',
  },
  {
    term: 'Margin Call',
    category: 'RISK',
    definition:
      'A broker alert when your equity falls below the required margin level, requesting you add funds or close positions.',
  },
  // P
  {
    term: 'Pip',
    category: 'PRICING',
    definition:
      'The smallest price movement in a currency pair — typically the 4th decimal place (0.0001) for most pairs.',
  },
  {
    term: 'Position Sizing',
    category: 'RISK',
    definition:
      'Calculating the correct lot size for a trade based on account size and acceptable risk per trade.',
  },
  // R
  {
    term: 'Resistance',
    category: 'TECHNICAL',
    definition:
      'A price level where selling pressure has historically prevented further upward movement.',
  },
  {
    term: 'Risk/Reward Ratio',
    category: 'RISK',
    definition:
      'The ratio between potential loss (risk) and potential profit (reward) on a trade. A 1:3 ratio risks 1 to gain 3.',
  },
  // S
  {
    term: 'Short',
    category: 'GENERAL',
    definition: 'A sell position — you profit when the asset falls in price.',
  },
  {
    term: 'Spread',
    category: 'PRICING',
    definition:
      'The difference between the bid and ask price — the primary cost of a trade on spread-based accounts.',
  },
  {
    term: 'Stop-Loss',
    category: 'ORDER/EXEC',
    definition:
      'An order to automatically close a position when it reaches a specified loss level.',
  },
  {
    term: 'Support',
    category: 'TECHNICAL',
    definition:
      'A price level where buying pressure has historically prevented further downward movement.',
  },
  {
    term: 'Swap',
    category: 'PRICING',
    definition:
      "Interest paid or earned for holding a leveraged position overnight, based on the two currencies' interest rate differential.",
  },
  // T
  {
    term: 'Take-Profit',
    category: 'ORDER/EXEC',
    definition:
      'An order to automatically close a profitable position when it reaches a specified target price.',
  },
  {
    term: 'Technical Analysis',
    category: 'ANALYSIS',
    definition:
      'Evaluating price movements using historical chart data, patterns and statistical indicators.',
  },
  {
    term: 'Trend',
    category: 'TECHNICAL',
    definition:
      'The general direction in which price is moving — uptrend (higher highs), downtrend (lower lows), or sideways.',
  },
  // V
  {
    term: 'Volatility',
    category: 'GENERAL',
    definition:
      'The degree to which a price moves over time. High volatility means larger price swings; low volatility means smaller ones.',
  },
  // W
  {
    term: 'Whipsaw',
    category: 'CHART/PATTERN',
    definition:
      'A false breakout where price briefly moves past a key level before reversing sharply.',
  },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = TERMS;

    if (search) {
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.definition.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (activeLetter) {
      result = result.filter((t) => t.term.toUpperCase().startsWith(activeLetter));
    }
    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory);
    }
    return result;
  }, [search, activeLetter, activeCategory]);

  const availableLetters = useMemo(
    () => new Set(TERMS.map((t) => t.term[0]?.toUpperCase() ?? '')),
    [],
  );

  function handleLetterClick(letter: string) {
    setActiveLetter((prev) => (prev === letter ? null : letter));
    setSearch('');
  }

  function handleCategoryClick(cat: string) {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setSearch('');
    setActiveLetter(null);
  }

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4">TRADING DICTIONARY</SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.1]">
            Trading
            <br />
            glossary.
          </h1>
          <p className="font-body text-muted mb-6 max-w-[320px] text-[14px] leading-[1.55]">
            Every term, defined in plain English. Searchable, no jargon, no fluff.
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
              placeholder="Search 400+ trading terms..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveLetter(null);
              }}
              className="border-border font-body text-foreground placeholder-muted focus:border-accent w-full rounded-full bg-[#f9f9f9] py-3 pl-10 pr-4 text-[14px] font-medium outline-none dark:bg-[#1c1c1c]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-muted absolute right-4 top-1/2 -translate-y-1/2"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 1L11 11M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category filter pills */}
      <section className="dark:bg-background bg-white px-5 pb-3">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveLetter(null);
              }}
              className={`font-body flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'hover:text-foreground bg-[#f0f0f0] text-[#6b7280] dark:bg-[#1e1e1e] dark:text-[#9ca3af]'
              }`}
            >
              All
            </button>
            {Object.entries(CATEGORY_COLORS).map(([cat, colorClass]) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`font-body flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  activeCategory === cat
                    ? colorClass
                    : 'hover:text-foreground dark:hover:text-foreground bg-[#f0f0f0] text-[#6b7280] dark:bg-[#1e1e1e] dark:text-[#9ca3af]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Alphabet filter */}
      <section className="dark:bg-background bg-white px-5 pb-4">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto">
            {ALPHABET.map((letter) => {
              const available = availableLetters.has(letter);
              const active = activeLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => available && handleLetterClick(letter)}
                  disabled={!available}
                  className={`font-body h-8 w-8 flex-shrink-0 rounded-full text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-accent text-white'
                      : available
                        ? 'text-foreground hover:bg-accent/10 hover:text-accent'
                        : 'text-muted/30 cursor-default'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terms list */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5">
            {activeCategory
              ? `${activeCategory} · ${filtered.length} TERMS`
              : activeLetter
                ? `LETTER ${activeLetter} · ${filtered.length} TERMS`
                : `A–Z · ${filtered.length} TERMS`}
          </SectionKicker>
          {filtered.length === 0 ? (
            <p className="font-body text-muted py-8 text-center text-[14px]">
              No terms match your search.
            </p>
          ) : (
            <div className="flex flex-col">
              {filtered.map((term, i) => {
                const prevTerm = i > 0 ? filtered[i - 1] : undefined;
                const showLetter =
                  i === 0 || term.term[0]?.toUpperCase() !== prevTerm?.term[0]?.toUpperCase();
                return (
                  <div key={term.term}>
                    {showLetter && (
                      <div className="dark:bg-background sticky top-16 z-10 bg-white py-2">
                        <span className="text-accent font-sans text-[11px] font-semibold uppercase tracking-[0.1em]">
                          {term.term[0]?.toUpperCase() ?? ''}
                        </span>
                      </div>
                    )}
                    <div
                      className={`py-4 ${i < filtered.length - 1 ? 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]' : ''}`}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-foreground font-sans text-[15px] font-semibold">
                          {term.term}
                        </span>
                        <span
                          className={`font-body rounded-full px-2 py-[2px] text-[8px] font-semibold uppercase tracking-[0.1em] ${CATEGORY_COLORS[term.category] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {term.category}
                        </span>
                      </div>
                      <p className="font-body text-muted text-[13px] leading-[1.6]">
                        {term.definition}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-4 [&>span:last-child]:text-white/50">
            KEEP LEARNING
          </SectionKicker>
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Turn terms into trades.
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Our step-by-step guides show you how every concept applies in a live account.
          </p>
          <a
            href="/guides"
            className="bg-accent hover:bg-accent/90 font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-colors"
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
        </div>
      </section>
    </>
  );
}
