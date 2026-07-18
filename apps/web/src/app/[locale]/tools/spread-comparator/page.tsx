import { setRequestLocale } from 'next-intl/server';
import { SpreadComparatorPage, CtaBanner } from '@newera365/ui';
import type { CmsSpreadInstrument } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'مقارن فروق الأسعار' : 'Spread Comparator',
    description: isAr
      ? 'قارن فروق أسعار Newera365 مع متوسط الصناعة عبر أنواع الحسابات.'
      : 'Compare Newera365 spreads against the industry average across account types.',
  };
}

export default async function SpreadComparatorRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  // Fetch instruments with spread comparator fields.
  // We only show instruments that have at least one spread field seeded.
  // Falls back to static data inside the component if the CMS is empty.
  const rawInstruments = await getInstruments(undefined, 30);
  const instruments: CmsSpreadInstrument[] = rawInstruments
    .filter((i) => i.spreadIndustry != null || i.spreadStandard != null || i.spreadRaw != null)
    .map((i) => ({
      symbol: i.symbol,
      name: i.name,
      spreadIndustry: i.spreadIndustry,
      spreadStandard: i.spreadStandard,
      spreadRaw: i.spreadRaw,
      spreadVip: i.spreadVip,
      pipValue: i.pipValue,
    }));

  return (
    <>
      <SpreadComparatorPage instruments={instruments.length > 0 ? instruments : undefined} />
      <CtaBanner />
    </>
  );
}
