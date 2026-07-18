/**
 * migrate-media-press-publication-ar.ts
 *
 * Adds the new `publication_ar` column to media_press (additive, idempotent) and
 * seeds Arabic publication names for the existing entries. Pairs with the
 * `publicationAr` field added to MediaPress.ts — the column MUST exist before the
 * CMS redeploys with that field, or media-press reads 500 (schema drift, push:false).
 *
 * Dry-run by default; pass APPLY=1 to write. Direct Neon endpoint.
 *
 * Run (dry):   ts-node --transpile-only src/scripts/migrate-media-press-publication-ar.ts
 * Run (apply): APPLY=1 ts-node --transpile-only src/scripts/migrate-media-press-publication-ar.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  return (process.env.DATABASE_URL ?? '').replace(/-pooler\./, '.');
}

// English publication name → Arabic. Matched against the existing non-localized value.
const AR_NAMES: Record<string, string> = {
  Bloomberg: 'بلومبرغ',
  Reuters: 'رويترز',
  'Forbes Middle East': 'فوربس الشرق الأوسط',
  'The National': 'ذا ناشيونال',
};

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  const apply = process.env.APPLY === '1';

  const client = new Client({
    connectionString: getDirectConnectionString(),
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });
  await client.connect();
  console.log(`✅ Connected — mode: ${apply ? 'APPLY (will write)' : 'DRY RUN (no changes)'}\n`);

  try {
    if (apply) await client.query('BEGIN');

    // 1. Additive column (safe / idempotent).
    console.log('① ALTER TABLE media_press ADD COLUMN IF NOT EXISTS publication_ar varchar(100)');
    if (apply) {
      await client.query(
        'ALTER TABLE "media_press" ADD COLUMN IF NOT EXISTS "publication_ar" varchar(100);',
      );
    }

    // 2. Seed Arabic names for the known publications.
    console.log('\n② Seed Arabic publication names:');
    const { rows } = await client.query<{
      id: number;
      publication: string;
      publication_ar: string | null;
    }>(
      // publication_ar may not exist yet on a dry run → guard with a column check.
      apply
        ? 'SELECT id, publication, publication_ar FROM "media_press";'
        : 'SELECT id, publication, NULL::varchar AS publication_ar FROM "media_press";',
    );
    for (const r of rows) {
      const ar = AR_NAMES[r.publication];
      if (!ar) {
        console.log(`   • id=${r.id} "${r.publication}" → (no mapping, skip)`);
        continue;
      }
      console.log(`   • id=${r.id} "${r.publication}" → "${ar}"`);
      if (apply) {
        await client.query('UPDATE "media_press" SET "publication_ar" = $1 WHERE id = $2;', [
          ar,
          r.id,
        ]);
      }
    }

    if (apply) await client.query('COMMIT');
    console.log(`\n${'─'.repeat(56)}`);
    console.log(
      apply
        ? '✅ Column added + Arabic publication names seeded.'
        : '🔎 DRY RUN only. Re-run with APPLY=1 to write.',
    );
  } catch (err) {
    if (apply) await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Rolled back:', err instanceof Error ? err.message : err);
    await client.end();
    process.exit(1);
  }

  await client.end();
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
