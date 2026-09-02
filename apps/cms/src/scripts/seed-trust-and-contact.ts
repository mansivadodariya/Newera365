/**
 * seed-trust-and-contact.ts
 *
 * Client-feedback round 2 (#3 trust statistics, #5 floating contact):
 *  • kpiStats — 6 homepage stat tiles (EN/AR), replacing the 4-tile
 *    translation fallback with CMS-managed values.
 *  • Testimonials rating band — socialProofHeadline / ratingValue / ratingCount.
 *  • whatsappNumber — placeholder for the floating contact widget (mirrors the
 *    published support phone; client swaps in the real WhatsApp line at handoff).
 *  • Contact fields (phone / hours / address) — filled ONLY when currently
 *    blank, using the details already published on the /contact page.
 *
 * Values are professional placeholders, editable in the CMS after handoff.
 * Uses Payload's LOCAL API (overrideAccess) — partial updateGlobal, idempotent.
 * REQUIRES the whatsapp_number column (run migrate-missing-columns.ts first).
 *
 * Dry-run by default; pass APPLY=1 to write.
 * Run: APPLY=1 ts-node --transpile-only src/scripts/seed-trust-and-contact.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

const KPI_STATS = [
  { valueEn: '3+', valueAr: '+3', labelEn: 'Years in Market', labelAr: 'سنوات في السوق' },
  { valueEn: '50k', valueAr: '50 ألف', labelEn: 'Active Traders', labelAr: 'متداول نشط' },
  {
    valueEn: '< 12 ms',
    valueAr: 'أقل من 12 م.ث',
    labelEn: 'Avg Execution',
    labelAr: 'متوسط التنفيذ',
  },
  { valueEn: '99.95%', valueAr: '99.95%', labelEn: 'Platform Uptime', labelAr: 'جاهزية المنصة' },
];

const RATING = {
  socialProofHeadlineEn: 'Trusted by 50,000+ traders worldwide',
  socialProofHeadlineAr: 'موثوق من أكثر من 50,000 متداول حول العالم',
  ratingValue: '4.8',
  ratingCountEn: 'based on 2,400+ verified reviews',
  ratingCountAr: 'استناداً إلى أكثر من 2,400 تقييم موثَّق',
};

const CONTACT_FALLBACKS = {
  contactPhone: '+44 2070970860',
  whatsappNumber: '+18677783511',
  supportHoursEn: 'Monday–Friday, 24/5',
  supportHoursAr: 'الاثنين–الجمعة، 24/5',
  contactAddressEn: 'DIFC Gate Village, Tower 4, Dubai, UAE',
  contactAddressAr: 'مركز دبي المالي العالمي، غيت فيليدج، البرج 4، دبي، الإمارات',
};

const DOWNLOAD_URLS = {
  downloadWindows:
    'https://download.terminal.free/cdn/web/newera.capital.markets/mt5/neweracapitalmarkets5setup.exe',
  downloadMac:
    'https://download.terminal.free/cdn/web/newera.capital.markets/mt5/neweracapitalmarkets5setup.exe',
  downloadWebTrader: 'https://webtrading.newera365.com/terminal',
  downloadAndroid:
    'https://download.terminal.free/cdn/mobile/mt5/android?server=NeweraCapitalMarkets-Server',
  downloadIos:
    'https://download.terminal.free/cdn/mobile/mt5/ios?server=NeweraCapitalMarkets-Server',
};

const USP_METRICS = [
  {
    valueEn: '< 15 ms',
    valueAr: '< 15 ms',
    titleEn: 'Average execution speed',
    titleAr: 'متوسط سرعة التنفيذ',
    descEn: 'Orders fill at real market speed, not screen speed.',
    descAr: 'تُنفَّذ الأوامر بسرعة السوق الحقيقية، لا بسرعة الشاشة.',
  },
  {
    valueEn: '24/7',
    valueAr: '24/7',
    titleEn: 'Support availability',
    titleAr: 'توفر الدعم',
    descEn: 'A human on the other end, any day of the week.',
    descAr: 'شخص حقيقي في الطرف الآخر، في أي يوم من أيام الأسبوع.',
  },
  {
    valueEn: '100%',
    valueAr: '100%',
    titleEn: 'Straight-to-market execution',
    titleAr: 'تنفيذ مباشر إلى السوق',
    descEn: 'No dealing desk intervention on client orders.',
    descAr: 'لا تدخل من مكتب التداول في أوامر العملاء.',
  },
  {
    valueEn: 'Tier-1',
    valueAr: 'المستوى 1',
    titleEn: 'Regulated & segregated',
    titleAr: 'منظّم وأموال منفصلة',
    descEn: 'Client funds are held separately from company funds in Tier-1 regulated banks.',
    descAr: 'تُحفظ أموال العملاء بشكل منفصل عن أموال الشركة في بنوك مرخصة من المستوى الأول.',
  },
  {
    valueEn: '0',
    valueAr: '0',
    titleEn: 'Re-quotes on market orders',
    titleAr: 'إعادة تسعير على أوامر السوق',
    descEn: 'The price you click is the price you get.',
    descAr: 'السعر الذي تنقر عليه هو السعر الذي تحصل عليه.',
  },
  {
    valueEn: '2026',
    valueAr: '2026',
    titleEn: 'Built for the next generation of trading',
    titleAr: 'مصمم لجيل التداول القادم',
    descEn: 'Modern infrastructure, not a legacy platform bolted together.',
    descAr: 'بنية تحتية حديثة، وليست منصة قديمة مجمعة.',
  },
];

const TESTIMONIALS = [
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
      'Switched my portfolio to Newera last year. The seamless web and mobile MT5 sync lets me manage risk on major FX pairs from anywhere.',
    quoteAr:
      'نقلت محفظتي إلى Newera العام الماضي. التزامن السلس لـ MT5 على الويب والهاتف يتيح لي إدارة المخاطر على أزواج العملات الرئيسية من أي مكان.',
    authorName: 'Liam R.',
    authorRoleEn: 'Portfolio manager · Sydney',
    authorRoleAr: 'مدير محافظ · سدني',
    rating: 5,
  },
  {
    quoteEn:
      "I've traded with several brokers over the years, but Newera's raw spreads on EUR/USD are consistently the tightest. The transparency around fees is something I genuinely appreciate.",
    quoteAr:
      'تداولت مع عدة وسطاء على مر السنين، لكن سبريد EUR/USD في Newera هو الأضيق باستمرار. أقدّر حقاً الشفافية في رسوم التداول.',
    authorName: 'James O.',
    authorRoleEn: 'Forex day trader · London',
    authorRoleAr: 'متداول يومي في العملات · لندن',
    rating: 5,
  },
  {
    quoteEn:
      'Funding and withdrawing is genuinely painless. I tested with a small transfer first, and funds hit my account within hours. That kind of reliability builds real trust.',
    quoteAr:
      'عمليات الإيداع والسحب سهلة للغاية. جربت بتحويل صغير أولاً، ووصلت الأموال لحسابي في غضون ساعات. هذا النوع من الموثوقية يبني ثقة حقيقية.',
    authorName: 'Sara K.',
    authorRoleEn: 'Retail investor · Dubai',
    authorRoleAr: 'مستثمرة · دبي',
    rating: 5,
  },
  {
    quoteEn:
      'The MT5 platform on both desktop and mobile is stable and responsive. Chart loading is near-instant even during busy sessions like NFP. Exactly what a serious trader needs.',
    quoteAr:
      'منصة MT5 على سطح المكتب والهاتف مستقرة وسريعة الاستجابة. تحميل الرسوم البيانية شبه فوري حتى في جلسات مزدحمة مثل وقت صدور NFP. هذا ما يحتاجه المتداول الجاد.',
    authorName: 'Farouk A.',
    authorRoleEn: 'Swing trader · Cairo',
    authorRoleAr: 'متداول سوينغ · القاهرة',
    rating: 5,
  },
];

async function run() {
  const apply = process.env.APPLY === '1';
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  const current = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  })) as Record<string, unknown>;

  const data: Record<string, unknown> = {
    kpiStats: KPI_STATS,
    uspMetrics: USP_METRICS,
    testimonials: TESTIMONIALS,
    ...RATING,
    ...DOWNLOAD_URLS,
  };
  for (const [key, value] of Object.entries(CONTACT_FALLBACKS)) {
    const cur = current[key];
    if (cur == null || cur === '') data[key] = value;
    else console.log(`  • ${key} already set ("${String(cur).slice(0, 40)}") — leaving as-is`);
  }

  console.log(`\nMode: ${apply ? 'APPLY (will write)' : 'DRY RUN (no changes)'}`);
  console.log('Fields to write:', Object.keys(data).join(', '));
  console.log(`kpiStats: ${KPI_STATS.map((s) => `${s.valueEn} ${s.labelEn}`).join(' | ')}`);

  if (apply) {
    await payload.updateGlobal({ slug: 'site-settings', data, overrideAccess: true });
    console.log('\n✅ Seeded trust stats, rating band and contact fallbacks into SiteSettings.');
  } else {
    console.log('\n🔎 DRY RUN only. Re-run with APPLY=1 to write.');
  }
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-trust-and-contact failed:', err);
  process.exit(1);
});
