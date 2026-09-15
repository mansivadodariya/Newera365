import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { PlatformPage, WebTraderPage, CtaBanner } from '@newera365/ui';
import type { CmsPlatformDownloads } from '@newera365/ui';
import { getSiteSettings } from '@/lib/cms';

import type { Metadata } from 'next';

const VALID_SLUGS = ['mt5', 'metatrader-5', 'webtrader', 'tools'] as const;
type PlatformSlug = (typeof VALID_SLUGS)[number];

interface Props {
  params: { locale: string; slug: string };
}

const PLATFORM_META: Record<
  PlatformSlug,
  { en: { title: string; desc: string }; ar: { title: string; desc: string } }
> = {
  mt5: {
    en: {
      title: 'MetaTrader 5 (MT5) Platform',
      desc: 'Download MetaTrader 5 for Windows, Mac, iOS and Android with ultra-fast execution and advanced charting.',
    },
    ar: {
      title: 'منصة ميتاتريدر 5 (MT5)',
      desc: 'حمّل منصة ميتاتريدر 5 لأنظمة ويندوز وماك وiOS وأندرويد مع تنفيذ فائق السرعة ورسوم بيانية متقدمة.',
    },
  },
  'metatrader-5': {
    en: {
      title: 'MetaTrader 5 (MT5) Platform',
      desc: 'Download MetaTrader 5 for Windows, Mac, iOS and Android with ultra-fast execution and advanced charting.',
    },
    ar: {
      title: 'منصة ميتاتريدر 5 (MT5)',
      desc: 'حمّل منصة ميتاتريدر 5 لأنظمة ويندوز وماك وiOS وأندرويد مع تنفيذ فائق السرعة ورسوم بيانية متقدمة.',
    },
  },
  webtrader: {
    en: {
      title: 'WebTrader Platform',
      desc: 'Trade directly from your web browser with no downloads required using Newera WebTrader.',
    },
    ar: {
      title: 'منصة ويب تريدر',
      desc: 'تداول مباشرة من متصفح الويب الخاص بك دون الحاجة لتنزيل أي برامج عبر ويب تريدر.',
    },
  },
  tools: {
    en: {
      title: 'Trading Tools & Platform Features',
      desc: 'Discover advanced trading tools, charting features, and analytical widgets.',
    },
    ar: {
      title: 'أدوات التداول ومميزات المنصة',
      desc: 'استكشف أدوات التداول المتقدمة والرسوم البيانية والمؤشرات التحليلية.',
    },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug as PlatformSlug;
  if (!VALID_SLUGS.includes(slug)) return {};
  const isAr = params.locale === 'ar';
  const m = PLATFORM_META[slug][isAr ? 'ar' : 'en'];
  return {
    title: m.title,
    description: m.desc,
  };
}

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export default async function PlatformRoute({ params }: Props) {
  setRequestLocale(params.locale);
  if (!VALID_SLUGS.includes(params.slug as PlatformSlug)) notFound();

  const s = await getSiteSettings();

  if (params.slug === 'webtrader')
    return (
      <>
        <WebTraderPage specs={s?.webTraderSpecs ?? undefined} />
        <CtaBanner />
      </>
    );

  const downloads: CmsPlatformDownloads | undefined = s
    ? {
        windows: s.downloadMt5Windows,
        mac: s.downloadMt5Mac,
        ios: s.downloadMt5Ios,
        android: s.downloadMt5Android,
        webTrader: s.downloadWebTrader,
      }
    : undefined;

  return (
    <>
      <PlatformPage downloads={downloads} />
      <CtaBanner />
    </>
  );
}
