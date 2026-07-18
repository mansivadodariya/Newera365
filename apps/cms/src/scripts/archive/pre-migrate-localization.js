/**
 * Pre-migration script: drops the old per-document locale columns and enums
 * from all collections so that Drizzle push can cleanly create the native
 * Payload localization schema without the interactive enum-rename prompt.
 *
 * Run once BEFORE starting the CMS with push:true:
 *   node apps/cms/src/scripts/pre-migrate-localization.js
 *
 * Safe to run multiple times (all statements use IF EXISTS).
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

const COLLECTIONS_WITH_OLD_LOCALE = [
  'account_types', // had locale from old approach (might not exist)
  'awards',
  'blog_posts',
  'careers',
  'company_content',
  'education_content',
  'faqs',
  'legal_pages',
  'market_analysis',
  'news',
  'promotions',
  'research_reports',
  'team_members',
  'webinars',
];

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to Neon database');

  for (const table of COLLECTIONS_WITH_OLD_LOCALE) {
    // Drop locale select column (old per-document approach)
    await client.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "locale";`).catch(() => {});
    // Drop translationKey column
    await client
      .query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "translation_key";`)
      .catch(() => {});
    console.log(`  ✓ Cleaned ${table}`);
  }

  // Drop all old per-collection locale enums
  const enumsResult = await client.query(`
    SELECT typname FROM pg_type
    WHERE typname LIKE 'enum_%_locale'
    ORDER BY typname;
  `);

  for (const row of enumsResult.rows) {
    await client.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE;`).catch(() => {});
    console.log(`  ✓ Dropped enum ${row.typname}`);
  }

  // Also drop enum_careers_status if it conflicts
  await client.query(`DROP TYPE IF EXISTS "enum_careers_status" CASCADE;`).catch(() => {});

  await client.end();
  console.log('\n✅ Pre-migration complete. Now start the CMS to apply localization schema.');
}

run().catch((err) => {
  console.error('Pre-migration failed:', err);
  process.exit(1);
});
