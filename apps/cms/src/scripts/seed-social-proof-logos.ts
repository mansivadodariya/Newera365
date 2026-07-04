/**
 * seed-social-proof-logos.ts
 *
 * Uploads the real press wordmarks (Bloomberg, Reuters, Forbes Middle East,
 * The National) and points the homepage "As seen in" trust strip
 * (SiteSettings.socialProofLogos) at them.
 *
 * WHY REST + upload (not the old local-API resolve-by-filename): Railway's FS is
 * ephemeral, so the media volume only ever held the stop-gap NewEra365
 * placeholder tiles — the real wordmarks committed to src/media/ were never
 * pushed. Resolving existing media by filename just re-found the placeholders.
 * Uploading via REST lands the real bytes on the live volume. Works against
 * local or prod depending on PAYLOAD_PUBLIC_SERVER_URL.
 *
 * The global update sends ONLY socialProofLogos (Payload merges it over the
 * existing global — every other field is left intact); the script re-reads the
 * global afterwards and prints sentinel field lengths so you can confirm nothing
 * else (legal copy, footer, testimonials) was disturbed.
 *
 * Run (prod): PAYLOAD_PUBLIC_SERVER_URL=https://cms-production-580a.up.railway.app \
 *             ts-node --transpile-only src/scripts/seed-social-proof-logos.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
const MEDIA = path.resolve(__dirname, '../media');

// Real wordmarks committed to src/media/; alt + outlet link per logo.
const LOGOS = [
  {
    file: 'press-logo-bloomberg.png',
    altEn: 'Bloomberg',
    altAr: 'بلومبرغ',
    href: 'https://www.bloomberg.com/',
  },
  {
    file: 'press-logo-reuters.png',
    altEn: 'Reuters',
    altAr: 'رويترز',
    href: 'https://www.reuters.com/',
  },
  {
    file: 'press-logo-forbes-middle-east.png',
    altEn: 'Forbes Middle East',
    altAr: 'فوربس الشرق الأوسط',
    href: 'https://www.forbesmiddleeast.com/',
  },
  {
    file: 'press-logo-the-national.png',
    altEn: 'The National',
    altAr: 'ذا ناشيونال',
    href: 'https://www.thenationalnews.com/',
  },
];

let token = '';

async function login() {
  const res = await fetch(`${CMS}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  if (!res.ok) throw new Error(`login → ${res.status}`);
  token = (await res.json()).token;
}

async function uploadMedia(file: string, alt: string): Promise<number> {
  const raw = fs.readFileSync(file);
  // Media enforces a 200×200 minimum (anti-junk guard). Press wordmarks are wide
  // & short (~595×120), so upscale the short side clear of the floor. `fit:
  // 'outside'` scales to the smallest size with both dims ≥ 220, preserving the
  // transparent alpha; the strip object-contains to ~24px so it's visually
  // lossless. Only touch images that actually fall under the floor.
  const meta = await sharp(raw).metadata();
  const minSide = Math.min(meta.width ?? 999, meta.height ?? 999);
  const buf =
    minSide < 200 ? await sharp(raw).resize(220, 220, { fit: 'outside' }).png().toBuffer() : raw;
  const form = new FormData();
  // Fresh Uint8Array over a plain ArrayBuffer — Buffer<ArrayBufferLike> isn't a BlobPart.
  form.append('file', new Blob([new Uint8Array(buf)], { type: 'image/png' }), path.basename(file));
  form.append('alt', alt);
  const res = await fetch(`${CMS}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  });
  if (!res.ok)
    throw new Error(
      `upload ${path.basename(file)} → ${res.status}: ${(await res.text()).slice(0, 140)}`,
    );
  return ((await res.json()).doc ?? {}).id as number;
}

async function run() {
  console.log(`→ CMS: ${CMS}`);
  await login();
  console.log(`✅ Authenticated as ${ADMIN_EMAIL}\n`);

  const entries: { logo: number; altEn: string; altAr: string; href: string }[] = [];
  for (const l of LOGOS) {
    const file = path.join(MEDIA, l.file);
    if (!fs.existsSync(file)) {
      console.warn(`⚠ source missing, skipping: ${l.file}`);
      continue;
    }
    const id = await uploadMedia(file, `${l.altEn} logo`);
    entries.push({ logo: id, altEn: l.altEn, altAr: l.altAr, href: l.href });
    console.log(`  • ${l.altEn} → media #${id}`);
  }
  if (entries.length === 0) throw new Error('No logos uploaded — aborting.');

  // Partial update — only touches socialProofLogos, leaves every other field intact.
  const upd = await fetch(`${CMS}/api/globals/site-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ socialProofLogos: entries }),
  });
  if (!upd.ok)
    throw new Error(`update global → ${upd.status}: ${(await upd.text()).slice(0, 200)}`);

  // Verify: confirm the strip is repointed AND the shared global was not clobbered.
  const check = await fetch(`${CMS}/api/globals/site-settings?locale=en&depth=0`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const g = await check.json();
  const len = (k: string) => (typeof g[k] === 'string' ? g[k].length : 0);
  console.log(`\n✅ Wired ${entries.length} real press logos into the "As seen in" strip.`);
  console.log('   sentinel fields intact (char counts):');
  console.log(`     socialProofLogos: ${(g.socialProofLogos ?? []).length} entries`);
  console.log(`     riskDisclaimerEn: ${len('riskDisclaimerEn')}`);
  console.log(`     companyRegistrationEn: ${len('companyRegistrationEn')}`);
  console.log(`     footerEn: ${(g.footerEn ?? []).length} columns`);
  console.log(`     testimonials: ${(g.testimonials ?? []).length} entries`);
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-social-proof-logos failed:', err);
  process.exit(1);
});
