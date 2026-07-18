/**
 * migrate-category-enums-to-varchar.ts
 *
 * Category fields are now "creatable" — editors pick a curated option OR type a
 * brand-new value (see CategorySelect). Payload stores select fields as Postgres
 * ENUM columns, which reject any value outside the original option list, so a new
 * category would fail to save. This converts those category enum columns to
 * `varchar` in place (column names unchanged) and drops the now-unused enum types.
 *
 * IN PLACE = no column rename, so the drizzle adapter keeps reading/writing the
 * same column. Idempotent; safe to re-run. Structural enums (status, contentType,
 * assetClass, sentiment, pageType, methodType, locale) are intentionally left as
 * enums.
 *
 * Connects via the DIRECT Neon endpoint (not the pooler) so DDL completes without
 * PgBouncer session-mode restrictions.
 *
 * Run: ts-node --transpile-only src/scripts/migrate-category-enums-to-varchar.ts
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
        'Set DATABASE_URL_DIRECT to the direct Neon endpoint if this is a pooled URL.',
    );
  }
  return direct;
}

// Each category column: convert enum → varchar (preserving data + column name),
// then drop the orphaned enum type. ALTER then DROP, per column.
const migrations: Array<{ description: string; sql: string }> = [
  // blog_posts.category (single-word column name; camel == snake)
  {
    description: 'blog_posts.category enum → varchar',
    sql: `ALTER TABLE blog_posts ALTER COLUMN "category" TYPE varchar(80) USING "category"::text;`,
  },
  {
    description: 'drop enum_blog_posts_category',
    sql: `DROP TYPE IF EXISTS enum_blog_posts_category;`,
  },

  // news.category
  {
    description: 'news.category enum → varchar',
    sql: `ALTER TABLE news ALTER COLUMN "category" TYPE varchar(80) USING "category"::text;`,
  },
  { description: 'drop enum_news_category', sql: `DROP TYPE IF EXISTS enum_news_category;` },

  // analyst_calls.category
  {
    description: 'analyst_calls.category enum → varchar',
    sql: `ALTER TABLE analyst_calls ALTER COLUMN "category" TYPE varchar(80) USING "category"::text;`,
  },
  {
    description: 'drop enum_analyst_calls_category',
    sql: `DROP TYPE IF EXISTS enum_analyst_calls_category;`,
  },

  // faqs.category (field config already says text, but the DB column was still an enum)
  {
    description: 'faqs.category enum → varchar',
    sql: `ALTER TABLE faqs ALTER COLUMN "category" TYPE varchar(80) USING "category"::text;`,
  },
  { description: 'drop enum_faqs_category', sql: `DROP TYPE IF EXISTS enum_faqs_category;` },

  // market_analysis.assetCategory (camelCase column — the adapter names select columns in camelCase)
  {
    description: 'market_analysis."assetCategory" enum → varchar',
    sql: `ALTER TABLE market_analysis ALTER COLUMN "assetCategory" TYPE varchar(80) USING "assetCategory"::text;`,
  },
  {
    description: 'drop enum_market_analysis_asset_category',
    sql: `DROP TYPE IF EXISTS enum_market_analysis_asset_category;`,
  },

  // awards.awardCategory (NEW text field → snake_case column)
  {
    description: 'awards.award_category (new column)',
    sql: `ALTER TABLE awards ADD COLUMN IF NOT EXISTS award_category varchar(50);`,
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

  let passed = 0;
  let failed = 0;

  for (const m of migrations) {
    try {
      await client.query(m.sql);
      console.log(`   ✅ ${m.description}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${m.description}: ${msg}`);
      failed++;
    }
  }

  await client.end();

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ ${passed} applied  ❌ ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
