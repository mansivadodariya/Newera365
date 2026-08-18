'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function NewsletterUnsubscribedPage() {
  const locale = useLocale();
  const t = useTranslations('newsletter');

  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center bg-background px-5 py-20">
      <div className="flex max-w-[480px] flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f4f4f5] dark:bg-[#1a1c22]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 4l16 16M4 20L20 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-muted"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-sans text-[32px] font-semibold leading-[1.1] tracking-[-0.64px] text-foreground">
            {t('unsubscribedHeading')}
          </h1>
          <p className="font-body text-[15px] leading-[1.6] text-muted">{t('unsubscribedDesc')}</p>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href={`/${locale}/newsletter`}
            className="flex h-[46px] items-center justify-center rounded-full bg-accent px-6 font-body text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('resubscribeLink')}
          </Link>
          <Link
            href={`/${locale}`}
            className="font-body text-[13px] text-muted transition-opacity hover:opacity-70"
          >
            ← {t('backHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}
