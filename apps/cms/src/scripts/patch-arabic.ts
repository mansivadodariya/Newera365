/**
 * One-shot patch script — adds missing Arabic fields to existing CMS records.
 * Safe to run against live data: it never deletes or recreates documents.
 *
 * Usage (set the admin credentials in the environment; no defaults):
 *   SEED_ADMIN_EMAIL=admin@newera365.com SEED_ADMIN_PASS=<password> \
 *     npm run patch:arabic --workspace=@newera365/cms
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const PASS = process.env.SEED_ADMIN_PASS;
if (!PASS) throw new Error('SEED_ADMIN_PASS must be set — there is no default admin password.');
let token = '';

async function request(method: string, endpoint: string, body?: unknown) {
  const res = await fetch(`${CMS}/api${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${method} ${endpoint} → ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

async function login() {
  const data = await request('POST', '/users/login', { email: EMAIL, password: PASS });
  token = data.token as string;
  console.log('✅ Logged in as', EMAIL);
}

// ─── Payment method Arabic names ────────────────────────────────────────────

const PAYMENT_AR_NAMES: Record<string, string> = {
  'Visa / Mastercard': 'فيزا / ماستركارد',
  'Bank wire (SWIFT)': 'تحويل بنكي (SWIFT)',
  Skrill: 'سكريل',
  Neteller: 'نيتيلر',
  'Crypto (USDT, BTC)': 'عملات رقمية (USDT, BTC)',
  'Local bank transfer': 'تحويل بنكي محلي',
};

async function patchPaymentMethods() {
  console.log('\n💰 Patching payment method Arabic names...');
  const data = await request('GET', '/payment-methods?limit=50');
  const docs = (data.docs ?? []) as { id: number; name: string; nameAr?: string }[];
  let updated = 0;
  for (const doc of docs) {
    const nameAr = PAYMENT_AR_NAMES[doc.name];
    if (!nameAr) {
      console.log(`   ⏭  Skipping "${doc.name}" (no AR name mapped)`);
      continue;
    }
    if (doc.nameAr) {
      console.log(`   ✓  "${doc.name}" already has nameAr`);
      continue;
    }
    await request('PATCH', `/payment-methods/${doc.id}`, { nameAr });
    console.log(`   ✅ "${doc.name}" → "${nameAr}"`);
    updated++;
  }
  console.log(`   ${updated} records updated.`);
}

// ─── Account type Arabic features ───────────────────────────────────────────

const ACCOUNT_AR_FEATURES: Record<string, string> = {
  Demo: 'وصول كامل للمنصة\nبيانات السوق الفعلية\nلا يلزم إيداع',
  Standard: 'جميع الأدوات الـ 2000+\nصفر عمولة\nدعم خبراء 24/7',
  'Swap-Free': 'بدون فوائد بيعية\nبنية متوافقة مع الشريعة الإسلامية\nوصول كامل للسوق',
  Professional: 'فروق خام من 0.0\nتنفيذ ذو أولوية\nمدير حساب مخصص',
};

const ACCOUNT_AR_NAMES: Record<string, string> = {
  Demo: 'تجريبي',
  Standard: 'قياسي',
  'Swap-Free': 'إسلامي',
  Professional: 'احترافي',
};

async function patchAccountTypes() {
  console.log('\n💳 Patching account type Arabic content...');
  const data = await request('GET', '/account-types?limit=20');
  const docs = (data.docs ?? []) as {
    id: number;
    name: string;
    nameAr?: string;
    featuresAr?: string;
  }[];
  let updated = 0;
  for (const doc of docs) {
    const patch: Record<string, string> = {};
    if (!doc.nameAr && ACCOUNT_AR_NAMES[doc.name]) patch.nameAr = ACCOUNT_AR_NAMES[doc.name]!;
    if (!doc.featuresAr && ACCOUNT_AR_FEATURES[doc.name])
      patch.featuresAr = ACCOUNT_AR_FEATURES[doc.name]!;
    if (Object.keys(patch).length === 0) {
      console.log(`   ✓  "${doc.name}" already complete`);
      continue;
    }
    await request('PATCH', `/account-types/${doc.id}`, patch);
    console.log(`   ✅ "${doc.name}" → patched`, Object.keys(patch).join(', '));
    updated++;
  }
  console.log(`   ${updated} records updated.`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Newera365 Arabic patch script\n');
  await login();
  await patchPaymentMethods();
  await patchAccountTypes();
  console.log('\n🎉 Done — no data was deleted.');
}

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
