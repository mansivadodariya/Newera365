import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations('notFound');

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
      <Link
        href={`/${locale}`}
        className="flex h-[46px] items-center rounded-full bg-accent px-6 font-body text-[14px] font-medium text-white transition-colors hover:bg-accent-hover"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
