// Sweeps every text/varchar column in the public schema for leaked placeholder
// content (the project's "TEST —" convention, lorem ipsum, and bracketed
// [Placeholder] tokens). Reports table.column -> count + a sample value.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (!m) continue;
  let v = m[2].trim(); if ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'"))) v = v.slice(1, -1);
  if (!(m[1] in process.env)) process.env[m[1]] = v;
}
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const cols = await c.query(`
  select table_name, column_name
  from information_schema.columns
  where table_schema='public'
    and data_type in ('text','character varying','character')
  order by table_name, column_name`);
const PRED = `(
  "COL" ilike 'TEST %' or "COL" ilike '%TEST —%' or "COL" ilike '%TEST -%'
  or "COL" ilike '%lorem ipsum%'
  or "COL" ilike '%[regulator]%' or "COL" ilike '%[jurisdiction]%'
  or "COL" ilike '%example.com%' or "COL" ilike '%placeholder%'
)`;
let hits = 0;
for (const { table_name, column_name } of cols.rows) {
  const pred = PRED.replaceAll('COL', column_name);
  let r;
  try {
    r = await c.query(`select count(*)::int n, min("${column_name}") sample from "${table_name}" where ${pred}`);
  } catch { continue; }
  if (r.rows[0].n > 0) {
    hits++;
    const sample = String(r.rows[0].sample || '').replace(/\s+/g, ' ').slice(0, 90);
    console.log(`${table_name}.${column_name}  x${r.rows[0].n}  e.g. "${sample}"`);
  }
}
console.log(hits === 0 ? '\nNO placeholder content found.' : `\n${hits} column(s) contain placeholder content.`);
await c.end();
