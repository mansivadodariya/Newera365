/**
 * Applies the native Payload v2 localization schema to Neon.
 *
 * Creates the _locales enum and one `{collection}_locales` table per
 * localized collection, matching the structure Payload/Drizzle expects.
 *
 * Run ONCE after dropping old locale columns (pre-migrate-localization.js)
 * and BEFORE starting the CMS server:
 *   node apps/cms/src/scripts/apply-localization-schema.js
 *
 * After this runs, the CMS push will detect no pending changes and start cleanly.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to Neon');

  // ── 1. Create the shared _locales enum ──────────────────────────────────
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "_locales" AS ENUM ('en', 'ar');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  console.log('  ✓ _locales enum');

  // ── 2. Helper function ──────────────────────────────────────────────────
  async function createLocalesTable(collection, fields) {
    const tableName = `${collection}_locales`;
    const parentTable = collection;
    const fieldDefs = fields.map(([name, type]) => `  "${name}" ${type}`).join(',\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        "id" serial PRIMARY KEY,
        "_locale" "_locales" NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "${parentTable}"("id") ON DELETE CASCADE,
${fieldDefs},
        UNIQUE ("_locale", "_parent_id")
      );
    `);
    console.log(`  ✓ ${tableName}`);
  }

  // ── 3. Create locales tables for each localized collection ───────────────

  // blog_posts
  await createLocalesTable('blog_posts', [
    ['title', 'varchar(200)'],
    ['author', 'varchar(100)'],
    ['excerpt', 'varchar(300)'],
    ['body', 'jsonb'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // news
  await createLocalesTable('news', [
    ['headline', 'varchar(200)'],
    ['body', 'jsonb'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // market_analysis
  await createLocalesTable('market_analysis', [
    ['title', 'varchar(200)'],
    ['analyst', 'varchar(100)'],
    ['body', 'jsonb'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // research_reports
  await createLocalesTable('research_reports', [
    ['title', 'varchar(200)'],
    ['summary', 'text'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // education_content
  await createLocalesTable('education_content', [
    ['title', 'varchar(200)'],
    ['glossary_term', 'varchar(100)'],
    ['alphabetical_index', 'varchar(10)'],
    ['body', 'jsonb'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // webinars
  await createLocalesTable('webinars', [
    ['title', 'varchar(200)'],
    ['speaker_bio', 'text'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // faqs
  await createLocalesTable('faqs', [
    ['question', 'varchar(300)'],
    ['answer', 'jsonb'],
  ]);

  // legal_pages
  await createLocalesTable('legal_pages', [
    ['title', 'varchar(200)'],
    ['body', 'jsonb'],
    ['risk_warning_banner', 'text'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // careers
  await createLocalesTable('careers', [
    ['title', 'varchar(100)'],
    ['location', 'varchar(100)'],
    ['summary', 'text'],
    ['body', 'jsonb'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  // team_members
  await createLocalesTable('team_members', [
    ['name', 'varchar(100)'],
    ['role', 'varchar(100)'],
    ['bio', 'text'],
  ]);

  // awards
  await createLocalesTable('awards', [
    ['title', 'varchar(200)'],
    ['description', 'text'],
  ]);

  // company_content
  await createLocalesTable('company_content', [
    ['title', 'varchar(200)'],
    ['description', 'text'],
    ['body', 'jsonb'],
  ]);

  // promotions
  await createLocalesTable('promotions', [
    ['title', 'varchar(100)'],
    ['tag', 'varchar(20)'],
    ['description', 'text'],
    ['terms', 'text'],
    ['cta_label', 'varchar(50)'],
    ['seo_title', 'varchar(60)'],
    ['seo_description', 'text'],
  ]);

  await client.end();
  console.log(
    '\n✅ Localization schema applied. Set push:false in payload.config.ts, then start CMS.',
  );
}

run().catch((err) => {
  console.error('Schema migration failed:', err.message);
  process.exit(1);
});
