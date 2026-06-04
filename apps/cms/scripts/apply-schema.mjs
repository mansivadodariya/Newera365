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
  // ── account_types: new columns from our AccountTypes.ts changes ──────────
  `ALTER TABLE account_types ADD COLUMN IF NOT EXISTS badge varchar`,
  `ALTER TABLE account_types ADD COLUMN IF NOT EXISTS name_ar varchar`,
  `ALTER TABLE account_types ADD COLUMN IF NOT EXISTS features_ar text`,

  // ── payment_methods_locales: from PaymentMethods localization ─────────────
  `CREATE TABLE IF NOT EXISTS payment_methods_locales (
     id serial PRIMARY KEY,
     _locale varchar NOT NULL,
     deposit_time varchar,
     withdrawal_time varchar,
     min_deposit varchar,
     fee varchar,
     notes varchar,
     _payment_method_id integer NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
     UNIQUE (_locale, _payment_method_id)
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
