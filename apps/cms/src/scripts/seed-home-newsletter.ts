/**
 * seed-home-newsletter.ts
 *
 * Seeds the homepage newsletter teaser copy into SiteSettings (client feedback
 * #19) so the CMS holds the same content the component ships as i18n defaults.
 * Editable in the CMS afterwards. Run migrate-home-newsletter.ts FIRST (the
 * columns must exist).
 *
 * Partial updateGlobal — omitted fields (testimonials, footer, kpiStats, …)
 * survive. Idempotent: re-running re-sets the same values.
 *
 * Run: ts-node --transpile-only src/scripts/seed-home-newsletter.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

const NEWSLETTER = {
  nlHeadlineEn: 'Read the market',
  nlHeadlineAr: 'اقرأ السوق',
  nlHeadlineAccentEn: 'before it moves.',
  nlHeadlineAccentAr: 'قبل أن يتحرّك.',
  nlSubtitleEn:
    'The Monday Briefing lands in your inbox each week: the insights, events, and setups our desk is watching. No noise, and one click to unsubscribe.',
  nlSubtitleAr:
    'تصل نشرة الإثنين إلى بريدك كل أسبوع: الرؤى والأحداث والفرص التي يتابعها مكتبنا. بلا ضجيج، وبنقرة واحدة لإلغاء الاشتراك.',
  nlMetricValue: '47,000+',
  nlMetricLabelEn: 'traders read it every Monday',
  nlMetricLabelAr: 'يقرأها المتداولون كل إثنين',
  nlIssueMetaEn: 'Issue 118 · Mon 7:00am',
  nlIssueMetaAr: 'العدد 118 · الإثنين 7:00 ص',
  nlLeadHeadlineEn: 'Dollar braces for CPI as the desk trims risk',
  nlLeadHeadlineAr: 'الدولار يترقب بيانات التضخم والمكتب يقلّص المخاطر',
  nlFxHeadEn: 'Where the dollar goes after the print',
  nlFxHeadAr: 'إلى أين يتجه الدولار بعد صدور البيانات',
  nlCmdHeadEn: "Gold's range and the level that breaks it",
  nlCmdHeadAr: 'نطاق الذهب والمستوى الذي يكسره',
  nlMacroHeadEn: 'What three central banks signal this week',
  nlMacroHeadAr: 'ما تشير إليه ثلاثة بنوك مركزية هذا الأسبوع',
  nlCategories: [
    {
      cadenceEn: 'Every morning',
      cadenceAr: 'كل صباح',
      titleEn: 'Daily insights',
      titleAr: 'رؤى يومية',
      descEn: "What moved overnight and the levels we're watching at the open.",
      descAr: 'ما تحرّك خلال الليل والمستويات التي نتابعها عند الافتتاح.',
    },
    {
      cadenceEn: 'This week',
      cadenceAr: 'هذا الأسبوع',
      titleEn: 'Economic events',
      titleAr: 'الأحداث الاقتصادية',
      descEn: 'The data that moves markets, jobs, inflation, central banks, with pre-event notes.',
      descAr:
        'البيانات التي تحرّك الأسواق، الوظائف والتضخم والبنوك المركزية، مع ملاحظات قبل الصدور.',
    },
    {
      cadenceEn: 'Weekly',
      cadenceAr: 'أسبوعياً',
      titleEn: 'Trading tips',
      titleAr: 'نصائح التداول',
      descEn: 'One clear setup with entry, stop, and target, explained in plain terms.',
      descAr: 'فرصة واحدة واضحة بنقطة دخول ووقف وهدف، مشروحة ببساطة.',
    },
    {
      cadenceEn: 'Every Monday',
      cadenceAr: 'كل إثنين',
      titleEn: 'Weekly outlook',
      titleAr: 'النظرة الأسبوعية',
      descEn: 'A 5 minute read on where markets are headed, and why.',
      descAr: 'قراءة من خمس دقائق حول وجهة الأسواق وأسبابها.',
    },
  ],
};

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  await payload.updateGlobal({
    slug: 'site-settings',
    data: NEWSLETTER,
    overrideAccess: true,
  });

  console.log('✅ Seeded homepage newsletter copy into SiteSettings (EN + AR).');
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-home-newsletter failed:', err);
  process.exit(1);
});
