import { getLocale, getTranslations } from 'next-intl/server';
import { SectionKicker } from './SectionKicker';
import { MarketsSectionGrid } from './MarketsSectionGrid';

// `symbol` maps each category to one representative MT5 instrument for the live
// quote board (LiveSpark). Every symbol below exists in /api/mt5/instruments.
const MARKETS = [
  {
    key: 'forex',
    bg: '/images/market-forex-dark.jpg',
    nameKey: 'marketsForex',
    countKey: 'marketsForexCount',
    symbol: 'EURUSD',
  },
  {
    key: 'indices',
    bg: '/images/market-indices-dark.jpg',
    nameKey: 'marketsIndices',
    countKey: 'marketsIndicesCount',
    symbol: 'US500',
  },
  {
    key: 'commodities',
    bg: '/images/market-commodities-dark.jpg',
    nameKey: 'marketsCommodities',
    countKey: 'marketsCommoditiesCount',
    symbol: 'XAUUSD',
  },
  {
    key: 'stocks',
    bg: '/images/market-stocks-dark.jpg',
    nameKey: 'marketsStocks',
    countKey: 'marketsStocksCount',
    symbol: 'AAPL.US',
  },
  {
    key: 'crypto',
    bg: '/images/market-crypto-dark.jpg',
    nameKey: 'marketsCrypto',
    countKey: 'marketsCryptoCount',
    symbol: 'BTCUSD',
  },
  {
    key: 'etfs',
    bg: '/images/market-etfs-dark-v2.jpg',
    nameKey: 'marketsETFs',
    countKey: 'marketsETFsCount',
    symbol: 'SPY.US',
  },
] as const;

/**
 * Demo restyle of MarketsSection — same animated card grid (MarketsSectionGrid),
 * refreshed section header + spacing. Section background uses the brand gradient
 * tokens so it sits cohesively with the rest of the page.
 */
export async function MarketsSectionDemo() {
  const t = await getTranslations('home');
  const locale = await getLocale();

  const marketItems = MARKETS.map((market) => ({
    key: market.key,
    bg: market.bg,
    name: t(market.nameKey),
    count: t(market.countKey),
    href: `/${locale}/markets/${market.key}`,
    symbol: market.symbol,
  }));

  return (
    <section className="rounded-s-[32px] bg-gradient-to-r from-[#DCEAE1] to-[#F2F5F3] px-5 pb-8 pt-10 xl:pb-12 xl:pt-12 rtl:bg-gradient-to-l dark:from-[#1F262E] dark:to-[#000000]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="mb-[14px]">
          {t('marketsKicker')}
        </SectionKicker>

        <h2 className="text-foreground text-headline mb-3 font-sans">{t('marketsHeading')}</h2>
        <p className="font-body text-muted text-lead mb-6 max-w-[560px] dark:text-white">
          {t('marketsSubheading')}
        </p>

        <MarketsSectionGrid items={marketItems} />
      </div>
    </section>
  );
}
