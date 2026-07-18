/**
 * migrate-testimonials-and-footer.ts
 *
 * Backfills the SiteSettings schema added for client feedback #5 (homepage
 * social proof) and #6 (footer company / regulation), which the postgres
 * adapter will not auto-create because it runs with `push: false`.
 *
 * Without this, every `GET /api/globals/site-settings` 500s once the new config
 * ships (the adapter selects columns / the `site_settings_testimonials` array
 * table that don't yet exist) — which breaks the homepage AND the footer, since
 * both read site-settings. RUN THIS BEFORE booting the CMS with the new config.
 *
 * Two parts:
 *   1. New scalar columns on `site_settings` (snake_case — drizzle adapter naming
 *      for globals; mirrors the existing analyst_* columns added the same way).
 *   2. The `site_settings_testimonials` top-level array table. Payload v2 assigns
 *      VARCHAR ids to array rows (see the ib_content_steps integer-id incident),
 *      `_parent_id` references the single site_settings row (integer serial id),
 *      and `_order` carries the drag-sort. The shape mirrors the already-working
 *      `site_settings_kpi_stats` / `site_settings_social_proof_logos` arrays. The
 *      avatar is a plain URL column (not an upload) so the table stays flat — no
 *      `_rels` row is needed.
 *
 * Idempotent (IF NOT EXISTS throughout) + transactional. Connects via the DIRECT
 * Neon endpoint for DDL (PgBouncer session-mode restrictions don't apply there).
 *
 * Run: ts-node --transpile-only src/scripts/migrate-testimonials-and-footer.ts
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
  // ── 1. Social proof + footer scalar columns on site_settings ──────────────
  {
    description: 'site_settings.social_proof_headline_en',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_proof_headline_en varchar(80);`,
  },
  {
    description: 'site_settings.social_proof_headline_ar',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_proof_headline_ar varchar(80);`,
  },
  {
    description: 'site_settings.rating_value',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS rating_value varchar(10);`,
  },
  {
    description: 'site_settings.rating_count_en',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS rating_count_en varchar(60);`,
  },
  {
    description: 'site_settings.rating_count_ar',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS rating_count_ar varchar(60);`,
  },
  {
    description: 'site_settings.regulatory_disclosure_en',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS regulatory_disclosure_en text;`,
  },
  {
    description: 'site_settings.regulatory_disclosure_ar',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS regulatory_disclosure_ar text;`,
  },
  {
    description: 'site_settings.company_registration_en',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS company_registration_en text;`,
  },
  {
    description: 'site_settings.company_registration_ar',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS company_registration_ar text;`,
  },
  {
    description: 'site_settings.live_chat_url',
    sql: `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS live_chat_url varchar(500);`,
  },

  // ── 2. site_settings_testimonials array table (flat — varchar id) ─────────
  {
    description: 'site_settings_testimonials table',
    sql: `CREATE TABLE IF NOT EXISTS site_settings_testimonials (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
            quote_en text,
            quote_ar text,
            author_name varchar(80),
            author_role_en varchar(80),
            author_role_ar varchar(80),
            rating numeric,
            avatar_url varchar(500)
          );`,
  },
  {
    description: 'site_settings_testimonials._order index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_testimonials_order_idx ON site_settings_testimonials USING btree (_order);`,
  },
  {
    description: 'site_settings_testimonials._parent_id index',
    sql: `CREATE INDEX IF NOT EXISTS site_settings_testimonials_parent_id_idx ON site_settings_testimonials USING btree (_parent_id);`,
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
    console.log('\n✅ Committed — testimonials + footer schema is ready.');
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
