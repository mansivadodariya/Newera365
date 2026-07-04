/**
 * delete-junk-test-docs.ts
 *
 * Removes two leftover test documents whose uploaded files were never persisted
 * to the production server (uploaded via the local admin → file on local disk +
 * Neon row, but the binary never reached Railway's ephemeral FS), so the live
 * site renders valid-looking image URLs that 404:
 *
 *   • blog-posts        slug = "ai-blog"   (featuredImage "newera dark theme logo.jpg")
 *   • education-content slug = "ai-class"  (thumbnail "NewEra365 logo.pdf")
 *
 * Payload v2's drizzle schema makes child tables (`*_locales`, array tables)
 * FK to their parent ON DELETE CASCADE, so deleting the main row removes its
 * children. The script prints every incoming FK + its delete rule first so any
 * non-cascading reference that would block is visible before APPLY.
 *
 * Dry-run by default; pass APPLY=1 to delete. Connects to the DIRECT Neon endpoint.
 *
 * Run (dry):   ts-node --transpile-only src/scripts/delete-junk-test-docs.ts
 * Run (apply): APPLY=1 ts-node --transpile-only src/scripts/delete-junk-test-docs.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  return (process.env.DATABASE_URL ?? '').replace(/-pooler\./, '.');
}

// table → slug of the row to delete
const TARGETS: { table: string; slug: string }[] = [
  { table: 'blog_posts', slug: 'ai-blog' },
  { table: 'education_content', slug: 'ai-class' },
];

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  const apply = process.env.APPLY === '1';

  const client = new Client({
    connectionString: getDirectConnectionString(),
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });
  await client.connect();
  console.log(`✅ Connected — mode: ${apply ? 'APPLY (will delete)' : 'DRY RUN (no changes)'}\n`);

  let totalDeleted = 0;
  try {
    if (apply) await client.query('BEGIN');
    for (const { table, slug } of TARGETS) {
      const sel = await client.query(`SELECT id, slug FROM "${table}" WHERE slug = $1;`, [slug]);
      if (sel.rows.length === 0) {
        console.log(`• ${table}: no row with slug="${slug}" (already gone)`);
        continue;
      }
      sel.rows.forEach((r) => console.log(`• ${table}: id=${r.id} slug="${r.slug}"`));

      // Show incoming FKs so a non-CASCADE blocker is visible up front.
      const fks = await client.query<{ child: string; rule: string }>(
        `SELECT tc.table_name AS child, rc.delete_rule AS rule
           FROM information_schema.table_constraints tc
           JOIN information_schema.constraint_column_usage ccu
             ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
           JOIN information_schema.referential_constraints rc
             ON tc.constraint_name = rc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = $1
          ORDER BY tc.table_name;`,
        [table],
      );
      fks.rows.forEach((f) => console.log(`     ↳ referenced by ${f.child} (ON DELETE ${f.rule})`));

      if (apply) {
        const del = await client.query(`DELETE FROM "${table}" WHERE slug = $1;`, [slug]);
        totalDeleted += del.rowCount ?? 0;
        console.log(
          `     🗑️  deleted ${del.rowCount ?? 0} row(s) from ${table} (children cascade)`,
        );
      }
    }
    if (apply) await client.query('COMMIT');
  } catch (err) {
    if (apply) await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Rolled back:', err instanceof Error ? err.message : err);
    await client.end();
    process.exit(1);
  }

  console.log(
    `\n${'─'.repeat(50)}\n` +
      (apply
        ? `✅ Deleted ${totalDeleted} document(s).`
        : `🔎 Dry run complete. Re-run with APPLY=1 to delete.`),
  );
  await client.end();
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
