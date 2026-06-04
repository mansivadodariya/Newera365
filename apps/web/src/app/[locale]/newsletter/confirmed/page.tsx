'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function NewsletterConfirmedPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('newsletter');
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) {
      router.push(`/${locale}/newsletter`);
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, locale, router]);

  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center bg-background px-5 py-20">
      <div className="flex max-w-[480px] flex-col items-center gap-6 text-center">
        {/* Checkmark */}
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#00b050]/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12l5 5L20 7"
              stroke="#00b050"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-sans text-[32px] font-semibold leading-[1.1] tracking-[-0.64px] text-foreground">
            {t('confirmedHeading')}
          </h1>
          <p className="font-body text-[15px] leading-[1.6] text-muted">{t('confirmedDesc')}</p>
        </div>

        <p className="text-muted/60 font-body text-[13px]">{t('redirectingIn', { count })}</p>

        <Link
          href={`/${locale}/newsletter`}
          className="font-body text-[14px] font-medium text-accent transition-opacity hover:opacity-80"
        >
          {t('confirmedLink')} →
        </Link>
      </div>
    </main>
  );
}
