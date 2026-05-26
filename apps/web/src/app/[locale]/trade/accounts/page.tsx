import { setRequestLocale } from 'next-intl/server';
import { AccountsPage } from '@newera365/ui';

export default function AccountsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <AccountsPage />;
}
