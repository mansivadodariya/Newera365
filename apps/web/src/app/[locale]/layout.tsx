import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Analytics } from '@/components/Analytics';
import { CookieConsent } from '@/components/CookieConsent';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Outfit, Montserrat, Cairo, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import {
  ToastProvider,
  Footer,
  RiskBanner,
  StickyCtaBar,
  FloatingContactWidget,
} from '@newera365/ui';
import type { CmsSocialLinks } from '@newera365/ui';
import { RouteChrome } from '@/components/RouteChrome';
import { dir, LOCALES, type Locale } from '@newera365/types';
import { routing } from '@/i18n/routing';
import { getSiteSettings, getPaymentMethods } from '@/lib/cms';
import { PageFade } from '@/components/PageFade';
import '../globals.css';
// Self-hosted Flaticon Uicons brand glyphs (footer social icons). Fonts are
// served from 'self', so the hardened CSP (font-src 'self') needs no changes.
import '@flaticon/flaticon-uicons/css/brands/all.css';

// Headings/titles use Outfit — the site's original display face (client
// 2026-07-13: Montserrat didn't suit the trading vibe; reverted headings only).
// Body keeps Montserrat. Cairo covers Arabic glyph-by-glyph for both. Both Latin
// faces set adjustFontFallback:false so their synthetic Arial fallback can't
// intercept Arabic glyphs before Cairo (next in the family stack).
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: false,
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  adjustFontFallback: false,
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

const rawBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  .trim()
  .replace(/\/+$/, '');

const BASE = rawBase
  ? rawBase.startsWith('http://') || rawBase.startsWith('https://')
    ? rawBase
    : `https://${rawBase}`
  : 'http://localhost:3000';

function getMetadataBase(urlStr: string): URL {
  try {
    return new URL(urlStr);
  } catch {
    return new URL('http://localhost:3000');
  }
}

// Per-locale metadata so Next.js emits correct hreflang + canonical tags.
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const isAr = locale === 'ar';
  return {
    metadataBase: getMetadataBase(BASE),
    title: {
      default: isAr
        ? 'نيو إيرا: تداول الفوركس والعقود مقابل الفروقات'
        : 'Newera: Forex & CFD Trading',
      template: isAr ? '%s | نيو إيرا' : '%s | Newera',
    },
    description: isAr
      ? 'تداول الفوركس والمؤشرات والسلع والعملات الرقمية مع نيو إيرا، فروقات ضيقة وتنفيذ سريع ومنصة MT5. رأس المال في خطر.'
      : 'Trade forex, indices, commodities and crypto CFDs with Newera: tight spreads, fast execution, and MT5. Capital at risk.',
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: {
        en: `${BASE}/en`,
        ar: `${BASE}/ar`,
        'x-default': `${BASE}/en`,
      },
    },
    openGraph: {
      siteName: 'Newera',
      type: 'website',
      locale: locale === 'ar' ? 'ar_AE' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_AE'],
      images: [
        {
          url: `${BASE}/og-image.jpg`,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: isAr
            ? 'نيو إيرا: تداول الفوركس والعقود مقابل الفروقات'
            : 'Newera: Forex and CFD Trading',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isAr
        ? 'نيو إيرا: تداول الفوركس والعقود مقابل الفروقات'
        : 'Newera: Forex & CFD Trading',
      description: isAr
        ? 'تداول الفوركس والمؤشرات والسلع والعملات الرقمية مع نيو إيرا.'
        : 'Trade forex, indices, commodities and crypto CFDs with Newera.',
      images: [`${BASE}/og-image.jpg`],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-light.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
        { url: '/favicon-dark.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const s = await getSiteSettings();

  // Compliance text: treat a blank/whitespace-only CMS value as absent so the
  // Footer's i18n fallback engages. Never render an empty risk paragraph.
  const riskDisclaimerRaw = s ? (locale === 'ar' ? s.riskDisclaimerAr : s.riskDisclaimerEn) : null;
  const riskDisclaimer = riskDisclaimerRaw?.trim() ? riskDisclaimerRaw : undefined;

  const riskBannerEnabled = s?.riskBannerEnabled ?? false;
  const riskBannerMessage = s
    ? ((locale === 'ar' ? s.riskBannerAr : s.riskBannerEn) ?? undefined)
    : undefined;

  const socialLinks: CmsSocialLinks | undefined = s
    ? {
        facebook: s.socialFacebook ?? null,
        x: s.socialX ?? null,
        linkedin: s.socialLinkedIn ?? null,
        instagram: s.socialInstagram ?? null,
        youtube: s.socialYoutube ?? null,
        telegram: s.socialTelegram ?? null,
        tiktok: s.socialTiktok ?? null,
      }
    : undefined;

  // Footer contact, regulatory & payment data — all CMS-driven (client feedback #6)
  const isAr = locale === 'ar';
  const contact = s
    ? {
        email: s.contactEmail ?? null,
        phone: s.contactPhone ?? null,
        address: (isAr ? s.contactAddressAr : s.contactAddressEn) ?? null,
        hours: null,
      }
    : undefined;
  const regulatoryDisclosure = s
    ? ((isAr ? s.regulatoryDisclosureAr : s.regulatoryDisclosureEn) ?? undefined)
    : undefined;
  const companyRegistration = s
    ? ((isAr ? s.companyRegistrationAr : s.companyRegistrationEn) ?? undefined)
    : undefined;
  const paymentMethods = (await getPaymentMethods(locale))
    .map((p) => (isAr ? (p.nameAr ?? p.name) : p.name))
    .filter((n): n is string => Boolean(n));

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      suppressHydrationWarning
      className={`${outfit.variable} ${montserrat.variable} ${cairo.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* TradingView embeds: loader script from s3, widget iframe from
            tradingview-widget.com — warm both origins before the embeds mount. */}
        <link rel="preconnect" href="https://s3.tradingview.com" />
        <link rel="preconnect" href="https://www.tradingview-widget.com" />
        <link rel="dns-prefetch" href="https://s.tradingview.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FinancialService',
              name: 'Newera',
              url: BASE,
              logo: `${BASE}/favicon-dark.png`,
              description:
                'Forex and CFD broker offering tight spreads, fast MT5 execution, and multilingual support.',
              sameAs: [
                'https://x.com/newera365',
                'https://linkedin.com/company/newera365',
                'https://instagram.com/newera365',
              ],
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <ToastProvider>
              {/* CMS-controlled dismissible risk banner — shown above header */}
              <RiskBanner enabled={riskBannerEnabled} message={riskBannerMessage} />

              <RouteChrome />
              <PageFade>{children}</PageFade>
              <Analytics />
              <CookieConsent />
              {/* Floating CTAs live outside PageFade so they persist across
                  route transitions. */}
              <StickyCtaBar />
              <FloatingContactWidget
                email={s?.contactEmail || 'info@newera365.com'}
                phone={s?.contactPhone || '+44 2070970860'}
                whatsapp={s?.whatsappNumber || '+18677783511'}
              />
              <Footer
                riskDisclaimer={riskDisclaimer ?? undefined}
                socialLinks={socialLinks}
                contact={contact}
                whatsapp={s?.whatsappNumber || '+18677783511'}
                paymentMethods={paymentMethods}
                regulatoryDisclosure={regulatoryDisclosure}
                companyRegistration={companyRegistration}
              />
            </ToastProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
