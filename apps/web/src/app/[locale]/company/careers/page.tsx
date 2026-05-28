import { setRequestLocale } from 'next-intl/server';
import { CareersPage } from '@newera365/ui';

export default function CareersRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <CareersPage />;
}
