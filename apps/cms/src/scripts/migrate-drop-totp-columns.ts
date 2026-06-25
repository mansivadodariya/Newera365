/**
 * migrate-drop-totp-columns.ts
 *
 * Drops the orphaned TOTP/2FA columns from the `users` table. The 2FA feature
 * was removed (collection fields + endpoints + login hook deleted), so these
 * columns are no longer in Payload's drizzle schema and are never read/written.
 * They linger only because `push: false` never drops unknown columns.
 *
 * Introspects information_schema first so it drops whatever casing actually
 * exists (the adapter created some columns snake_case and some camelCase in this
 * DB). Idempotent: a clean no-op once the columns are gone.
 *
 * Connects via the DIRECT Neon endpoint (not the pooler) so DDL completes
 * without PgBouncer session-mode restrictions.
 *
 * Run: ts-node --transpile-only src/scripts/migrate-drop-totp-columns.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

// Build the direct (non-pooler) connection URL from the pooler URL.
function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;

  const poolerUrl = process.env.DATABASE_URL ?? '';
  const direct = poolerUrl.replace(/-pooler\./, '.');
  if (direct === poolerUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      '[migrate] DATABASE_URL has no "-pooler" host segment — using it as-is for DDL. ' +
        'If it is a pooled endpoint, set DATABASE_URL_DIRECT to the direct Neon endpoint.',
    );
  }
  return direct;
}

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  const connectionString = getDirectConnectionString();
  console.log('🔗 Connecting to Neon (direct endpoint)...');
  console.log(`   ${connectionString.replace(/:([^:@]+)@/, ':***@')}\n`);

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });

  await client.connect();
  console.log('✅ Connected\n');

  // Find the actual TOTP columns on `users`, whatever their casing.
  const { rows } = await client.query<{ column_name: string }>(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name ILIKE '%totp%'
      ORDER BY column_name;`,
  );

  if (rows.length === 0) {
    console.log('⏭️  No TOTP columns found on "users" — nothing to drop.');
    await client.end();
    return;
  }

  console.log(`Found ${rows.length} TOTP column(s) to drop:`);
  rows.forEach((r) => console.log(`   • ${r.column_name}`));
  console.log('');

  let dropped = 0;
  for (const { column_name } of rows) {
    // Quote the identifier to handle camelCase names safely.
    const sql = `ALTER TABLE users DROP COLUMN IF EXISTS "${column_name}";`;
    try {
      await client.query(sql);
      console.log(`   ✅ dropped users."${column_name}"`);
      dropped++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ users."${column_name}": ${msg}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ ${dropped} TOTP column(s) dropped from "users".`);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
