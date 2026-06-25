import { getLocale, getTranslations } from 'next-intl/server';
import { SectionKicker } from './SectionKicker';
import { MarketsSectionGrid } from './MarketsSectionGrid';

const MARKETS = [
  {
    key: 'forex',
    bg: '/images/market-forex.jpg',
    nameKey: 'marketsForex',
    countKey: 'marketsForexCount',
  },
  {
    key: 'indices',
    bg: '/images/market-indices.jpg',
    nameKey: 'marketsIndices',
    countKey: 'marketsIndicesCount',
  },
  {
    key: 'commodities',
    bg: '/images/market-commodities.jpg',
    nameKey: 'marketsCommodities',
    countKey: 'marketsCommoditiesCount',
  },
  {
    key: 'stocks',
    bg: '/images/market-stocks.jpg',
    nameKey: 'marketsStocks',
    countKey: 'marketsStocksCount',
  },
  {
    key: 'crypto',
    bg: '/images/market-crypto.jpg',
    nameKey: 'marketsCrypto',
    countKey: 'marketsCryptoCount',
  },
  {
    key: 'etfs',
    bg: '/images/market-etfs.jpg',
    nameKey: 'marketsETFs',
    countKey: 'marketsETFsCount',
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
  }));

  return (
    <section className="rounded-s-[32px] bg-gradient-to-r from-[#E2E2E2] to-white px-5 pb-9 pt-12 xl:pb-16 xl:pt-14 rtl:bg-gradient-to-l dark:from-[#1F262E] dark:to-[#000000]">
      <div className="mx-auto max-w-[390px] md:max-w-2xl xl:max-w-[1200px]">
        <SectionKicker className="text-foreground [&>span:first-child]:bg-accent mb-[14px]">
          {t('marketsKicker')}
        </SectionKicker>

        <h2 className="text-foreground mb-3 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.8px] xl:text-[38px]">
          {t('marketsHeading')}
        </h2>
        <p className="font-body mb-5 max-w-[520px] text-[14px] leading-[1.55] text-[#363636] dark:text-[#FFFFFF]">
          {t('marketsSubheading')}
        </p>

        <MarketsSectionGrid items={marketItems} />
      </div>
    </section>
  );
}
