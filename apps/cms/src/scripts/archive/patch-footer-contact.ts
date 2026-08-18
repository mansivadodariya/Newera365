/**
 * patch-footer-contact.ts
 *
 * Footer edit (client feedback): reformat the office address as a multi-line
 * postal block and simplify support hours to "Monday to Friday" (drop timings).
 *
 * Direct SQL (pg) rather than Payload's local API: the postgres adapter runs a
 * drizzle schema push on init that contends with a running dev server and hangs
 * headless. These four fields are flat, non-localized columns on `site_settings`
 * (single row, id=1), so one UPDATE is all it takes — no Payload boot needed.
 *
 * Dry-run by default (SELECT only); pass APPLY=1 to write.
 * Run: APPLY=1 ts-node --transpile-only src/scripts/patch-footer-contact.ts
 */

import 'dotenv/config';
import { Client } from 'pg';

const PATCH: Record<string, string> = {
  contact_address_en:
    'Level 14, Boulevard Plaza Tower 1\nSheikh Mohammed Bin Rashid Boulevard\nDubai, UAE',
  contact_address_ar: 'الطابق 14، برج بلازا بوليفارد 1\nشارع الشيخ محمد بن راشد\nدبي، الإمارات',
  support_hours_en: 'Monday to Friday',
  support_hours_ar: 'الاثنين إلى الجمعة',
};

const COLS = Object.keys(PATCH);

async function run() {
  const apply = process.env.APPLY === '1';
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL must be set');

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const before = await client.query(`SELECT ${COLS.join(', ')} FROM site_settings WHERE id = 1`);
    console.log(`\nMode: ${apply ? 'APPLY (will write)' : 'DRY RUN (no changes)'}\n`);
    for (const col of COLS) {
      console.log(`  ${col}:`);
      console.log(`    before: ${JSON.stringify(before.rows[0]?.[col])}`);
      console.log(`    after:  ${JSON.stringify(PATCH[col])}`);
    }

    if (apply) {
      const setSql = COLS.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const values = COLS.map((c) => PATCH[c]);
      const res = await client.query(`UPDATE site_settings SET ${setSql} WHERE id = 1`, values);
      console.log(`\n✅ Updated ${res.rowCount} row. Footer address + support hours patched.`);
    } else {
      console.log('\n🔎 DRY RUN only. Re-run with APPLY=1 to write.');
    }
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('\n❌ patch-footer-contact failed:', err);
  process.exit(1);
});
