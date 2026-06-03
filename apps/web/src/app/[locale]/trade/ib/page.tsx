import { setRequestLocale } from 'next-intl/server';
import { IBPage, CtaBanner } from '@newera365/ui';
import { getIBContent } from '@/lib/cms';

export default async function IBRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const cmsContent = await getIBContent(params.locale);
  return (
    <>
      <IBPage cmsContent={cmsContent} />
      <CtaBanner />
    </>
  );
}
