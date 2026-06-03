import { setRequestLocale } from 'next-intl/server';
import { PromoPage, CtaBanner } from '@newera365/ui';
import type { CmsPromoItem } from '@newera365/ui';
import { getPromotions } from '@/lib/cms';
import type { CmsPromotion } from '@/lib/cms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promotions & Offers | NewEra365',
  description: 'Current trading bonuses, cashback, and promotional offers.',
};

function mapPromo(p: CmsPromotion): CmsPromoItem {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    tag: p.tag,
    tagColor: p.tagColor,
    description: p.description ?? '',
    terms: p.terms,
    ctaLabel: p.ctaLabel,
    ctaHref: p.ctaHref,
    isHighlighted: p.isHighlighted,
  };
}

export default async function PromotionsRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const promos = await getPromotions(params.locale);
  return (
    <>
      <PromoPage promos={promos.length > 0 ? promos.map(mapPromo) : undefined} />
      <CtaBanner />
    </>
  );
}
