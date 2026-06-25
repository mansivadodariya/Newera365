// Removes confirmed junk and blanks placeholder webinar links. All operations are
// guarded/verified. Does NOT touch any client-input content (legal/social/etc.).
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

// 1) Junk news #124 — only if its EN headline really is "example" (safety guard)
const chk = await c.query("select l.headline h from news_locales l where l._parent_id = 124 and l._locale = 'en'");
const headline = chk.rows[0] && chk.rows[0].h;
if (headline === 'example') {
  for (const t of ['news_locales', 'news_rels']) {
    try { const r = await c.query(`delete from ${t} where _parent_id = 124`); console.log(`  ${t}: deleted ${r.rowCount}`); }
    catch (e) { console.log(`  ${t}: ${e.message}`); }
  }
  try { const r = await c.query('delete from news where id = 124'); console.log(`news #124 ("example") deleted: ${r.rowCount}`); }
  catch (e) { console.log(`news #124 delete FAILED: ${e.message}`); }
} else {
  console.log(`SKIP news #124 — EN headline is "${headline}", not "example" (guard tripped)`);
}

// 2) Leftover June-22 test rows (admin-only collections)
let r = await c.query('delete from contact_submissions where id = any($1::int[])', [[3, 4]]);
console.log(`contact_submissions #3,#4 deleted: ${r.rowCount}`);
r = await c.query('delete from webinar_registrations where id = $1', [2]);
console.log(`webinar_registrations #2 deleted: ${r.rowCount}`);

// 3) Blank placeholder webinar links (NULL if nullable, else empty string)
for (const col of ['replay_url', 'zoom_registration_link']) {
  const n = await c.query("select is_nullable from information_schema.columns where table_name='webinars' and column_name=$1", [col]);
  const nullable = n.rows[0] && n.rows[0].is_nullable === 'YES';
  const u = await c.query(`update webinars set ${col} = ${nullable ? 'NULL' : "''"} where ${col} ilike '%placeholder%'`);
  console.log(`webinars.${col} blanked (-> ${nullable ? 'NULL' : "''"}): ${u.rowCount}`);
}

// VERIFY everything is gone
const v = await c.query(`select
  (select count(*)::int from news where id = 124) as news124,
  (select count(*)::int from webinars where replay_url ilike '%placeholder%' or zoom_registration_link ilike '%placeholder%') as webinar_ph,
  (select count(*)::int from contact_submissions where id in (3,4)) as contact_junk,
  (select count(*)::int from webinar_registrations where id = 2) as reg_junk`);
const row = v.rows[0];
const clean = row.news124 === 0 && row.webinar_ph === 0 && row.contact_junk === 0 && row.reg_junk === 0;
console.log(`VERIFY -> news124=${row.news124} webinarPlaceholders=${row.webinar_ph} contactJunk=${row.contact_junk} regJunk=${row.reg_junk}`);
console.log(clean ? 'ALL CLEAN' : 'SOMETHING REMAINS — review above');
await c.end();
process.exit(clean ? 0 : 1);
