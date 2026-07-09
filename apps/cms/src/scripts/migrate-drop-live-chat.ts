/**
 * migrate-drop-live-chat.ts
 *
 * Removes the live-chat orphans left in Neon after the `/live-chat` feature and
 * the SiteSettings `liveChatUrl` field were deleted from the codebase:
 *   1. site_settings.live_chat_url            (orphan column — no longer in config)
 *   2. site_settings_footer_en_links          (stale "/live-chat" nav row)
 *   3. site_settings_footer_ar_links          (stale "/live-chat" nav row)
 *
 * Idempotent — safe to re-run (DROP … IF EXISTS, DELETE matches nothing on re-run).
 *
 * ⚠️  PROD ORDERING: the column DROP is only safe once the deployed CMS runs code
 * WITHOUT the `liveChatUrl` field. Deploy the new CMS build (Railway) first, or the
 * still-old CMS will 500 on every site-settings read (column does not exist). The
 * two footer-row DELETEs are safe on any code version.
 *
 * Connects via the DIRECT Neon endpoint (not the pooler) so DDL completes without
 * PgBouncer session-mode restrictions.
 *
 * Run: ts-node --transpile-only src/scripts/migrate-drop-live-chat.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  const poolerUrl = process.env.DATABASE_URL ?? '';
  const direct = poolerUrl.replace(/-pooler\./, '.');
  if (direct === poolerUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      '[migrate] DATABASE_URL has no "-pooler" host segment — using it as-is for DDL. ' +
        'Set DATABASE_URL_DIRECT to be explicit if this is a pooled endpoint.',
    );
  }
  return direct;
}

const statements: Array<{ description: string; sql: string }> = [
  {
    description: 'DROP site_settings.live_chat_url (orphan column)',
    sql: `ALTER TABLE site_settings DROP COLUMN IF EXISTS live_chat_url;`,
  },
  {
    description: "DELETE stale '/live-chat' footer rows (EN)",
    sql: `DELETE FROM site_settings_footer_en_links WHERE href ILIKE '%live-chat%';`,
  },
  {
    description: "DELETE stale '/live-chat' footer rows (AR)",
    sql: `DELETE FROM site_settings_footer_ar_links WHERE href ILIKE '%live-chat%';`,
  },
];

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  const connectionString = getDirectConnectionString();
  console.log('🔗 Connecting to Neon (direct endpoint)...');
  console.log(`   ${connectionString.replace(/:([^:@]+)@/, ':***@').replace(/\?.*$/, '')}\n`);

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });

  await client.connect();
  console.log('✅ Connected\n');

  let failed = 0;
  for (const s of statements) {
    try {
      const res = await client.query(s.sql);
      const n = typeof res.rowCount === 'number' ? res.rowCount : 0;
      console.log(`   ✅ ${s.description}${s.sql.startsWith('DELETE') ? ` (${n} row(s))` : ''}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${s.description}: ${msg}`);
      failed++;
    }
  }

  await client.end();
  console.log(`\n${'─'.repeat(50)}`);
  console.log(failed === 0 ? '✅ live-chat orphans removed' : `❌ ${failed} statement(s) failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
