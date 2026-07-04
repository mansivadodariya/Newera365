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
