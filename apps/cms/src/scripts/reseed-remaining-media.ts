/**
 * reseed-remaining-media.ts
 *
 * Restores images for the collections that have NO dedicated REST reseed
 * script: blog-posts (featuredImage), research-reports (thumbnail),
 * payment-methods (logo), team-members (photo). Their images are only seeded
 * inside seed.ts, which skips existing docs — so after a media-volume wipe they
 * stay 404. This script finds each existing doc, uploads its source file from
 * seed-assets/ via REST (so files land on the live media volume), and repoints
 * the image field. Idempotent in effect (re-run repoints to fresh media; old
 * orphan media rows are harmless). Does NOT create content docs.
 *
 * Run (prod): PAYLOAD_PUBLIC_SERVER_URL=https://cms-production-e103.up.railway.app \
 *             npx ts-node --transpile-only src/scripts/reseed-remaining-media.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
const ASSETS = path.resolve(__dirname, '../../seed-assets');
let token = '';

// PaymentMethods have no slug — match the (EN) name to its logo asset.
const PAY: Record<string, string> = {
  'Local bank transfer': 'pay-local-bank-transfer.png',
  'Crypto (USDT, BTC)': 'pay-crypto-usdt-btc.png',
  Neteller: 'pay-neteller.png',
  Skrill: 'pay-skrill.png',
  'Bank wire (SWIFT)': 'pay-bank-wire-swift.png',
  'Visa / Mastercard': 'pay-visa-mastercard.png',
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function login() {
  const res = await fetch(`${CMS}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  if (!res.ok) throw new Error(`login → ${res.status}`);
  token = (await res.json()).token;
}

// Media enforces a 200×200 minimum. Letterbox anything smaller onto a 256²
// canvas (transparent for png logos, white for jpg) so the upload validates.
async function readSized(file: string): Promise<Buffer> {
  const buf = fs.readFileSync(file);
  const m = await sharp(buf).metadata();
  if ((m.width ?? 0) >= 200 && (m.height ?? 0) >= 200) return buf;
  const png = file.toLowerCase().endsWith('.png');
  return sharp(buf)
    .resize({
      width: 256,
      height: 256,
      fit: 'contain',
      background: png ? { r: 255, g: 255, b: 255, alpha: 0 } : { r: 255, g: 255, b: 255 },
    })
    .toBuffer();
}

async function uploadMedia(file: string, alt: string): Promise<number | null> {
  const buf = await readSized(file);
  const type = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buf)], { type }), path.basename(file));
  form.append('alt', alt);
  const res = await fetch(`${CMS}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  });
  if (!res.ok) {
    console.log(
      `   ⚠️ upload ${path.basename(file)} → ${res.status}: ${(await res.text()).slice(0, 120)}`,
    );
    return null;
  }
  return ((await res.json()).doc ?? {}).id as number;
}

async function patch(col: string, id: number, field: string, mediaId: number): Promise<boolean> {
  const res = await fetch(`${CMS}/api/${col}/${id}?locale=en`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ [field]: mediaId }),
  });
  if (!res.ok) {
    console.log(`   ⚠️ patch ${col}/${id} → ${res.status}: ${(await res.text()).slice(0, 120)}`);
    return false;
  }
  return true;
}

async function docs(col: string): Promise<any[]> {
  // depth=1 so the current image resolves to an object with .url (for the guard).
  const res = await fetch(`${CMS}/api/${col}?limit=100&depth=1&locale=en`);
  if (!res.ok) throw new Error(`list ${col} → ${res.status}`);
  return (await res.json()).docs ?? [];
}

// True if the doc's current image already resolves (200) — lets re-runs skip
// what's already good and only repair the broken ones.
async function alreadyOk(cur: any): Promise<boolean> {
  if (!cur || !cur.url) return false;
  const u = cur.url.startsWith('http') ? cur.url : CMS + cur.url;
  try {
    return (await fetch(u, { method: 'HEAD' })).status === 200;
  } catch {
    return false;
  }
}

// (collection, image field, fn → asset filename or null, alt fn)
const GROUPS: {
  col: string;
  field: string;
  file: (d: any) => string | null;
  alt: (d: any) => string;
}[] = [
  {
    col: 'blog-posts',
    field: 'featuredImage',
    file: (d) => `blog-${d.slug}.jpg`,
    alt: (d) => d.title ?? 'Blog cover',
  },
  {
    col: 'research-reports',
    field: 'thumbnail',
    file: (d) => `report-cover-${d.slug}.jpg`,
    alt: (d) => d.title ?? 'Report cover',
  },
  {
    col: 'payment-methods',
    field: 'logo',
    file: (d) => PAY[d.name] ?? null,
    alt: (d) => d.name ?? 'Payment method',
  },
  {
    col: 'team-members',
    field: 'photo',
    file: (d) => `team-${slugify(d.name)}.jpg`,
    alt: (d) => d.name ?? 'Team member',
  },
  {
    col: 'market-analysis',
    field: 'featuredImage',
    file: (d) => `analysis-${d.slug}.jpg`,
    alt: (d) => d.title ?? 'Analysis cover',
  },
  {
    col: 'media-press',
    field: 'logo',
    file: (d) => `press-logo-${slugify(d.publication)}.png`,
    alt: (d) => `${d.publication} logo`,
  },
];

async function run() {
  console.log(`→ CMS: ${CMS}`);
  await login();
  console.log(`✅ Authenticated as ${EMAIL}\n`);
  let done = 0;
  let skip = 0;
  for (const g of GROUPS) {
    const list = await docs(g.col);
    console.log(`── ${g.col} (${list.length}) ──`);
    for (const d of list) {
      const label = d.slug ?? d.name ?? d.publication ?? d.id;
      if (await alreadyOk(d[g.field])) {
        console.log(`   ✓ ${label}: already resolves`);
        skip++;
        continue;
      }
      const name = g.file(d);
      const file = name ? path.join(ASSETS, name) : null;
      if (!file || !fs.existsSync(file)) {
        console.log(`   ⏭️  ${label}: no asset (${name ?? '—'})`);
        skip++;
        continue;
      }
      const mediaId = await uploadMedia(file, g.alt(d));
      if (!mediaId) continue;
      if (await patch(g.col, d.id, g.field, mediaId)) {
        console.log(`   ✅ ${label} → media #${mediaId}`);
        done++;
      }
    }
  }
  console.log(`\n✅ Done — ${done} repointed, ${skip} skipped.`);
  process.exit(0);
}

run().catch((e) => {
  console.error('\n❌ failed:', e);
  process.exit(1);
});
