/**
 * migrate-ib-steps-array-id.ts
 *
 * Fixes the `ib_content_steps` array-table schema defect that blocked managing
 * the IB "How it works" steps via the seed script and the admin panel.
 *
 * Payload v2's postgres adapter (@payloadcms/db-postgres 0.8.x) assigns VARCHAR
 * ids to array rows, but `ib_content_steps` was provisioned with an INTEGER
 * serial id, so any insert with steps failed:
 *   invalid input syntax for type integer: "<24-hex>"  (in insertArrays)
 *
 * This adapter version uses SINGLE-underscore locale tables (`<table>_locales`),
 * confirmed live: ib_content_locales (2 rows) and media_press_locales (8 rows)
 * are the tables the running server reads. The DOUBLE-underscore `__locales`
 * tables are stale empty duplicates (0 rows) and are dropped here.
 *
 * Changes (all in one transaction; every affected table is empty so the casts
 * are no-ops and the live ib_content_locales content is untouched):
 *   1. ib_content_steps.id            integer-serial -> varchar
 *   2. ib_content_steps_locales._parent_id   integer -> varchar (live, single-_)
 *   3. recreate ib_content_steps_locales._parent_id FK (ON DELETE CASCADE)
 *   4. drop stale empty double-underscore duplicates
 *
 * Idempotent: safe to re-run. Connects via the DIRECT Neon endpoint for DDL.
 * Run: ts-node --transpile-only src/scripts/migrate-ib-steps-array-id.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const poolerUrl = process.env.DATABASE_URL ?? '';
  return poolerUrl.replace(/-pooler\./, '.');
}

const statements: Array<{ description: string; sql: string }> = [
  {
    description: 'drop FK ib_content_steps_locales._parent_id (live, single-_)',
    sql: `ALTER TABLE ib_content_steps_locales DROP CONSTRAINT IF EXISTS ib_content_steps_locales__parent_id_fkey;`,
  },
  {
    description: 'drop FK ib_content_steps__locales._parent_id (stale, double-_)',
    sql: `ALTER TABLE IF EXISTS ib_content_steps__locales DROP CONSTRAINT IF EXISTS ib_content_steps__locales__parent_id_fkey;`,
  },
  {
    description: 'ib_content_steps.id drop serial default',
    sql: `ALTER TABLE ib_content_steps ALTER COLUMN id DROP DEFAULT;`,
  },
  {
    description: 'ib_content_steps.id integer -> varchar',
    sql: `ALTER TABLE ib_content_steps ALTER COLUMN id TYPE varchar USING id::varchar;`,
  },
  {
    description: 'drop ib_content_steps_id_seq',
    sql: `DROP SEQUENCE IF EXISTS ib_content_steps_id_seq;`,
  },
  {
    description: 'ib_content_steps_locales._parent_id integer -> varchar',
    sql: `ALTER TABLE ib_content_steps_locales ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;`,
  },
  {
    description: 'recreate ib_content_steps_locales._parent_id FK',
    sql: `ALTER TABLE ib_content_steps_locales
            ADD CONSTRAINT ib_content_steps_locales__parent_id_fkey
            FOREIGN KEY (_parent_id) REFERENCES ib_content_steps(id) ON DELETE CASCADE;`,
  },
  {
    description: 'drop stale ib_content_steps__locales (double-_, 0 rows)',
    sql: `DROP TABLE IF EXISTS ib_content_steps__locales;`,
  },
  {
    description: 'drop stale ib_content__locales (double-_, 0 rows)',
    sql: `DROP TABLE IF EXISTS ib_content__locales;`,
  },
];

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

  try {
    await client.query('BEGIN');
    for (const s of statements) {
      await client.query(s.sql);
      console.log(`   ✅ ${s.description}`);
    }
    await client.query('COMMIT');
    console.log('\n✅ Committed — ib_content_steps schema fixed.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Rolled back. Error:', err instanceof Error ? err.message : err);
    await client.end();
    process.exit(1);
  }

  await client.end();
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
