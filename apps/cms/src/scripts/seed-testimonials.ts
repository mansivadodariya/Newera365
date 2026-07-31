/**
 * seed-testimonials.ts
 *
 * Restores the homepage testimonials (SiteSettings.testimonials) — the array
 * was found empty in production on 2026-07-02, which makes TestimonialsSection
 * render nothing (client feedback round 3, #7). Content matches the reviewed
 * sample set from seed-sample-content.ts; editable in the CMS afterwards.
 *
 * Partial updateGlobal — verified that omitted arrays (footerEn, kpiStats,
 * socialProofLogos) survive partial updates, so only testimonials is touched.
 * Idempotent: re-running re-sets the same three entries.
 *
 * Run: ts-node --transpile-only src/scripts/seed-testimonials.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

const TESTIMONIALS = [
  {
    quoteEn:
      'Withdrawals hit my account the same day, every time. After three brokers, this is the first one I actually trust with size.',
    quoteAr:
      'تصلني عمليات السحب في نفس اليوم في كل مرة. بعد ثلاثة وسطاء، هذا أول وسيط أثق به فعلاً بأحجام كبيرة.',
    authorName: 'Omar A.',
    authorRoleEn: 'Day trader · Dubai',
    authorRoleAr: 'متداول يومي · دبي',
    rating: 5,
  },
  {
    quoteEn:
      'Spreads on the Raw account are genuinely tight and execution is fast even during news. My dedicated manager actually picks up the phone.',
    quoteAr:
      'الفروقات على حساب Raw ضيقة فعلاً والتنفيذ سريع حتى أثناء الأخبار. ومديري المخصص يرد على الهاتف بالفعل.',
    authorName: 'Sara K.',
    authorRoleEn: 'Swing trader · Riyadh',
    authorRoleAr: 'متداولة تأرجح · الرياض',
    rating: 5,
  },
  {
    quoteEn:
      'I started on the demo, moved to a live account in minutes, and the MT5 setup just worked across my laptop and phone.',
    quoteAr:
      'بدأت بالحساب التجريبي، وانتقلت إلى حساب حقيقي خلال دقائق، وعملت منصة MT5 بسلاسة على حاسوبي وهاتفي.',
    authorName: 'James T.',
    authorRoleEn: 'New trader · London',
    authorRoleAr: 'متداول جديد · لندن',
    rating: 5,
  },
  {
    quoteEn:
      'Swap-free account terms are transparent and fair. Trading Gold (XAUUSD) with tight spreads without hidden overnight fees makes a massive difference for my strategy.',
    quoteAr:
      'شروط الحساب الخالي من الفوائد شفافة وعادلة. تداول الذهب بسبريد ضيق ودون رسوم تبييت خفية أحدث فارقاً كبيراً في استراتيجيتي.',
    authorName: 'Tariq M.',
    authorRoleEn: 'Commodity trader · Kuwait City',
    authorRoleAr: 'متداول سلع · مدينة الكويت',
    rating: 5,
  },
  {
    quoteEn:
      'USDT deposits clear almost instantly and order execution under 15ms is real. No re-quotes or unexpected slippage during high volatility.',
    quoteAr:
      'إيداعات USDT تتأكد شبه فورياً وتنفيذ الأوامر في أقل من 15 ملي ثانية حقيقي. لا توجد إعادة تسعير أو انزلاق غير متوقع أثناء تقلبات السوق.',
    authorName: 'Lucas V.',
    authorRoleEn: 'Algorithmic trader · Frankfurt',
    authorRoleAr: 'متداول خوارزمي · فرانكفورت',
    rating: 5,
  },
  {
    quoteEn:
      'Customer support answered my account verification questions within minutes via live chat. Refreshing to deal with a broker that values client service.',
    quoteAr:
      'أجاب فريق الدعم الفني على استفسارات توثيق حسابي خلال دقائق عبر المحادثة المباشرة. من الرائع التعامل مع وسيط يهتم بخدمة العملاء.',
    authorName: 'Nadia H.',
    authorRoleEn: 'FX trader · Kuala Lumpur',
    authorRoleAr: 'متداولة عملات · كوالالمبور',
    rating: 5,
  },
  {
    quoteEn:
      'Switched my portfolio to Newera365 last year. The seamless web and mobile MT5 sync lets me manage risk on major FX pairs from anywhere.',
    quoteAr:
      'نقلت محفظتي إلى Newera365 العام الماضي. التزامن السلس لـ MT5 على الويب والهاتف يتيح لي إدارة المخاطر على أزواج العملات الرئيسية من أي مكان.',
    authorName: 'Liam R.',
    authorRoleEn: 'Portfolio manager · Sydney',
    authorRoleAr: 'مدير محافظ · سدني',
    rating: 5,
  },
];

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  const current = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  })) as { testimonials?: unknown[] };
  console.log(`Current testimonials: ${current.testimonials?.length ?? 0}`);

  await payload.updateGlobal({
    slug: 'site-settings',
    data: { testimonials: TESTIMONIALS },
    overrideAccess: true,
  });

  console.log(`✅ Restored ${TESTIMONIALS.length} testimonials into SiteSettings.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-testimonials failed:', err);
  process.exit(1);
});
