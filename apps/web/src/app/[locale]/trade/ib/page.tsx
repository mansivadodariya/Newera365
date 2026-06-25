import { setRequestLocale } from 'next-intl/server';
import { IBPage, CtaBanner } from '@newera365/ui';
import { getIBContent } from '@/lib/cms';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr
      ? 'الشركاء والمعرّفون (IB) | نيو إيرا 365'
      : 'Introducing Brokers & Partners | NewEra365',
    description: isAr
      ? 'انضم إلى برنامج الشركاء واكسب عمولات على كل صفقة. خطط IB والتابعين والعلامات البيضاء متاحة.'
      : 'Join our partner programme and earn commissions on every trade. IB, affiliate, and white-label plans available.',
  };
}

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
