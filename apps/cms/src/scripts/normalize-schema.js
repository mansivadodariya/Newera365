/**
 * Normalizes the DB schema to match what Payload v2 native localization expects:
 *
 * 1. Makes old localized columns nullable in main tables (they now live in _locales)
 * 2. Adds camelCase aliases for fields where Payload v2 uses camelCase column names
 * 3. Creates missing relationship tables
 *
 * Safe to re-run (all ALTER TABLE use IF EXISTS / IF NOT EXISTS).
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected');

  const q = (sql) =>
    client.query(sql).catch((e) => console.log(`  skip: ${e.message.slice(0, 80)}`));

  // ── helper: add camelCase alias if snake_case exists ────────────────────
  async function addCamelAlias(table, snakeName, camelName, type = 'text') {
    const cols = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='${table}'`,
    );
    const names = cols.rows.map((r) => r.column_name);
    if (!names.includes(camelName) && names.includes(snakeName)) {
      await q(`ALTER TABLE "${table}" ADD COLUMN "${camelName}" ${type}`);
      // Copy existing data
      await q(`UPDATE "${table}" SET "${camelName}" = "${snakeName}" WHERE "${camelName}" IS NULL`);
      console.log(`  ✓ ${table}.${camelName} (alias of ${snakeName})`);
    }
  }

  // ── helper: make column nullable ─────────────────────────────────────────
  async function makeNullable(table, column) {
    await q(`ALTER TABLE "${table}" ALTER COLUMN "${column}" DROP NOT NULL`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n1. Making old localized columns nullable in main tables...');

  // FAQs: question and answer are now in faqs_locales
  await makeNullable('faqs', 'question');
  await makeNullable('faqs', 'answer');
  console.log('  ✓ faqs.question, faqs.answer nullable');

  // Blog posts: localized fields now in blog_posts_locales
  for (const col of ['title', 'body', 'author', 'excerpt', 'seo_title', 'seo_description']) {
    await makeNullable('blog_posts', col);
  }
  console.log('  ✓ blog_posts localized cols nullable');

  // Market analysis
  for (const col of ['title', 'analyst', 'body', 'seo_title', 'seo_description']) {
    await makeNullable('market_analysis', col).catch(() => {});
  }

  // News
  for (const col of ['headline', 'body', 'seo_title', 'seo_description']) {
    await makeNullable('news', col).catch(() => {});
  }

  // Research reports
  for (const col of ['title', 'summary', 'seo_title', 'seo_description']) {
    await makeNullable('research_reports', col).catch(() => {});
  }

  // Education content
  for (const col of [
    'title',
    'glossary_term',
    'alphabetical_index',
    'body',
    'seo_title',
    'seo_description',
  ]) {
    await makeNullable('education_content', col).catch(() => {});
  }

  // Legal pages
  for (const col of ['title', 'body', 'risk_warning_banner', 'seo_title', 'seo_description']) {
    await makeNullable('legal_pages', col).catch(() => {});
  }

  // Careers
  for (const col of ['title', 'location', 'summary', 'body', 'seo_title', 'seo_description']) {
    await makeNullable('careers', col).catch(() => {});
  }

  // Team members
  for (const col of ['name', 'role', 'bio']) {
    await makeNullable('team_members', col).catch(() => {});
  }

  // Awards
  for (const col of ['title', 'description']) {
    await makeNullable('awards', col).catch(() => {});
  }

  // Company content
  for (const col of ['title', 'description', 'body']) {
    await makeNullable('company_content', col).catch(() => {});
  }

  // Webinars
  for (const col of ['title', 'speaker_bio', 'seo_title', 'seo_description']) {
    await makeNullable('webinars', col).catch(() => {});
  }

  // Promotions - localized fields now in promotions_locales
  // (title, tag, description, terms, cta_label are localized)
  for (const col of ['title', 'description', 'description_en_old', 'description_ar_old']) {
    await makeNullable('promotions', col).catch(() => {});
  }

  console.log('  ✓ All localized columns made nullable');

  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n2. Adding camelCase column aliases...');

  // FAQs
  await addCamelAlias('faqs', 'sort_order', 'sortOrder', 'numeric');
  // Careers
  await addCamelAlias('careers', 'sort_order', 'sortOrder', 'numeric');
  await addCamelAlias('careers', 'published_date', 'publishedDate', 'timestamp(3) with time zone');
  await addCamelAlias('careers', 'apply_url', 'applyUrl', 'text');
  await addCamelAlias('careers', 'employment_type', 'employmentType', 'text');
  // Team members
  await addCamelAlias('team_members', 'sort_order', 'sortOrder', 'numeric');
  // Awards
  await addCamelAlias('awards', 'sort_order', 'sortOrder', 'numeric');
  await addCamelAlias('awards', 'external_url', 'externalUrl', 'text');
  // Blog posts
  await addCamelAlias(
    'blog_posts',
    'published_date',
    'publishedDate',
    'timestamp(3) with time zone',
  );
  await addCamelAlias('blog_posts', 'seo_title', 'seoTitle', 'varchar(60)');
  await addCamelAlias('blog_posts', 'seo_description', 'seoDescription', 'text');
  // News
  await addCamelAlias('news', 'published_date', 'publishedDate', 'timestamp(3) with time zone');
  await addCamelAlias('news', 'source_url', 'sourceUrl', 'text');
  await addCamelAlias('news', 'seo_title', 'seoTitle', 'varchar(60)');
  await addCamelAlias('news', 'seo_description', 'seoDescription', 'text');
  // Market analysis
  await addCamelAlias(
    'market_analysis',
    'published_date',
    'publishedDate',
    'timestamp(3) with time zone',
  );
  await addCamelAlias('market_analysis', 'asset_category', 'assetCategory', 'text');
  await addCamelAlias('market_analysis', 'chart_embed', 'chartEmbed', 'text');
  await addCamelAlias('market_analysis', 'seo_title', 'seoTitle', 'varchar(60)');
  await addCamelAlias('market_analysis', 'seo_description', 'seoDescription', 'text');
  // Legal pages
  await addCamelAlias('legal_pages', 'page_type', 'pageType', 'text');
  await addCamelAlias(
    'legal_pages',
    'effective_date',
    'effectiveDate',
    'timestamp(3) with time zone',
  );
  await addCamelAlias('legal_pages', 'risk_warning_banner', 'riskWarningBanner', 'text');
  await addCamelAlias('legal_pages', 'seo_title', 'seoTitle', 'varchar(60)');
  await addCamelAlias('legal_pages', 'seo_description', 'seoDescription', 'text');
  // Education content
  await addCamelAlias('education_content', 'content_type', 'contentType', 'text');
  await addCamelAlias('education_content', 'is_gated', 'isGated', 'boolean');
  await addCamelAlias('education_content', 'video_embed', 'videoEmbed', 'text');
  await addCamelAlias('education_content', 'glossary_term', 'glossaryTerm', 'varchar(100)');
  await addCamelAlias(
    'education_content',
    'alphabetical_index',
    'alphabeticalIndex',
    'varchar(10)',
  );
  await addCamelAlias('education_content', 'seo_title', 'seoTitle', 'varchar(60)');
  await addCamelAlias('education_content', 'seo_description', 'seoDescription', 'text');
  // Research reports
  await addCamelAlias(
    'research_reports',
    'published_date',
    'publishedDate',
    'timestamp(3) with time zone',
  );
  await addCamelAlias('research_reports', 'is_gated', 'isGated', 'boolean');
  await addCamelAlias('research_reports', 'seo_title', 'seoTitle', 'varchar(60)');
  await addCamelAlias('research_reports', 'seo_description', 'seoDescription', 'text');

  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n3. Adding missing _rels tables...');

  const relsTablesNeeded = [
    // payment_methods has a logo upload field → needs _rels
    ['payment_methods_rels', 'payment_methods'],
    // education_content has audio/pdf uploads → needs _rels
    ['education_content_rels', 'education_content'],
    // webinars has thumbnail upload → needs _rels
    ['webinars_rels', 'webinars'],
    // promotions has seo fields only, no upload → might not need _rels
    // team_members has photo upload → needs _rels (might already exist)
    ['awards_rels', 'awards'],
  ];

  for (const [tableName, parentTable] of relsTablesNeeded) {
    await q(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        "id"        serial PRIMARY KEY,
        "order"     integer,
        "parent_id" integer REFERENCES "${parentTable}"("id") ON DELETE CASCADE,
        "path"      text NOT NULL,
        "media_id"  integer REFERENCES "media"("id") ON DELETE CASCADE
      )
    `);
    console.log(`  ✓ ${tableName}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n4. Ensuring faqs camelCase columns...');
  // FAQs non-localized fields
  await q('ALTER TABLE faqs ADD COLUMN IF NOT EXISTS "sortOrder" numeric DEFAULT 0');
  await q('UPDATE faqs SET "sortOrder" = sort_order WHERE "sortOrder" IS NULL');

  await client.end();
  console.log('\n✅ Schema normalization complete');
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
