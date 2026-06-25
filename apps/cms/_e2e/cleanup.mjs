// Deletes every row written by audit.mjs (tagged with @e2e-audit.invalid) from the
// three collections the write-path tests touch, and verifies zero remain.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}
loadEnv(path.join(__dirname, '..', '.env'));

const DOMAIN = '@e2e-audit.invalid';
const TABLES = ['contact_submissions', 'newsletter_subscribers', 'webinar_registrations'];

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
let totalRemaining = 0;
for (const t of TABLES) {
  let matched = 0;
  try {
    const before = await c.query(`select count(*)::int n from ${t} where email like $1`, ['%' + DOMAIN]);
    matched = before.rows[0].n;
    const del = await c.query(`delete from ${t} where email like $1`, ['%' + DOMAIN]);
    const after = await c.query(`select count(*)::int n from ${t} where email like $1`, ['%' + DOMAIN]);
    totalRemaining += after.rows[0].n;
    console.log(`${t.padEnd(24)} matched=${matched} deleted=${del.rowCount} remaining=${after.rows[0].n}`);
  } catch (e) {
    console.log(`${t.padEnd(24)} ERROR ${e.message}`);
    totalRemaining += 1;
  }
}
await c.end();
console.log(totalRemaining === 0 ? 'CLEANUP OK — no tagged rows remain' : `CLEANUP INCOMPLETE — ${totalRemaining} rows remain`);
process.exit(totalRemaining === 0 ? 0 : 1);
