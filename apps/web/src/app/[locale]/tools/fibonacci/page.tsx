import { setRequestLocale } from 'next-intl/server';
import { FibonacciCalculatorPage, CtaBanner } from '@newera365/ui';

export default function FibonacciCalculatorRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <FibonacciCalculatorPage />
      <CtaBanner />
    </>
  );
}
