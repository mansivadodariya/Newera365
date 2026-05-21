/**
 * One-shot migration: creates compound unique indexes on (slug, locale) for
 * all collections that use the `uniqueSlugPerLocale` hook.
 *
 * Run via:
 *   npm run db:migrate:slug-indexes -w apps/cms
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const main = async (): Promise<void> => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set — aborting.');
    process.exit(1);
  }

  const sql = readFileSync(
    join(__dirname, '../../migrations/001_slug_locale_unique_indexes.sql'),
    'utf8',
  );

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
    console.log('Running slug-locale unique index migration…');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration complete. All indexes created (or already existed).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed — rolled back.', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

void main();
