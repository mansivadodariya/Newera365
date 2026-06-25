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
    title: isAr ? 'أنواع الحسابات | نيو إيرا 365' : 'Account Types | NewEra365',
    description: isAr
      ? 'قارن بين الحسابات المعيارية والخام والـ VIP — فروقات من صفر، رافعة تصل إلى 1:500، وتنفيذ MT5 الاحترافي.'
      : 'Compare Standard, Raw, and VIP accounts — spreads from 0.0, leverage up to 1:500, and professional MT5 execution.',
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
