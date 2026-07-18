/**
 * migrate-analyst-calls-table.ts
 *
 * Creates the `analyst_calls` table that was missing from Neon. The AnalystCalls
 * collection was added to the Payload config after the initial migration, but
 * with the postgres adapter running `push: false` the table was never created —
 * so every `GET /api/analyst-calls` 500s with `relation "analyst_calls" does not
 * exist`, and the frontend (/research/analyst-chart) silently falls back to
 * static rows while the collection is uneditable in admin.
 *
 * AnalystCalls has NO localized fields, so only the single main table is needed
 * (no `_locales` table). Column naming is snake_case to match what the drizzle
 * adapter (@payloadcms/db-postgres 0.8.10) queries on main collection tables
 * (verified live: the adapter looks for `tv_symbol`, not `tvSymbol`). Select
 * fields map to `enum_analyst_calls_<field>` pg enums, matching the convention
 * used by the existing tables (e.g. `enum_news_status`).
 *
 * Idempotent: enums are guarded with DO/EXCEPTION blocks and the table with
 * IF NOT EXISTS, so it is safe to re-run. Connects via the DIRECT Neon endpoint
 * for DDL (PgBouncer session-mode restrictions don't apply there).
 *
 * Run: ts-node --transpile-only src/scripts/migrate-analyst-calls-table.ts
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
    description: 'enum_analyst_calls_sentiment',
    sql: `DO $$ BEGIN
            CREATE TYPE enum_analyst_calls_sentiment AS ENUM ('BULLISH','BEARISH','NEUTRAL');
          EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  },
  {
    description: 'enum_analyst_calls_category',
    sql: `DO $$ BEGIN
            CREATE TYPE enum_analyst_calls_category AS ENUM ('Majors','Crosses','Commodities','Crypto');
          EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  },
  {
    description: 'enum_analyst_calls_status',
    sql: `DO $$ BEGIN
            CREATE TYPE enum_analyst_calls_status AS ENUM ('active','inactive');
          EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  },
  {
    description: 'analyst_calls table',
    sql: `CREATE TABLE IF NOT EXISTS analyst_calls (
            id serial PRIMARY KEY,
            symbol varchar,
            tv_symbol varchar,
            current_price varchar,
            target_price varchar,
            confidence numeric,
            sentiment enum_analyst_calls_sentiment,
            category enum_analyst_calls_category,
            spark_points varchar,
            sort_order numeric DEFAULT 0,
            status enum_analyst_calls_status DEFAULT 'active',
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
    console.log('\n✅ Committed — analyst_calls table is ready.');
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
