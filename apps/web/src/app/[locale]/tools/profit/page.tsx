import { setRequestLocale } from 'next-intl/server';
import { ProfitCalculatorPage } from '@newera365/ui';

export default function ProfitCalculatorRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <ProfitCalculatorPage />;
}
