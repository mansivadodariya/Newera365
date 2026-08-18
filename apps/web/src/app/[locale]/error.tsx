'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('error');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-5 text-center">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
        {t('code')}
      </p>
      <h1 className="mb-3 font-sans text-[32px] font-semibold leading-[1.1] text-foreground">
        {t('heading')}
      </h1>
      <p className="mb-8 max-w-[300px] font-body text-[14px] leading-[1.55] text-muted">
        {t('desc')}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex h-[46px] items-center rounded-full border border-border px-6 font-body text-[14px] font-medium text-foreground transition-colors hover:border-accent/50"
        >
          {t('tryAgain')}
        </button>
        <Link
          href={`/${locale}`}
          className="flex h-[46px] items-center rounded-full bg-accent px-6 font-body text-[14px] font-medium text-white transition-colors hover:bg-accent-hover"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
