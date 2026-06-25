// End-to-end CMS audit harness. Hits the running CMS over HTTP, exercises every
// collection read (en/ar), the custom endpoints (happy + negative + rate-limit),
// and the full newsletter double-opt-in. All write rows are tagged with
// @e2e-audit.invalid so cleanup.mjs can delete them. Prints a compact report.
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

const BASE = process.env.E2E_BASE || `http://localhost:${process.env.PORT || 3001}`;
const HEALTH = process.env.HEALTH_CHECK_TOKEN || '';
const DOMAIN = '@e2e-audit.invalid';
const fails = [];
const notes = [];
const ok = (c) => c >= 200 && c < 300;
const fail = (name, detail) => fails.push(`${name} :: ${detail}`);

async function req(method, p, { body, headers } = {}) {
  try {
    const res = await fetch(BASE + p, {
      method,
      headers: { 'content-type': 'application/json', ...(headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await res.text();
    let data;
    try { data = JSON.parse(txt); } catch { data = txt; }
    return { status: res.status, data };
  } catch (e) {
    return { status: 0, data: String((e && e.message) || e) };
  }
}
const short = (d) => (typeof d === 'string' ? d.slice(0, 120) : JSON.stringify(d).slice(0, 160));

async function dbClient() {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  return c;
}

console.log('E2E base:', BASE);

// 1) HEALTH ------------------------------------------------------------------
{
  const noTok = await req('GET', '/api/health');
  if (noTok.status !== 401) fail('health/no-token', `expected 401 got ${noTok.status}`);
  const withTok = await req('GET', '/api/health', { headers: { 'x-health-token': HEALTH } });
  if (!ok(withTok.status)) fail('health/with-token', `expected 200 got ${withTok.status} ${short(withTok.data)}`);
  console.log(`health: noToken=${noTok.status} withToken=${withTok.status}`);
}

// 2) COLLECTION READS --------------------------------------------------------
const PUBLIC = ['media','blog-posts','market-analysis','news','research-reports','education-content','webinars','products-instruments','account-types','faqs','careers','legal-pages','awards','company-milestones','media-press','team-members','promotions','payment-methods','ib-content','analyst-calls'];
const ADMIN = ['users','newsletter-subscribers','webinar-registrations','contact-submissions'];

console.log('\n-- public collection reads (en/ar) --');
for (const s of PUBLIC) {
  const en = await req('GET', `/api/${s}?limit=1&depth=0&locale=en`);
  const ar = await req('GET', `/api/${s}?limit=1&depth=0&locale=ar`);
  const enN = en.data && en.data.totalDocs !== undefined ? en.data.totalDocs : '?';
  const arN = ar.data && ar.data.totalDocs !== undefined ? ar.data.totalDocs : '?';
  if (!ok(en.status)) fail(`read/${s}/en`, `status ${en.status} ${short(en.data)}`);
  if (!ok(ar.status)) fail(`read/${s}/ar`, `status ${ar.status} ${short(ar.data)}`);
  if (ok(en.status) && enN === 0) notes.push(`${s}: 0 docs (empty collection)`);
  console.log(`${s.padEnd(22)} en=${en.status}(${enN}) ar=${ar.status}(${arN})`);
}

console.log('\n-- admin-only / PII collections (expect 401/403 unauth) --');
for (const s of ADMIN) {
  const r = await req('GET', `/api/${s}?limit=1`);
  const protectedOk = r.status === 401 || r.status === 403;
  if (!protectedOk) fail(`access/${s}`, `admin/PII collection readable unauth: status ${r.status} <-- LEAK`);
  console.log(`${s.padEnd(22)} ${r.status} ${protectedOk ? '(protected OK)' : '<-- LEAK?'}`);
}

// 3) GLOBAL ------------------------------------------------------------------
{
  const r = await req('GET', '/api/globals/site-settings?depth=0');
  if (!ok(r.status)) fail('global/site-settings', `status ${r.status} ${short(r.data)}`);
  console.log(`\nsite-settings global: ${r.status}`);
}

// 4) MT5 PROXY ---------------------------------------------------------------
{
  const list = await req('GET', '/api/mt5/instruments');
  if (!ok(list.status)) fail('mt5/instruments', `status ${list.status} ${short(list.data)}`);
  const src = list.data && list.data.source;
  const n = list.data && Array.isArray(list.data.data) ? list.data.data.length : '?';
  console.log(`mt5/instruments: ${list.status} source=${src} count=${n}`);

  const pi = await req('GET', '/api/products-instruments?limit=1&depth=0');
  const sampleSymbol = pi.data && pi.data.docs && pi.data.docs[0] && pi.data.docs[0].symbol;
  if (sampleSymbol) {
    const one = await req('GET', `/api/mt5/instruments/${encodeURIComponent(sampleSymbol)}`);
    if (!ok(one.status)) fail('mt5/instrument', `symbol ${sampleSymbol} status ${one.status}`);
    console.log(`mt5/instruments/${sampleSymbol}: ${one.status} source=${one.data && one.data.source}`);
  } else notes.push('no products-instruments symbol to test single-instrument MT5 endpoint');

  const badAC = await req('GET', '/api/mt5/instruments?assetClass=bogus');
  if (badAC.status !== 400) fail('mt5/bad-assetClass', `expected 400 got ${badAC.status}`);
  const badSym = await req('GET', '/api/mt5/instruments/%24bad');
  if (badSym.status !== 400) fail('mt5/bad-symbol', `expected 400 got ${badSym.status}`);
}

// 5) WRITE PATH (tagged, cleaned by cleanup.mjs) -----------------------------
console.log('\n-- write path (happy + negative) --');
{
  const r = await req('POST', '/api/contact', { body: { name: 'E2E Audit', email: 'contact' + DOMAIN, subject: 'E2E automated test', message: 'Automated end-to-end audit message, please ignore.' } });
  if (!ok(r.status)) fail('contact/happy', `status ${r.status} ${short(r.data)}`);
  console.log(`contact: ${r.status}`);
  const bad = await req('POST', '/api/contact', { body: { name: '', email: 'bad' } });
  if (bad.status !== 400) fail('contact/validation', `expected 400 got ${bad.status}`);
}
{
  const r = await req('POST', '/api/partners/apply', { body: { name: 'E2E Partner', email: 'partner' + DOMAIN, company: 'E2E Co', website: 'https://example.com', country: 'AE', message: 'Automated audit.' } });
  if (!ok(r.status)) fail('partners/happy', `status ${r.status} ${short(r.data)}`);
  console.log(`partners/apply: ${r.status}`);
  const bad = await req('POST', '/api/partners/apply', { body: { name: 'x', email: 'x', website: 'notaurl' } });
  if (bad.status !== 400) fail('partners/validation', `expected 400 got ${bad.status}`);
}
// newsletter double opt-in: subscribe -> confirm (token from DB) -> unsubscribe
{
  const email = 'nl' + DOMAIN;
  const sub = await req('POST', '/api/newsletter/subscribe', { body: { email, locale: 'en' } });
  if (!ok(sub.status)) fail('newsletter/subscribe', `status ${sub.status} ${short(sub.data)}`);
  console.log(`newsletter/subscribe: ${sub.status}`);
  let token = null;
  try {
    const c = await dbClient();
    const q = await c.query('select confirm_token from newsletter_subscribers where email=$1 limit 1', [email]);
    token = q.rows[0] && q.rows[0].confirm_token;
    await c.end();
  } catch (e) { notes.push('nl token db read failed: ' + e.message); }
  if (token) {
    const conf = await req('GET', `/api/newsletter/confirm?token=${token}`);
    if (!ok(conf.status) && conf.status !== 302) fail('newsletter/confirm', `status ${conf.status}`);
    console.log(`newsletter/confirm: ${conf.status}`);
    let st = null, unsub = null;
    try {
      const c = await dbClient();
      const q = await c.query('select status, unsubscribe_token from newsletter_subscribers where email=$1 limit 1', [email]);
      st = q.rows[0] && q.rows[0].status; unsub = q.rows[0] && q.rows[0].unsubscribe_token;
      await c.end();
    } catch (e) { notes.push('nl verify db read failed: ' + e.message); }
    if (st !== 'subscribed') fail('newsletter/confirm-state', `expected subscribed got ${st}`);
    console.log(`newsletter status after confirm: ${st}`);
    if (unsub) {
      const u = await req('POST', '/api/newsletter/unsubscribe', { body: { token: unsub } });
      if (!ok(u.status)) fail('newsletter/unsubscribe', `status ${u.status}`);
      console.log(`newsletter/unsubscribe: ${u.status}`);
    }
  } else fail('newsletter/confirm', 'no confirm token found in DB after subscribe');
}
// education gate
{
  const r = await req('GET', '/api/education-content?limit=50&depth=0');
  const docs = (r.data && r.data.docs) || [];
  const gated = docs.find((d) => d.isGated && d.status === 'published');
  if (gated) {
    const g = await req('POST', '/api/education/gate', { body: { email: 'gate' + DOMAIN, contentId: String(gated.id), locale: 'en' } });
    if (!ok(g.status)) fail('education/gate', `status ${g.status} ${short(g.data)}`);
    console.log(`education/gate (id ${gated.id}): ${g.status} delivered=${g.data && g.data.delivered}`);
  } else notes.push('no published gated education-content found; gate happy-path skipped');
  const bad = await req('POST', '/api/education/gate', { body: { email: 'gate' + DOMAIN, contentId: '99999999' } });
  if (bad.status !== 404) fail('education/gate-404', `expected 404 got ${bad.status}`);
}
// webinar register
{
  const r = await req('GET', '/api/webinars?limit=50&depth=0');
  const docs = (r.data && r.data.docs) || [];
  const w = docs.find((d) => d.status === 'upcoming' || d.status === 'live');
  if (w) {
    const reg = await req('POST', '/api/webinars/register', { body: { name: 'E2E Reg', email: 'webinar' + DOMAIN, webinarId: String(w.id), locale: 'en' } });
    if (!ok(reg.status)) fail('webinars/register', `status ${reg.status} ${short(reg.data)}`);
    console.log(`webinars/register (id ${w.id}): ${reg.status}`);
  } else notes.push('no upcoming/live webinar found; register happy-path skipped');
  const bad = await req('POST', '/api/webinars/register', { body: { name: 'x', email: 'webinar' + DOMAIN, webinarId: '99999999' } });
  if (bad.status !== 404) fail('webinars/register-404', `expected 404 got ${bad.status}`);
}

// 6) RATE LIMIT (contact default 3/min/IP) -> expect at least one 429 --------
{
  const codes = [];
  for (let i = 0; i < 6; i++) {
    const r = await req('POST', '/api/contact', { body: { name: 'E2E RL', email: 'contact' + DOMAIN, subject: 'rl test', message: 'rate limit probe automated audit message.' } });
    codes.push(r.status);
  }
  const got429 = codes.includes(429);
  if (!got429) fail('rate-limit/contact', `expected a 429 in burst, got ${codes.join(',')}`);
  console.log(`\nrate-limit contact burst: [${codes.join(',')}] -> ${got429 ? '429 seen OK' : 'NO 429'}`);
}

// SUMMARY --------------------------------------------------------------------
console.log('\n================ SUMMARY ================');
console.log(`FAILURES: ${fails.length}`);
for (const f of fails) console.log('  x ' + f);
if (notes.length) { console.log('NOTES:'); for (const n of notes) console.log('  - ' + n); }
console.log(`(run _e2e/cleanup.mjs to delete rows tagged ${DOMAIN})`);
console.log('========================================');
process.exit(fails.length ? 1 : 0);
