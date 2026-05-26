import { setRequestLocale } from 'next-intl/server';
import { PromoPage } from '@newera365/ui';

export default function PromotionsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <PromoPage />;
}
