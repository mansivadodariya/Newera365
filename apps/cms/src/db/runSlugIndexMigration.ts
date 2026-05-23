import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

/**
 * Applies the compound unique indexes on (slug, locale) defined in
 * migrations/001_slug_locale_unique_indexes.sql. Idempotent — every statement
 * uses CREATE ... IF NOT EXISTS, so it is safe to run on every boot.
 *
 * Shared by the standalone npm script (scripts/migrate-slug-indexes.ts) and the
 * server startup path (server.ts). The .sql file is the single source of truth.
 *
 * Returns nothing on success; throws on failure so callers decide whether the
 * failure is fatal (the script exits 1; the server logs and continues, since the
 * uniqueSlugPerLocale application hook still enforces uniqueness).
 */
export async function runSlugIndexMigration(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — cannot run slug-index migration.');
  }

  // SQL file lives at apps/cms/migrations/. From the compiled location
  // (dist/db/runSlugIndexMigration.js) that is ../../migrations.
  const sql = readFileSync(
    join(__dirname, '../../migrations/001_slug_locale_unique_indexes.sql'),
    'utf8',
  );

  // Default to verifying the server cert (matches sslmode=verify-full in DATABASE_URL).
  // Set MIGRATE_SKIP_SSL=true only for local environments without a valid CA chain.
  const skipSsl = process.env.MIGRATE_SKIP_SSL === 'true';
  const pool = new Pool({
    connectionString,
    ssl: skipSsl ? false : { rejectUnauthorized: true },
  });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
  } catch (err) {
    // ROLLBACK best-effort — don't let its failure mask the original error.
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}
