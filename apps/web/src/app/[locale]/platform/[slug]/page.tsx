import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { PlatformPage, WebTraderPage } from '@newera365/ui';
import type { CmsPlatformDownloads } from '@newera365/ui';
import { getSiteSettings } from '@/lib/cms';

const VALID_SLUGS = ['mt5', 'metatrader-5', 'webtrader', 'mobile', 'tools'] as const;
type PlatformSlug = (typeof VALID_SLUGS)[number];

interface Props {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export default async function PlatformRoute({ params }: Props) {
  setRequestLocale(params.locale);
  if (!VALID_SLUGS.includes(params.slug as PlatformSlug)) notFound();
  if (params.slug === 'webtrader') return <WebTraderPage />;

  const s = await getSiteSettings();
  const downloads: CmsPlatformDownloads | undefined = s
    ? {
        windows: s.downloadMt5Windows,
        mac: s.downloadMt5Mac,
        ios: s.downloadMt5Ios,
        android: s.downloadMt5Android,
        webTrader: s.downloadWebTrader,
      }
    : undefined;

  return <PlatformPage downloads={downloads} />;
}
