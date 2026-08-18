/**
 * seed-news-bodies.ts
 *
 * ADDITIVE, idempotent: backfills real EN + AR article bodies onto the existing
 * `news` rows (matched by slug) so the frontend renders genuine CMS content
 * instead of any placeholder. NEVER deletes. Bodies come from news-bodies.ts.
 *
 * Run: ts-node --transpile-only src/scripts/seed-news-bodies.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import payload from 'payload';
import { NEWS_BODIES, toSlate } from './news-bodies';

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  let updated = 0;
  let missing = 0;
  console.log('\n📰 Backfilling news bodies (EN + AR)...');

  for (const [slug, bodies] of Object.entries(NEWS_BODIES)) {
    const found = await payload.find({
      collection: 'news',
      where: { slug: { equals: slug } },
      limit: 1,
      locale: 'en',
    });
    const doc = found.docs[0];
    if (!doc) {
      console.log(`   ⚠️  no news row for slug "${slug}" — skipped`);
      missing++;
      continue;
    }
    await payload.update({
      collection: 'news',
      id: doc.id,
      locale: 'en',
      data: { body: toSlate(bodies.en) } as never,
    });
    await payload.update({
      collection: 'news',
      id: doc.id,
      locale: 'ar',
      data: { body: toSlate(bodies.ar) } as never,
    });
    console.log(`   ✅ ${slug}`);
    updated++;
  }

  console.log(`\n✅ Done — ${updated} updated, ${missing} missing (EN + AR).`);
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-news-bodies failed:', err);
  process.exit(1);
});
