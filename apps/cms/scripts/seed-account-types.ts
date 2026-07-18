/**
 * Seed / replace account types in the CMS to match the Figma design.
 *
 * Usage (from repo root, after starting the CMS):
 *   npx ts-node --project apps/cms/tsconfig.json apps/cms/scripts/seed-account-types.ts
 *
 * Or run with tsx:
 *   npx tsx apps/cms/scripts/seed-account-types.ts
 *
 * After running:
 *   1. Verify the 4 account types appear correctly in the CMS admin.
 *   2. Set `push: false` back in apps/cms/src/payload.config.ts.
 */

const CMS_URL = process.env.CMS_URL ?? 'http://localhost:3001';
const EMAIL = process.env.CMS_EMAIL ?? 'admin@newera365.com';
const PASSWORD = process.env.CMS_PASSWORD;
if (!PASSWORD) throw new Error('CMS_PASSWORD must be set — there is no default admin password.');

interface AccountSeed {
  name: string;
  nameAr: string;
  badge: 'free' | 'popular' | 'pro' | 'islamic';
  minDeposit: number;
  spreadFrom: string;
  leverage: string;
  platforms: ('mt5' | 'web-trader' | 'mobile')[];
  commission: string;
  usesMT5Data: boolean;
  isPopular: boolean;
  sortOrder: number;
  status: 'active';
  features: { value: string }[];
  featuresAr: string; // newline-separated
}

const ACCOUNT_TYPES: AccountSeed[] = [
  {
    name: 'Demo',
    nameAr: 'تجريبي',
    badge: 'free',
    minDeposit: 0,
    spreadFrom: '1.2',
    leverage: 'Up to 1:500',
    platforms: ['mt5', 'web-trader', 'mobile'],
    commission: '$0',
    usesMT5Data: false,
    isPopular: false,
    sortOrder: 1,
    status: 'active',
    features: [
      { value: 'Full platform access' },
      { value: 'Real-time market data' },
      { value: 'No deposit required' },
    ],
    featuresAr: 'الوصول الكامل للمنصة\nبيانات السوق اللحظية\nلا يتطلب إيداعاً',
  },
  {
    name: 'Standard',
    nameAr: 'معياري',
    badge: 'popular',
    minDeposit: 50,
    spreadFrom: '1.2',
    leverage: 'Up to 1:500',
    platforms: ['mt5', 'web-trader', 'mobile'],
    commission: '$0',
    usesMT5Data: false,
    isPopular: true,
    sortOrder: 2,
    status: 'active',
    features: [
      { value: 'All 2000+ instruments' },
      { value: 'Zero commission' },
      { value: '24/7 expert support' },
    ],
    featuresAr: 'جميع الأدوات +2000\nصفر عمولة\nدعم متخصص 24/7',
  },
  {
    name: 'Swap-Free',
    nameAr: 'خالٍ من الفائدة',
    badge: 'islamic',
    minDeposit: 50,
    spreadFrom: '1.4',
    leverage: 'Up to 1:500',
    platforms: ['mt5', 'web-trader', 'mobile'],
    commission: '$0',
    usesMT5Data: false,
    isPopular: false,
    sortOrder: 3,
    status: 'active',
    features: [
      { value: 'No overnight swaps' },
      { value: 'Sharia-compliant structure' },
      { value: 'Full market access' },
    ],
    featuresAr: 'لا مبادلات ليلية\nهيكل متوافق مع الشريعة\nالوصول الكامل للسوق',
  },
  {
    name: 'Professional',
    nameAr: 'احترافي',
    badge: 'pro',
    minDeposit: 2500,
    spreadFrom: '0.0',
    leverage: 'Up to 1:200',
    platforms: ['mt5', 'web-trader', 'mobile'],
    commission: '$1.5',
    usesMT5Data: false,
    isPopular: false,
    sortOrder: 4,
    status: 'active',
    features: [
      { value: 'Raw spreads from 0.0' },
      { value: 'Priority execution' },
      { value: 'Dedicated account manager' },
    ],
    featuresAr: 'فروقات خام من 0.0\nتنفيذ ذو أولوية\nمدير حساب مخصص',
  },
];

async function run() {
  // 1. Authenticate
  console.log(`Authenticating as ${EMAIL}...`);
  const loginRes = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) {
    const body = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${body}`);
  }
  const { token } = (await loginRes.json()) as { token: string };
  console.log('Authenticated.');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `JWT ${token}`,
  };

  // 2. Fetch existing account types
  console.log('Fetching existing account types...');
  const existingRes = await fetch(`${CMS_URL}/api/account-types?limit=100`, { headers });
  const existing = (await existingRes.json()) as { docs: { id: number }[] };
  console.log(`Found ${existing.docs.length} existing account type(s).`);

  // 3. Delete all existing
  for (const doc of existing.docs) {
    const del = await fetch(`${CMS_URL}/api/account-types/${doc.id}`, {
      method: 'DELETE',
      headers,
    });
    if (!del.ok) {
      console.warn(`  Failed to delete account type ${doc.id}: ${del.status}`);
    } else {
      console.log(`  Deleted account type ${doc.id}.`);
    }
  }

  // 4. Create new account types
  for (const account of ACCOUNT_TYPES) {
    const createRes = await fetch(`${CMS_URL}/api/account-types`, {
      method: 'POST',
      headers,
      body: JSON.stringify(account),
    });
    if (!createRes.ok) {
      const body = await createRes.text();
      console.error(`  Failed to create "${account.name}": ${createRes.status} — ${body}`);
    } else {
      const created = (await createRes.json()) as { doc: { id: number } };
      console.log(`  Created "${account.name}" (id: ${created.doc.id}).`);
    }
  }

  console.log('\nDone. Verify in the CMS admin at http://localhost:3001/admin.');
  console.log('Then set push: false in apps/cms/src/payload.config.ts.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
