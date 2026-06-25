import { setRequestLocale } from 'next-intl/server';
import { AnalystChartPage, CtaBanner } from '@newera365/ui';
import type { CmsAnalystCallItem, CmsAnalystProfile } from '@newera365/ui';
import { getAnalystCalls, getSiteSettings } from '@/lib/cms';

export default async function AnalystChartRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  const [rawCalls, settings] = await Promise.all([getAnalystCalls(), getSiteSettings()]);

  const cmsCalls: CmsAnalystCallItem[] = rawCalls.map((c) => ({
    id: c.id,
    symbol: c.symbol,
    tvSymbol: c.tvSymbol,
    currentPrice: c.currentPrice,
    targetPrice: c.targetPrice,
    confidence: c.confidence,
    sentiment: c.sentiment,
    category: c.category,
    sparkPoints: c.sparkPoints,
  }));

  const cmsAnalyst: CmsAnalystProfile | null = settings
    ? {
        initials: settings.analystInitials,
        name: settings.analystName,
        title: settings.analystTitle,
        updated: settings.analystUpdated,
        commentaryEn: settings.analystCommentaryEn,
        commentaryAr: settings.analystCommentaryAr,
      }
    : null;

  return (
    <>
      <AnalystChartPage cmsCalls={cmsCalls} cmsAnalyst={cmsAnalyst} locale={params.locale} />
      <CtaBanner />
    </>
  );
}
