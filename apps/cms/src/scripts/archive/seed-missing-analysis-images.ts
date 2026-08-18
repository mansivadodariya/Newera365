/**
 * seed-missing-analysis-images.ts
 *
 * The 4 market-analysis articles created by seed-extra-content.ts were text-only,
 * so /research renders the decorative SVG placeholder instead of a cover image
 * (the most-recent one is the page's featured hero). This wires each to a real,
 * topic-matched cover from seed-assets/analysis-<slug>.jpg, uploaded via REST so
 * it lands on the live server's media volume (same path as every other cover).
 *
 * Idempotent: skips any article that already has a featuredImage. featuredImage
 * is non-localized, so one update covers EN + AR.
 *
 * Run (local):  ts-node --transpile-only src/scripts/seed-missing-analysis-images.ts
 * Run (prod):   PAYLOAD_PUBLIC_SERVER_URL=https://cms-production-580a.up.railway.app \
 *               ts-node --transpile-only src/scripts/seed-missing-analysis-images.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
const ASSETS_DIR = path.resolve(__dirname, '../../seed-assets');

// slug → { asset key in seed-assets, alt text }
const TARGETS: { slug: string; key: string; alt: string }[] = [
  {
    slug: 'gold-real-yield-anchor-2400',
    key: 'analysis-gold-real-yield-anchor-2400',
    alt: 'Gold bullion bars',
  },
  {
    slug: 'yen-carry-trade-rebuilding',
    key: 'analysis-yen-carry-trade-rebuilding',
    alt: 'Japanese yen banknotes',
  },
  {
    slug: 'crypto-correlation-break-2026',
    key: 'analysis-crypto-correlation-break-2026',
    alt: 'Bitcoin cryptocurrency coin',
  },
  {
    slug: 'brent-wti-spread-trade',
    key: 'analysis-brent-wti-spread-trade',
    alt: 'Crude oil storage tanks',
  },
];

let token = '';

async function login(): Promise<void> {
  const res = await fetch(`${CMS}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  if (!res.ok) throw new Error(`login → ${res.status}: ${(await res.text()).slice(0, 160)}`);
  token = (await res.json()).token;
}

async function uploadMedia(file: string, alt: string): Promise<number> {
  const buf = fs.readFileSync(file);
  const form = new FormData();
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), path.basename(file));
  form.append('alt', alt);
  const res = await fetch(`${CMS}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  });
  if (!res.ok)
    throw new Error(
      `upload ${path.basename(file)} → ${res.status}: ${(await res.text()).slice(0, 160)}`,
    );
  const json = await res.json();
  return (json.doc ?? json).id as number;
}

async function findArticle(slug: string): Promise<{ id: number; hasImage: boolean } | null> {
  const res = await fetch(
    `${CMS}/api/market-analysis?where[slug][equals]=${encodeURIComponent(slug)}&locale=en&depth=0&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  );
  if (!res.ok) throw new Error(`find ${slug} → ${res.status}`);
  const doc = (await res.json()).docs?.[0];
  return doc ? { id: doc.id, hasImage: Boolean(doc.featuredImage) } : null;
}

async function setFeaturedImage(id: number, mediaId: number): Promise<void> {
  const res = await fetch(`${CMS}/api/market-analysis/${id}?locale=en`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ featuredImage: mediaId }),
  });
  if (!res.ok) throw new Error(`patch ${id} → ${res.status}: ${(await res.text()).slice(0, 160)}`);
}

async function run() {
  console.log(`→ CMS: ${CMS}`);
  await login();
  console.log(`✅ Authenticated as ${ADMIN_EMAIL}\n`);

  let updated = 0;
  let skipped = 0;
  for (const t of TARGETS) {
    const article = await findArticle(t.slug);
    if (!article) {
      console.log(`⚠️  ${t.slug}: article not found — skipping`);
      continue;
    }
    if (article.hasImage) {
      console.log(`⏭️  ${t.slug}: already has featuredImage`);
      skipped++;
      continue;
    }
    const file = path.join(ASSETS_DIR, `${t.key}.jpg`);
    if (!fs.existsSync(file)) {
      console.log(`⚠️  ${t.slug}: asset ${t.key}.jpg missing — skipping`);
      continue;
    }
    const mediaId = await uploadMedia(file, t.alt);
    await setFeaturedImage(article.id, mediaId);
    console.log(`✅ ${t.slug}: media #${mediaId} → article #${article.id}`);
    updated++;
  }
  console.log(`\n✅ Done — ${updated} updated, ${skipped} already had an image.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-missing-analysis-images failed:', err);
  process.exit(1);
});
