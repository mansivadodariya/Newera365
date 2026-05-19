import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Button } from '@newera365/ui';

// Home — Template "Unique". MT5-driven KPI ticker is wired in Phase 3.
export default function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('home');
  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-4xl font-bold text-brand">{t('heroTitle')}</h1>
      <p className="mt-4 text-lg text-brand-dark">{t('heroSubtitle')}</p>
      <div className="mt-8 flex gap-4">
        <Button variant="primary">{t('ctaLive')}</Button>
        <Button variant="secondary">{t('ctaDemo')}</Button>
      </div>
    </main>
  );
}
