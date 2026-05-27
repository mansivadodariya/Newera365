import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { PlatformPage, WebTraderPage } from '@newera365/ui';

const VALID_SLUGS = ['mt5', 'metatrader-5', 'webtrader', 'mobile', 'tools'] as const;
type PlatformSlug = (typeof VALID_SLUGS)[number];

interface Props {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export default function PlatformRoute({ params }: Props) {
  setRequestLocale(params.locale);
  if (!VALID_SLUGS.includes(params.slug as PlatformSlug)) notFound();
  if (params.slug === 'webtrader') return <WebTraderPage />;
  return <PlatformPage />;
}
