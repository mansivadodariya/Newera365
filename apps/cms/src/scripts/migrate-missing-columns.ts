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

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

// Build the direct (non-pooler) connection URL from the pooler URL
// Pooler: ep-round-bar-apsu8d1v-pooler.c-7.us-east-1.aws.neon.tech
// Direct: ep-round-bar-apsu8d1v.us-east-1.aws.neon.tech
function getDirectConnectionString(): string {
  // Prefer an explicit direct endpoint when provided.
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;

  const poolerUrl = process.env.DATABASE_URL ?? '';
  // Strip only '-pooler' from the host — keep .c-7. (Neon region prefix)
  const direct = poolerUrl.replace(/-pooler\./, '.');
  if (direct === poolerUrl) {
    // The '-pooler' marker was absent → this is a silent no-op. Correct only if
    // DATABASE_URL is already a direct endpoint; warn so a pooled URL in a different
    // format isn't used for DDL against PgBouncer (NE code-review WR-15). Set
    // DATABASE_URL_DIRECT to be explicit.
    // eslint-disable-next-line no-console
    console.warn(
      '[migrate] DATABASE_URL has no "-pooler" host segment — using it as-is for DDL. ' +
        'If it is a pooled endpoint, set DATABASE_URL_DIRECT to the direct Neon endpoint.',
    );
  }
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
  // ── PaymentMethods: depositTime/withdrawalTime/fee are localized again, so the
  //    drizzle adapter writes locale rows into payment_methods_locales keyed by
  //    _parent_id. A stale legacy `_payment_method_id` column on that table is
  //    NOT NULL but never populated by the adapter, so every localized write 500s
  //    (`null value in column "_payment_method_id" violates not-null constraint`).
  //    Drop the constraint so the vestigial column no longer blocks inserts. ──
  {
    description: 'payment_methods_locales._payment_method_id DROP NOT NULL',
    sql: `ALTER TABLE payment_methods_locales ALTER COLUMN _payment_method_id DROP NOT NULL;`,
  },
  // ── ProductsInstruments: spread comparator + calculator fields ──
  {
    description: 'products_instruments.tv_symbol',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS tv_symbol varchar(50);`,
  },
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
  // ── ProductsInstruments: spec-panel fields (safety entries — most exist from
  // the initial schema; idempotent no-ops in that case) ──
  {
    description: 'products_instruments.swap_long',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS swap_long numeric;`,
  },
  {
    description: 'products_instruments.swap_short',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS swap_short numeric;`,
  },
  {
    description: 'products_instruments.margin_requirement',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS margin_requirement numeric;`,
  },
  {
    description: 'products_instruments.contract_size',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS contract_size numeric;`,
  },
  {
    description: 'products_instruments.trading_hours',
    sql: `ALTER TABLE products_instruments ADD COLUMN IF NOT EXISTS trading_hours varchar(255);`,
  },
  // ── SiteSettings: floating contact widget WhatsApp channel ──
  {
    description: 'site_settings.whatsapp_number',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS whatsapp_number varchar(30);`,
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
  // ── MarketAnalysis: editorialCategory override field ──
  {
    description: 'market_analysis."editorialCategory"',
    sql: `ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS "editorialCategory" varchar(50);`,
  },
  // ── MarketAnalysis: featuredImage upload. Payload v2's postgres adapter stores
  //    upload/relationship targets in <table>_rels (path + <target>_id), not as a
  //    main-table column. market_analysis_rels already exists (for relatedInstruments)
  //    but lacks media_id, so writing featuredImage 500s until this is added. ──
  {
    description: 'market_analysis_rels.media_id',
    sql: `ALTER TABLE market_analysis_rels ADD COLUMN IF NOT EXISTS media_id integer REFERENCES media(id);`,
  },
  // ── News: featuredImage upload. Payload v2's postgres adapter stores upload
  //    targets in <table>_rels (path + media_id), not a main-table column. News had
  //    no relationship/upload fields, so news_rels never existed — create it mirroring
  //    blog_posts_rels, otherwise every save of a News doc with featuredImage 500s. ──
  {
    description: 'news_rels table (featuredImage)',
    sql: `
      CREATE TABLE IF NOT EXISTS news_rels (
        id serial PRIMARY KEY,
        "order" integer,
        parent_id integer NOT NULL,
        path varchar NOT NULL,
        media_id integer,
        CONSTRAINT news_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES news(id) ON DELETE CASCADE,
        CONSTRAINT news_rels_media_fk FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS news_rels_order_idx ON news_rels USING btree ("order");
      CREATE INDEX IF NOT EXISTS news_rels_parent_idx ON news_rels USING btree (parent_id);
      CREATE INDEX IF NOT EXISTS news_rels_path_idx ON news_rels USING btree (path);
      CREATE INDEX IF NOT EXISTS news_rels_media_id_idx ON news_rels USING btree (media_id);
    `,
  },
  // ── SiteSettings: analyst profile fields (snake_case — drizzle adapter naming for globals) ──
  {
    description: 'site_settings.analyst_initials',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analyst_initials varchar(5);`,
  },
  {
    description: 'site_settings.analyst_name',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analyst_name varchar(80);`,
  },
  {
    description: 'site_settings.analyst_title',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analyst_title varchar(100);`,
  },
  {
    description: 'site_settings.analyst_updated',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analyst_updated varchar(50);`,
  },
  {
    description: 'site_settings.analyst_commentary_en',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analyst_commentary_en text;`,
  },
  {
    description: 'site_settings.analyst_commentary_ar',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analyst_commentary_ar text;`,
  },
  // ── IBContent: non-localized stat/badge fields (snake_case — drizzle adapter
  //    queries e.g. ib_content.ib_tag). Added to the collection after the initial
  //    migration, so the columns must be backfilled or every ib-content read 500s. ──
  {
    description: 'ib_content.ib_tag',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS ib_tag varchar(40);`,
  },
  {
    description: 'ib_content.ib_rate_display',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS ib_rate_display varchar(20);`,
  },
  {
    description: 'ib_content.ib_payouts_frequency',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS ib_payouts_frequency varchar(20);`,
  },
  {
    description: 'ib_content.ib_minimum',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS ib_minimum varchar(20);`,
  },
  {
    description: 'ib_content.affiliate_tag',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS affiliate_tag varchar(40);`,
  },
  {
    description: 'ib_content.affiliate_cpa_max',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS affiliate_cpa_max varchar(20);`,
  },
  {
    description: 'ib_content.affiliate_cookie_days',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS affiliate_cookie_days varchar(20);`,
  },
  {
    description: 'ib_content.affiliate_min_cpa',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS affiliate_min_cpa varchar(20);`,
  },
  {
    description: 'ib_content.wl_tag',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS wl_tag varchar(40);`,
  },
  {
    description: 'ib_content.wl_setup_time',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS wl_setup_time varchar(20);`,
  },
  {
    description: 'ib_content.wl_spread_markup',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS wl_spread_markup varchar(20);`,
  },
  {
    description: 'ib_content.wl_tech_stack',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS wl_tech_stack varchar(20);`,
  },
  // ── IBContent: word-label stats RE-LOCALIZED (localized:true) → columns moved
  //    to ib_content_locales. Without these the adapter 500s every ib-content read. ──
  {
    description: 'ib_content_locales.ib_tag',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS ib_tag varchar;`,
  },
  {
    description: 'ib_content_locales.ib_payouts_frequency',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS ib_payouts_frequency varchar;`,
  },
  {
    description: 'ib_content_locales.ib_minimum',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS ib_minimum varchar;`,
  },
  {
    description: 'ib_content_locales.affiliate_cookie_days',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS affiliate_cookie_days varchar;`,
  },
  {
    description: 'ib_content_locales.wl_tag',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS wl_tag varchar;`,
  },
  {
    description: 'ib_content_locales.wl_setup_time',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS wl_setup_time varchar;`,
  },
  {
    description: 'ib_content_locales.wl_spread_markup',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS wl_spread_markup varchar;`,
  },
  {
    description: 'ib_content_locales.wl_tech_stack',
    sql: `ALTER TABLE ib_content_locales ADD COLUMN IF NOT EXISTS wl_tech_stack varchar;`,
  },
  {
    description: 'account_types.commission Raw $8 update',
    sql: `UPDATE account_types SET commission = '$8' WHERE LOWER(name) = 'raw' OR badge = 'value';`,
  },
];

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
