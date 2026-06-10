import { setRequestLocale } from 'next-intl/server';
import { FeesPage, CtaBanner } from '@newera365/ui';
import type { CmsSpreadRow } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';
import type { CmsInstrument } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fees & Spreads | NewEra365',
  description: 'Live spread table, overnight swaps, and a full breakdown of all account charges.',
};

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
  // Fetch the 6 most popular instruments by sort order for the spread table
  const instruments = await getInstruments(undefined, 6);
  const spreadData: CmsSpreadRow[] = instruments.length > 0 ? instruments.map(mapToSpreadRow) : [];
  return (
    <>
      <FeesPage spreadData={spreadData.length > 0 ? spreadData : undefined} />
      <CtaBanner />
    </>
  );
}
