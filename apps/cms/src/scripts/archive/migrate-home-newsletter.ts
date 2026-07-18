/**
 * migrate-home-newsletter.ts
 *
 * Backfills the SiteSettings schema added for the CMS-managed homepage newsletter
 * teaser (client feedback #19). The postgres adapter runs with `push: false`, so
 * these columns / the `site_settings_nl_categories` array table are NOT created
 * automatically. Without them, every `GET /api/globals/site-settings` 500s once
 * the new config ships (the adapter selects columns that don't exist) — which
 * breaks the homepage AND the footer (both read site-settings). The frontend
 * fetch catches the 500 and falls back to i18n, but the CMS admin's site-settings
 * global would error. RUN THIS BEFORE booting the CMS with the new config.
 *
 * Shape mirrors migrate-testimonials-and-footer.ts: scalar snake_case columns on
 * `site_settings`, and a flat varchar-id array table (`_parent_id` -> the single
 * site_settings serial row, `_order` carries drag-sort).
 *
 * Idempotent (IF NOT EXISTS throughout) + transactional. Connects via the DIRECT
 * Neon endpoint for DDL.
 *
 * Run: ts-node --transpile-only src/scripts/migrate-home-newsletter.ts
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

const col = (name: string, type: string) => ({
  description: `site_settings.${name}`,
  sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ${name} ${type};`,
});

const statements: Array<{ description: string; sql: string }> = [
  // ── 1. Newsletter scalar columns on site_settings ─────────────────────────
  col('nl_headline_en', 'varchar(80)'),
  col('nl_headline_ar', 'varchar(80)'),
  col('nl_headline_accent_en', 'varchar(60)'),
  col('nl_headline_accent_ar', 'varchar(60)'),
  col('nl_subtitle_en', 'text'),
  col('nl_subtitle_ar', 'text'),
  col('nl_metric_value', 'varchar(20)'),
  col('nl_metric_label_en', 'varchar(80)'),
  col('nl_metric_label_ar', 'varchar(80)'),
  col('nl_issue_meta_en', 'varchar(60)'),
  col('nl_issue_meta_ar', 'varchar(60)'),
  col('nl_lead_headline_en', 'varchar(160)'),
  col('nl_lead_headline_ar', 'varchar(160)'),
  col('nl_fx_head_en', 'varchar(120)'),
  col('nl_fx_head_ar', 'varchar(120)'),
  col('nl_cmd_head_en', 'varchar(120)'),
  col('nl_cmd_head_ar', 'varchar(120)'),
  col('nl_macro_head_en', 'varchar(120)'),
  col('nl_macro_head_ar', 'varchar(120)'),

  // ── 2. site_settings_nl_categories array table (flat — varchar id) ────────
  {
    description: 'site_settings_nl_categories table',
    sql: `CREATE TABLE IF NOT EXISTS site_settings_nl_categories (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
            cadence_en varchar(40),
            cadence_ar varchar(40),
            title_en varchar(60),
            title_ar varchar(60),
            desc_en varchar(200),
            desc_ar varchar(200)
          );`,
  },
  {
    description: 'site_settings_nl_categories._order index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_nl_categories_order_idx ON site_settings_nl_categories USING btree (_order);`,
  },
  {
    description: 'site_settings_nl_categories._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_nl_categories_parent_id_idx ON site_settings_nl_categories USING btree (_parent_id);`,
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
    console.log('\n✅ Committed — home newsletter schema is ready.');
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
