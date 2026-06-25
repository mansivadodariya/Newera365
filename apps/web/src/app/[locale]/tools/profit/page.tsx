import { setRequestLocale } from 'next-intl/server';
import { ProfitCalculatorPage, CtaBanner } from '@newera365/ui';
import type { CmsCalculatorInstrument } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';

export default async function ProfitCalculatorRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const rawInstruments = await getInstruments(undefined, 30);
  const instruments: CmsCalculatorInstrument[] = rawInstruments
    .filter((i) => i.contractSize && i.pipValue)
    .map((i) => ({
      symbol: i.symbol,
      name: i.name,
      contractSize: i.contractSize,
      pipValue: i.pipValue,
      swapRateLong: i.swapRateLong,
      swapRateShort: i.swapRateShort,
    }));

  return (
    <>
      <ProfitCalculatorPage instruments={instruments.length > 0 ? instruments : undefined} />
      <CtaBanner />
    </>
  );
}
