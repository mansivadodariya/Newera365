'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SectionKicker } from './SectionKicker';

type ToolTab = 'MARGIN' | 'PIP' | 'SWAP';

const INSTRUMENTS = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'BTC/USD', 'NAS100', 'US30'] as const;
type Instrument = (typeof INSTRUMENTS)[number];

const CONTRACT_SIZES: Record<Instrument, number> = {
  'EUR/USD': 100000,
  'GBP/USD': 100000,
  'XAU/USD': 100,
  'BTC/USD': 1,
  NAS100: 10,
  US30: 10,
};

const PIP_VALUES: Record<Instrument, number> = {
  'EUR/USD': 10,
  'GBP/USD': 10,
  'XAU/USD': 1,
  'BTC/USD': 1,
  NAS100: 1,
  US30: 1,
};

const SWAP_RATES: Record<Instrument, { long: number; short: number }> = {
  'EUR/USD': { long: -0.52, short: 0.14 },
  'GBP/USD': { long: -0.44, short: 0.08 },
  'XAU/USD': { long: -3.2, short: 1.1 },
  'BTC/USD': { long: -12.5, short: 4.2 },
  NAS100: { long: -1.8, short: 0.6 },
  US30: { long: -1.5, short: 0.5 },
};

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">{label}</label>
      <div className="border-border relative overflow-hidden rounded-[12px] border bg-white dark:bg-[#1c1c1c]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-body text-foreground w-full appearance-none bg-transparent px-4 py-3 text-[14px] outline-none"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          className="text-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = '0.01',
  min = '0',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="border-border font-body text-foreground focus:border-accent w-full rounded-[12px] border bg-white px-4 py-3 text-[14px] outline-none dark:bg-[#1c1c1c]"
      />
    </div>
  );
}

export function TraderToolsPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<ToolTab>('MARGIN');
  const [currency, setCurrency] = useState('USD');
  const [instrument, setInstrument] = useState<Instrument>('EUR/USD');
  const [positionSize, setPositionSize] = useState('0.10');
  const [leverage, setLeverage] = useState('100');
  const [days, setDays] = useState('1');
  const [direction, setDirection] = useState<'long' | 'short'>('long');

  const lots = parseFloat(positionSize) || 0;
  const lev = parseFloat(leverage) || 1;
  const contractSize = CONTRACT_SIZES[instrument];
  const pipValue = PIP_VALUES[instrument];
  const swapRate = SWAP_RATES[instrument];

  const marginRequired = useCallback(() => {
    const notional = lots * contractSize;
    return notional / lev;
  }, [lots, contractSize, lev]);

  const pipValueCalc = useCallback(() => {
    return lots * pipValue;
  }, [lots, pipValue]);

  const swapCalc = useCallback(() => {
    const rate = direction === 'long' ? swapRate.long : swapRate.short;
    const d = parseFloat(days) || 1;
    return lots * rate * d;
  }, [lots, swapRate, direction, days]);

  const margin = marginRequired();
  const pip = pipValueCalc();
  const swap = swapCalc();

  const TABS: { id: ToolTab; label: string }[] = [
    { id: 'MARGIN', label: 'Margin' },
    { id: 'PIP', label: 'Pip value' },
    { id: 'SWAP', label: 'Swap' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[42px] font-semibold leading-[1.05]">
            The math.
            <br />
            <span className="text-accent">Done for you.</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            Margin, pip value, swap — pre-trade math without the spreadsheet.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="dark:bg-background bg-white px-5 pb-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Tab switcher */}
          <div className="mb-5 flex rounded-[14px] bg-[#f2f2f4] p-1 dark:bg-[#1c1c1c]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-body flex-1 rounded-[11px] py-2.5 text-[13px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground bg-white shadow-sm dark:bg-[#2a2a2a] dark:text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4">
            <SelectInput
              label="Account Currency"
              value={currency}
              options={['USD', 'EUR', 'GBP']}
              onChange={setCurrency}
            />
            <SelectInput
              label="Instrument"
              value={instrument}
              options={INSTRUMENTS}
              onChange={(v) => setInstrument(v as Instrument)}
            />
            <NumberInput
              label="Position size (lots)"
              value={positionSize}
              onChange={setPositionSize}
              step="0.01"
              min="0.01"
            />
            {activeTab !== 'SWAP' && (
              <SelectInput
                label="Leverage"
                value={`1:${leverage}`}
                options={['1:10', '1:20', '1:50', '1:100', '1:200', '1:500']}
                onChange={(v) => setLeverage(v.split(':')[1] ?? '100')}
              />
            )}
            {activeTab === 'SWAP' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">
                    Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['long', 'short'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDirection(d)}
                        className={`font-body rounded-[12px] border py-3 text-[13px] font-medium transition-colors ${
                          direction === d
                            ? d === 'long'
                              ? 'border-[#26A69A] bg-[#26A69A]/10 text-[#26A69A]'
                              : 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
                            : 'border-border text-muted'
                        }`}
                      >
                        {d === 'long' ? 'Buy / Long' : 'Sell / Short'}
                      </button>
                    ))}
                  </div>
                </div>
                <NumberInput label="Days held" value={days} onChange={setDays} step="1" min="1" />
              </>
            )}
          </div>

          {/* Result */}
          <div
            className="mt-5 overflow-hidden rounded-[18px] bg-[#111111]"
            style={{ boxShadow: '0 4px 24px rgba(0,176,80,0.15)' }}
          >
            <div className="px-5 pb-5 pt-5">
              <p className="font-body mb-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
                {activeTab === 'MARGIN'
                  ? 'Required Margin'
                  : activeTab === 'PIP'
                    ? 'Pip Value'
                    : 'Swap Cost / Day'}
              </p>
              <p className="font-sans text-[42px] font-semibold leading-[1.1] text-white">
                {activeTab === 'SWAP' && swap < 0 ? '-' : ''}
                {Math.abs(
                  activeTab === 'MARGIN' ? margin : activeTab === 'PIP' ? pip : swap,
                ).toFixed(2)}
                <span className="ml-1 text-[22px] font-normal text-white/60">{currency}</span>
              </p>
            </div>
            <div className="mx-5 border-t border-white/10" />
            <div className="grid grid-cols-3 px-5 py-4">
              {activeTab === 'MARGIN' &&
                [
                  {
                    label: 'Notional',
                    value: `${(lots * contractSize).toLocaleString('en-US')} ${currency}`,
                  },
                  { label: 'Leverage', value: `1:${leverage}` },
                  { label: 'Contract', value: contractSize.toLocaleString('en-US') },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
                      {item.label}
                    </span>
                    <span className="font-body text-[12px] font-medium text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              {activeTab === 'PIP' &&
                [
                  { label: 'Lot size', value: positionSize },
                  { label: 'Pip size', value: instrument.includes('JPY') ? '0.01' : '0.0001' },
                  { label: 'Per pip', value: `${pip.toFixed(2)} ${currency}` },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
                      {item.label}
                    </span>
                    <span className="font-body text-[12px] font-medium text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              {activeTab === 'SWAP' &&
                [
                  {
                    label: 'Rate / lot',
                    value: `${direction === 'long' ? swapRate.long : swapRate.short} ${currency}`,
                  },
                  { label: 'Lots', value: positionSize },
                  { label: 'Days', value: days },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
                      {item.label}
                    </span>
                    <span className="font-body text-[12px] font-medium text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Formula */}
          <div className="mt-4 rounded-[14px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]">
            <p className="font-body text-muted mb-2 text-[10px] uppercase tracking-[0.1em]">
              How it&apos;s calculated
            </p>
            <p className="font-body text-foreground text-[13px] leading-[1.6]">
              {activeTab === 'MARGIN' && (
                <>
                  <span className="font-medium">
                    Margin = (Position size × Contract size) ÷ Leverage
                  </span>
                  <br />
                  <span className="text-muted">
                    The margin is the amount of capital required to open and maintain your position.
                    It scales linearly with position size and inversely with leverage.
                  </span>
                </>
              )}
              {activeTab === 'PIP' && (
                <>
                  <span className="font-medium">
                    Pip value = Lot size × Pip size × Contract size
                  </span>
                  <br />
                  <span className="text-muted">
                    Each pip movement on your position is worth this amount. Multiply by your
                    expected pip gain/loss to estimate P&L.
                  </span>
                </>
              )}
              {activeTab === 'SWAP' && (
                <>
                  <span className="font-medium">Swap = Swap rate × Lot size × Days</span>
                  <br />
                  <span className="text-muted">
                    Swap is charged daily for holding positions overnight. Wednesday swap is tripled
                    to account for the weekend.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Other tools */}
      <section className="dark:bg-background bg-[#f9f9f9] px-5 pb-10 pt-8">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            MORE TOOLS
          </SectionKicker>
          <div className="flex flex-col gap-[10px]">
            {[
              {
                label: 'Spread Comparator',
                desc: 'See where you save vs. the market average.',
                href: `/${locale}/tools/spread-comparator`,
              },
              {
                label: 'Economic Calendar',
                desc: 'Key macro events and impact ratings.',
                href: `/${locale}/tools/calendar`,
              },
            ].map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                className="group flex items-center justify-between rounded-[16px] bg-white p-4 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <div>
                  <p className="text-foreground font-sans text-[14px] font-semibold">
                    {tool.label}
                  </p>
                  <p className="font-body text-muted mt-0.5 text-[12px]">{tool.desc}</p>
                </div>
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                  className="text-muted group-hover:text-accent flex-shrink-0 transition-colors"
                >
                  <path
                    d="M1 1L6 6L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-t-[32px] bg-black px-5 pb-12 pt-10">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h2 className="mb-3 font-sans text-[26px] font-semibold leading-[1.1] text-white">
            Ready to put
            <br />
            the math to work?
          </h2>
          <p className="font-body mb-7 text-[13px] leading-relaxed text-white/60">
            Open a live or demo account and trade with the same math your desk uses.
          </p>
          <Link
            href={`/${locale}/register`}
            className="bg-accent hover:bg-accent/90 font-body flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[14px] font-medium text-white transition-colors"
          >
            Open account
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
        </div>
      </section>
    </>
  );
}
