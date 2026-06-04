import { setRequestLocale } from 'next-intl/server';
import { AccountsPage, CtaBanner } from '@newera365/ui';
import { getAccountTypes } from '@/lib/cms';

export default async function AccountsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const cmsAccounts = await getAccountTypes(params.locale);
  return (
    <>
      <AccountsPage cmsAccounts={cmsAccounts} />
      <CtaBanner />
    </>
  );
}
