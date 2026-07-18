/**
 * migrate-company-milestones-table.ts
 *
 * Creates the `company_milestones` collection tables, which power the About
 * page "journey" timeline. The collection was added to the Payload config after
 * the initial migration, and with the postgres adapter running `push: false`
 * the tables are never auto-created — so every `GET /api/company-milestones`
 * 500s and the frontend falls back to the static (i18n) milestones.
 *
 * The collection has localized fields (`label`, `description`), so it needs BOTH
 * the main table and a single-underscore `<table>_locales` table — mirroring the
 * live `awards` / `awards_locales` shape (verified by introspection). The locale
 * column reuses the shared `_locales` enum (values en/ar); it is referenced
 * quoted as "_locales" because the leading underscore would otherwise be parsed
 * as an array type. Column naming is snake_case to match what the drizzle
 * adapter (@payloadcms/db-postgres 0.8.10) queries on main tables; the select
 * field maps to the `enum_company_milestones_status` pg enum.
 *
 * Idempotent: the enum is guarded with a DO/EXCEPTION block and the tables with
 * IF NOT EXISTS, so it is safe to re-run. Connects via the DIRECT Neon endpoint
 * for DDL (PgBouncer session-mode restrictions don't apply there).
 *
 * Run: ts-node --transpile-only src/scripts/migrate-company-milestones-table.ts
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
    description: 'enum_company_milestones_status',
    sql: `DO $$ BEGIN
            CREATE TYPE enum_company_milestones_status AS ENUM ('published','draft');
          EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  },
  {
    description: 'company_milestones table',
    sql: `CREATE TABLE IF NOT EXISTS company_milestones (
            id serial PRIMARY KEY,
            year varchar,
            sort_order numeric DEFAULT 0,
            status enum_company_milestones_status DEFAULT 'draft',
            updated_at timestamptz NOT NULL DEFAULT now(),
            created_at timestamptz NOT NULL DEFAULT now()
          );`,
  },
  {
    description: 'company_milestones_locales table',
    sql: `CREATE TABLE IF NOT EXISTS company_milestones_locales (
            id serial PRIMARY KEY,
            _locale "_locales" NOT NULL,
            _parent_id integer NOT NULL REFERENCES company_milestones(id) ON DELETE CASCADE,
            label varchar,
            description text,
            CONSTRAINT company_milestones_locales__locale__parent_id_key UNIQUE (_locale, _parent_id)
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
    console.log('\n✅ Committed — company_milestones tables are ready.');
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
