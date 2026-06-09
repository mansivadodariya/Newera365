import { setRequestLocale } from 'next-intl/server';
import { TraderToolsPage, CtaBanner } from '@newera365/ui';
import type { CmsCalculatorInstrument } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';

export default async function TraderToolsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  // Fetch instrument data for the calculator — includes contractSize, pipValue,
  // swapRateLong, swapRateShort. Falls back to static data inside the component
  // if the CMS collection is empty or a field is not yet seeded.
  const rawInstruments = await getInstruments(undefined, 30);
  const instruments: CmsCalculatorInstrument[] = rawInstruments
    .filter((i) => i.contractSize || i.pipValue || i.swapRateLong)
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
      <TraderToolsPage instruments={instruments.length > 0 ? instruments : undefined} />
      <CtaBanner />
    </>
  );
}
