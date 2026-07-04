import { setRequestLocale } from 'next-intl/server';
import { FeesPage, CtaBanner } from '@newera365/ui';
import type { CmsSpreadRow } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';
import type { CmsInstrument } from '@/lib/cms';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'الرسوم والفروقات' : 'Fees & Spreads',
    description: isAr
      ? 'جدول الفروقات المباشرة، مقايضات الليلية، وتفاصيل شاملة لجميع رسوم الحساب.'
      : 'Live spread table, overnight swaps, and a full breakdown of all account charges.',
  };
}

function mapToSpreadRow(instrument: CmsInstrument): CmsSpreadRow {
  return {
    instrument: instrument.name,
    symbol: instrument.symbol,
    spread: instrument.spread,
    spreadRaw: instrument.spreadRaw,
    spreadStandard: instrument.spreadStandard,
    spreadVip: instrument.spreadVip,
  };
}

export default async function FeesRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  // Fetch instruments in the requested locale so names are translated
  const instruments = await getInstruments(undefined, 6, params.locale);
  const spreadData: CmsSpreadRow[] = instruments.length > 0 ? instruments.map(mapToSpreadRow) : [];
  return (
    <>
      <FeesPage spreadData={spreadData.length > 0 ? spreadData : undefined} />
      <CtaBanner />
    </>
  );
}
