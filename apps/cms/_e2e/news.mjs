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
const cols = await c.query(
  "select table_name, column_name from information_schema.columns where table_name in ('news','news_locales') and data_type in ('text','character varying') order by 1,2"
);
console.log('news text cols:', cols.rows.map((r) => r.table_name + '.' + r.column_name).join(', '));
const titleCol = cols.rows.find((r) => r.table_name === 'news_locales' && /headline/i.test(r.column_name));
if (titleCol) {
  const t = titleCol.table_name, col = titleCol.column_name;
  const q = t === 'news_locales'
    ? `select n.id, n.status, l."${col}" t from news n left join news_locales l on l._parent_id = n.id and l._locale = 'en' order by n.id`
    : `select id, status, "${col}" t from news order by id`;
  const r = await c.query(q);
  console.log(`news titles (en) via ${t}.${col}:`);
  for (const x of r.rows) console.log(`  #${x.id} [${x.status}] ${x.t}`);
} else console.log('no title-like column found');
await c.end();
