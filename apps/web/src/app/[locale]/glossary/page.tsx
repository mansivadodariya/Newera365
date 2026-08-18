import { setRequestLocale } from 'next-intl/server';
import { GlossaryPage, CtaBanner } from '@newera365/ui';
import type { CmsGlossaryTerm } from '@newera365/ui';
import { getGlossaryTerms } from '@/lib/cms';
import type { CmsEducationContent } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Glossary',
  description: 'Definitions for hundreds of trading, forex, and financial market terms.',
};

function mapToGlossaryTerm(item: CmsEducationContent): CmsGlossaryTerm {
  return {
    id: item.id,
    glossaryTerm: item.glossaryTerm ?? item.title,
    alphabeticalIndex: item.alphabeticalIndex,
    glossaryCategory: item.glossaryCategory,
    body: item.body ?? null,
  };
}

export default async function GlossaryRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const items = await getGlossaryTerms(params.locale);
  return (
    <>
      <GlossaryPage terms={items.length > 0 ? items.map(mapToGlossaryTerm) : undefined} />
      <CtaBanner />
    </>
  );
}
