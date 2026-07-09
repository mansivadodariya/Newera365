import { setRequestLocale } from 'next-intl/server';
import { FundingPage, CtaBanner } from '@newera365/ui';
import type { CmsPaymentMethodItem } from '@newera365/ui';
import { getPaymentMethods, getSiteSettings } from '@/lib/cms';
import type { CmsPaymentMethod } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funding & Withdrawals',
  description: 'Deposit and withdraw instantly with cards, bank transfer, e-wallets, and crypto.',
};

function mapMethod(m: CmsPaymentMethod): CmsPaymentMethodItem {
  // The `logo` upload (resolved via depth=1) becomes the desktop cover banner.
  // When unset the FundingPage falls back to a bundled static cover.
  const logo = m.logo;
  const coverImage = logo && typeof logo !== 'number' ? (logo.url ?? null) : null;
  return {
    id: m.id,
    name: m.name,
    nameAr: m.nameAr,
    methodType: m.methodType,
    depositTime: m.depositTime,
    withdrawalTime: m.withdrawalTime,
    minDeposit: m.minDeposit,
    fee: m.fee,
    notes: m.notes,
    coverImage,
  };
}

export default async function FundingRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const methods = await getPaymentMethods(params.locale);
  const siteSettings = await getSiteSettings();
  return (
    <>
      <FundingPage
        paymentMethods={methods.length > 0 ? methods.map(mapMethod) : undefined}
        withdrawalStatValue={siteSettings?.fundingWithdrawalStatValue}
      />
      <CtaBanner />
    </>
  );
}
