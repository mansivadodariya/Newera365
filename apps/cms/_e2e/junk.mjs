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

console.log('--- leftover test rows in contact_submissions ---');
let r = await c.query(`select id, email, subject, submitted_at from contact_submissions
  where email ilike '%@example.com%' or email ilike '%test%' or subject ilike '%test%' order by id`);
for (const x of r.rows) console.log(`  #${x.id} ${x.email} | ${x.subject} | ${x.submitted_at}`);
console.log(`  (${r.rowCount} rows)`);

console.log('--- leftover test rows in webinar_registrations ---');
r = await c.query(`select id, email, registered_at from webinar_registrations
  where email ilike '%@example.com%' or email ilike '%test%' order by id`);
for (const x of r.rows) console.log(`  #${x.id} ${x.email} | ${x.registered_at}`);
console.log(`  (${r.rowCount} rows)`);

console.log('--- leftover test rows in newsletter_subscribers ---');
r = await c.query(`select id, email, status from newsletter_subscribers
  where email ilike '%@example.com%' or email ilike '%test%' order by id`);
for (const x of r.rows) console.log(`  #${x.id} ${x.email} | ${x.status}`);
console.log(`  (${r.rowCount} rows)`);

console.log('--- all news titles (en) — eyeball for junk ---');
r = await c.query(`select n.id, l.title, n.status from news n
  left join news_locales l on l._parent_id = n.id and l._locale = 'en' order by n.id`);
for (const x of r.rows) console.log(`  #${x.id} [${x.status}] ${x.title}`);

console.log('--- webinars with placeholder links ---');
r = await c.query(`select id, status, replay_url, zoom_registration_link from webinars
  where replay_url ilike '%placeholder%' or zoom_registration_link ilike '%placeholder%' order by id`);
for (const x of r.rows) console.log(`  #${x.id} [${x.status}] replay=${x.replay_url ? 'placeholder' : '-'} zoom=${x.zoom_registration_link ? 'placeholder' : '-'}`);
console.log(`  (${r.rowCount} webinars)`);

await c.end();
