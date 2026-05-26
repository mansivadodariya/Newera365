import { setRequestLocale } from 'next-intl/server';
import { FundingPage } from '@newera365/ui';

export default function FundingRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <FundingPage />;
}
