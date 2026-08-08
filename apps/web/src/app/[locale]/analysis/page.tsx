import { setRequestLocale } from 'next-intl/server';
import { AnalysisPage } from '@newera365/ui';

interface AnalysisPageRouteProps {
  params: { locale: string };
}

export function generateMetadata() {
  return {
    title: 'Market Analysis & Real-Time Technical Gauges | NewEra',
    description:
      'Real-time Forex heatmap, economic calendar, cross-rates matrix, and automated technical analysis gauges for Gold, Crude Oil, EUR/USD, and Apple.',
  };
}

export default function Page({ params: { locale } }: AnalysisPageRouteProps) {
  setRequestLocale(locale);
  return <AnalysisPage />;
}
