/**
 * migrate-missing-columns.ts
 *
 * Adds columns that exist in the collection definitions but are missing from
 * the Neon DB (schema was added after the initial migration).
 *
 * Connects via the DIRECT Neon endpoint (not the pooler) so DDL completes
 * without PgBouncer session-mode restrictions.
 *
 * Run: ts-node --transpile-only src/scripts/migrate-missing-columns.ts
 */

import { Client } from 'pg';

// Build the direct (non-pooler) connection URL from the pooler URL
// Pooler: ep-round-bar-apsu8d1v-pooler.c-7.us-east-1.aws.neon.tech
// Direct: ep-round-bar-apsu8d1v.us-east-1.aws.neon.tech
function getDirectConnectionString(): string {
  const poolerUrl = process.env.DATABASE_URL ?? '';
  // Strip only '-pooler' from the host — keep .c-7. (Neon region prefix)
  const direct = poolerUrl.replace(/-pooler\./, '.');
  return direct;
}

const migrations: Array<{ description: string; sql: string }> = [
  // ── PaymentMethods: localized fields moved to main table (localized: true removed) ──
  {
    description: 'payment_methods.deposit_time',
    sql: `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS deposit_time varchar(80);`,
  },
  {
    description: 'payment_methods.withdrawal_time',
    sql: `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS withdrawal_time varchar(80);`,
  },
  {
    description: 'payment_methods.min_deposit',
    sql: `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS min_deposit varchar(30);`,
  },
  {
    description: 'payment_methods.fee',
    sql: `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS fee varchar(50);`,
  },
  {
    description: 'payment_methods.notes',
    sql: `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS notes text;`,
  },
  // ── ProductsInstruments: spread comparator + calculator fields ──
  {
    description: 'products_instruments.spread_industry',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS spread_industry numeric;`,
  },
  {
    description: 'products_instruments.spread_standard',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS spread_standard numeric;`,
  },
  {
    description: 'products_instruments.spread_raw',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS spread_raw numeric;`,
  },
  {
    description: 'products_instruments.spread_vip',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS spread_vip numeric;`,
  },
  {
    description: 'products_instruments.swap_rate_long',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS swap_rate_long numeric;`,
  },
  {
    description: 'products_instruments.swap_rate_short',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS swap_rate_short numeric;`,
  },
  // ── Promotions: value_display in locales table ──
  {
    description: 'promotions_locales.value_display',
    sql: `ALTER TABLE promotions_locales ADD COLUMN IF NOT EXISTS value_display varchar(60);`,
  },
  // ── EducationContent: media_category ──
  {
    description: 'education_content.media_category',
    sql: `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS media_category varchar(50);`,
  },
  // ── EducationContent: camelCase columns (Payload v2 drizzle adapter uses camelCase) ──
  {
    description: 'education_content."mediaCategory"',
    sql: `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS "mediaCategory" varchar(50);`,
  },
  {
    description: 'education_content."glossaryCategory"',
    sql: `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS "glossaryCategory" varchar(80);`,
  },
  {
    description: 'education_content."isFeatured"',
    sql: `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS "isFeatured" boolean DEFAULT false;`,
  },
  {
    description: 'education_content."thumbnailId"',
    sql: `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS "thumbnailId" integer REFERENCES media(id);`,
  },
  {
    description: 'education_content."audioFileId"',
    sql: `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS "audioFileId" integer REFERENCES media(id);`,
  },
  {
    description: 'education_content."pdfFileId"',
    sql: `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS "pdfFileId" integer REFERENCES media(id);`,
  },
];

async function run() {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

  const connectionString = getDirectConnectionString();
  console.log('🔗 Connecting to Neon (direct endpoint)...');
  // Mask password in log
  const logUrl = connectionString.replace(/:([^:@]+)@/, ':***@');
  console.log(`   ${logUrl}\n`);

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });

  await client.connect();
  console.log('✅ Connected\n');

  let passed = 0;
  let skipped = 0;
  let failed = 0;

  for (const m of migrations) {
    try {
      await client.query(m.sql);
      console.log(`   ✅ ${m.description}`);
      passed++;
    } catch (err: unknown) {
      // IF NOT EXISTS handles idempotency, but log unexpected errors
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) {
        console.log(`   ⏭️  ${m.description} — already exists`);
        skipped++;
      } else {
        console.error(`   ❌ ${m.description}: ${msg}`);
        failed++;
      }
    }
  }

  await client.end();

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ ${passed} applied  ⏭️  ${skipped} already present  ❌ ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
