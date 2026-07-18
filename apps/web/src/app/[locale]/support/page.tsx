import { setRequestLocale } from 'next-intl/server';
import { SupportPage, CtaBanner } from '@newera365/ui';
import type { CmsFaqItem, CmsContactDetails } from '@newera365/ui';
import { getFaqs, getSiteSettings } from '@/lib/cms';
import type { CmsFaq } from '@/lib/cms';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'الدعم' : 'Support',
    description: isAr
      ? 'إجابات على الأسئلة الشائعة وطرق التواصل مع فريق Newera365.'
      : 'Answers to common questions and ways to reach the Newera365 team.',
  };
}

function mapFaq(faq: CmsFaq): CmsFaqItem {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    sortOrder: faq.sortOrder,
  };
}

export default async function SupportRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const [faqs, s] = await Promise.all([getFaqs(params.locale), getSiteSettings()]);

  const contactDetails: CmsContactDetails | undefined = s
    ? {
        email: s.contactEmail,
        phone: s.contactPhone,
        address: params.locale === 'ar' ? s.contactAddressAr : s.contactAddressEn,
        supportHours: params.locale === 'ar' ? s.supportHoursAr : s.supportHoursEn,
      }
    : undefined;

  return (
    <>
      <SupportPage
        faqs={faqs.length > 0 ? faqs.map(mapFaq) : undefined}
        contactDetails={contactDetails}
        promiseStats={s?.supportPromiseStats ?? undefined}
      />
      <CtaBanner />
    </>
  );
}
