/**
 * migrate-numeric-content-fields.ts
 *
 * Backfills the schema for the "no hardcoded numeric claims" pass: moves IBPage's
 * hero stats / income ladder / rebate matrix / FTD conditions, and the scattered
 * single stats on About/Funding/Support/WebTrader/homepage-USP, off local JS
 * constants and into IBContent + SiteSettings. Postgres adapter runs with
 * `push: false`, so these new columns/tables must be created here first —
 * otherwise every read of ib-content / site-settings 500s once the new config ships.
 *
 * Array tables follow the proven `site_settings_testimonials` shape (see
 * migrate-testimonials-and-footer.ts): varchar row ids, `_order` + `_parent_id`,
 * flat columns. `select`-type fields were deliberately written as `text` in the
 * collection configs (see SiteSettings.ts partners.groupKey/logoType comment) to
 * avoid hand-authoring Postgres enum DDL, so no enum types are created here.
 *
 * Idempotent (IF NOT EXISTS throughout) + transactional. Connects via the DIRECT
 * Neon endpoint for DDL (PgBouncer session-mode restrictions don't apply there).
 *
 * Run: ts-node --transpile-only src/scripts/migrate-numeric-content-fields.ts
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
  // ── IBContent: hero stats + FTD condition scalar columns ──────────────────
  {
    description: 'ib_content.hero_stat1_value',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS hero_stat1_value varchar(20);`,
  },
  {
    description: 'ib_content.hero_stat2_value',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS hero_stat2_value varchar(20);`,
  },
  {
    description: 'ib_content.hero_stat3_value',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS hero_stat3_value varchar(20);`,
  },
  {
    description: 'ib_content.hero_stat4_value',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS hero_stat4_value varchar(20);`,
  },
  {
    description: 'ib_content.ftd_cap',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS ftd_cap varchar(20);`,
  },
  {
    description: 'ib_content.ftd_min_lots',
    sql: `ALTER TABLE ib_content ADD COLUMN IF NOT EXISTS ftd_min_lots varchar(20);`,
  },

  // ── IBContent: income ladder array ─────────────────────────────────────────
  {
    description: 'ib_content_income_ladder table',
    sql: `CREATE TABLE IF NOT EXISTS ib_content_income_ladder (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES ib_content(id) ON DELETE CASCADE,
            balance_label varchar(40),
            min_balance numeric,
            income_value varchar(20),
            is_top_slab boolean DEFAULT false
          );`,
  },
  {
    description: 'ib_content_income_ladder._order index',
    sql: `CREATE INDEX IF NOT EXISTS ib_content_income_ladder_order_idx ON ib_content_income_ladder USING btree (_order);`,
  },
  {
    description: 'ib_content_income_ladder._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS ib_content_income_ladder_parent_id_idx ON ib_content_income_ladder USING btree (_parent_id);`,
  },

  // ── IBContent: rebate tables array (+ nested rows array) ───────────────────
  {
    description: 'ib_content_rebate_tables table',
    sql: `CREATE TABLE IF NOT EXISTS ib_content_rebate_tables (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES ib_content(id) ON DELETE CASCADE,
            instrument_name_en varchar(40),
            instrument_name_ar varchar(40)
          );`,
  },
  {
    description: 'ib_content_rebate_tables._order index',
    sql: `CREATE INDEX IF NOT EXISTS ib_content_rebate_tables_order_idx ON ib_content_rebate_tables USING btree (_order);`,
  },
  {
    description: 'ib_content_rebate_tables._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS ib_content_rebate_tables_parent_id_idx ON ib_content_rebate_tables USING btree (_parent_id);`,
  },
  {
    description: 'ib_content_rebate_tables_rows table',
    sql: `CREATE TABLE IF NOT EXISTS ib_content_rebate_tables_rows (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id varchar NOT NULL REFERENCES ib_content_rebate_tables(id) ON DELETE CASCADE,
            spread varchar(20),
            commission varchar(20),
            rebate varchar(20)
          );`,
  },
  {
    description: 'ib_content_rebate_tables_rows._order index',
    sql: `CREATE INDEX IF NOT EXISTS ib_content_rebate_tables_rows_order_idx ON ib_content_rebate_tables_rows USING btree (_order);`,
  },
  {
    description: 'ib_content_rebate_tables_rows._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS ib_content_rebate_tables_rows_parent_id_idx ON ib_content_rebate_tables_rows USING btree (_parent_id);`,
  },

  // ── SiteSettings: single-value page stat callouts ──────────────────────────
  {
    description: 'site_settings.about_manifesto_stat_value',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_manifesto_stat_value varchar(20);`,
  },
  {
    description: 'site_settings.funding_withdrawal_stat_value',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS funding_withdrawal_stat_value varchar(20);`,
  },

  // ── SiteSettings: homepage USP metrics array ───────────────────────────────
  {
    description: 'site_settings_usp_metrics table',
    sql: `CREATE TABLE IF NOT EXISTS site_settings_usp_metrics (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
            value_en varchar(20),
            value_ar varchar(20),
            title_en varchar(60),
            title_ar varchar(60),
            desc_en varchar(140),
            desc_ar varchar(140)
          );`,
  },
  {
    description: 'site_settings_usp_metrics._order index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_usp_metrics_order_idx ON site_settings_usp_metrics USING btree (_order);`,
  },
  {
    description: 'site_settings_usp_metrics._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_usp_metrics_parent_id_idx ON site_settings_usp_metrics USING btree (_parent_id);`,
  },

  // ── SiteSettings: partners / infrastructure wall array ─────────────────────
  {
    description: 'site_settings_partners table',
    sql: `CREATE TABLE IF NOT EXISTS site_settings_partners (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
            group_key varchar(20),
            name varchar(60),
            logo_type varchar(10) DEFAULT 'none',
            logo_filename varchar(200)
          );`,
  },
  {
    description: 'site_settings_partners._order index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_partners_order_idx ON site_settings_partners USING btree (_order);`,
  },
  {
    description: 'site_settings_partners._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_partners_parent_id_idx ON site_settings_partners USING btree (_parent_id);`,
  },

  // ── SiteSettings: support page promise stats array ─────────────────────────
  {
    description: 'site_settings_support_promise_stats table',
    sql: `CREATE TABLE IF NOT EXISTS site_settings_support_promise_stats (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
            value_en varchar(20),
            value_ar varchar(20),
            label_en varchar(60),
            label_ar varchar(60)
          );`,
  },
  {
    description: 'site_settings_support_promise_stats._order index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_support_promise_stats_order_idx ON site_settings_support_promise_stats USING btree (_order);`,
  },
  {
    description: 'site_settings_support_promise_stats._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_support_promise_stats_parent_id_idx ON site_settings_support_promise_stats USING btree (_parent_id);`,
  },

  // ── SiteSettings: web trader platform specs array ──────────────────────────
  {
    description: 'site_settings_web_trader_specs table',
    sql: `CREATE TABLE IF NOT EXISTS site_settings_web_trader_specs (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
            value_en varchar(20),
            value_ar varchar(20),
            label_en varchar(60),
            label_ar varchar(60)
          );`,
  },
  {
    description: 'site_settings_web_trader_specs._order index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_web_trader_specs_order_idx ON site_settings_web_trader_specs USING btree (_order);`,
  },
  {
    description: 'site_settings_web_trader_specs._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_web_trader_specs_parent_id_idx ON site_settings_web_trader_specs USING btree (_parent_id);`,
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
    console.log('\n✅ Committed — numeric-content-fields schema is ready.');
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
