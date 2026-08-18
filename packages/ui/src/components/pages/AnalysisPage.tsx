'use client';

import { useState } from 'react';
import { SectionKicker } from '../primitives/SectionKicker';
import { ScrollReveal } from '../motion/ScrollReveal';
import { TradingViewWidget } from '../market/TradingViewWidget';

const TECH_SYMBOLS = [
  { id: 'gold', name: 'Gold (XAU/USD)', symbol: 'OANDA:XAUUSD' },
  { id: 'oil', name: 'Crude Oil (USOIL)', symbol: 'TVC:USOIL' },
  { id: 'eurusd', name: 'EUR/USD', symbol: 'OANDA:EURUSD' },
  { id: 'aapl', name: 'Apple Inc. (AAPL)', symbol: 'NASDAQ:AAPL' },
] as const;

export function AnalysisPage() {
  const [activeSymbol, setActiveSymbol] = useState<string>('OANDA:XAUUSD');

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Header */}
      <section className="bg-transparent px-5 pb-8 pt-10 xl:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <SectionKicker className="mb-3">MARKET INSIGHTS & WIDGETS</SectionKicker>
            <h1 className="text-display text-foreground font-sans font-extrabold tracking-tight">
              Market Analysis & Real-Time Technicals
            </h1>
            <p className="font-body text-lead text-foreground/80 mt-3 max-w-[65ch] dark:text-white/80">
              Institutional-grade market data, real-time currency heatmaps, economic calendar, and
              automated technical gauges across key global assets.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Technical Analysis Gauges Grid (Gold, Oil, EUR/USD, Apple) */}
      <section className="px-5 py-8 xl:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="mb-6">
              <SectionKicker className="mb-2">TECHNICAL ANALYSIS GAUGES</SectionKicker>
              <h2 className="text-headline text-foreground font-sans font-bold">
                Technical Signals & Sentiment
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {TECH_SYMBOLS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveSymbol(item.symbol)}
                  className={`border-border group cursor-pointer overflow-hidden rounded-[20px] border bg-white p-4 transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-[#14161c] ${
                    activeSymbol === item.symbol ? 'border-accent ring-accent/30 ring-2' : ''
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-foreground font-sans text-[15px] font-bold dark:text-white">
                      {item.name}
                    </span>
                    <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase">
                      {item.symbol.split(':')[0]}
                    </span>
                  </div>
                  <div className="h-[360px] w-full overflow-hidden rounded-[12px]">
                    <TradingViewWidget
                      type="technical-analysis"
                      symbol={item.symbol}
                      theme="dark"
                      height={360}
                      interactive={false}
                      config={{
                        interval: '1D',
                        isTransparent: false,
                        showIntervalTabs: true,
                        displayMode: 'single',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Live Advanced Market Chart */}
      <section className="px-5 py-8 xl:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="mb-6 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <SectionKicker className="mb-2">INTERACTIVE TERMINAL</SectionKicker>
                <h2 className="text-headline text-foreground font-sans font-bold">
                  Live Market Chart
                </h2>
              </div>
              <span className="text-accent-bright font-mono text-xs font-semibold uppercase">
                Active Symbol: {TECH_SYMBOLS.find((s) => s.symbol === activeSymbol)?.name}
              </span>
            </div>

            <div className="border-border shadow-card overflow-hidden rounded-[24px] border bg-[#0a0d14] p-3 dark:border-white/10">
              <div className="h-[560px] w-full">
                <TradingViewWidget
                  type="advanced-chart"
                  symbol={activeSymbol}
                  theme="dark"
                  height="100%"
                  interactive={true}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Currency Heat Map & Cross Rates */}
      <section className="px-5 py-8 xl:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="flex w-full min-w-0 flex-col gap-8">
              {/* Currency Heat Map */}
              <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[24px] bg-white p-6 dark:bg-[#14161c]">
                <div className="mb-4">
                  <SectionKicker className="mb-1">FOREX HEATMAP</SectionKicker>
                  <h3 className="text-foreground font-sans text-xl font-bold dark:text-white">
                    Currency Heat Map
                  </h3>
                </div>
                <div className="h-auto min-h-[420px] w-full overflow-hidden rounded-[16px] md:min-h-[460px]">
                  <TradingViewWidget
                    type="forex-heat-map"
                    theme="dark"
                    height="100%"
                    interactive={true}
                    config={{
                      currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'],
                      isTransparent: false,
                    }}
                  />
                </div>
              </div>

              {/* Currency Cross Rates */}
              <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[24px] bg-white p-6 dark:bg-[#14161c]">
                <div className="mb-4">
                  <SectionKicker className="mb-1">FX MATRIX</SectionKicker>
                  <h3 className="text-foreground font-sans text-xl font-bold dark:text-white">
                    Currency Cross Rates
                  </h3>
                </div>
                <div className="h-auto min-h-[420px] w-full overflow-hidden rounded-[16px] md:min-h-[460px]">
                  <TradingViewWidget
                    type="forex-cross-rates"
                    theme="dark"
                    height="100%"
                    interactive={true}
                    config={{
                      currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'],
                      isTransparent: false,
                    }}
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Economic Calendar & Economic Heat Map */}
      <section className="px-5 py-8 pb-16 xl:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="mb-6">
              <SectionKicker className="mb-2">MACROECONOMIC EVENTS & HEATMAP</SectionKicker>
              <h2 className="text-headline text-foreground font-sans font-bold">
                Economic Calendar & Global Market Heat Map
              </h2>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-8">
              {/* Economic Calendar */}
              <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[24px] bg-white p-6 dark:bg-[#14161c]">
                <div className="mb-4">
                  <SectionKicker className="mb-1">SCHEDULED RELEASES</SectionKicker>
                  <h3 className="text-foreground font-sans text-xl font-bold dark:text-white">
                    Economic Calendar
                  </h3>
                </div>
                <div className="h-auto min-h-[480px] w-full overflow-hidden rounded-[16px] md:min-h-[560px]">
                  <TradingViewWidget
                    type="economic-calendar"
                    theme="dark"
                    height="100%"
                    interactive={true}
                    config={{
                      importanceFilter: '-1,0,1',
                      currencyFilter: 'USD,EUR,GBP,JPY,AUD,CAD,CHF',
                      isTransparent: false,
                    }}
                  />
                </div>
              </div>

              {/* Economic / Market Heat Map */}
              <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[24px] bg-white p-6 dark:bg-[#14161c]">
                <div className="mb-4">
                  <SectionKicker className="mb-1">GLOBAL SECTORS</SectionKicker>
                  <h3 className="text-foreground font-sans text-xl font-bold dark:text-white">
                    Economic & Market Heat Map
                  </h3>
                </div>
                <div className="h-auto min-h-[480px] w-full overflow-hidden rounded-[16px] md:min-h-[560px]">
                  <TradingViewWidget
                    type="stock-heatmap"
                    theme="dark"
                    height="100%"
                    interactive={true}
                    config={{
                      dataSource: 'S&P500',
                      grouping: 'sector',
                      blockSize: 'market_cap_basic',
                      blockColor: 'change',
                      isTransparent: false,
                    }}
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
