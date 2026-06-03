'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';

const INSTRUMENTS = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'BTC/USD', 'NAS100', 'US30'] as const;
type Instrument = (typeof INSTRUMENTS)[number];
type TabMode = 'Profit' | 'Loss' | 'R/R';

const CONTRACT_SIZES: Record<Instrument, number> = {
  'EUR/USD': 100000,
  'GBP/USD': 100000,
  'XAU/USD': 100,
  'BTC/USD': 1,
  NAS100: 10,
  US30: 10,
};

const PIP_SIZES: Record<Instrument, number> = {
  'EUR/USD': 0.0001,
  'GBP/USD': 0.0001,
  'XAU/USD': 0.01,
  'BTC/USD': 1,
  NAS100: 1,
  US30: 1,
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
  step = '0.0001',
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
        step={step}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="border-border font-body text-foreground focus:border-accent w-full rounded-[12px] border bg-white px-4 py-3 text-[14px] outline-none dark:bg-[#1c1c1c]"
      />
    </div>
  );
}

interface ProfitResult {
  profit: number;
  notional: number;
  pips: number;
  pipValue: number;
}

function ResultCard({
  result,
  currency,
  mode,
  labelProfit,
  labelLoss,
  labelRR,
  infoNotional,
  infoPips,
  infoPipVal,
}: {
  result: ProfitResult;
  currency: string;
  mode: TabMode;
  labelProfit: string;
  labelLoss: string;
  labelRR: string;
  infoNotional: string;
  infoPips: string;
  infoPipVal: string;
}) {
  const isPositive = result.profit >= 0;
  const valueColor = isPositive ? '#00B050' : '#EF4444';
  const label = mode === 'R/R' ? labelRR : mode === 'Profit' ? labelProfit : labelLoss;

  return (
    <div
      className="overflow-hidden rounded-[18px] bg-[#111111]"
      style={{ boxShadow: '0 4px 24px rgba(0,176,80,0.15)' }}
    >
      <div className="px-5 pb-4 pt-5">
        <p className="font-body mb-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
          {label}
        </p>
        <p
          className="font-sans text-[42px] font-semibold leading-[1.1]"
          style={{ color: valueColor }}
        >
          {mode === 'R/R' ? (
            <>
              {Math.abs(result.profit).toFixed(2)}
              <span className="ml-1 text-[22px] font-normal text-white/60">R</span>
            </>
          ) : (
            <>
              {result.profit >= 0 ? '+' : '-'}
              {Math.abs(result.profit).toFixed(2)}
              <span className="ml-1 text-[22px] font-normal text-white/60">{currency}</span>
            </>
          )}
        </p>
      </div>
      <div className="mx-5 border-t border-white/10" />
      <div className="grid grid-cols-3 px-5 py-4">
        {[
          {
            label: infoNotional,
            value: `$${result.notional.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
          },
          { label: infoPips, value: Math.abs(result.pips).toFixed(0) },
          { label: infoPipVal, value: `$${result.pipValue.toFixed(2)}` },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="font-body text-[9px] uppercase tracking-[0.1em] text-white/40">
              {item.label}
            </span>
            <span className="font-body text-[12px] font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulaBox({
  calcKicker,
  calcFormula,
  calcDesc,
}: {
  calcKicker: string;
  calcFormula: string;
  calcDesc: string;
}) {
  return (
    <div className="rounded-[14px] bg-[#f9f9f9] p-4 dark:bg-[#1c1c1c]">
      <p className="font-body text-muted mb-2 text-[10px] uppercase tracking-[0.1em]">
        {calcKicker}
      </p>
      <p className="font-body text-foreground text-[13px] leading-[1.6]">
        <span className="font-medium">{calcFormula}</span>
        <br />
        <span className="text-muted">{calcDesc}</span>
      </p>
    </div>
  );
}

export function ProfitCalculatorPage() {
  const locale = useLocale();
  const t = useTranslations('profit');

  const [mode, setMode] = useState<TabMode>('Profit');
  const [currency] = useState('USD');
  const [instrument, setInstrument] = useState<Instrument>('EUR/USD');
  const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy');
  const [openPrice, setOpenPrice] = useState('1.0840');
  const [closePrice, setClosePrice] = useState('1.0925');
  const [lots, setLots] = useState('0.50');

  const computeResult = useCallback(
    (
      inst: Instrument,
      open: number,
      close: number,
      lotsVal: number,
      type: 'Buy' | 'Sell',
    ): ProfitResult => {
      const contractSize = CONTRACT_SIZES[inst];
      const pipSize = PIP_SIZES[inst];
      const pipValue = contractSize * pipSize * lotsVal;
      const priceDiff = type === 'Buy' ? close - open : open - close;
      const pips = priceDiff / pipSize;
      const profit = pips * pipValue;
      const notional = open * contractSize * lotsVal;
      return { profit, notional, pips, pipValue };
    },
    [],
  );

  const [result, setResult] = useState<ProfitResult>(() =>
    computeResult('EUR/USD', 1.084, 1.0925, 0.5, 'Buy'),
  );

  const handleCalculate = useCallback(() => {
    const open = parseFloat(openPrice);
    const close = parseFloat(closePrice);
    const lotsVal = parseFloat(lots);
    if (isNaN(open) || isNaN(close) || isNaN(lotsVal) || lotsVal <= 0) return;
    setResult(computeResult(instrument, open, close, lotsVal, tradeType));
  }, [instrument, openPrice, closePrice, lots, tradeType, computeResult]);

  const handleReset = useCallback(() => {
    setInstrument('EUR/USD');
    setTradeType('Buy');
    setOpenPrice('1.0840');
    setClosePrice('1.0925');
    setLots('0.50');
    setResult(computeResult('EUR/USD', 1.084, 1.0925, 0.5, 'Buy'));
  }, [computeResult]);

  return (
    <>
      {/* Hero */}
      <section className="dark:bg-background bg-white px-5 pb-6 pt-9 xl:px-[80px] xl:py-16">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <h1 className="text-foreground mb-3 font-sans text-[42px] font-semibold leading-[1.05]">
            {t('heroLine1')}
            <br />
            <span className="text-[#00B050]">{t('heroLine2')}</span>
          </h1>
          <p className="font-body text-muted max-w-[340px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="dark:bg-background bg-white px-5 pb-10 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          {/* Mode tabs */}
          <div className="mb-5 flex rounded-[14px] bg-[#f2f2f4] p-1 dark:bg-[#1c1c1c]">
            {(['Profit', 'Loss', 'R/R'] as TabMode[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`font-body flex-1 rounded-[11px] py-2.5 text-[12px] font-medium transition-colors ${
                  mode === tab
                    ? 'text-foreground bg-white shadow-sm dark:bg-[#2a2a2a] dark:text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {tab === 'Profit' ? t('tabProfit') : tab === 'Loss' ? t('tabLoss') : t('tabRR')}
              </button>
            ))}
          </div>

          <div className="xl:flex xl:gap-8">
            <div className="flex flex-col gap-4 xl:grid xl:flex-1 xl:grid-cols-2 xl:gap-4">
              <SelectInput
                label={t('fieldCurrency')}
                value={currency}
                options={['USD']}
                onChange={() => {}}
              />
              <SelectInput
                label={t('fieldInstrument')}
                value={instrument}
                options={INSTRUMENTS}
                onChange={(v) => setInstrument(v as Instrument)}
              />
              <SelectInput
                label={t('fieldType')}
                value={tradeType}
                options={['Buy', 'Sell']}
                onChange={(v) => setTradeType(v as 'Buy' | 'Sell')}
              />
              <NumberInput
                label={t('fieldOpen')}
                value={openPrice}
                onChange={setOpenPrice}
                step="0.00001"
              />
              <NumberInput
                label={t('fieldClose')}
                value={closePrice}
                onChange={setClosePrice}
                step="0.00001"
              />
              <NumberInput
                label={t('fieldLots')}
                value={lots}
                onChange={setLots}
                step="0.01"
                min="0.01"
              />

              {/* Buttons */}
              <div className="flex items-center gap-3 xl:col-span-2">
                <button
                  onClick={handleCalculate}
                  className="font-body flex h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[#00B050] text-[14px] font-medium text-white transition-colors hover:bg-[#00B050]/90 xl:flex-none xl:px-8"
                >
                  {t('calcBtn')}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleReset}
                  className="border-border font-body flex h-[48px] flex-1 items-center justify-center rounded-full border text-[14px] font-medium transition-colors xl:flex-none xl:px-8"
                >
                  {t('resetBtn')}
                </button>
              </div>
            </div>

            {/* Desktop result panel */}
            <div className="hidden xl:flex xl:w-[400px] xl:flex-shrink-0 xl:flex-col xl:gap-4">
              <ResultCard
                result={result}
                currency={currency}
                mode={mode}
                labelProfit={t('resultProfit')}
                labelLoss={t('resultLoss')}
                labelRR={t('resultRR')}
                infoNotional={t('infoNotional')}
                infoPips={t('infoPips')}
                infoPipVal={t('infoPipVal')}
              />
              <FormulaBox
                calcKicker={t('calcKicker')}
                calcFormula={t('calcFormula')}
                calcDesc={t('calcDesc')}
              />
            </div>
          </div>

          {/* Mobile result panel */}
          <div className="mt-5 flex flex-col gap-4 xl:hidden">
            <ResultCard
              result={result}
              currency={currency}
              mode={mode}
              labelProfit={t('resultProfit')}
              labelLoss={t('resultLoss')}
              labelRR={t('resultRR')}
              infoNotional={t('infoNotional')}
              infoPips={t('infoPips')}
              infoPipVal={t('infoPipVal')}
            />
            <FormulaBox
              calcKicker={t('calcKicker')}
              calcFormula={t('calcFormula')}
              calcDesc={t('calcDesc')}
            />
          </div>
        </div>
      </section>

      {/* More Calculators */}
      <section className="dark:bg-background bg-[#f9f9f9] px-5 pb-10 pt-8 xl:px-[80px]">
        <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="mb-5 [&>span:first-child]:bg-[#6B7280] [&>span:last-child]:text-[#6B7280]">
            {t('moreKicker')}
          </SectionKicker>
          <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-3 xl:gap-5">
            {[
              {
                tag: 'Pre-trade',
                label: t('marginTitle'),
                desc: t('marginDesc'),
                href: `/${locale}/tools`,
              },
              {
                tag: 'Technical',
                label: t('pivotTitle'),
                desc: t('pivotDesc'),
                href: `/${locale}/tools/pivot`,
              },
              {
                tag: 'Technical',
                label: t('fibTitle'),
                desc: t('fibDesc'),
                href: `/${locale}/tools/fibonacci`,
              },
            ].map((calc) => (
              <div
                key={calc.label}
                className="flex flex-col gap-3 rounded-[16px] bg-white p-5 dark:bg-[#1c1c1c]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <span className="font-body inline-flex w-fit rounded-full bg-[#f3f4f6] px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6b7280] dark:bg-[#2a2a2a] dark:text-[#9ca3af]">
                  {calc.tag}
                </span>
                <div>
                  <p className="text-foreground font-sans text-[14px] font-semibold">
                    {calc.label}
                  </p>
                  <p className="font-body text-muted mt-1 text-[12px] leading-[1.55]">
                    {calc.desc}
                  </p>
                </div>
                <Link
                  href={calc.href}
                  className="font-body mt-auto text-[13px] font-semibold text-[#00B050] hover:underline"
                >
                  {t('openBtn')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
