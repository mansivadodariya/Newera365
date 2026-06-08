/**
 * Applies all pending schema changes directly via SQL, bypassing Drizzle's
 * interactive TTY prompts. Run once before starting the CMS with push:false.
 *
 *   node apps/cms/scripts/apply-schema.mjs
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from apps/cms/.env
const envPath = resolve(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbUrlMatch) { console.error('DATABASE_URL not found in .env'); process.exit(1); }
const DATABASE_URL = dbUrlMatch[1].trim();

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: true },
  max: 2,
});

const migrations = [
  // ── account_types: columns added previously ───────────────────────────────
  `ALTER TABLE account_types ADD COLUMN IF NOT EXISTS badge varchar`,
  `ALTER TABLE account_types ADD COLUMN IF NOT EXISTS name_ar varchar`,
  `ALTER TABLE account_types ADD COLUMN IF NOT EXISTS features_ar text`,

  // ── education_content: is_featured column ─────────────────────────────────
  `ALTER TABLE education_content ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false`,

  // ── payment_methods__locales (double-underscore: drizzle-push artefact) ─────
  `CREATE TABLE IF NOT EXISTS payment_methods__locales (
     id serial PRIMARY KEY,
     _locale varchar NOT NULL,
     deposit_time varchar,
     withdrawal_time varchar,
     min_deposit varchar,
     fee varchar,
     notes varchar,
     _parent_id integer NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE
   )`,
  `ALTER TABLE payment_methods__locales ADD COLUMN IF NOT EXISTS _parent_id integer REFERENCES payment_methods(id) ON DELETE CASCADE`,
  `ALTER TABLE payment_methods__locales ADD COLUMN IF NOT EXISTS _locale varchar`,

  // ── payment_methods_locales (single-underscore: what Payload v2 drizzle queries)
  // Old migration used _payment_method_id; Payload expects _parent_id.
  `ALTER TABLE payment_methods_locales ADD COLUMN IF NOT EXISTS _parent_id integer REFERENCES payment_methods(id) ON DELETE CASCADE`,

  // ── ib_content ─────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS ib_content (
     id serial PRIMARY KEY,
     slug varchar NOT NULL UNIQUE,
     ib_rate_display varchar,
     affiliate_cpa_max varchar,
     status varchar NOT NULL DEFAULT 'draft',
     updated_at timestamp(3) NOT NULL DEFAULT now(),
     created_at timestamp(3) NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS ib_content_slug_idx ON ib_content(slug)`,

  // Payload v2 drizzle uses single-underscore: {table}_locales
  `CREATE TABLE IF NOT EXISTS ib_content_locales (
     id serial PRIMARY KEY,
     _locale varchar NOT NULL,
     hero_subtitle text,
     ib_description text,
     affiliate_description text,
     white_label_description text,
     cta_heading varchar,
     cta_subtitle text,
     _parent_id integer NOT NULL REFERENCES ib_content(id) ON DELETE CASCADE,
     UNIQUE (_locale, _parent_id)
   )`,

  `CREATE TABLE IF NOT EXISTS ib_content_steps (
     id serial PRIMARY KEY,
     _order integer NOT NULL DEFAULT 0,
     _parent_id integer NOT NULL REFERENCES ib_content(id) ON DELETE CASCADE,
     updated_at timestamp(3) NOT NULL DEFAULT now(),
     created_at timestamp(3) NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS ib_content_steps_locales (
     id serial PRIMARY KEY,
     _locale varchar NOT NULL,
     step_title varchar,
     step_description text,
     _parent_id integer NOT NULL REFERENCES ib_content_steps(id) ON DELETE CASCADE,
     UNIQUE (_locale, _parent_id)
   )`,

  // ── media_press ────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS media_press (
     id serial PRIMARY KEY,
     publication varchar NOT NULL,
     date timestamp(3),
     url varchar,
     is_featured boolean DEFAULT false,
     sort_order numeric DEFAULT 0,
     status varchar NOT NULL DEFAULT 'draft',
     updated_at timestamp(3) NOT NULL DEFAULT now(),
     created_at timestamp(3) NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS media_press_locales (
     id serial PRIMARY KEY,
     _locale varchar NOT NULL,
     headline varchar,
     excerpt text,
     _parent_id integer NOT NULL REFERENCES media_press(id) ON DELETE CASCADE,
     UNIQUE (_locale, _parent_id)
   )`,

  // _rels table for upload/relationship fields (logo)
  `CREATE TABLE IF NOT EXISTS media_press_rels (
     id serial PRIMARY KEY,
     "order" integer,
     parent_id integer NOT NULL REFERENCES media_press(id) ON DELETE CASCADE,
     path varchar NOT NULL,
     media_id integer REFERENCES media(id) ON DELETE SET NULL
   )`,
];

async function run() {
  const client = await pool.connect();
  try {
    for (const sql of migrations) {
      const label = sql.split('\n')[0].slice(0, 80);
      try {
        await client.query(sql);
        console.log(`  ✓ ${label}`);
      } catch (err) {
        // If it already exists or has been applied, skip
        if (err.code === '42701' || err.code === '42P07' || err.message.includes('already exists')) {
          console.log(`  – already applied: ${label}`);
        } else {
          console.error(`  ✗ FAILED: ${label}`);
          console.error(`    ${err.message}`);
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log('\nSchema apply complete.');
}

run().catch(err => { console.error(err); process.exit(1); });
