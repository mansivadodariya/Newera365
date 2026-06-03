import { setRequestLocale } from 'next-intl/server';
import { TraderToolsPage, CtaBanner } from '@newera365/ui';

export default function TraderToolsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <TraderToolsPage />
      <CtaBanner />
    </>
  );
}
