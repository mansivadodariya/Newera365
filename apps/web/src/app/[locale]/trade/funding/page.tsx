import { setRequestLocale } from 'next-intl/server';
import { FundingPage, CtaBanner } from '@newera365/ui';
import type { CmsPaymentMethodItem } from '@newera365/ui';
import { getPaymentMethods } from '@/lib/cms';
import type { CmsPaymentMethod } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funding & Withdrawals | NewEra365',
  description: 'Deposit and withdraw instantly with cards, bank transfer, e-wallets, and crypto.',
};

function mapMethod(m: CmsPaymentMethod): CmsPaymentMethodItem {
  return {
    id: m.id,
    name: m.name,
    methodType: m.methodType,
    depositTime: m.depositTime,
    withdrawalTime: m.withdrawalTime,
    minDeposit: m.minDeposit,
    fee: m.fee,
    notes: m.notes,
  };
}

export default async function FundingRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const methods = await getPaymentMethods(params.locale);
  return (
    <>
      <FundingPage paymentMethods={methods.length > 0 ? methods.map(mapMethod) : undefined} />
      <CtaBanner />
    </>
  );
}
