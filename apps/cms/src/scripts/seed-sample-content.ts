/**
 * seed-sample-content.ts
 *
 * SAMPLE / placeholder content for the homepage social-proof + footer sections
 * (Developer Brief Part A, items 5.1 & 6.1). Populates the SiteSettings global so
 * the TrustStrip, Stats, Testimonials and Footer don't render empty before the
 * client supplies real copy.
 *
 * SAFE & IDEMPOTENT: fills ONLY fields that are currently empty — it never
 * overwrites values an editor (or the client) has already entered, so it is safe
 * to re-run against the populated Neon DB. Re-run after the client enters real
 * data and it will no-op.
 *
 * NOT seeded: image uploads (socialProofLogos.logo, payment-method logos) — those
 * require real media assets, not fabricated ones. Add them in the CMS admin.
 *
 * ⚠️  The regulatory / company / risk text below is GENERIC placeholder. Have
 *     compliance replace it with the licensed entity's real disclosures.
 *
 * Run: ts-node --transpile-only src/scripts/seed-sample-content.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import payload from 'payload';

type Dict = Record<string, unknown>;

// Returns sample only when the current value is empty/missing (string or array).
const isEmpty = (v: unknown): boolean =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

const SAMPLE: Dict = {
  // ── KPI stats (homepage) ──────────────────────────────────────────────────
  kpiStats: [
    { valueEn: '50,000+', valueAr: '+٥٠٬٠٠٠', labelEn: 'Active Traders', labelAr: 'متداول نشط' },
    { valueEn: '10+', valueAr: '+١٠', labelEn: 'Years in Business', labelAr: 'سنوات في السوق' },
    {
      valueEn: '1M+',
      valueAr: '+١ مليون',
      labelEn: 'Trades Executed Daily',
      labelAr: 'صفقة تُنفّذ يومياً',
    },
    { valueEn: '99.9%', valueAr: '٪٩٩٫٩', labelEn: 'Platform Uptime', labelAr: 'جهوزية المنصة' },
  ],

  // ── Social proof headline + rating ────────────────────────────────────────
  socialProofHeadlineEn: 'Trusted by 50,000+ traders worldwide',
  socialProofHeadlineAr: 'موثوق به من أكثر من ٥٠٬٠٠٠ متداول حول العالم',
  ratingValue: '4.8',
  ratingCountEn: 'based on 2,400+ verified reviews',
  ratingCountAr: 'استناداً إلى أكثر من ٢٬٤٠٠ مراجعة موثّقة',

  // ── Testimonials ──────────────────────────────────────────────────────────
  testimonials: [
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
  ],

  // ── Contact ───────────────────────────────────────────────────────────────
  contactEmail: 'support@newera365.com',
  contactEmailCompliance: 'compliance@newera365.com',
  contactPhone: '+44 20 1234 5678',
  contactAddressEn: '1 Example Street, London, EC1A 1AA, United Kingdom',
  contactAddressAr: '١ شارع المثال، لندن، EC1A 1AA، المملكة المتحدة',
  supportHoursEn: 'Monday – Friday, 08:00 – 22:00 UTC',
  supportHoursAr: 'الإثنين – الجمعة، ٠٨:٠٠ – ٢٢:٠٠ بتوقيت UTC',

  // ── Social links (placeholder handles) ────────────────────────────────────
  socialFacebook: 'https://facebook.com/newera365',
  socialX: 'https://x.com/newera365',
  socialLinkedIn: 'https://linkedin.com/company/newera365',
  socialInstagram: 'https://instagram.com/newera365',
  socialYoutube: 'https://youtube.com/@newera365',
  socialTelegram: 'https://t.me/newera365',

  // ── Footer columns ────────────────────────────────────────────────────────
  footerEn: [
    {
      heading: 'Trading',
      links: [
        { label: 'Accounts', href: '/trade/accounts' },
        { label: 'Funding', href: '/trade/funding' },
        { label: 'Fees', href: '/trade/fees' },
        { label: 'Promotions', href: '/trade/promotions' },
      ],
    },
    {
      heading: 'Markets',
      links: [
        { label: 'Forex', href: '/markets/forex' },
        { label: 'Metals', href: '/markets/metals' },
        { label: 'Indices', href: '/markets/indices' },
        { label: 'Crypto', href: '/markets/crypto' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '/company/about' },
        { label: 'Careers', href: '/company/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Awards', href: '/company/awards' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Education', href: '/education' },
        { label: 'Research', href: '/research' },
        { label: 'Glossary', href: '/glossary' },
        { label: 'FAQs', href: '/faqs' },
      ],
    },
  ],
  footerAr: [
    {
      heading: 'التداول',
      links: [
        { label: 'الحسابات', href: '/trade/accounts' },
        { label: 'الإيداع والسحب', href: '/trade/funding' },
        { label: 'الرسوم', href: '/trade/fees' },
        { label: 'العروض', href: '/trade/promotions' },
      ],
    },
    {
      heading: 'الأسواق',
      links: [
        { label: 'الفوركس', href: '/markets/forex' },
        { label: 'المعادن', href: '/markets/metals' },
        { label: 'المؤشرات', href: '/markets/indices' },
        { label: 'العملات الرقمية', href: '/markets/crypto' },
      ],
    },
    {
      heading: 'الشركة',
      links: [
        { label: 'من نحن', href: '/company/about' },
        { label: 'الوظائف', href: '/company/careers' },
        { label: 'تواصل معنا', href: '/contact' },
        { label: 'الجوائز', href: '/company/awards' },
      ],
    },
    {
      heading: 'المصادر',
      links: [
        { label: 'التعليم', href: '/education' },
        { label: 'الأبحاث', href: '/research' },
        { label: 'المسرد', href: '/glossary' },
        { label: 'الأسئلة الشائعة', href: '/faqs' },
      ],
    },
  ],

  // ── Regulatory / company / risk (GENERIC placeholder — compliance must replace) ──
  regulatoryDisclosureEn:
    'Newera365 is a trading name of [Registered Entity Ltd], authorised and regulated by [Regulator] under licence number [000000]. Trading services are provided in accordance with the regulator’s rules.',
  regulatoryDisclosureAr:
    'Newera365 اسم تجاري لـ [الكيان المسجّل المحدودة]، المرخّص والخاضع لرقابة [الجهة التنظيمية] بموجب الترخيص رقم [000000]. تُقدَّم خدمات التداول وفقاً لقواعد الجهة التنظيمية.',
  companyRegistrationEn:
    '[Registered Entity Ltd], Company No. 000000. Registered office: 1 Example Street, London, EC1A 1AA, United Kingdom.',
  companyRegistrationAr:
    '[الكيان المسجّل المحدودة]، رقم الشركة 000000. المكتب المسجّل: ١ شارع المثال، لندن، EC1A 1AA، المملكة المتحدة.',
  riskDisclaimerEn:
    'CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money. Past performance is not a reliable indicator of future results.',
  riskDisclaimerAr:
    'عقود الفروقات أدوات معقّدة وتنطوي على مخاطر عالية لخسارة الأموال بسرعة بسبب الرافعة المالية. ينبغي أن تدرس ما إذا كنت تفهم كيفية عمل عقود الفروقات وما إذا كان بإمكانك تحمّل المخاطر العالية لخسارة أموالك. الأداء السابق ليس مؤشراً موثوقاً للنتائج المستقبلية.',
};

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  const current = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as Dict;

  const patch: Dict = {};
  const filled: string[] = [];
  const skipped: string[] = [];
  for (const [key, value] of Object.entries(SAMPLE)) {
    if (isEmpty(current[key])) {
      patch[key] = value;
      filled.push(key);
    } else {
      skipped.push(key);
    }
  }

  if (Object.keys(patch).length === 0) {
    console.log('✅ Nothing to seed — every sample field already has a value.');
    process.exit(0);
  }

  await payload.updateGlobal({ slug: 'site-settings', data: patch as never });

  console.log(`\n✅ Seeded ${filled.length} empty field(s): ${filled.join(', ')}`);
  if (skipped.length) {
    console.log(`⏭️  Left ${skipped.length} already-set field(s) untouched: ${skipped.join(', ')}`);
  }
  console.log('\n⚠️  Regulatory/company/risk text is placeholder — have compliance replace it.');
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-sample-content failed:', err);
  process.exit(1);
});
