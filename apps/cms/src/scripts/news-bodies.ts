/**
 * news-bodies.ts
 *
 * Single source of truth for the article bodies of the seeded news items
 * (EN + AR), keyed by slug. Imported by both the canonical seeder
 * (seed.ts → seedNews) and the additive live-data patch (seed-news-bodies.ts)
 * so the prose lives in exactly one place — never hardcoded in the frontend.
 */

export const NEWS_BODIES: Record<string, { en: string[]; ar: string[] }> = {
  'fed-holds-rates-signals-two-cuts-2026': {
    en: [
      'The Federal Reserve left its benchmark rate unchanged at the June meeting, holding the target range steady for a fourth consecutive decision while it waits for clearer evidence that inflation is returning to target.',
      'The updated dot plot now points to two quarter-point cuts before the end of 2026 — a slightly more dovish path than markets had priced. Treasury yields eased and the dollar softened modestly as traders pulled forward the expected timing of the first cut.',
    ],
    ar: [
      'أبقى الاحتياطي الفيدرالي سعر الفائدة القياسي دون تغيير في اجتماع يونيو، مثبتاً النطاق المستهدف للقرار الرابع على التوالي بانتظار أدلة أوضح على عودة التضخم إلى المستوى المستهدف.',
      'ويشير مخطط النقاط المحدّث الآن إلى خفضين بمقدار ربع نقطة قبل نهاية 2026 — وهو مسار أكثر تيسيراً قليلاً مما سعّره السوق. وتراجعت عوائد سندات الخزانة وضعف الدولار بشكل طفيف مع تقديم المتداولين توقيت الخفض الأول.',
    ],
  },
  'gold-record-high-2400-safe-haven': {
    en: [
      'Gold pushed to a fresh record high above $2,400 an ounce as renewed safe-haven demand and steady central-bank buying outweighed the drag from a firm dollar.',
      'Analysts point to falling real yields and persistent geopolitical risk as the main supports. A sustained close above $2,400 would keep the next psychological target of $2,500 within reach, though a sharp rebound in yields remains the key risk.',
    ],
    ar: [
      'ارتفع الذهب إلى مستوى قياسي جديد فوق 2,400 دولار للأونصة مع تجدد الطلب على الملاذ الآمن واستمرار مشتريات البنوك المركزية بما فاق ضغط الدولار القوي.',
      'ويشير المحللون إلى تراجع العوائد الحقيقية واستمرار المخاطر الجيوسياسية كأبرز عوامل الدعم. ومن شأن إغلاق ثابت فوق 2,400 دولار أن يُبقي الهدف النفسي التالي عند 2,500 دولار في المتناول، مع بقاء الارتداد الحاد في العوائد الخطر الرئيسي.',
    ],
  },
  'bitcoin-surges-70000-etf-inflows': {
    en: [
      'Bitcoin climbed back above $70,000 as spot exchange-traded funds recorded their strongest week of net inflows since launch, signalling renewed institutional appetite.',
      'The rally broadened across major tokens, with traders watching whether ETF demand can absorb supply through the next halving cycle. Thin weekend liquidity, however, leaves the market exposed to sharp two-way swings.',
    ],
    ar: [
      'صعد البيتكوين مجدداً فوق 70,000 دولار مع تسجيل الصناديق المتداولة الفورية أقوى أسبوع من صافي التدفقات منذ إطلاقها، في إشارة إلى تجدد الشهية المؤسسية.',
      'واتسع الارتفاع ليشمل العملات الكبرى، فيما يراقب المتداولون ما إذا كان طلب الصناديق قادراً على استيعاب المعروض خلال دورة التنصيف المقبلة. غير أن ضعف السيولة في عطلة نهاية الأسبوع يترك السوق عرضة لتقلبات حادة في الاتجاهين.',
    ],
  },
  'ecb-minutes-caution-june-meeting': {
    en: [
      "Minutes from the European Central Bank's latest meeting struck a cautious tone, with policymakers stressing that any further easing will depend on incoming wage and services-inflation data.",
      'The euro held steady against the dollar as the account offered little new guidance on the pace of cuts. Markets continue to price a gradual path, wary of moving ahead of confirmation from the June projections.',
    ],
    ar: [
      'جاءت محاضر اجتماع البنك المركزي الأوروبي الأخير بنبرة حذرة، إذ شدّد صنّاع السياسة على أن أي تيسير إضافي سيعتمد على بيانات الأجور وتضخم الخدمات الواردة.',
      'وحافظ اليورو على استقراره أمام الدولار إذ لم تقدّم المحاضر توجيهات جديدة تُذكر بشأن وتيرة الخفض. ويواصل السوق تسعير مسار تدريجي بحذر من التحرك قبل تأكيد توقعات يونيو.',
    ],
  },
  'us-stocks-all-time-high-earnings': {
    en: [
      'US equity indices closed at all-time highs as a stronger-than-expected earnings season lifted megacap technology and financial shares.',
      'Breadth improved with more sectors participating in the advance, though stretched valuations and a still-data-dependent Fed leave the market sensitive to any upside surprise in inflation.',
    ],
    ar: [
      'أغلقت مؤشرات الأسهم الأمريكية عند مستويات قياسية مع موسم أرباح أقوى من المتوقع رفع أسهم كبرى شركات التكنولوجيا والقطاع المالي.',
      'وتحسّن اتساع السوق بمشاركة قطاعات أكثر في الصعود، رغم أن التقييمات المرتفعة وبقاء الفيدرالي معتمداً على البيانات يتركان السوق حساساً لأي مفاجأة صعودية في التضخم.',
    ],
  },
};

/** Wrap plain paragraphs into Payload v2 Slate richtext nodes. */
export const toSlate = (paras: string[]): Array<{ children: Array<{ text: string }> }> =>
  paras.map((p) => ({ children: [{ text: p }] }));
