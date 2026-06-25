import { setRequestLocale } from 'next-intl/server';
import { LegalPage, CtaBanner } from '@newera365/ui';
import type { CmsLegalDocument } from '@newera365/ui';
import { getLegalPages } from '@/lib/cms';
import type { CmsLegalPage } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string };
}

export const metadata: Metadata = {
  title: 'Legal Documents',
  description:
    'Terms & Conditions, Privacy Policy, Risk Disclosure, AML Policy, and Cookie Policy.',
};

function mapLegalPage(page: CmsLegalPage): CmsLegalDocument {
  return {
    id: page.id,
    pageType: page.pageType,
    title: page.title,
    body: page.body,
    effectiveDate: page.effectiveDate,
    version: page.version,
  };
}

export default async function LegalRoute({ params }: Props) {
  setRequestLocale(params.locale);
  const pages = await getLegalPages(params.locale);
  return (
    <>
      <LegalPage documents={pages.length > 0 ? pages.map(mapLegalPage) : undefined} />
      <CtaBanner />
    </>
  );
}
