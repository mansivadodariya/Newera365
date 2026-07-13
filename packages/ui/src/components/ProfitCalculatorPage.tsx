'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CmsCalculatorInstrument } from './TraderToolsPage';
import { CalcSelect } from './CalcSelect';
import { CountUp } from './CountUp';
import { FormulaChips, NumberInput, ResultPanel } from './CalcKit';

const INSTRUMENTS_FALLBACK = [
  'EUR/USD',
  'GBP/USD',
  'XAU/USD',
  'BTC/USD',
  'NAS100',
  'US30',
] as const;
type Instrument = (typeof INSTRUMENTS_FALLBACK)[number];

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

interface ProfitResult {
  profit: number;
  notional: number;
  pips: number;
  pipValue: number;
}

function ResultCard({
  result,
  labelProfit,
  labelLoss,
  infoNotional,
  infoPips,
  infoPipVal,
}: {
  result: ProfitResult;
  labelProfit: string;
  labelLoss: string;
  infoNotional: string;
  infoPips: string;
  infoPipVal: string;
}) {
  const isPositive = result.profit >= 0;

  return (
    <ResultPanel>
      <div className="px-5 pb-4 pt-5">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          {isPositive ? labelProfit : labelLoss}
        </p>
        <p
          dir="ltr"
          className={`font-mono text-[42px] font-semibold tabular-nums leading-[1.1] ${
            isPositive ? 'text-accent-bright' : 'text-[#EF5350]'
          }`}
        >
          {isPositive ? '+' : '-'}
          <CountUp value={Math.abs(result.profit).toFixed(2)} />
          <span className="ms-1 text-[22px] font-normal text-white/60">USD</span>
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
            <span
              dir="ltr"
              className="w-fit font-mono text-[12px] font-medium tabular-nums text-white"
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </ResultPanel>
  );
}

interface ProfitCalculatorProps {
  instruments?: CmsCalculatorInstrument[];
}

export function ProfitCalculator({ instruments: cmsInstruments }: ProfitCalculatorProps = {}) {
  const t = useTranslations('profit');

  const activeInstruments = cmsInstruments?.map((i) => i.symbol) ?? [...INSTRUMENTS_FALLBACK];
  const defaultInstrument = activeInstruments[0] ?? 'EUR/USD';

  const [instrument, setInstrument] = useState<string>(defaultInstrument);
  const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy');
  const [openPrice, setOpenPrice] = useState('1.0840');
  const [closePrice, setClosePrice] = useState('1.0925');
  const [lots, setLots] = useState('0.50');

  // Live recompute on every input; invalid mid-edit values fall back to zeros.
  const result = useMemo<ProfitResult>(() => {
    const open = parseFloat(openPrice);
    const close = parseFloat(closePrice);
    const lotsVal = parseFloat(lots);
    if (isNaN(open) || isNaN(close) || isNaN(lotsVal) || lotsVal <= 0) {
      return { profit: 0, notional: 0, pips: 0, pipValue: 0 };
    }
    const cmsInst = cmsInstruments?.find((i) => i.symbol === instrument);
    const contractSize =
      cmsInst?.contractSize ?? CONTRACT_SIZES[instrument as Instrument] ?? 100000;
    const pipSize =
      cmsInst?.pipValue && cmsInst.contractSize
        ? cmsInst.pipValue / cmsInst.contractSize
        : (PIP_SIZES[instrument as Instrument] ?? 0.0001);
    const pipValue = contractSize * pipSize * lotsVal;
    const priceDiff = tradeType === 'Buy' ? close - open : open - close;
    const pips = priceDiff / pipSize;
    const profit = pips * pipValue;
    const notional = open * contractSize * lotsVal;
    return { profit, notional, pips, pipValue };
  }, [cmsInstruments, instrument, openPrice, closePrice, lots, tradeType]);

  return (
    <div>
      <div className="xl:flex xl:gap-8">
        <div className="xl:flex-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CalcSelect
              label={t('fieldInstrument')}
              value={instrument}
              options={activeInstruments}
              onChange={(v) => setInstrument(v)}
            />
            {/* Buy/Sell segmented toggle — same control as the swap tab */}
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-muted text-[11px] uppercase tracking-[0.1em]">
                {t('fieldType')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(['Buy', 'Sell'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setTradeType(d)}
                    aria-pressed={tradeType === d}
                    className={`font-body cursor-pointer rounded-[12px] border py-3 text-[13px] font-medium transition-colors duration-200 ${
                      tradeType === d
                        ? d === 'Buy'
                          ? 'border-[#26A69A] bg-[#26A69A]/10 text-[#26A69A]'
                          : 'border-[#EF5350] bg-[#EF5350]/10 text-[#EF5350]'
                        : 'border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {d === 'Buy' ? t('typeBuy') : t('typeSell')}
                  </button>
                ))}
              </div>
            </div>
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
          </div>
        </div>

        {/* Desktop result panel */}
        <div className="hidden xl:flex xl:w-[400px] xl:flex-shrink-0 xl:flex-col xl:gap-4">
          <ResultCard
            result={result}
            labelProfit={t('resultProfit')}
            labelLoss={t('resultLoss')}
            infoNotional={t('infoNotional')}
            infoPips={t('infoPips')}
            infoPipVal={t('infoPipVal')}
          />
          <FormulaChips kicker={t('calcKicker')} formula={t('calcFormula')} desc={t('calcDesc')} />
        </div>
      </div>

      {/* Mobile result panel */}
      <div className="mt-5 flex flex-col gap-4 xl:hidden">
        <ResultCard
          result={result}
          labelProfit={t('resultProfit')}
          labelLoss={t('resultLoss')}
          infoNotional={t('infoNotional')}
          infoPips={t('infoPips')}
          infoPipVal={t('infoPipVal')}
        />
        <FormulaChips kicker={t('calcKicker')} formula={t('calcFormula')} desc={t('calcDesc')} />
      </div>
    </div>
  );
}
