import { setRequestLocale } from 'next-intl/server';
import { InstrumentsPage } from '@newera365/ui';
import { getInstruments } from '@/lib/cms';

export default async function InstrumentsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const instruments = await getInstruments();
  return <InstrumentsPage instruments={instruments} />;
}
