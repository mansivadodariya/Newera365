import { setRequestLocale } from 'next-intl/server';
import { AccountComparisonPage } from '@newera365/ui';
import { getAccountTypes } from '@/lib/cms';

export default async function AccountComparisonRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const cmsAccounts = await getAccountTypes();
  return <AccountComparisonPage cmsAccounts={cmsAccounts} />;
}
