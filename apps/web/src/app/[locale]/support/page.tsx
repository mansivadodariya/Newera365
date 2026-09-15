import { setRequestLocale } from 'next-intl/server';
import { SupportPage, CtaBanner } from '@newera365/ui';
import type { CmsFaqItem, CmsContactDetails } from '@newera365/ui';
import { getFaqs, getSiteSettings } from '@/lib/cms';
import type { CmsFaq } from '@/lib/cms';
import type { Metadata } from 'next';

const SAINT_LUCIA_ADDRESS =
  'Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  return {
    title: isAr ? 'تواصل معنا والدعم' : 'Contact Us & Support',
    description: isAr
      ? `تواصل مع نيو إيرا (Newera). العنوان المسجل: ${SAINT_LUCIA_ADDRESS}. الدعم الفني وخدمة العملاء على مدار الساعة.`
      : `Get in touch with Newera. Registered address: ${SAINT_LUCIA_ADDRESS}. 24/5 dedicated client support.`,
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

  const contactDetails: CmsContactDetails = {
    email: s?.contactEmail || 'support@newera365.com',
    phone: s?.contactPhone || '+44 2070970860',
    address:
      (params.locale === 'ar' ? s?.contactAddressAr : s?.contactAddressEn) || SAINT_LUCIA_ADDRESS,
    supportHours:
      (params.locale === 'ar' ? s?.supportHoursAr : s?.supportHoursEn) || '24/5 Client Desk',
  };

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
