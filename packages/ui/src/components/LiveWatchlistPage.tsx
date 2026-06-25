'use client';

import { useTranslations } from 'next-intl';
import { SectionKicker } from './SectionKicker';
import { ChartWidget } from './ChartWidget';

// Symbols sourced from TradingView market-overview widget docs:
// https://www.tradingview.com/widget-docs/widgets/watchlists/market-overview/
const MARKET_OVERVIEW_CONFIG = {
  colorTheme: 'dark',
  dateRange: '12M',
  showChart: true,
  locale: 'en',
  largeChartUrl: '',
  isTransparent: true,
  showSymbolLogo: true,
  showFloatingTooltip: false,
  plotLineColorGrowing: 'rgba(41,98,255,1)',
  plotLineColorFalling: 'rgba(41,98,255,1)',
  gridLineColor: 'rgba(42,46,57,0)',
  scaleFontColor: 'rgba(219,219,219,1)',
  belowLineFillColorGrowing: 'rgba(41,98,255,0.12)',
  belowLineFillColorFalling: 'rgba(41,98,255,0.12)',
  symbolActiveColor: 'rgba(41,98,255,0.12)',
  tabs: [
    {
      title: 'Indices',
      symbols: [
        { s: 'FOREXCOM:SPXUSD', d: 'S&P 500 Index' },
        { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100' },
        { s: 'FOREXCOM:DJI', d: 'Dow 30' },
        { s: 'INDEX:NKY', d: 'Nikkei 225' },
        { s: 'INDEX:DEU40', d: 'DAX Index' },
        { s: 'FOREXCOM:UKXGBP', d: 'UK 100' },
      ],
      originalTitle: 'Indices',
    },
    {
      title: 'Futures',
      symbols: [
        { s: 'TVC:USOIL', d: 'WTI Crude Oil' },
        { s: 'TVC:UKOIL', d: 'Brent Crude' },
        { s: 'TVC:NATGAS', d: 'Natural Gas' },
        { s: 'TVC:GOLD', d: 'Gold' },
        { s: 'TVC:SILVER', d: 'Silver' },
        { s: 'TVC:COPPER', d: 'Copper' },
      ],
      originalTitle: 'Futures',
    },
    {
      title: 'Bonds',
      symbols: [
        { s: 'EUREX:FGBL1!', d: 'Euro Bund' },
        { s: 'EUREX:FBTP1!', d: 'Euro BTP' },
        { s: 'EUREX:FGBM1!', d: 'Euro BOBL' },
      ],
      originalTitle: 'Bonds',
    },
    {
      title: 'Forex',
      symbols: [
        { s: 'OANDA:EURUSD', d: 'EUR/USD' },
        { s: 'OANDA:GBPUSD', d: 'GBP/USD' },
        { s: 'OANDA:USDJPY', d: 'USD/JPY' },
        { s: 'OANDA:USDCHF', d: 'USD/CHF' },
        { s: 'OANDA:AUDUSD', d: 'AUD/USD' },
        { s: 'OANDA:USDCAD', d: 'USD/CAD' },
      ],
      originalTitle: 'Forex',
    },
  ],
};

export function LiveWatchlistPage() {
  const t = useTranslations('watchlist');

  return (
    <>
      {/* Hero */}
      <section className="bg-transparent px-5 pb-8 pt-9">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <SectionKicker className="[&>span:first-child]:bg-muted text-muted mb-4">
            {t('kicker')}
          </SectionKicker>
          <h1 className="text-foreground mb-3 font-sans text-[40px] font-semibold leading-[1.05] tracking-[-1.2px]">
            {t('heroLine1')}
            <br />
            <span className="text-accent">{t('heroAccent')}</span>
          </h1>
          <p className="font-body text-muted max-w-[300px] text-[14px] leading-[1.55]">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* TradingView market-overview widget — handles tabs natively */}
      <section className="px-5 pb-10">
        <div className="motion-safe:animate-rise-in mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
          <div className="overflow-hidden rounded-[22px] bg-[#0d1117] xl:rounded-[28px]">
            <ChartWidget
              type="market-overview"
              theme="dark"
              width="100%"
              height={660}
              config={MARKET_OVERVIEW_CONFIG}
            />
          </div>
          <p className="font-body text-muted mt-3 text-[11px]">{t('disclaimer')}</p>
        </div>
      </section>
    </>
  );
}
