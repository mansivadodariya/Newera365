/**
 * Fix schema gaps caused by the localization migration:
 * 1. Restore careers.status (dropped when enum_careers_status was CASCADE-dropped)
 * 2. Create payment_methods table (was never created — collection was added after initial schema)
 * 3. Add missing columns to promotions (tagColor, tag, terms, activeFrom, activeTo)
 *
 * Run once: node apps/cms/src/scripts/fix-schema.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to Neon');

  // ── 1. Restore careers.status ─────────────────────────────────────────────
  const careersCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='careers'",
  );
  const careerColNames = careersCols.rows.map((r) => r.column_name);

  if (!careerColNames.includes('status')) {
    await client.query(
      "ALTER TABLE careers ADD COLUMN status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed'))",
    );
    console.log('  ✓ careers.status restored');
  } else {
    console.log('  ✓ careers.status already exists');
  }

  // ── 2. Create payment_methods table ──────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "payment_methods" (
      "id"               serial  PRIMARY KEY,
      "name"             varchar(80),
      "method_type"      text,
      "logo_id"          integer REFERENCES media(id) ON DELETE SET NULL,
      "deposit_time"     varchar(80),
      "withdrawal_time"  varchar(80),
      "min_deposit"      varchar(30),
      "fee"              varchar(50),
      "notes"            text,
      "sort_order"       numeric,
      "status"           text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
      "updated_at"       timestamp(3) with time zone DEFAULT now(),
      "created_at"       timestamp(3) with time zone DEFAULT now()
    );
  `);
  console.log('  ✓ payment_methods table created (or already exists)');

  // ── 3. Add missing columns to promotions ────────────────────────────────
  const promoCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='promotions'",
  );
  const promoColNames = promoCols.rows.map((r) => r.column_name);

  const promoFixes = [
    ['tag', 'varchar(20)'],
    ['tag_color', 'text'],
    ['terms', 'text'],
    ['cta_label', 'varchar(50)'],
    ['active_from', 'timestamp(3) with time zone'],
    ['active_to', 'timestamp(3) with time zone'],
  ];

  for (const [col, type] of promoFixes) {
    if (!promoColNames.includes(col)) {
      await client.query(`ALTER TABLE promotions ADD COLUMN "${col}" ${type}`);
      console.log(`  ✓ promotions.${col} added`);
    }
  }
  // Also ensure status/slug/cta_href/is_highlighted/sort_order exist
  const promoEssentials = [
    ['slug', 'text'],
    ['cta_href', 'text'],
    ['status', "text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))"],
  ];
  for (const [col, type] of promoEssentials) {
    if (!promoColNames.includes(col)) {
      await client.query(`ALTER TABLE promotions ADD COLUMN "${col}" ${type}`);
      console.log(`  ✓ promotions.${col} added`);
    }
  }

  // Rename old columns to match new schema if they exist
  const renames = [
    ['badge_label_en', 'badge_label_en_old'],
    ['badge_label_ar', 'badge_label_ar_old'],
    ['description_en', 'description_en_old'],
    ['description_ar', 'description_ar_old'],
    ['cta_label_en', 'cta_label_en_old'],
    ['cta_label_ar', 'cta_label_ar_old'],
  ];
  for (const [oldName, newName] of renames) {
    if (promoColNames.includes(oldName)) {
      await client.query(`ALTER TABLE promotions RENAME COLUMN "${oldName}" TO "${newName}"`);
      console.log(`  ✓ promotions.${oldName} renamed to ${newName}`);
    }
  }

  // ── 4. Also fix awards_rels missing parent column ────────────────────────
  // Check if there are any other missing columns on commonly-used collections
  const awardsCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='awards'",
  );
  const awardsColNames = awardsCols.rows.map((r) => r.column_name);
  if (!awardsColNames.includes('status')) {
    await client.query(
      "ALTER TABLE awards ADD COLUMN status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft'))",
    );
    console.log('  ✓ awards.status restored');
  }

  await client.end();
  console.log('\n✅ Schema fix complete');
}

run().catch((err) => {
  console.error('Fix failed:', err.message);
  process.exit(1);
});
