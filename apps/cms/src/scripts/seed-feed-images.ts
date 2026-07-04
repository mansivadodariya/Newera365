/**
 * seed-feed-images.ts
 *
 * Uploads a unique, topic-matched cover photo for every market-analysis +
 * news item that was missing one (and replaces the 4 stop-gap reused analysis
 * covers with their own dedicated image). Sources live in seed-assets/:
 *   analysis-<slug>.jpg  (market-analysis)   news-<slug>.jpg  (news)
 *
 * Uploads via REST so files land on the live media volume. featuredImage is
 * non-localized → one PATCH covers EN + AR. Always sets the image (so the 4
 * reused analysis covers get repointed). Run once.
 *
 * Run (prod): PAYLOAD_PUBLIC_SERVER_URL=https://cms-production-580a.up.railway.app \
 *             ts-node --transpile-only src/scripts/seed-feed-images.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
const ASSETS = path.resolve(__dirname, '../../seed-assets');

// collection, slug, seed-asset key, alt text
const TARGETS: { col: 'market-analysis' | 'news'; slug: string; key: string; alt: string }[] = [
  {
    col: 'market-analysis',
    slug: 'gold-real-yield-anchor-2400',
    key: 'analysis-gold-real-yield-anchor-2400',
    alt: 'Gold bullion bars and coins',
  },
  {
    col: 'market-analysis',
    slug: 'yen-carry-trade-rebuilding',
    key: 'analysis-yen-carry-trade-rebuilding',
    alt: 'Japanese 10,000 yen banknotes',
  },
  {
    col: 'market-analysis',
    slug: 'crypto-correlation-break-2026',
    key: 'analysis-crypto-correlation-break-2026',
    alt: 'Bitcoin coin on a dark background',
  },
  {
    col: 'market-analysis',
    slug: 'brent-wti-spread-trade',
    key: 'analysis-brent-wti-spread-trade',
    alt: 'Oil refinery at dusk',
  },
  {
    col: 'news',
    slug: 'gold-record-high-2400-safe-haven',
    key: 'news-gold-record-high-2400-safe-haven',
    alt: 'Stacked 100 troy ounce gold bars',
  },
  {
    col: 'news',
    slug: 'bitcoin-surges-70000-etf-inflows',
    key: 'news-bitcoin-surges-70000-etf-inflows',
    alt: 'Bitcoin coin with gold nuggets',
  },
  {
    col: 'news',
    slug: 'oil-steadies-82-opec-extends-cuts',
    key: 'news-oil-steadies-82-opec-extends-cuts',
    alt: 'Rows of oil barrels',
  },
  {
    col: 'news',
    slug: 'dollar-index-slips-yields-retreat',
    key: 'news-dollar-index-slips-yields-retreat',
    alt: 'US one hundred dollar bills',
  },
  {
    col: 'news',
    slug: 'nikkei-225-multi-decade-high-yen',
    key: 'news-nikkei-225-multi-decade-high-yen',
    alt: 'Tokyo city skyline at dusk',
  },
  {
    col: 'news',
    slug: 'ethereum-rallies-spot-etf-speculation',
    key: 'news-ethereum-rallies-spot-etf-speculation',
    alt: 'Ethereum coins on a trading chart',
  },
  {
    col: 'news',
    slug: 'sterling-firms-boe-policy-decision',
    key: 'news-sterling-firms-boe-policy-decision',
    alt: 'Bank of England five pound notes',
  },
  {
    col: 'news',
    slug: 'us-stocks-all-time-high-earnings',
    key: 'news-us-stocks-all-time-high-earnings',
    alt: 'New York Stock Exchange building',
  },
  {
    col: 'news',
    slug: 'ecb-minutes-caution-june-meeting',
    key: 'news-ecb-minutes-caution-june-meeting',
    alt: 'Euro banknotes',
  },
  {
    col: 'news',
    slug: 'fed-holds-rates-signals-two-cuts-2026',
    key: 'news-fed-holds-rates-signals-two-cuts-2026',
    alt: 'US Federal Reserve building',
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
      `upload ${path.basename(file)} → ${res.status}: ${(await res.text()).slice(0, 140)}`,
    );
  return ((await res.json()).doc ?? {}).id as number;
}

async function findId(col: string, slug: string): Promise<number | null> {
  const res = await fetch(
    `${CMS}/api/${col}?where[slug][equals]=${encodeURIComponent(slug)}&locale=en&depth=0&limit=1`,
    {
      headers: { Authorization: `JWT ${token}` },
    },
  );
  if (!res.ok) throw new Error(`find ${col}/${slug} → ${res.status}`);
  return (await res.json()).docs?.[0]?.id ?? null;
}

async function setImage(col: string, id: number, mediaId: number) {
  const res = await fetch(`${CMS}/api/${col}/${id}?locale=en`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ featuredImage: mediaId }),
  });
  if (!res.ok)
    throw new Error(`patch ${col}/${id} → ${res.status}: ${(await res.text()).slice(0, 140)}`);
}

async function run() {
  console.log(`→ CMS: ${CMS}`);
  await login();
  console.log(`✅ Authenticated as ${ADMIN_EMAIL}\n`);
  let done = 0;
  for (const t of TARGETS) {
    const file = path.join(ASSETS, `${t.key}.jpg`);
    if (!fs.existsSync(file)) {
      console.log(`⚠️  ${t.slug}: missing ${t.key}.jpg`);
      continue;
    }
    const id = await findId(t.col, t.slug);
    if (!id) {
      console.log(`⚠️  ${t.col}/${t.slug}: not found`);
      continue;
    }
    const mediaId = await uploadMedia(file, t.alt);
    await setImage(t.col, id, mediaId);
    console.log(`✅ ${t.col}/${t.slug}: media #${mediaId} → doc #${id}`);
    done++;
  }
  console.log(`\n✅ Done — ${done}/${TARGETS.length} covers set.`);
  process.exit(0);
}

run().catch((e) => {
  console.error('\n❌ failed:', e);
  process.exit(1);
});
