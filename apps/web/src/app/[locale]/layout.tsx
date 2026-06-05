import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { ToastProvider, Header, Footer, RiskBanner, SmartCtaBanner } from '@newera365/ui';
import type { CmsFooterColumn, CmsSocialLinks } from '@newera365/ui';
import { dir, LOCALES, type Locale } from '@newera365/types';
import { routing } from '@/i18n/routing';
import { getSiteSettings } from '@/lib/cms';
import '../globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

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

  const footerColumns: CmsFooterColumn[] | undefined = s
    ? ((locale === 'ar' ? s.footerAr : s.footerEn) ?? undefined)
    : undefined;

  const riskDisclaimer = s
    ? ((locale === 'ar' ? s.riskDisclaimerAr : s.riskDisclaimerEn) ?? undefined)
    : undefined;

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

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <ToastProvider>
              {/* CMS-controlled dismissible risk banner — shown above header */}
              <RiskBanner enabled={riskBannerEnabled} message={riskBannerMessage} />

              <Header />
              <div
                className="fixed inset-0 -z-10 dark:hidden"
                style={{ background: 'linear-gradient(0deg, #FFF 53.85%, #67FF59 100%)' }}
                aria-hidden="true"
              />
              <div
                className="fixed inset-0 -z-10 hidden dark:block"
                style={{ background: 'linear-gradient(0deg, #000 56.25%, #085a00 100%)' }}
                aria-hidden="true"
              />
              <main>{children}</main>
              <Footer
                footerColumns={
                  footerColumns && footerColumns.length > 0 ? footerColumns : undefined
                }
                riskDisclaimer={riskDisclaimer ?? undefined}
                socialLinks={socialLinks}
              />
            </ToastProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
