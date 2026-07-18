/**
 * remove-mobile-footer-link.ts
 *
 * Removes the "/platform/mobile" link from the CMS footer (SiteSettings global's
 * footerEn / footerAr array fields). The live footer renders from this CMS data
 * — not the hardcoded fallback in Footer.tsx — so the link must be deleted here.
 *
 * Scans every Payload array table that has both `label` and `href` columns and
 * reports any row whose href points at /platform/mobile. Dry-run by default;
 * pass APPLY=1 to actually delete. Connects to the DIRECT Neon endpoint.
 *
 * Run (dry):   ts-node --transpile-only src/scripts/remove-mobile-footer-link.ts
 * Run (apply): APPLY=1 ts-node --transpile-only src/scripts/remove-mobile-footer-link.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  return (process.env.DATABASE_URL ?? '').replace(/-pooler\./, '.');
}

const TARGET = '/platform/mobile';

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

  // Every array table that models {label, href} link rows.
  const { rows: tables } = await client.query<{ table_name: string }>(
    `SELECT table_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'href'
        AND table_name IN (
          SELECT table_name FROM information_schema.columns
           WHERE table_schema = 'public' AND column_name = 'label'
        )
      ORDER BY table_name;`,
  );

  let totalFound = 0;
  let totalDeleted = 0;
  try {
    if (apply) await client.query('BEGIN');
    for (const { table_name } of tables) {
      const sel = await client.query(
        `SELECT id, label, href FROM "${table_name}" WHERE href = $1;`,
        [TARGET],
      );
      if (sel.rows.length === 0) continue;
      totalFound += sel.rows.length;
      sel.rows.forEach((r) =>
        console.log(`   • ${table_name}: id=${r.id} label="${r.label}" href="${r.href}"`),
      );
      if (apply) {
        const del = await client.query(`DELETE FROM "${table_name}" WHERE href = $1;`, [TARGET]);
        totalDeleted += del.rowCount ?? 0;
        console.log(`     🗑️  deleted ${del.rowCount ?? 0} from ${table_name}`);
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
        ? `✅ Deleted ${totalDeleted} row(s) pointing at ${TARGET}.`
        : `🔎 Found ${totalFound} row(s) pointing at ${TARGET}. Re-run with APPLY=1 to delete.`),
  );
  await client.end();
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
