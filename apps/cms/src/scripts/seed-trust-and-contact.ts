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
  { valueEn: '12+', valueAr: '+12', labelEn: 'Years in Markets', labelAr: 'عاماً في الأسواق' },
  { valueEn: '180k+', valueAr: '+180 ألف', labelEn: 'Active Traders', labelAr: 'متداول نشط' },
  {
    valueEn: '< 12 ms',
    valueAr: 'أقل من 12 م.ث',
    labelEn: 'Avg Execution',
    labelAr: 'متوسط التنفيذ',
  },
  { valueEn: '99.99%', valueAr: '99.99%', labelEn: 'Platform Uptime', labelAr: 'جاهزية المنصة' },
  {
    valueEn: '10,000+',
    valueAr: '+10,000',
    labelEn: 'Tradable Instruments',
    labelAr: 'أداة قابلة للتداول',
  },
  { valueEn: '120+', valueAr: '+120', labelEn: 'Countries Served', labelAr: 'دولة نخدمها' },
];

const RATING = {
  socialProofHeadlineEn: 'Trusted by 180,000+ traders worldwide',
  socialProofHeadlineAr: 'يثق بنا أكثر من 180 ألف متداول حول العالم',
  ratingValue: '4.8',
  ratingCountEn: 'based on 2,400+ verified reviews',
  ratingCountAr: 'استناداً إلى أكثر من 2,400 تقييم موثَّق',
};

// Details already published on the /contact page — used only to fill blanks.
const CONTACT_FALLBACKS = {
  contactPhone: '+1 867-778-3511',
  whatsappNumber: '+18677783511',
  supportHoursEn: 'Monday–Friday, 24/5',
  supportHoursAr: 'الاثنين–الجمعة، 24/5',
  contactAddressEn: 'DIFC Gate Village, Tower 4, Dubai, UAE',
  contactAddressAr: 'مركز دبي المالي العالمي، غيت فيليدج، البرج 4، دبي، الإمارات',
};

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

  const data: Record<string, unknown> = { kpiStats: KPI_STATS, ...RATING };
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
