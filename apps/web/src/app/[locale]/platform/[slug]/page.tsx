import { setRequestLocale } from 'next-intl/server';
import { PlatformPage } from '@newera365/ui';

export default function PlatformRoute({ params }: { params: { locale: string; slug: string } }) {
  setRequestLocale(params.locale);
  return <PlatformPage />;
}
