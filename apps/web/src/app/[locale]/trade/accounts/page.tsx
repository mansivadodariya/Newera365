import { setRequestLocale } from 'next-intl/server';
import { AccountsPage } from '@newera365/ui';
import type { CmsAccountTypeItem } from '@newera365/ui';
import { getAccountTypes } from '@/lib/cms';
import type { CmsAccountType } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Types | NewEra365',
  description: 'Compare Standard, Raw, and VIP trading accounts. No hidden fees.',
};

function mapAccount(a: CmsAccountType): CmsAccountTypeItem {
  return {
    id: a.id,
    name: a.name,
    minDeposit: a.minDeposit,
    spreadFrom: a.spreadFrom,
    leverage: a.leverage,
    commission: a.commission,
    features: a.features,
    isPopular: a.isPopular,
    sortOrder: a.sortOrder,
  };
}

export default async function AccountsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const accounts = await getAccountTypes();
  return <AccountsPage accounts={accounts.length > 0 ? accounts.map(mapAccount) : undefined} />;
}
