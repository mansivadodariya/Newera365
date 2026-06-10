/**
 * Seed media-press collection with press coverage + newsroom press releases
 * matching the Figma design (node 2684:362 / 2717:374).
 *
 * Press coverage (isFeatured: false) = external media articles
 * Newsroom (isFeatured: true)        = NewEra365 press releases
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CMS = 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'demo@newera.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS || 'password123';
let token = '';

async function api(method, p, body) {
  const res = await fetch(CMS + '/api' + p, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'JWT ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`${method} ${p} → ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

// External press coverage articles (shown in top list)
const PRESS_COVERAGE = [
  {
    headline: 'NewEra365 launches sub-12ms execution tier',
    publication: 'Finance Magnates',
    date: '2026-05-28',
    url: '#',
    excerpt: 'A new low-latency routing tier for active traders and scalpers.',
    isFeatured: false,
    sortOrder: 1,
  },
  {
    headline: 'NewEra365 expands to 2,000+ instruments',
    publication: 'FX Empire',
    date: '2026-05-14',
    url: '#',
    excerpt: 'Broader CFD coverage across FX, indices, commodities and crypto.',
    isFeatured: false,
    sortOrder: 2,
  },
  {
    headline: 'NewEra365 secures $1M client insurance cover',
    publication: 'Reuters',
    date: '2026-04-30',
    url: '#',
    excerpt: 'Per-client protection adds a further layer of fund safety.',
    isFeatured: false,
    sortOrder: 3,
  },
  {
    headline: 'MTs-first broker NewEra365 grows MEA footprint',
    publication: 'Bloomberg',
    date: '2026-04-12',
    url: '#',
    excerpt: 'Regional expansion focuses on the Middle East and Africa.',
    isFeatured: false,
    sortOrder: 4,
  },
  {
    headline: 'NewEra365 rolls out copy trading & VPS',
    publication: 'Coindesk',
    date: '2026-03-27',
    url: '#',
    excerpt: 'New tools target both discretionary and automated strategies.',
    isFeatured: false,
    sortOrder: 5,
  },
  {
    headline: 'NewEra365 named fastest-growing broker',
    publication: 'World Finance',
    date: '2026-03-09',
    url: '#',
    excerpt: 'Recognition follows a year of rapid client and volume growth.',
    isFeatured: false,
    sortOrder: 6,
  },
];

// Newsroom press releases (shown in "Latest from the newsroom" section)
const NEWSROOM = [
  {
    headline: 'NewEra365 introduces sub-12ms execution',
    publication: 'NewEra365',
    date: '2026-05-16',
    url: '#',
    excerpt: null,
    isFeatured: true,
    sortOrder: 10,
  },
  {
    headline: 'NewEra365 surpasses 2,000 tradeable instruments',
    publication: 'NewEra365',
    date: '2026-03-14',
    url: '#',
    excerpt: null,
    isFeatured: true,
    sortOrder: 11,
  },
  {
    headline: 'NewEra365 partners on $1m client insurance program',
    publication: 'NewEra365',
    date: '2026-02-20',
    url: '#',
    excerpt: null,
    isFeatured: true,
    sortOrder: 12,
  },
  {
    headline: 'NewEra365 launches copy trading and VPS hosting',
    publication: 'NewEra365',
    date: '2026-02-05',
    url: '#',
    excerpt: null,
    isFeatured: true,
    sortOrder: 13,
  },
];

const ALL_ITEMS = [...PRESS_COVERAGE, ...NEWSROOM];

async function main() {
  console.log('\n🗞️  Media Press Seed\n');

  const d = await api('POST', '/users/login', { email: ADMIN_EMAIL, password: ADMIN_PASS });
  token = d.token;
  console.log('✅ Logged in as', ADMIN_EMAIL);

  // Delete existing
  const existing = await api('GET', '/media-press?limit=100').catch(() => ({ docs: [] }));
  for (const doc of existing.docs || []) {
    await api('DELETE', '/media-press/' + doc.id).catch(() => {});
  }
  if (existing.docs?.length) console.log(`🗑️  Deleted ${existing.docs.length} existing items`);

  for (const item of ALL_ITEMS) {
    try {
      const r = await api('POST', '/media-press', { ...item, status: 'published' });
      const tag = item.isFeatured ? '[newsroom]' : '[press]  ';
      console.log(`  ✅ ${tag} ${(r.doc?.headline ?? '').slice(0, 60)}`);
    } catch (e) {
      console.error(`  ❌ ${item.headline.slice(0, 40)}: ${e.message.slice(0, 80)}`);
    }
  }

  console.log('\n✅ Done!\n');
}

main().catch((e) => {
  console.error('\n❌ Failed:', e.message);
  process.exit(1);
});
