import { setRequestLocale } from 'next-intl/server';
import { ContactPage } from '@newera365/ui';
import type { CmsContactDetails } from '@newera365/ui';
import { getSiteSettings } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | NewEra365',
  description: 'Get in touch with our support team — email, phone, or live chat.',
};

export default async function ContactRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const s = await getSiteSettings();

  const contactDetails: CmsContactDetails | undefined = s
    ? {
        email: s.contactEmail,
        phone: s.contactPhone,
        address: params.locale === 'ar' ? s.contactAddressAr : s.contactAddressEn,
        supportHours: params.locale === 'ar' ? s.supportHoursAr : s.supportHoursEn,
      }
    : undefined;

  return <ContactPage contactDetails={contactDetails} />;
}
