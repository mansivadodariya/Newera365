import { notFound } from 'next/navigation';
// import { setRequestLocale } from 'next-intl/server';
// import { AiCrmPage, CtaBanner } from '@newera365/ui';

export default function AiCrmRoute({ params }: { params: { locale: string } }) {
  // Ticket CRM route disabled
  notFound();
  // setRequestLocale(params.locale);
  // return (
  //   <>
  //     <AiCrmPage />
  //     <CtaBanner />
  //   </>
  // );
}
