import { setRequestLocale } from 'next-intl/server';
import { FaqPage , CtaBanner } from '@newera365/ui';
import type { CmsFaqItem } from '@newera365/ui';
import { getFaqs } from '@/lib/cms';
import type { CmsFaq } from '@/lib/cms';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string };
}

export const metadata: Metadata = {
  title: 'FAQs | NewEra365',
  description: 'Find answers to common questions about trading, accounts, deposits, and platforms.',
};

function mapFaq(faq: CmsFaq): CmsFaqItem {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    sortOrder: faq.sortOrder,
  };
}

export default async function FaqsRoute({ params }: Props) {
  setRequestLocale(params.locale);
  const faqs = await getFaqs(params.locale);
  return (
    <>
      <FaqPage faqs={faqs.length > 0 ? faqs.map(mapFaq) : undefined} />
      <CtaBanner />
    </>
  );
}
