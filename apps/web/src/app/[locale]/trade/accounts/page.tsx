import { setRequestLocale } from 'next-intl/server';
import { AccountsPage, CtaBanner } from '@newera365/ui';
import { getAccountTypes } from '@/lib/cms';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'أنواع الحسابات' : 'Account Types',
    description: isAr
      ? 'قارن بين حسابات Standard وRaw وPro، فروق من 0.2 نقطة، رافعة تصل إلى 1:500، وتنفيذ MT5 الاحترافي.'
      : 'Compare Standard, Raw and Pro accounts: spreads from 0.2 pips, leverage up to 1:500, and professional MT5 execution.',
  };
}

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
