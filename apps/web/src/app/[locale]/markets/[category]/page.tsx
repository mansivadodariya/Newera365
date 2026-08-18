import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { MarketCategoryPage, CtaBanner } from '@newera365/ui';
import { getInstruments, getSiteSettings } from '@/lib/cms';
import type { Metadata } from 'next';

const VALID_CATEGORIES = ['forex', 'indices', 'commodities', 'stocks', 'etfs', 'crypto'] as const;
type Category = (typeof VALID_CATEGORIES)[number];

const CATEGORY_META: Record<
  Category,
  { en: { title: string; desc: string }; ar: { title: string; desc: string } }
> = {
  forex: {
    en: {
      title: 'Forex Trading',
      desc: 'Trade major, minor and exotic FX pairs with tight spreads and fast MT5 execution.',
    },
    ar: {
      title: 'تداول الفوركس',
      desc: 'تداول أزواج العملات الرئيسية والفرعية والنادرة بفروقات ضيقة وتنفيذ MT5 سريع.',
    },
  },
  indices: {
    en: {
      title: 'Indices Trading',
      desc: 'Access global stock market indices including US500, DE40 and more.',
    },
    ar: {
      title: 'تداول المؤشرات',
      desc: 'تداول مؤشرات الأسهم العالمية بما فيها US500 وDE40 والمزيد.',
    },
  },
  commodities: {
    en: {
      title: 'Commodities Trading',
      desc: 'Trade gold, oil, silver and soft commodities with competitive spreads.',
    },
    ar: {
      title: 'تداول السلع',
      desc: 'تداول الذهب والنفط والفضة والسلع الزراعية بفروقات تنافسية.',
    },
  },
  stocks: {
    en: {
      title: 'Stocks CFD Trading',
      desc: 'Go long or short on 500+ global stocks as CFDs with no stamp duty.',
    },
    ar: {
      title: 'تداول أسهم CFD',
      desc: 'اتخذ مراكز شراء أو بيع على أكثر من 500 سهم عالمي بصيغة CFD.',
    },
  },
  etfs: {
    en: {
      title: 'ETF CFD Trading',
      desc: 'Trade sector and index ETFs as CFDs for broad market exposure.',
    },
    ar: {
      title: 'تداول صناديق ETF CFD',
      desc: 'تداول صناديق القطاعات والمؤشرات بصيغة CFD للتعرض الواسع للسوق.',
    },
  },
  crypto: {
    en: {
      title: 'Crypto CFD Trading',
      desc: 'Trade Bitcoin, Ethereum and major crypto pairs as CFDs 24/7.',
    },
    ar: {
      title: 'تداول العملات الرقمية',
      desc: 'تداول البيتكوين والإيثيريوم وأبرز أزواج العملات الرقمية بصيغة CFD 24/7.',
    },
  },
};

interface Props {
  params: { locale: string; category: string };
}

export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = params.category as Category;
  if (!VALID_CATEGORIES.includes(cat)) return {};
  const isAr = params.locale === 'ar';
  const m = CATEGORY_META[cat][isAr ? 'ar' : 'en'];
  return {
    title: m.title,
    description: m.desc,
  };
}

export default async function MarketCategoryRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const { category } = params;
  if (!VALID_CATEGORIES.includes(category as Category)) notFound();

  // Fetch instruments in requested locale so names are translated.
  // Also fetch site settings to check MT5 sync status for the source indicator.
  const [instruments, settings] = await Promise.all([
    getInstruments(category, 50, params.locale),
    getSiteSettings(),
  ]);

  return (
    <>
      <MarketCategoryPage
        category={category}
        instruments={instruments}
        mt5Enabled={settings?.mt5SyncEnabled ?? false}
      />
      <CtaBanner />
    </>
  );
}
