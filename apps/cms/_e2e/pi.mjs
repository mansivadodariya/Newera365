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
const cols = await c.query("select column_name from information_schema.columns where table_name='products_instruments' and (column_name ilike '%mt5%' or column_name ilike '%swap%' or column_name ilike '%symbol%' or column_name ilike '%contract%' or column_name ilike '%asset%') order by 1");
console.log('relevant cols:', cols.rows.map(r => r.column_name).join(', '));
const r = await c.query('select symbol, mt5_symbol, "assetClass" ac, swap_long, swap_short, swap_rate_long, swap_rate_short, contract_size, status from products_instruments order by "assetClass", symbol');
console.log(`\n${r.rowCount} instruments:`);
for (const x of r.rows) {
  console.log(`  ${(x.symbol||'').padEnd(12)} mt5=${String(x.mt5_symbol||'-').padEnd(11)} ${String(x.ac||'').padEnd(11)} swapL=${x.swap_long} swapS=${x.swap_short} | rateL=${x.swap_rate_long} rateS=${x.swap_rate_short} contract=${x.contract_size} ${x.status}`);
}
await c.end();
