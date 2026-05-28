import { setRequestLocale } from 'next-intl/server';
import { AccountComparisonPage } from '@newera365/ui';

export default function AccountComparisonRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <AccountComparisonPage />;
}
