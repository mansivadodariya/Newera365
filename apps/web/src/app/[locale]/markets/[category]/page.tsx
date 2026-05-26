import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { MarketCategoryPage } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';

const VALID_CATEGORIES = ['forex', 'indices', 'commodities', 'stocks', 'etfs', 'crypto'] as const;
type Category = (typeof VALID_CATEGORIES)[number];

interface Props {
  params: { locale: string; category: string };
}

export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export default async function MarketCategoryRoute({ params }: Props) {
  setRequestLocale(params.locale);

  const { category } = params;
  if (!VALID_CATEGORIES.includes(category as Category)) notFound();

  const instruments = await getInstruments(category, 50);

  return <MarketCategoryPage category={category} instruments={instruments} />;
}
