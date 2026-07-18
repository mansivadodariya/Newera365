/**
 * rebrand-newera-casing.ts
 *
 * One-off content sweep: replaces the string "NewEra" with "Newera" in every
 * varchar/text/jsonb column of every public table (SiteSettings footer legal
 * text, legal pages richText, seeded content, etc.). Case-sensitive, so
 * lowercase domains/emails (newera365.com) and the all-caps NEWERA logo are
 * untouched. Idempotent — re-running finds nothing to change.
 *
 * Run from apps/cms: npx ts-node --transpile-only src/scripts/rebrand-newera-casing.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  return (process.env.DATABASE_URL ?? '').replace(/-pooler\./, '.');
}

const q = (name: string) => `"${name.replace(/"/g, '""')}"`;

async function main() {
  const client = new Client({
    connectionString: getDirectConnectionString(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const { rows: cols } = await client.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('character varying', 'text', 'jsonb')
    ORDER BY table_name, column_name
  `);

  let total = 0;
  for (const { table_name, column_name, data_type } of cols) {
    // Filenames map to physical files — renaming the DB value would 404 the asset.
    if (table_name === 'media' && (column_name === 'filename' || column_name === 'url')) continue;
    const t = q(table_name);
    const c = q(column_name);
    const sql =
      data_type === 'jsonb'
        ? `UPDATE ${t} SET ${c} = replace(${c}::text, 'NewEra', 'Newera')::jsonb WHERE ${c}::text LIKE '%NewEra%'`
        : `UPDATE ${t} SET ${c} = replace(${c}, 'NewEra', 'Newera') WHERE ${c} LIKE '%NewEra%'`;
    try {
      const res = await client.query(sql);
      if (res.rowCount) {
        total += res.rowCount;
        console.log(`  ${table_name}.${column_name}: ${res.rowCount} row(s)`);
      }
    } catch (err) {
      console.warn(`  SKIP ${table_name}.${column_name}: ${(err as Error).message}`);
    }
  }
  console.log(`Done — ${total} row-updates.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
