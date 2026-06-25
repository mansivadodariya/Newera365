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
const q1 = await c.query('select status, is_gated, count(*)::int n from education_content group by 1,2 order by 1,2');
console.log('education_content by status/is_gated:');
for (const r of q1.rows) console.log(`  status=${r.status} is_gated=${r.is_gated} -> ${r.n}`);
const q2 = await c.query('select id, status, is_gated, pdf_file_id from education_content where is_gated = true limit 10');
console.log('\ngated rows (id/status/pdf_file_id):');
for (const r of q2.rows) console.log(`  id=${r.id} status=${r.status} pdf_file_id=${r.pdf_file_id}`);
await c.end();
