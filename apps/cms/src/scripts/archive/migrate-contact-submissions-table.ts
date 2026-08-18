/**
 * migrate-contact-submissions-table.ts
 *
 * Creates the `contact_submissions` table that was missing from Neon. The
 * ContactSubmissions collection was added to the Payload config after the initial
 * migration, but with the postgres adapter running `push: false` the table was
 * never created — so every public POST /api/contact and POST /api/partners/apply
 * 500s with `relation "contact_submissions" does not exist` (the contact form and
 * the IB/partner application both persist into this collection), and the
 * collection is unreadable in admin.
 *
 * ContactSubmissions has NO localized fields, so only the single main table is
 * needed (no `_locales` table). Column naming is snake_case to match what the
 * drizzle adapter (@payloadcms/db-postgres 0.8.10) queries on main collection
 * tables (verified live: `ip_hash`, `submitted_at`, not camelCase). The `status`
 * select field maps to `enum_contact_submissions_status`, matching the convention
 * used by existing tables (e.g. `enum_newsletter_subscribers_status`).
 *
 * Idempotent: the enum is guarded with a DO/EXCEPTION block and the table with
 * IF NOT EXISTS, so it is safe to re-run. Connects via the DIRECT Neon endpoint
 * for DDL (PgBouncer session-mode restrictions don't apply there).
 *
 * Run: ts-node --transpile-only src/scripts/migrate-contact-submissions-table.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  const poolerUrl = process.env.DATABASE_URL ?? '';
  return poolerUrl.replace(/-pooler\./, '.');
}

const statements: Array<{ description: string; sql: string }> = [
  {
    description: 'enum_contact_submissions_status',
    sql: `DO $$ BEGIN
            CREATE TYPE enum_contact_submissions_status AS ENUM ('new','read','responded');
          EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  },
  {
    description: 'contact_submissions table',
    sql: `CREATE TABLE IF NOT EXISTS contact_submissions (
            id serial PRIMARY KEY,
            name varchar NOT NULL,
            email varchar NOT NULL,
            subject varchar NOT NULL,
            message varchar NOT NULL,
            submitted_at timestamptz,
            status enum_contact_submissions_status NOT NULL DEFAULT 'new',
            ip_hash varchar,
            updated_at timestamptz NOT NULL DEFAULT now(),
            created_at timestamptz NOT NULL DEFAULT now()
          );`,
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
    console.log('\n✅ Committed — contact_submissions table is ready.');
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
