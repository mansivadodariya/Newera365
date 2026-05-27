import { setRequestLocale } from 'next-intl/server';
import { EducationHubPage } from '@newera365/ui';

export default function EducationRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <EducationHubPage />;
}
