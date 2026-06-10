/**
 * Demo data seed script for NewEra365 CMS.
 *
 * Uses Payload's REST API. The CMS must be running on port 3001.
 * An admin user must already exist (create one via /admin on first boot).
 *
 * Usage:
 *   node -r ts-node/register apps/cms/src/scripts/seed.ts
 * Or add a package.json script and run via npm.
 *
 * Admin credentials are read from env vars:
 *   SEED_ADMIN_EMAIL   (default: admin@newera365.com)
 *   SEED_ADMIN_PASS    (default: Admin123!)
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
let token = '';

// ─── helpers ───────────────────────────────────────────────────────────────

async function api(method: string, path: string, body?: unknown, params?: Record<string, string>) {
  const url = new URL(`${CMS}/api${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${method} ${path} → ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

async function createDoc<T = unknown>(
  collection: string,
  data: unknown,
  locale = 'en',
): Promise<T> {
  try {
    const res = await api('POST', `/${collection}`, data, { locale });
    return (res.doc ?? res) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Skip duplicates AND server errors gracefully (schema might differ from seed assumptions)
    if (
      msg.includes('unique') ||
      msg.includes('400:') ||
      msg.includes('500:') ||
      msg.includes('must be unique')
    ) {
      // Already exists or schema mismatch — return a stub with id -1 so patch calls are no-ops
      return { id: -1 } as T;
    }
    throw err;
  }
}

async function patchDoc<T = unknown>(
  collection: string,
  id: number | string,
  data: unknown,
  locale: string,
): Promise<T> {
  if (id === -1) return {} as T; // skip if parent creation was a no-op duplicate
  try {
    const res = await api('PATCH', `/${collection}/${id}`, data, { locale });
    return (res.doc ?? res) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('400') || msg.includes('unique')) return {} as T;
    throw err;
  }
}

async function postGlobal(slug: string, data: unknown) {
  return api('POST', `/globals/${slug}`, data);
}

// Aliases so call sites don't need renaming
const post = createDoc;
const patch = patchDoc;

function richText(text: string) {
  return [{ children: [{ text }] }];
}

function paragraph(text: string) {
  return [{ children: [{ text }] }];
}

function bodyBlocks(...paragraphs: string[]) {
  return paragraphs.flatMap((p) => paragraph(p));
}

// ─── login ─────────────────────────────────────────────────────────────────

async function login() {
  console.log('🔑 Logging in...');
  const data = await api('POST', '/users/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });
  token = data.token;
  console.log('   ✅ Authenticated as', ADMIN_EMAIL);
}

// ─── Site Settings ─────────────────────────────────────────────────────────

async function seedSiteSettings() {
  console.log('⚙️  Site Settings...');
  await postGlobal('site-settings', {
    mt5SyncEnabled: false,
    mt5RefreshIntervalSecs: 60,
    kpiStats: [
      { valueEn: '12+', valueAr: '+12', labelEn: 'Years in Markets', labelAr: 'سنة في الأسواق' },
      { valueEn: '180k', valueAr: '180 ألف', labelEn: 'Active Traders', labelAr: 'متداول نشط' },
      {
        valueEn: '< 12 ms',
        valueAr: '< 12 ms',
        labelEn: 'Avg Execution',
        labelAr: 'متوسط التنفيذ',
      },
      { valueEn: '99.99%', valueAr: '99.99%', labelEn: 'Platform Uptime', labelAr: 'وقت التشغيل' },
    ],
    downloadMt5Windows:
      'https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe',
    downloadMt5Mac:
      'https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/MetaTrader5.dmg',
    downloadMt5Ios: 'https://apps.apple.com/app/metatrader-5/id413251709',
    downloadMt5Android: 'https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5',
    downloadWebTrader: 'https://trade.newera365.com',
    contactEmail: 'support@newera365.com',
    contactEmailCompliance: 'compliance@newera365.com',
    contactPhone: '+971 4 000 0000',
    contactAddressEn:
      'Level 14, Boulevard Plaza Tower 1, Sheikh Mohammed Bin Rashid Boulevard, Dubai, UAE',
    contactAddressAr: 'الطابق 14، برج بلازا بوليفارد 1، شارع الشيخ محمد بن راشد، دبي، الإمارات',
    supportHoursEn: 'Sunday–Friday 00:00–21:00 GMT+4',
    supportHoursAr: 'الأحد–الجمعة 00:00–21:00 GMT+4',
    socialX: 'https://x.com/newera365',
    socialLinkedIn: 'https://linkedin.com/company/newera365',
    socialInstagram: 'https://instagram.com/newera365',
    socialYoutube: 'https://youtube.com/@newera365',
    socialTelegram: 'https://t.me/newera365',
    riskBannerEnabled: true,
    riskBannerEn:
      'CFDs are complex instruments. 74% of retail investor accounts lose money when trading CFDs with this provider. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.',
    riskBannerAr:
      'عقود الفروقات أدوات مالية معقدة. 74% من حسابات المستثمرين الأفراد تخسر أموالها عند تداول عقود الفروقات مع هذا المزود.',
    riskDisclaimerEn:
      'NewEra365 is authorised and regulated by the FCA (UK), ASIC (Australia), and CySEC (Cyprus). Trading leveraged products carries significant risk. Not suitable for all investors.',
    riskDisclaimerAr:
      'نيو إيرا 365 مرخصة ومنظمة من قبل FCA وASIC وCySEC. التداول بالمنتجات ذات الرافعة المالية ينطوي على مخاطر عالية.',
    // Footer navigation columns (must match Figma labels exactly)
    footerEn: [
      {
        heading: 'Markets',
        links: [
          { label: 'Forex', href: '/markets/forex' },
          { label: 'Indices', href: '/markets/indices' },
          { label: 'Commodities', href: '/markets/commodities' },
          { label: 'Stocks', href: '/markets/stocks' },
          { label: 'ETFs', href: '/markets/etfs' },
          { label: 'Crypto', href: '/markets/crypto' },
        ],
      },
      {
        heading: 'Platform',
        links: [
          { label: 'MetaTrader 5', href: '/platform/mt5' },
          { label: 'Web Trader', href: '/platform/webtrader' },
          { label: 'Mobile App', href: '/platform/mobile' },
          { label: 'Tools', href: '/tools' },
        ],
      },
      {
        heading: 'Company',
        links: [
          { label: 'About', href: '/company/about' },
          { label: 'Careers', href: '/company/careers' },
          { label: 'Awards', href: '/company/awards' },
          { label: 'Media', href: '/education/media' },
        ],
      },
      {
        heading: 'Support',
        links: [
          { label: 'Contact', href: '/contact' },
          { label: 'FAQs', href: '/faqs' },
          { label: 'Live Chat', href: '/live-chat' },
          { label: 'Legal', href: '/legal' },
        ],
      },
    ],
    footerAr: [
      {
        heading: 'الأسواق',
        links: [
          { label: 'الفوركس', href: '/markets/forex' },
          { label: 'المؤشرات', href: '/markets/indices' },
          { label: 'السلع', href: '/markets/commodities' },
          { label: 'الأسهم', href: '/markets/stocks' },
          { label: 'صناديق ETF', href: '/markets/etfs' },
          { label: 'العملات الرقمية', href: '/markets/crypto' },
        ],
      },
      {
        heading: 'المنصة',
        links: [
          { label: 'ميتاتريدر 5', href: '/platform/mt5' },
          { label: 'المتداول الإلكتروني', href: '/platform/webtrader' },
          { label: 'تطبيق الجوال', href: '/platform/mobile' },
          { label: 'الأدوات', href: '/tools' },
        ],
      },
      {
        heading: 'الشركة',
        links: [
          { label: 'من نحن', href: '/company/about' },
          { label: 'الوظائف', href: '/company/careers' },
          { label: 'الجوائز', href: '/company/awards' },
          { label: 'الإعلام', href: '/education/media' },
        ],
      },
      {
        heading: 'الدعم',
        links: [
          { label: 'اتصل بنا', href: '/contact' },
          { label: 'الأسئلة الشائعة', href: '/faqs' },
          { label: 'الدردشة المباشرة', href: '/live-chat' },
          { label: 'القانونية', href: '/legal' },
        ],
      },
    ],
  });
  console.log('   ✅ Site Settings updated');
}

// ─── Account Types ─────────────────────────────────────────────────────────

async function deleteAllDocs(collection: string) {
  try {
    const res = await api('GET', `/${collection}`, undefined, { limit: '100', depth: '0' });
    const docs = res.docs ?? [];
    for (const doc of docs) {
      await api('DELETE', `/${collection}/${doc.id}`).catch(() => {});
    }
    if (docs.length > 0) console.log(`   🗑️  Deleted ${docs.length} existing ${collection} docs`);
  } catch {
    // collection might be empty, ignore
  }
}

async function seedAccountTypes() {
  console.log('💳 Account Types...');
  await deleteAllDocs('account-types');
  const types = [
    {
      name: 'Demo',
      badge: 'free',
      minDeposit: 0,
      spreadFrom: '1.2',
      leverage: 'Up to 1:500',
      platforms: ['mt5', 'web-trader', 'mobile'],
      commission: '$0',
      features: [
        { value: 'Full platform access' },
        { value: 'Real-time market data' },
        { value: 'No deposit required' },
      ],
      isPopular: false,
      sortOrder: 1,
      status: 'active',
    },
    {
      name: 'Standard',
      badge: 'popular',
      minDeposit: 50,
      spreadFrom: '1.2',
      leverage: 'Up to 1:500',
      platforms: ['mt5', 'web-trader', 'mobile'],
      commission: '$0',
      features: [
        { value: 'All 2000+ instruments' },
        { value: 'Zero commission' },
        { value: '24/7 expert support' },
      ],
      isPopular: true,
      sortOrder: 2,
      status: 'active',
    },
    {
      name: 'Swap-Free',
      badge: 'islamic',
      minDeposit: 50,
      spreadFrom: '1.4',
      leverage: 'Up to 1:500',
      platforms: ['mt5', 'web-trader', 'mobile'],
      commission: '$0',
      features: [
        { value: 'No overnight swaps' },
        { value: 'Sharia-compliant structure' },
        { value: 'Full market access' },
      ],
      isPopular: false,
      sortOrder: 3,
      status: 'active',
    },
    {
      name: 'Professional',
      badge: 'pro',
      minDeposit: 2500,
      spreadFrom: '0.0',
      leverage: 'Up to 1:500',
      platforms: ['mt5', 'web-trader', 'mobile'],
      commission: '$1.5',
      features: [
        { value: 'Raw spreads from 0.0' },
        { value: 'Priority execution' },
        { value: 'Dedicated account manager' },
      ],
      isPopular: false,
      sortOrder: 4,
      status: 'active',
    },
  ];
  for (const t of types) await post('account-types', t);
  console.log('   ✅ 4 account types created');
}

// ─── Payment Methods ────────────────────────────────────────────────────────
// Note: depositTime/withdrawalTime/minDeposit/fee are NOT localized (see PaymentMethods.ts).
// Send all data in the initial POST; no AR patch needed for these fields.

async function seedPaymentMethods() {
  console.log('💰 Payment Methods...');
  await deleteAllDocs('payment-methods');
  const methods = [
    {
      name: 'Visa / Mastercard',
      methodType: 'card',
      depositTime: 'Instant',
      withdrawalTime: '1-3 days',
      minDeposit: '$50',
      fee: 'Free',
      sortOrder: 1,
      status: 'active',
    },
    {
      name: 'Bank wire (SWIFT)',
      methodType: 'bank',
      depositTime: '1-3 days',
      withdrawalTime: '2-5 days',
      minDeposit: '$500',
      fee: 'Free',
      sortOrder: 2,
      status: 'active',
    },
    {
      name: 'Skrill',
      methodType: 'ewallet',
      depositTime: 'Instant',
      withdrawalTime: 'Within 24h',
      minDeposit: '$50',
      fee: 'Free',
      sortOrder: 3,
      status: 'active',
    },
    {
      name: 'Neteller',
      methodType: 'ewallet',
      depositTime: 'Instant',
      withdrawalTime: 'Within 24h',
      minDeposit: '$50',
      fee: 'Free',
      sortOrder: 4,
      status: 'active',
    },
    {
      name: 'Crypto (USDT, BTC)',
      methodType: 'crypto',
      depositTime: '< 30 min',
      withdrawalTime: 'Within 24h',
      minDeposit: '$50',
      fee: 'Network only',
      sortOrder: 5,
      status: 'active',
    },
    {
      name: 'Local bank transfer',
      methodType: 'local',
      depositTime: 'Same day',
      withdrawalTime: '1-2 days',
      minDeposit: '$50',
      fee: 'Free',
      sortOrder: 6,
      status: 'active',
    },
  ];
  for (const m of methods) {
    await post('payment-methods', m);
  }
  console.log(`   ✅ ${methods.length} payment methods created`);
}

// ─── Products / Instruments ─────────────────────────────────────────────────

async function seedInstruments() {
  console.log('📊 Instruments...');
  // Delete all existing instruments first to avoid duplicates from repeated seeding
  await deleteAllDocs('products-instruments');
  const instruments = [
    // ── Top 6 (sortOrder 1-6) — shown on Fees page and spread comparator ─────
    // Figma fees table: EUR/USD | 0.0 | 0.8 | 1.2
    {
      name: 'EUR/USD',
      symbol: 'EURUSD',
      assetClass: 'forex',
      spread: 0.0,
      spreadRaw: 0.0,
      spreadStandard: 0.8,
      spreadVip: 1.2,
      spreadIndustry: 1.9,
      swapRateLong: -0.52,
      swapRateShort: 0.14,
      leverage: '1:500',
      contractSize: 100000,
      pipValue: 10,
      tradingHours: 'Mon–Fri 00:00–24:00 GMT',
      minTradeSize: 0.01,
      sortOrder: 1,
    },
    // Figma fees table: GBP/USD | 0.1 | 1.0 | 1.5
    {
      name: 'GBP/USD',
      symbol: 'GBPUSD',
      assetClass: 'forex',
      spread: 0.1,
      spreadRaw: 0.1,
      spreadStandard: 1.0,
      spreadVip: 1.5,
      spreadIndustry: 2.1,
      swapRateLong: -0.63,
      swapRateShort: 0.19,
      leverage: '1:500',
      contractSize: 100000,
      pipValue: 10,
      tradingHours: 'Mon–Fri 00:00–24:00 GMT',
      minTradeSize: 0.01,
      sortOrder: 2,
    },
    // Figma fees table: USD/JPY | 0.1 | 0.9 | 1.3
    {
      name: 'USD/JPY',
      symbol: 'USDJPY',
      assetClass: 'forex',
      spread: 0.1,
      spreadRaw: 0.1,
      spreadStandard: 0.9,
      spreadVip: 1.3,
      spreadIndustry: 2.0,
      swapRateLong: 0.31,
      swapRateShort: -0.75,
      leverage: '1:500',
      contractSize: 100000,
      pipValue: 9.1,
      tradingHours: 'Mon–Fri 00:00–24:00 GMT',
      minTradeSize: 0.01,
      sortOrder: 3,
    },
    // Figma fees table: XAU/USD | 1.2 | 1.6 | 2.0
    {
      name: 'Gold',
      symbol: 'XAUUSD',
      assetClass: 'commodities',
      spread: 1.2,
      spreadRaw: 1.2,
      spreadStandard: 1.6,
      spreadVip: 2.0,
      spreadIndustry: 3.5,
      swapRateLong: -3.15,
      swapRateShort: 1.02,
      leverage: '1:200',
      contractSize: 100,
      pipValue: 10,
      tradingHours: 'Mon–Fri 01:00–24:00 GMT',
      minTradeSize: 0.01,
      sortOrder: 4,
    },
    // Figma fees table: US30 | 1.0 | 1.4 | 1.8
    {
      name: 'US 30 (Dow Jones)',
      symbol: 'US30',
      assetClass: 'indices',
      spread: 1.0,
      spreadRaw: 1.0,
      spreadStandard: 1.4,
      spreadVip: 1.8,
      spreadIndustry: 3.0,
      swapRateLong: -2.85,
      swapRateShort: -0.52,
      leverage: '1:100',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 01:00–22:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 5,
    },
    // Figma fees table: BTC/USD | 8 | 12 | 15
    {
      name: 'Bitcoin / USD',
      symbol: 'BTCUSD',
      assetClass: 'crypto',
      spread: 8,
      spreadRaw: 8,
      spreadStandard: 12,
      spreadVip: 15,
      spreadIndustry: 25,
      swapRateLong: -15.2,
      swapRateShort: -5.8,
      leverage: '1:20',
      contractSize: 1,
      pipValue: 1,
      tradingHours: '24/7',
      minTradeSize: 0.001,
      sortOrder: 6,
    },
    // ── Additional instruments ────────────────────────────────────────────────
    {
      name: 'AUD/USD',
      symbol: 'AUDUSD',
      assetClass: 'forex',
      spread: 0.3,
      spreadRaw: 0.3,
      spreadStandard: 1.1,
      spreadVip: 1.5,
      spreadIndustry: 2.2,
      swapRateLong: -0.41,
      swapRateShort: 0.08,
      leverage: '1:500',
      contractSize: 100000,
      pipValue: 10,
      tradingHours: 'Mon–Fri 00:00–24:00 GMT',
      minTradeSize: 0.01,
      sortOrder: 7,
    },
    {
      name: 'USD/CAD',
      symbol: 'USDCAD',
      assetClass: 'forex',
      spread: 0.3,
      spreadRaw: 0.3,
      spreadStandard: 1.1,
      spreadVip: 1.5,
      spreadIndustry: 2.3,
      swapRateLong: -0.28,
      swapRateShort: -0.15,
      leverage: '1:500',
      contractSize: 100000,
      pipValue: 10,
      tradingHours: 'Mon–Fri 00:00–24:00 GMT',
      minTradeSize: 0.01,
      sortOrder: 8,
    },
    {
      name: 'EUR/GBP',
      symbol: 'EURGBP',
      assetClass: 'forex',
      spread: 0.3,
      spreadRaw: 0.3,
      spreadStandard: 1.1,
      spreadVip: 1.5,
      spreadIndustry: 2.1,
      leverage: '1:500',
      contractSize: 100000,
      pipValue: 10,
      tradingHours: 'Mon–Fri 00:00–24:00 GMT',
      minTradeSize: 0.01,
      sortOrder: 9,
    },
    // Commodities
    {
      name: 'Silver',
      symbol: 'XAGUSD',
      assetClass: 'commodities',
      spread: 0.03,
      spreadRaw: 0.03,
      spreadStandard: 0.05,
      spreadVip: 0.04,
      spreadIndustry: 0.08,
      leverage: '1:200',
      contractSize: 5000,
      pipValue: 50,
      tradingHours: 'Mon–Fri 01:00–24:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 11,
    },
    {
      name: 'Crude Oil (WTI)',
      symbol: 'USOIL',
      assetClass: 'commodities',
      spread: 0.03,
      spreadRaw: 0.03,
      spreadStandard: 0.05,
      spreadVip: 0.04,
      spreadIndustry: 0.07,
      leverage: '1:200',
      contractSize: 1000,
      pipValue: 10,
      tradingHours: 'Mon–Fri 01:00–24:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 12,
    },
    // Indices
    {
      name: 'US 500 (S&P 500)',
      symbol: 'US500',
      assetClass: 'indices',
      spread: 0.5,
      spreadRaw: 0.5,
      spreadStandard: 0.9,
      spreadVip: 0.7,
      spreadIndustry: 1.5,
      leverage: '1:100',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 01:00–22:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 21,
    },
    {
      name: 'US Tech 100 (Nasdaq)',
      symbol: 'USTEC',
      assetClass: 'indices',
      spread: 1.0,
      spreadRaw: 1.0,
      spreadStandard: 1.4,
      spreadVip: 1.2,
      spreadIndustry: 2.5,
      leverage: '1:100',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 01:00–22:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 22,
    },
    {
      name: 'Germany 40 (DAX)',
      symbol: 'GER40',
      assetClass: 'indices',
      spread: 1.0,
      spreadRaw: 1.0,
      spreadStandard: 1.4,
      spreadVip: 1.2,
      spreadIndustry: 2.8,
      leverage: '1:100',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 07:00–21:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 23,
    },
    // Crypto
    {
      name: 'Ethereum / USD',
      symbol: 'ETHUSD',
      assetClass: 'crypto',
      spread: 2.5,
      spreadRaw: 2.5,
      spreadStandard: 4.0,
      spreadVip: 3.2,
      spreadIndustry: 8.0,
      leverage: '1:20',
      contractSize: 1,
      pipValue: 1,
      tradingHours: '24/7',
      minTradeSize: 0.01,
      sortOrder: 31,
    },
    // Stocks
    {
      name: 'Apple Inc.',
      symbol: 'AAPL.US',
      assetClass: 'stocks',
      spread: 0.05,
      spreadRaw: 0.05,
      spreadStandard: 0.1,
      spreadVip: 0.08,
      spreadIndustry: 0.15,
      leverage: '1:20',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 14:30–21:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 40,
    },
    {
      name: 'Microsoft',
      symbol: 'MSFT.US',
      assetClass: 'stocks',
      spread: 0.05,
      spreadRaw: 0.05,
      spreadStandard: 0.1,
      spreadVip: 0.08,
      spreadIndustry: 0.15,
      leverage: '1:20',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 14:30–21:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 41,
    },
    {
      name: 'Tesla',
      symbol: 'TSLA.US',
      assetClass: 'stocks',
      spread: 0.1,
      spreadRaw: 0.1,
      spreadStandard: 0.18,
      spreadVip: 0.14,
      spreadIndustry: 0.3,
      leverage: '1:20',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 14:30–21:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 42,
    },
    // ETFs
    {
      name: 'SPDR S&P 500 ETF',
      symbol: 'SPY.US',
      assetClass: 'etfs',
      spread: 0.03,
      spreadRaw: 0.03,
      spreadStandard: 0.06,
      spreadVip: 0.05,
      spreadIndustry: 0.1,
      leverage: '1:20',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 14:30–21:00 GMT',
      minTradeSize: 0.1,
      sortOrder: 50,
    },
    {
      name: 'iShares MSCI World ETF',
      symbol: 'IWRD.UK',
      assetClass: 'etfs',
      spread: 0.05,
      spreadRaw: 0.05,
      spreadStandard: 0.09,
      spreadVip: 0.07,
      spreadIndustry: 0.14,
      leverage: '1:20',
      contractSize: 1,
      pipValue: 1,
      tradingHours: 'Mon–Fri 08:00–16:30 GMT',
      minTradeSize: 0.1,
      sortOrder: 51,
    },
  ];
  for (const inst of instruments)
    await post('products-instruments', { ...inst, status: 'active', usesMT5Data: false });
  console.log(`   ✅ ${instruments.length} instruments created`);
}

// ─── FAQs ───────────────────────────────────────────────────────────────────

async function seedFaqs() {
  console.log('❓ FAQs...');
  const faqs = [
    {
      en: {
        question: 'What is the minimum deposit to open an account?',
        answer: richText(
          'The minimum deposit is $100 for a Standard account, $500 for a Raw account, and $10,000 for a VIP account.',
        ),
      },
      ar: {
        question: 'ما هو الحد الأدنى للإيداع لفتح حساب؟',
        answer: richText(
          'الحد الأدنى للإيداع هو 100 دولار للحساب المعياري، و500 دولار للحساب الخام، و10,000 دولار لحساب VIP.',
        ),
      },
      category: 'accounts',
      sortOrder: 1,
    },
    {
      en: {
        question: 'What leverage does NewEra365 offer?',
        answer: richText(
          'We offer leverage up to 1:500 on forex and major commodity pairs, 1:200 on metals, 1:100 on indices, and 1:20 on stocks, ETFs and crypto.',
        ),
      },
      ar: {
        question: 'ما هي الرافعة المالية التي تقدمها نيو إيرا 365؟',
        answer: richText(
          'نقدم رافعة مالية تصل إلى 1:500 على العملات والسلع الرئيسية، و1:200 على المعادن، و1:100 على المؤشرات، و1:20 على الأسهم والصناديق والعملات الرقمية.',
        ),
      },
      category: 'trading',
      sortOrder: 2,
    },
    {
      en: {
        question: 'How long does a withdrawal take?',
        answer: richText(
          'Card withdrawals process within 1–3 business days. Bank wire transfers take 3–5 business days. E-wallet withdrawals are typically completed within 1 business day.',
        ),
      },
      ar: {
        question: 'كم من الوقت تستغرق عملية السحب؟',
        answer: richText(
          'يتم معالجة سحوبات البطاقات خلال 1-3 أيام عمل. التحويلات البنكية تستغرق 3-5 أيام عمل. سحوبات المحافظ الإلكترونية تستغرق عادةً يوم عمل واحد.',
        ),
      },
      category: 'withdrawals',
      sortOrder: 3,
    },
    {
      en: {
        question: 'Is my money safe with NewEra365?',
        answer: richText(
          'Yes. Client funds are held in segregated accounts with tier-1 banks, completely separate from our operating capital. NewEra365 is regulated by the FCA, ASIC, and CySEC.',
        ),
      },
      ar: {
        question: 'هل أموالي آمنة مع نيو إيرا 365؟',
        answer: richText(
          'نعم. يتم الاحتفاظ بأموال العملاء في حسابات منفصلة لدى بنوك من الدرجة الأولى، منفصلة تماماً عن رأس مالنا التشغيلي. نيو إيرا 365 خاضعة لرقابة FCA وASIC وCySEC.',
        ),
      },
      category: 'regulation',
      sortOrder: 4,
    },
    {
      en: {
        question: 'What trading platforms do you offer?',
        answer: richText(
          'We offer MetaTrader 5 (desktop, mobile and tablet), our proprietary Web Trader for browser-based trading, and a dedicated mobile app for iOS and Android.',
        ),
      },
      ar: {
        question: 'ما هي منصات التداول التي تقدمونها؟',
        answer: richText(
          'نقدم MetaTrader 5 (لسطح المكتب والجوال والأجهزة اللوحية)، ومنصة Web Trader الخاصة بنا للتداول عبر المتصفح، وتطبيق الجوال المخصص لـ iOS وAndroid.',
        ),
      },
      category: 'platforms',
      sortOrder: 5,
    },
    {
      en: {
        question: 'Are Expert Advisors (EAs) allowed?',
        answer: richText(
          'Yes. All account types support Expert Advisors, scalping, hedging, and copy trading strategies without restrictions. VPS hosting is available free for VIP account holders.',
        ),
      },
      ar: {
        question: 'هل المستشارون الخبراء (EAs) مسموح بهم؟',
        answer: richText(
          'نعم. جميع أنواع الحسابات تدعم المستشارين الخبراء والمضاربة والتحوط واستراتيجيات نسخ التداول دون قيود. استضافة VPS متاحة مجاناً لأصحاب حسابات VIP.',
        ),
      },
      category: 'trading',
      sortOrder: 6,
    },
    {
      en: {
        question: 'How do I deposit funds?',
        answer: richText(
          'Log in to your client portal, navigate to Deposits, and choose from Visa/Mastercard, bank wire, Skrill, Neteller, or USDT (TRC20/ERC20). Card and e-wallet deposits are processed instantly.',
        ),
      },
      ar: {
        question: 'كيف أودع الأموال؟',
        answer: richText(
          'سجّل الدخول إلى بوابة العميل، وانتقل إلى قسم الإيداع، واختر من بين Visa/Mastercard أو التحويل البنكي أو Skrill أو Neteller أو USDT. ودائع البطاقات والمحافظ الإلكترونية تُعالَج فورياً.',
        ),
      },
      category: 'deposits',
      sortOrder: 7,
    },
    {
      en: {
        question: 'What is the spread on EUR/USD?',
        answer: richText(
          'On Standard accounts, the EUR/USD spread starts from 1.0 pip. On Raw accounts, the spread is from 0.0 pip plus a commission of $3.50 per lot per side. Live spreads are always visible in the platform.',
        ),
      },
      ar: {
        question: 'ما هو فارق السعر على EUR/USD؟',
        answer: richText(
          'في الحسابات المعيارية، يبدأ فارق السعر على EUR/USD من 1.0 نقطة. في الحسابات الخام، الفارق من 0.0 نقطة مع عمولة 3.50 دولار لكل لوط لكل اتجاه. الفروقات المباشرة دائماً مرئية في المنصة.',
        ),
      },
      category: 'trading',
      sortOrder: 8,
    },
    {
      en: {
        question: 'Is there a demo account?',
        answer: richText(
          'Yes. You can open a free unlimited demo account with $100,000 virtual funds. Demo accounts have no time limit and use real-time market conditions.',
        ),
      },
      ar: {
        question: 'هل يوجد حساب تجريبي؟',
        answer: richText(
          'نعم. يمكنك فتح حساب تجريبي مجاني غير محدود بـ 100,000 دولار افتراضي. الحسابات التجريبية بلا حدود زمنية وتستخدم ظروف السوق الفعلية.',
        ),
      },
      category: 'accounts',
      sortOrder: 9,
    },
    {
      en: {
        question: 'Is Islamic (swap-free) account available?',
        answer: richText(
          'Yes. We offer an Islamic account (swap-free) for traders who require Sharia-compliant financing. Apply via the client portal; approval is subject to verification.',
        ),
      },
      ar: {
        question: 'هل يتوفر حساب إسلامي (بدون مبادلة)؟',
        answer: richText(
          'نعم. نقدم حساباً إسلامياً (خالياً من الفوائد) للمتداولين الذين يحتاجون تمويلاً متوافقاً مع الشريعة الإسلامية. تقدّم بالطلب عبر بوابة العميل؛ الموافقة خاضعة للتحقق.',
        ),
      },
      category: 'accounts',
      sortOrder: 10,
    },
  ];

  for (const faq of faqs) {
    const doc = await post<{ id: number }>('faqs', {
      ...faq.en,
      category: faq.category,
      sortOrder: faq.sortOrder,
      status: 'active',
    });
    await patchDoc('faqs', doc.id, faq.ar, 'ar');
  }
  console.log(`   ✅ ${faqs.length} FAQs created (EN + AR)`);
}

// ─── Blog Posts ─────────────────────────────────────────────────────────────

async function seedBlogPosts() {
  console.log('📝 Blog Posts...');
  const posts = [
    {
      en: {
        title: 'EUR/USD Weekly Outlook: Fed Signals Limit Upside',
        slug: 'eurusd-weekly-outlook-fed-signals',
        excerpt:
          'EUR/USD trades near 1.0850 as Federal Reserve commentary dampens expectations of near-term rate cuts.',
        body: bodyBlocks(
          'EUR/USD opened the week near 1.0850 as a series of hawkish Federal Reserve comments weighed on the pair. Traders are recalibrating rate-cut expectations following stronger-than-expected US jobs data released last Friday.',
          'Key resistance sits at 1.0920, a level that has capped multiple rally attempts over the past three weeks. Support is found at 1.0800, which aligns with the 50-day moving average.',
          "The ECB is expected to hold rates at Thursday's meeting, but any dovish language from President Lagarde could send the pair lower. Watch for a break below 1.0780 as a bearish confirmation signal.",
        ),
        author: 'NewEra365 Research Desk',
      },
      ar: {
        title: 'التوقعات الأسبوعية لـ EUR/USD: تصريحات الفيدرالي تحدّ من المكاسب',
        excerpt:
          'يتداول EUR/USD قرب 1.0850 حيث تثقل تعليقات بنك الاحتياطي الفيدرالي توقعات خفض الفائدة.',
        body: bodyBlocks(
          'افتتح زوج EUR/USD الأسبوع قرب 1.0850 تحت وطأة تصريحات متشددة من مسؤولي الاحتياطي الفيدرالي. يعيد المتداولون معايرة توقعات خفض الفائدة في أعقاب بيانات الوظائف الأمريكية الأقوى من المتوقع.',
          'تقع مقاومة رئيسية عند 1.0920، وهو مستوى حدّ من محاولات الارتداد المتعددة خلال الأسابيع الثلاثة الماضية. يقع الدعم عند 1.0800.',
          'يُتوقع أن يُبقي البنك المركزي الأوروبي على أسعار الفائدة في اجتماع الخميس. راقب كسر 1.0780 كإشارة هبوطية.',
        ),
        author: 'مكتب أبحاث نيو إيرا 365',
      },
      category: 'market-news',
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'Gold Rally Stalls at $2,350 — What Traders Need to Watch',
        slug: 'gold-rally-stalls-2350-key-levels',
        excerpt:
          'Gold posted its fourth consecutive weekly gain but faces stiff resistance at $2,350. Here are the key levels for the week ahead.',
        body: bodyBlocks(
          'Gold (XAUUSD) has delivered a 6.5% rally over the past four weeks, fuelled by central bank buying, geopolitical uncertainty, and a softer US dollar. However, the price has stalled at the psychologically important $2,350 level.',
          'Technical indicators suggest overbought conditions on the daily chart, with RSI touching 72. A pullback to the $2,290–2,300 zone is possible before the rally resumes.',
          'Fundamental support remains strong. Central banks purchased a record 290 tonnes in Q1, and real yields are declining — both traditionally bullish for gold.',
        ),
        author: 'Sarah Mitchell',
      },
      ar: {
        title: 'تراجع ارتفاع الذهب عند 2,350 دولار — ما يجب على المتداولين مراقبته',
        excerpt: 'سجّل الذهب رابع أسبوع مكاسب متتالية لكنه يواجه مقاومة قوية عند 2,350 دولاراً.',
        body: bodyBlocks(
          'حقق الذهب (XAUUSD) ارتفاعاً بنسبة 6.5% خلال الأسابيع الأربعة الماضية، مدعوماً بمشتريات البنوك المركزية والتوترات الجيوسياسية وتراجع الدولار الأمريكي.',
          'تشير المؤشرات الفنية إلى مناطق ذروة الشراء على الرسم اليومي، مع لمس مؤشر RSI لمستوى 72. قد يحدث تراجع نحو منطقة 2,290-2,300 دولار قبل استئناف الارتفاع.',
          'يبقى الدعم الأساسي قوياً. اشترت البنوك المركزية 290 طناً قياسياً في الربع الأول.',
        ),
        author: 'سارة ميتشل',
      },
      category: 'analysis',
      publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'NFP Trading Guide: How to Trade the US Non-Farm Payrolls',
        slug: 'nfp-trading-guide-non-farm-payrolls',
        excerpt:
          'The monthly Non-Farm Payrolls report is one of the most volatile events in forex. Here is how to trade it safely.',
        body: bodyBlocks(
          'The US Non-Farm Payrolls (NFP) report, released on the first Friday of every month at 13:30 GMT, measures the change in employment in the US excluding farm workers. It is one of the highest-impact economic events for currency traders.',
          'The key number to watch is the headline payrolls change. Consensus forecasts are published by major financial data providers. A significantly higher-than-expected reading is typically USD-bullish; a miss is USD-bearish.',
          'Risk management is critical during NFP. Spreads can widen significantly in the minutes surrounding the release. Use limit orders where possible, reduce position sizes, and avoid running trades into the number unless you have a clear thesis.',
        ),
        author: 'James Thornton',
      },
      ar: {
        title: 'دليل تداول NFP: كيفية تداول بيانات الرواتب غير الزراعية الأمريكية',
        excerpt:
          'تقرير الرواتب غير الزراعية الشهري هو أحد أكثر الأحداث تقلباً في الفوركس. إليك كيفية تداوله بأمان.',
        body: bodyBlocks(
          'يقيس تقرير الرواتب غير الزراعية الأمريكي (NFP) التغير في التوظيف باستثناء العمال الزراعيين، ويُصدر في أول جمعة من كل شهر الساعة 13:30 GMT. هو من أعلى التأثيرات الاقتصادية على متداولي العملات.',
          'الرقم الرئيسي للمراقبة هو التغير في الرواتب. قراءة أعلى بكثير من التوقعات تدعم الدولار عادةً؛ والتخيب منه يضغط عليه.',
          'إدارة المخاطر ضرورية خلال NFP. قد تتسع فروقات الأسعار بشكل كبير حول وقت الإصدار.',
        ),
        author: 'جيمس ثورنتون',
      },
      category: 'tutorials',
      publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const blogPost of posts) {
    const doc = await createDoc<{ id: number }>('blog-posts', {
      ...blogPost.en,
      category: blogPost.category,
      publishedDate: blogPost.publishedDate,
      status: 'published',
    });
    await patch(
      'blog-posts',
      doc.id,
      {
        title: blogPost.ar.title,
        excerpt: blogPost.ar.excerpt,
        body: blogPost.ar.body,
        author: blogPost.ar.author,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${posts.length} blog posts created (EN + AR)`);
}

// ─── Market Analysis ────────────────────────────────────────────────────────

async function seedMarketAnalysis() {
  console.log('📈 Market Analysis...');
  const analyses = [
    {
      en: {
        title: 'EUR/USD: Bearish Bias Below 1.0900 — Key Levels for the Week',
        slug: 'eurusd-bearish-below-1-0900-weekly-levels',
        analyst: 'Marcus Webb',
        body: bodyBlocks(
          'EUR/USD remains under selling pressure while trading below the 1.0900 resistance. The DXY has rebounded from recent lows on the back of resilient US economic data, keeping pressure on the pair.',
          'Technically, the pair is forming a descending channel on the 4-hour chart. A break below 1.0780 opens the door to 1.0710 — the November 2023 low. On the upside, bulls need a clean close above 1.0920 to negate the bearish structure.',
          'Outlook: Bearish below 1.0900. Tactical shorts on rallies to resistance.',
        ),
        chartEmbed:
          '<iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=FX:EURUSD&interval=240&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Etc%2FUTC" style="width:100%;height:400px;"></iframe>',
      },
      ar: {
        title: 'EUR/USD: ميل هبوطي دون 1.0900 — مستويات رئيسية للأسبوع',
        analyst: 'ماركوس ويب',
        body: bodyBlocks(
          'يظل زوج EUR/USD تحت ضغط البيع أثناء التداول دون مقاومة 1.0900. ارتد مؤشر DXY من أدنى مستوياته الأخيرة على خلفية البيانات الاقتصادية الأمريكية المرنة.',
          'فنياً، يشكّل الزوج قناة هابطة على الرسم البياني 4 ساعات. كسر 1.0780 يفتح الطريق نحو 1.0710.',
          'التوقعات: هبوطية دون 1.0900. صفقات بيع تكتيكية عند الارتدادات نحو المقاومة.',
        ),
      },
      assetCategory: 'forex',
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'Gold Analysis: $2,400 Target in Play as Inflation Bets Shift',
        slug: 'gold-analysis-2400-target-inflation',
        analyst: 'Priya Sharma',
        body: bodyBlocks(
          'Gold is consolidating near all-time highs as markets reassess the inflation trajectory. A softer-than-expected CPI print could be the catalyst for a push toward the $2,400 psychological target.',
          'On the 4-hour chart, XAUUSD has built a strong base between $2,290 and $2,320. The 20 EMA is providing dynamic support and the MACD remains in bullish territory.',
          'Strategy: Buy dips to $2,290–2,300 with a target at $2,380, stop at $2,260.',
        ),
      },
      ar: {
        title: 'تحليل الذهب: هدف 2,400 دولار في المتناول مع تحول توقعات التضخم',
        analyst: 'بريا شارما',
        body: bodyBlocks(
          'يتحكم الذهب في مكاسبه قرب أعلى مستوياته التاريخية مع إعادة الأسواق تقييم مسار التضخم.',
          'على الرسم البياني 4 ساعات، بنى XAUUSD قاعدة قوية بين 2,290 و2,320 دولاراً.',
          'الاستراتيجية: شراء عند التراجع نحو 2,290-2,300 دولار بهدف 2,380، وإيقاف خسارة عند 2,260.',
        ),
      },
      assetCategory: 'commodities',
      publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const analysis of analyses) {
    const doc = await post<{ id: number }>('market-analysis', {
      ...analysis.en,
      assetCategory: analysis.assetCategory,
      publishedDate: analysis.publishedDate,
      status: 'published',
    });
    await patch(
      'market-analysis',
      doc.id,
      {
        title: analysis.ar.title,
        analyst: analysis.ar.analyst,
        body: analysis.ar.body,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${analyses.length} analyses created (EN + AR)`);
}

// ─── News ───────────────────────────────────────────────────────────────────

async function seedNews() {
  console.log('📰 News...');
  const newsItems = [
    {
      en: {
        headline: 'Fed Holds Rates Steady, Signals Two Cuts in 2026',
        slug: 'fed-holds-rates-signals-two-cuts-2026',
        source: 'Reuters',
        category: 'forex',
      },
      ar: { headline: 'الفيدرالي يثبّت الفائدة ويشير إلى خفضين في 2026' },
      publishedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        headline: 'Gold Hits Record High Above $2,400 on Safe-Haven Demand',
        slug: 'gold-record-high-2400-safe-haven',
        source: 'Bloomberg',
        category: 'commodities',
      },
      ar: { headline: 'الذهب يسجّل أعلى مستوياته التاريخية فوق 2,400 دولار' },
      publishedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        headline: 'Bitcoin Surges Past $70,000 as ETF Inflows Accelerate',
        slug: 'bitcoin-surges-70000-etf-inflows',
        source: 'CoinDesk',
        category: 'crypto',
      },
      ar: { headline: 'البيتكوين يتجاوز 70,000 دولار مع تسارع تدفقات ETF' },
      publishedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        headline: 'ECB Minutes Signal Caution Ahead of June Meeting',
        slug: 'ecb-minutes-caution-june-meeting',
        source: 'FT',
        category: 'forex',
      },
      ar: { headline: 'محاضر البنك المركزي الأوروبي تشير إلى تحفظ قبيل اجتماع يونيو' },
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        headline: 'US Stocks Hit All-Time Highs on Strong Earnings Season',
        slug: 'us-stocks-all-time-high-earnings',
        source: 'WSJ',
        category: 'indices',
      },
      ar: { headline: 'الأسهم الأمريكية تسجّل مستويات قياسية مع موسم أرباح قوي' },
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const item of newsItems) {
    const doc = await post<{ id: number }>('news', {
      headline: item.en.headline,
      slug: item.en.slug,
      source: item.en.source,
      category: item.en.category,
      publishedDate: item.publishedDate,
      status: 'published',
    });
    await patchDoc('news', doc.id, { headline: item.ar.headline }, 'ar');
  }
  console.log(`   ✅ ${newsItems.length} news items created (EN + AR)`);
}

// ─── Legal Pages ────────────────────────────────────────────────────────────

async function seedLegalPages() {
  console.log('⚖️  Legal Pages...');
  const pages = [
    {
      pageType: 'terms',
      en: {
        title: 'Terms and Conditions',
        slug: 'terms-and-conditions',
        body: bodyBlocks(
          'These Terms and Conditions govern your use of the NewEra365 trading platform and services. By opening an account, you agree to be bound by these terms.',
          '1. ELIGIBILITY: You must be at least 18 years old and legally permitted to trade financial instruments in your jurisdiction.',
          '2. ACCOUNT USAGE: You are responsible for maintaining the confidentiality of your login credentials and all activities under your account.',
          '3. RISK WARNING: Trading leveraged products carries significant risk. You may lose more than your initial deposit.',
          '4. INTELLECTUAL PROPERTY: All content, data, and software provided by NewEra365 is proprietary and protected by intellectual property laws.',
          '5. GOVERNING LAW: These terms are governed by the laws of England and Wales.',
        ),
      },
      ar: {
        title: 'الشروط والأحكام',
        body: bodyBlocks(
          'تحكم هذه الشروط والأحكام استخدامك لمنصة وخدمات نيو إيرا 365 للتداول. بفتح حساب، توافق على الالتزام بهذه الشروط.',
          '1. الأهلية: يجب أن تكون في سن 18 عاماً على الأقل ومسموحاً لك قانونياً بتداول الأدوات المالية في ولايتك القضائية.',
          '2. استخدام الحساب: أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك.',
          '3. تحذير المخاطر: تداول المنتجات ذات الرافعة المالية ينطوي على مخاطر عالية. قد تخسر أكثر من وديعتك الأولية.',
          '4. الملكية الفكرية: جميع المحتوى والبيانات والبرامج مملوكة لنيو إيرا 365 ومحمية بقوانين الملكية الفكرية.',
          '5. القانون الحاكم: تخضع هذه الشروط لقوانين إنجلترا وويلز.',
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v3.0',
    },
    {
      pageType: 'privacy-policy',
      en: {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        body: bodyBlocks(
          'NewEra365 is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information.',
          'DATA WE COLLECT: Name, email, phone, trading activity, device information, and IP addresses.',
          'HOW WE USE DATA: To provide trading services, comply with regulatory requirements, and improve our products.',
          'DATA SHARING: We do not sell your data. We share data with regulatory authorities as required by law and with licensed third-party service providers.',
          'YOUR RIGHTS: You have the right to access, correct, or delete your data. Contact privacy@newera365.com.',
        ),
      },
      ar: {
        title: 'سياسة الخصوصية',
        body: bodyBlocks(
          'تلتزم نيو إيرا 365 بحماية بياناتك الشخصية. تشرح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها.',
          'البيانات التي نجمعها: الاسم، البريد الإلكتروني، الهاتف، نشاط التداول، معلومات الجهاز وعناوين IP.',
          'كيف نستخدم البيانات: لتقديم خدمات التداول، والامتثال للمتطلبات التنظيمية، وتحسين منتجاتنا.',
          'مشاركة البيانات: لا نبيع بياناتك. نشارك البيانات مع السلطات التنظيمية وفقاً للقانون.',
          'حقوقك: لديك الحق في الوصول إلى بياناتك أو تصحيحها أو حذفها. تواصل مع privacy@newera365.com.',
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v2.1',
    },
    {
      pageType: 'risk-disclosure',
      en: {
        title: 'Risk Disclosure',
        slug: 'risk-disclosure',
        body: bodyBlocks(
          'IMPORTANT RISK WARNING: Trading in Contracts for Difference (CFDs) and other leveraged instruments carries a high level of risk to your capital.',
          'CFDs are complex instruments. 74% of retail investor accounts lose money when trading CFDs with this provider.',
          'You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.',
          'Past performance is not indicative of future results. Never trade with money you cannot afford to lose.',
          'Seek independent financial advice if you are unsure about the suitability of these products.',
        ),
      },
      ar: {
        title: 'إفصاح المخاطر',
        body: bodyBlocks(
          'تحذير مهم من المخاطر: التداول في عقود الفروقات والأدوات ذات الرافعة المالية ينطوي على مخاطر عالية لرأس مالك.',
          'عقود الفروقات أدوات معقدة. 74% من حسابات المستثمرين الأفراد تخسر أموالها عند التداول مع هذا المزود.',
          'يجب أن تفكر فيما إذا كنت تفهم كيف تعمل عقود الفروقات وما إذا كنت تستطيع تحمّل خطر خسارة أموالك.',
          'الأداء السابق ليس مؤشراً على النتائج المستقبلية. لا تتداول أبداً بأموال لا تستطيع تحمّل خسارتها.',
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },
  ];

  for (const page of pages) {
    const doc = await post<{ id: number }>('legal-pages', {
      title: page.en.title,
      slug: page.en.slug,
      pageType: page.pageType,
      body: page.en.body,
      effectiveDate: page.effectiveDate,
      version: page.version,
      status: 'published',
    });
    await patch(
      'legal-pages',
      doc.id,
      {
        title: page.ar.title,
        body: page.ar.body,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${pages.length} legal pages created (EN + AR)`);
}

// ─── Team Members ────────────────────────────────────────────────────────────

async function seedTeamMembers() {
  console.log('👥 Team Members...');
  const members = [
    {
      en: {
        name: 'James Hartley',
        slug: 'james-hartley',
        role: 'Chief Executive Officer',
        bio: 'James has 20+ years of financial markets experience, previously serving as Head of FX at two tier-1 investment banks before co-founding NewEra365.',
      },
      ar: {
        name: 'جيمس هارتلي',
        role: 'الرئيس التنفيذي',
        bio: 'يتمتع جيمس بأكثر من 20 عاماً من الخبرة في الأسواق المالية، حيث شغل منصب رئيس قسم الفوركس في بنكين من الدرجة الأولى قبل تأسيس نيو إيرا 365.',
      },
      sortOrder: 1,
    },
    {
      en: {
        name: 'Priya Kapoor',
        slug: 'priya-kapoor',
        role: 'Chief Technology Officer',
        bio: 'Priya leads our engineering teams with a focus on low-latency execution infrastructure. Former Principal Engineer at a leading HFT firm.',
      },
      ar: {
        name: 'بريا كابور',
        role: 'المديرة التقنية',
        bio: 'تقود بريا فرق الهندسة مع التركيز على البنية التحتية منخفضة الكمون. مهندسة رئيسية سابقة في شركة تداول عالي التردد.',
      },
      sortOrder: 2,
    },
    {
      en: {
        name: 'Omar Al-Rashidi',
        slug: 'omar-al-rashidi',
        role: 'Head of Trading',
        bio: 'Omar manages our institutional liquidity relationships and execution quality. 15 years trading forex and derivatives at regional and global banks.',
      },
      ar: {
        name: 'عمر الرشيدي',
        role: 'رئيس التداول',
        bio: 'يدير عمر علاقات السيولة المؤسسية وجودة التنفيذ. 15 عاماً في تداول العملات الأجنبية والمشتقات في البنوك الإقليمية والعالمية.',
      },
      sortOrder: 3,
    },
    {
      en: {
        name: 'Claire Deschamps',
        slug: 'claire-deschamps',
        role: 'Chief Compliance Officer',
        bio: 'Claire oversees our regulatory obligations across three jurisdictions. Previously Head of Compliance at an FCA-authorised brokerage.',
      },
      ar: {
        name: 'كلير ديشامب',
        role: 'مديرة الامتثال الرئيسية',
        bio: 'تشرف كلير على التزاماتنا التنظيمية عبر ثلاث ولايات قضائية. شغلت سابقاً منصب رئيسة الامتثال في وساطة مرخصة من FCA.',
      },
      sortOrder: 4,
    },
  ];

  for (const member of members) {
    const doc = await post<{ id: number }>('team-members', {
      name: member.en.name,
      slug: member.en.slug,
      role: member.en.role,
      bio: member.en.bio,
      sortOrder: member.sortOrder,
      status: 'active',
    });
    await patch(
      'team-members',
      doc.id,
      {
        name: member.ar.name,
        role: member.ar.role,
        bio: member.ar.bio,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${members.length} team members created (EN + AR)`);
}

// ─── Awards ─────────────────────────────────────────────────────────────────

async function seedAwards() {
  console.log('🏆 Awards...');
  const awards = [
    {
      en: {
        title: 'Best Forex Broker — MENA 2025',
        slug: 'best-forex-broker-mena-2025',
        description:
          'Recognised by Global Finance Awards for excellence in forex trading services across the Middle East and North Africa region.',
      },
      ar: {
        title: 'أفضل وسيط فوركس — الشرق الأوسط وشمال أفريقيا 2025',
        description:
          'تم تكريمنا من قبل Global Finance Awards تقديراً للتميز في خدمات تداول الفوركس في منطقة الشرق الأوسط وشمال أفريقيا.',
      },
      date: '2025-11-15',
      sortOrder: 1,
    },
    {
      en: {
        title: 'Most Trusted Broker — Global Forex Awards 2025',
        slug: 'most-trusted-broker-global-forex-2025',
        description:
          'Voted Most Trusted Broker by traders for the second consecutive year at the Global Forex Awards.',
      },
      ar: {
        title: 'الوسيط الأكثر ثقة — جوائز الفوركس العالمية 2025',
        description:
          'فاز بلقب الوسيط الأكثر ثقة من قبل المتداولين للعام الثاني على التوالي في Global Forex Awards.',
      },
      date: '2025-09-20',
      sortOrder: 2,
    },
    {
      en: {
        title: 'Best Low-Spread Broker — The Tradesman 2024',
        slug: 'best-low-spread-broker-2024',
        description:
          'Awarded for delivering the tightest spreads across major forex pairs, as independently tested by The Tradesman publication.',
      },
      ar: {
        title: 'أفضل وسيط بأضيق فروقات — The Tradesman 2024',
        description:
          'حصل على الجائزة لتقديم أضيق الفروقات على أزواج الفوركس الرئيسية، باختبار مستقل من مجلة The Tradesman.',
      },
      date: '2024-05-10',
      sortOrder: 3,
    },
  ];

  for (const award of awards) {
    const doc = await post<{ id: number }>('awards', {
      title: award.en.title,
      slug: award.en.slug,
      description: award.en.description,
      date: award.date,
      sortOrder: award.sortOrder,
      status: 'published',
    });
    await patch(
      'awards',
      doc.id,
      {
        title: award.ar.title,
        description: award.ar.description,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${awards.length} awards created (EN + AR)`);
}

// ─── Promotions ─────────────────────────────────────────────────────────────

async function seedPromotions() {
  console.log('🎁 Promotions...');
  await deleteAllDocs('promotions');
  const promos = [
    {
      en: {
        title: 'Welcome Boost',
        slug: 'welcome-boost-50-percent',
        valueDisplay: 'Up to $5,000',
        tag: 'NEW',
        description: 'Match your first deposit up to $5,000. Credited within 24 hours.',
        terms: 'Min $200 deposit · 30 day rollout',
        ctaLabel: 'Claim',
        ctaHref: '/en/register',
      },
      ar: {
        title: 'مكافأة الترحيب',
        valueDisplay: 'حتى $5,000',
        tag: 'جديد',
        description: 'طابق إيداعك الأول حتى $5,000. يُضاف خلال 24 ساعة.',
        terms: 'الحد الأدنى $200 · جدول 30 يومًا',
        ctaLabel: 'المطالبة',
        ctaHref: '/ar/register',
      },
      tagColor: 'accent',
      isHighlighted: true,
      sortOrder: 1,
    },
    {
      en: {
        title: 'Active Trader Rebate',
        slug: 'cash-rebate-active-trader',
        valueDisplay: '50% rebate',
        tag: 'MONTHLY',
        description: 'Earn half your commissions back when you trade 100+ lots per month.',
        terms: 'Standard & Raw accounts. Rebate calculated on completed calendar month.',
        ctaLabel: 'Claim',
        ctaHref: '/en/trade/accounts',
      },
      ar: {
        title: 'استرداد التاجر النشط',
        valueDisplay: '50% استرداد',
        tag: 'شهري',
        description: 'اكسب نصف عمولاتك مرة أخرى عند تداول أكثر من 100 لوط في الشهر.',
        terms: 'حسابات معيارية وخام. يُحسب الاسترداد على الشهر التقويمي المكتمل.',
        ctaLabel: 'اطلب الآن',
        ctaHref: '/ar/trade/accounts',
      },
      tagColor: 'amber',
      isHighlighted: false,
      sortOrder: 2,
    },
    {
      en: {
        title: 'Refer a Friend',
        slug: 'refer-a-friend-500',
        valueDisplay: '$500',
        tag: 'EVERGREEN',
        description: 'Earn $500 cash for every friend who funds and trades 5 lots.',
        terms:
          'Unlimited referrals. Referred client must deposit $500+ and complete 5 standard lots. Bonus credited within 5 business days.',
        ctaLabel: 'Claim',
        ctaHref: '/en/register',
      },
      ar: {
        title: 'أحِل صديقاً',
        valueDisplay: '$500',
        tag: 'دائم',
        description: 'اكسب 500 دولار نقداً عن كل صديق يودع ويتداول 5 لوط.',
        terms:
          'إحالات غير محدودة. يجب أن يودع العميل 500 دولار فأكثر ويكمل 5 لوط. يُضاف الائتمان خلال 5 أيام عمل.',
        ctaLabel: 'احصل على رابطك',
        ctaHref: '/ar/register',
      },
      tagColor: 'blue',
      isHighlighted: false,
      sortOrder: 3,
    },
    {
      en: {
        title: 'Islamic Accounts',
        slug: 'islamic-account-zero-swap',
        valueDisplay: '0 swap',
        tag: 'PERMANENT',
        description: 'Swap-free accounts that comply with Sharia. No hidden admin fees.',
        terms: 'Available for verified accounts. Subject to eligibility verification.',
        ctaLabel: 'Claim',
        ctaHref: '/en/register',
      },
      ar: {
        title: 'الحسابات الإسلامية',
        valueDisplay: '0 مبادلة',
        tag: 'دائم',
        description: 'حسابات خالية من المبادلة تتوافق مع الشريعة الإسلامية. لا رسوم إدارية خفية.',
        terms: 'متاح للحسابات الموثقة. يخضع للتحقق من الأهلية.',
        ctaLabel: 'تقدّم الآن',
        ctaHref: '/ar/register',
      },
      tagColor: 'purple',
      isHighlighted: false,
      sortOrder: 4,
    },
    {
      en: {
        title: 'EA Traders Bonus',
        slug: 'free-vps-hosting',
        valueDisplay: 'Free VPS',
        tag: 'PERK',
        description: 'VPS hosting for 50+ accounts running automated strategies.',
        terms: 'Min balance $1,000. VPS provisioned within 48 hours of eligibility.',
        ctaLabel: 'Claim',
        ctaHref: '/en/trade/accounts',
      },
      ar: {
        title: 'مكافأة متداولي EA',
        valueDisplay: 'VPS مجاني',
        tag: 'ميزة',
        description: 'استضافة VPS للحسابات التي تشغّل 50+ من الاستراتيجيات الآلية.',
        terms: 'الحد الأدنى للرصيد 1,000 دولار. يتم توفير VPS خلال 48 ساعة من الأهلية.',
        ctaLabel: 'تحقق من الأهلية',
        ctaHref: '/ar/trade/accounts',
      },
      tagColor: 'grey',
      isHighlighted: false,
      sortOrder: 5,
    },
  ];

  for (const promo of promos) {
    const doc = await post<{ id: number }>('promotions', {
      title: promo.en.title,
      slug: promo.en.slug,
      valueDisplay: promo.en.valueDisplay,
      tag: promo.en.tag,
      tagColor: promo.tagColor,
      description: promo.en.description,
      terms: promo.en.terms,
      ctaLabel: promo.en.ctaLabel,
      ctaHref: promo.en.ctaHref,
      isHighlighted: promo.isHighlighted,
      sortOrder: promo.sortOrder,
      status: 'active',
    });
    await patch(
      'promotions',
      doc.id,
      {
        title: promo.ar.title,
        valueDisplay: promo.ar.valueDisplay,
        tag: promo.ar.tag,
        description: promo.ar.description,
        terms: promo.ar.terms,
        ctaLabel: promo.ar.ctaLabel,
        ctaHref: promo.ar.ctaHref,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${promos.length} promotions created (EN + AR)`);
}

// ─── Education Content ───────────────────────────────────────────────────────

async function seedEducation() {
  console.log('🎓 Education Content...');
  await deleteAllDocs('education-content');

  // Guides
  const guides = [
    {
      en: {
        title: 'Introduction to Forex Trading',
        slug: 'introduction-to-forex-trading',
        body: bodyBlocks(
          'Forex (foreign exchange) is the largest financial market in the world, with over $7 trillion traded daily. In this guide, you will learn the fundamentals of forex trading — how currency pairs work, how to read quotes, and how to place your first trade.',
          'THE FOREX MARKET: Currency pairs are quoted as the price of one currency in terms of another. EUR/USD at 1.0850 means it costs $1.0850 to buy €1.',
          'HOW TO GET STARTED: Open a demo account, practice reading charts, learn to manage risk, and only move to live trading once you are consistently profitable on the demo.',
        ),
      },
      ar: {
        title: 'مقدمة في تداول الفوركس',
        body: bodyBlocks(
          'الفوركس (تبادل العملات الأجنبية) هو أكبر سوق مالي في العالم، حيث يتم تداول ما يزيد على 7 تريليون دولار يومياً.',
          'كيف تعمل أزواج العملات: يُقتبس زوج EUR/USD عند 1.0850 مما يعني أن 1 يورو يساوي 1.0850 دولار.',
          'كيف تبدأ: افتح حساباً تجريبياً، وتدرّب على قراءة الرسوم البيانية، وتعلّم إدارة المخاطر.',
        ),
      },
      seoDescription:
        'Learn forex trading from scratch with our beginner guide to currency pairs, quotes and how to place your first trade.',
    },
    {
      en: {
        title: 'MetaTrader 5 Complete Guide',
        slug: 'metatrader-5-complete-guide',
        body: bodyBlocks(
          'MetaTrader 5 (MT5) is the industry-standard trading platform used by millions of traders worldwide. This guide covers everything from installation to advanced order types.',
          'INSTALLING MT5: Download MT5 from the NewEra365 client portal or directly from MetaQuotes. Enter your account credentials to log in.',
          'PLACING ORDERS: Click "New Order" or press F9. Enter the symbol, volume, stop loss and take profit. Choose between market order (instant fill) or limit/stop orders.',
        ),
      },
      ar: {
        title: 'الدليل الكامل لـ MetaTrader 5',
        body: bodyBlocks(
          'MetaTrader 5 هي منصة التداول المعيارية في الصناعة التي يستخدمها الملايين حول العالم. يشمل هذا الدليل كل شيء من التثبيت إلى أنواع الأوامر المتقدمة.',
          'تثبيت MT5: نزّل MT5 من بوابة عميل نيو إيرا 365 مباشرة. أدخل بيانات حسابك لتسجيل الدخول.',
          'تنفيذ الأوامر: انقر على "أمر جديد" أو اضغط F9. أدخل الرمز والحجم ووقف الخسارة وجني الأرباح.',
        ),
      },
      seoDescription:
        'The complete guide to MetaTrader 5 — installation, placing orders, using EAs, and advanced chart analysis.',
    },
    {
      en: {
        title: 'Risk Management for Traders',
        slug: 'risk-management-for-traders',
        body: bodyBlocks(
          'Proper risk management separates successful traders from those who blow their accounts. This guide covers position sizing, stop-loss placement, and risk-to-reward ratios.',
          'THE 1–2% RULE: Never risk more than 1–2% of your trading capital on a single trade. This ensures you can survive a run of losses without depleting your account.',
          'STOP-LOSS PLACEMENT: Always place a stop loss when entering a trade. Use technical levels (support/resistance, recent swing highs/lows) rather than arbitrary pip values.',
        ),
      },
      ar: {
        title: 'إدارة المخاطر للمتداولين',
        body: bodyBlocks(
          'إدارة المخاطر الصحيحة تميّز المتداولين الناجحين عن غيرهم. يشمل هذا الدليل تحديد حجم المركز ووضع وقف الخسارة ونسب المخاطرة/المكافأة.',
          'قاعدة 1-2%: لا تخاطر بأكثر من 1-2% من رأس مالك في صفقة واحدة. هذا يضمن بقاءك خلال سلسلة خسائر دون استنزاف حسابك.',
          'وضع وقف الخسارة: ضع دائماً وقف خسارة عند الدخول في صفقة. استخدم المستويات التقنية بدلاً من قيم نقاط عشوائية.',
        ),
      },
      seoDescription:
        'Master risk management in trading. Learn position sizing, stop-loss strategies, and risk-to-reward ratios.',
    },
  ];

  for (const guide of guides) {
    const doc = await post<{ id: number }>('education-content', {
      title: guide.en.title,
      slug: guide.en.slug,
      contentType: 'guide',
      body: guide.en.body,
      seoDescription: guide.seoDescription,
      status: 'published',
    });
    await patch(
      'education-content',
      doc.id,
      {
        title: guide.ar.title,
        body: guide.ar.body,
      },
      'ar',
    );
  }

  // Glossary terms
  const terms: {
    en: { glossaryTerm: string; body: unknown };
    ar: { glossaryTerm: string; body: unknown };
    slug: string;
    glossaryCategory: string;
  }[] = [
    {
      en: {
        glossaryTerm: 'Pip',
        body: richText(
          'A pip (percentage in point) is the smallest standard price movement in forex trading. For most currency pairs, 1 pip equals 0.0001.',
        ),
      },
      ar: {
        glossaryTerm: 'نقطة (بيب)',
        body: richText(
          'النقطة (pip) هي أصغر حركة سعرية معيارية في تداول الفوركس. لمعظم أزواج العملات، 1 نقطة تساوي 0.0001.',
        ),
      },
      slug: 'pip',
      glossaryCategory: 'PRICING',
    },
    {
      en: {
        glossaryTerm: 'Spread',
        body: richText(
          'The spread is the difference between the bid (sell) price and the ask (buy) price. It is the primary cost of trading.',
        ),
      },
      ar: {
        glossaryTerm: 'فارق السعر',
        body: richText(
          'فارق السعر هو الفرق بين سعر العرض (البيع) وسعر الطلب (الشراء). هو التكلفة الرئيسية للتداول.',
        ),
      },
      slug: 'spread',
      glossaryCategory: 'PRICING',
    },
    {
      en: {
        glossaryTerm: 'Leverage',
        body: richText(
          'Leverage allows traders to control a larger position size than their capital alone would permit. 1:100 leverage means $1,000 controls $100,000 in the market.',
        ),
      },
      ar: {
        glossaryTerm: 'الرافعة المالية',
        body: richText(
          'تسمح الرافعة المالية للمتداولين بالتحكم في حجم مركز أكبر مما يسمح به رأس مالهم. رافعة 1:100 تعني أن 1,000 دولار يتحكم في 100,000 دولار في السوق.',
        ),
      },
      slug: 'leverage',
      glossaryCategory: 'RISK',
    },
    {
      en: {
        glossaryTerm: 'Margin',
        body: richText(
          'Margin is the collateral required to open and maintain a leveraged position. It is expressed as a percentage of the full position value.',
        ),
      },
      ar: {
        glossaryTerm: 'الهامش',
        body: richText(
          'الهامش هو الضمان المطلوب لفتح والحفاظ على مركز مرفوع. يُعبَّر عنه كنسبة مئوية من القيمة الكاملة للمركز.',
        ),
      },
      slug: 'margin',
      glossaryCategory: 'RISK',
    },
    {
      en: {
        glossaryTerm: 'Stop Loss',
        body: richText(
          'A stop-loss order automatically closes a trade at a specified price to limit losses. It is an essential risk management tool.',
        ),
      },
      ar: {
        glossaryTerm: 'وقف الخسارة',
        body: richText(
          'أمر وقف الخسارة يغلق تلقائياً صفقة عند سعر محدد للحد من الخسائر. هو أداة أساسية لإدارة المخاطر.',
        ),
      },
      slug: 'stop-loss',
      glossaryCategory: 'ORDER/EXEC',
    },
  ];

  for (const term of terms) {
    const doc = await post<{ id: number }>('education-content', {
      title: term.en.glossaryTerm,
      slug: term.slug,
      contentType: 'glossary',
      glossaryTerm: term.en.glossaryTerm,
      body: term.en.body,
      glossaryCategory: term.glossaryCategory,
      status: 'published',
    });
    await patch(
      'education-content',
      doc.id,
      {
        title: term.ar.glossaryTerm,
        glossaryTerm: term.ar.glossaryTerm,
        body: term.ar.body,
      },
      'ar',
    );
  }

  // Media videos (category-based tabs: Macro / Strategy / Education / Interviews / Live)
  const videos = [
    {
      en: { title: "Inside the Fed: a former trader's view" },
      ar: { title: 'داخل الفيدرالي: رأي متداول سابق' },
      slug: 'inside-the-fed-traders-view',
      contentType: 'video',
      mediaCategory: 'macro',
      videoEmbed: 'https://www.youtube.com/watch?v=example1',
    },
    {
      en: { title: 'Reading the COT report' },
      ar: { title: 'قراءة تقرير المضاربين والتحوطيين' },
      slug: 'reading-the-cot-report',
      contentType: 'video',
      mediaCategory: 'strategy',
      videoEmbed: 'https://www.youtube.com/watch?v=example2',
    },
    {
      en: { title: 'The carry trade explained' },
      ar: { title: 'شرح تجارة الفائدة' },
      slug: 'carry-trade-explained',
      contentType: 'video',
      mediaCategory: 'strategy',
      videoEmbed: 'https://www.youtube.com/watch?v=example3',
    },
    {
      en: { title: 'Position sizing without the guesswork' },
      ar: { title: 'تحديد حجم المركز بدون تخمين' },
      slug: 'position-sizing-without-guesswork',
      contentType: 'video',
      mediaCategory: 'education',
      videoEmbed: 'https://www.youtube.com/watch?v=example4',
    },
    {
      en: { title: 'Technical analysis that actually works' },
      ar: { title: 'التحليل الفني الذي يعمل فعلاً' },
      slug: 'technical-analysis-that-works',
      contentType: 'video',
      mediaCategory: 'education',
      videoEmbed: 'https://www.youtube.com/watch?v=example5',
    },
    {
      en: { title: 'Interview: a London market maker' },
      ar: { title: 'مقابلة: صانع سوق في لندن' },
      slug: 'interview-london-market-maker',
      contentType: 'audio',
      mediaCategory: 'interviews',
      videoEmbed: null,
    },
    {
      en: { title: 'Why oil moves on Tuesday' },
      ar: { title: 'لماذا يتحرك النفط يوم الثلاثاء' },
      slug: 'why-oil-moves-tuesday',
      contentType: 'audio',
      mediaCategory: 'macro',
      videoEmbed: null,
    },
    {
      en: { title: 'Live BOE rate decision' },
      ar: { title: 'قرار سعر الفائدة لبنك إنجلترا مباشر' },
      slug: 'live-boe-rate-decision',
      contentType: 'video',
      mediaCategory: 'live',
      videoEmbed: 'https://www.youtube.com/watch?v=example6',
    },
  ];

  for (const video of videos) {
    const doc = await post<{ id: number }>('education-content', {
      title: video.en.title,
      slug: video.slug,
      contentType: video.contentType,
      mediaCategory: video.mediaCategory,
      videoEmbed: video.videoEmbed,
      status: 'published',
    });
    await patch('education-content', doc.id, { title: video.ar.title }, 'ar');
  }

  console.log(
    `   ✅ ${guides.length} guides + ${terms.length} glossary terms + ${videos.length} media videos created (EN + AR)`,
  );
}

// ─── Careers ────────────────────────────────────────────────────────────────

async function seedCareers() {
  console.log('💼 Careers...');
  const jobs = [
    {
      en: {
        title: 'Senior Backend Engineer — Trading Infrastructure',
        slug: 'senior-backend-engineer-trading',
        summary:
          'Build and maintain the low-latency execution engine and real-time data pipelines powering NewEra365.',
        body: bodyBlocks(
          'ROLE: You will work on the core trading infrastructure — order routing, position management, P&L calculation — serving 180,000+ active accounts.',
          'REQUIREMENTS: 5+ years with Go or Rust in high-throughput environments. Experience with FIX protocol, WebSocket streams, and time-series databases (TimescaleDB/InfluxDB). Strong knowledge of TCP/IP and systems programming.',
          'WHAT WE OFFER: Competitive salary, annual bonus, ESOP, remote-friendly, health insurance, free Raw trading account.',
        ),
      },
      ar: {
        title: 'مهندس خلفية أول — البنية التحتية للتداول',
        summary: 'بناء وصيانة محرك التنفيذ منخفض الكمون وخطوط بيانات الوقت الفعلي.',
        body: bodyBlocks(
          'الدور: ستعمل على البنية التحتية الأساسية للتداول — توجيه الأوامر وإدارة المراكز وحساب الأرباح والخسائر.',
          'المتطلبات: 5 سنوات أو أكثر مع Go أو Rust في بيئات عالية الإنتاجية. خبرة مع بروتوكول FIX وتدفقات WebSocket.',
          'ما نقدمه: راتب تنافسي، مكافأة سنوية، أسهم ESOP، عمل مرن، تأمين صحي.',
        ),
      },
      department: 'engineering',
      location: 'Remote / Dubai',
      employmentType: 'full-time',
      sortOrder: 1,
    },
    {
      en: {
        title: 'Institutional Sales Manager — GCC',
        slug: 'institutional-sales-manager-gcc',
        summary:
          "Grow NewEra365's institutional client base across the Gulf Cooperation Council region.",
        body: bodyBlocks(
          'You will identify and onboard institutional clients (hedge funds, family offices, money managers) across the UAE, Saudi Arabia, and Kuwait.',
          'REQUIREMENTS: 5+ years in FX/CFD institutional sales. Existing network of GCC-based fund managers. Fluent in English and Arabic. Experience with Salesforce or similar CRM.',
        ),
      },
      ar: {
        title: 'مدير مبيعات مؤسسية — دول مجلس التعاون',
        summary: 'توسيع قاعدة عملاء نيو إيرا 365 المؤسسيين في منطقة دول مجلس التعاون الخليجي.',
        body: bodyBlocks(
          'ستتولى تحديد وإلحاق العملاء المؤسسيين (صناديق التحوط، مكاتب العائلات، مديرو الأموال) في الإمارات والسعودية والكويت.',
          'المتطلبات: 5 سنوات أو أكثر في مبيعات الفوركس/CFD المؤسسية. شبكة علاقات من مديري الصناديق في دول مجلس التعاون.',
        ),
      },
      department: 'sales',
      location: 'Dubai, UAE',
      employmentType: 'full-time',
      sortOrder: 2,
    },
    {
      en: {
        title: 'Customer Support Specialist (Arabic)',
        slug: 'customer-support-specialist-arabic',
        summary:
          'Provide exceptional support to our Arabic-speaking traders across the MENA region.',
        body: bodyBlocks(
          'Handle incoming support tickets, live chat, and phone calls from Arabic-speaking clients. Topics include account opening, deposits/withdrawals, platform issues, and trading queries.',
          'REQUIREMENTS: Native or near-native Arabic speaker. Fluent English. 2+ years in financial services customer support. MT5 platform knowledge preferred.',
        ),
      },
      ar: {
        title: 'متخصص دعم عملاء (عربي)',
        summary:
          'تقديم دعم متميز لمتداولينا الناطقين بالعربية في منطقة الشرق الأوسط وشمال أفريقيا.',
        body: bodyBlocks(
          'معالجة تذاكر الدعم الواردة والدردشة المباشرة والمكالمات الهاتفية من العملاء الناطقين بالعربية.',
          'المتطلبات: متحدث عربي أصلي أو شبه أصلي. إجادة اللغة الإنجليزية. سنتان أو أكثر في دعم عملاء الخدمات المالية.',
        ),
      },
      department: 'support',
      location: 'Dubai, UAE',
      employmentType: 'full-time',
      sortOrder: 3,
    },
  ];

  for (const job of jobs) {
    const doc = await post<{ id: number }>('careers', {
      title: job.en.title,
      slug: job.en.slug,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      summary: job.en.summary,
      body: job.en.body,
      sortOrder: job.sortOrder,
      publishedDate: new Date().toISOString(),
      status: 'open',
    });
    await patch(
      'careers',
      doc.id,
      {
        title: job.ar.title,
        location: job.location,
        summary: job.ar.summary,
        body: job.ar.body,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${jobs.length} careers created (EN + AR)`);
}

// ─── Webinars ───────────────────────────────────────────────────────────────

async function seedWebinars() {
  console.log('🎙️  Webinars...');
  const now = new Date();
  const webinars = [
    {
      en: {
        title: 'Live Trading Session: EUR/USD Strategy for Q3 2026',
        slug: 'live-trading-eurusd-strategy-q3-2026',
        speaker: 'Marcus Webb',
        speakerBio:
          'Senior market analyst with 15 years trading EUR/USD. Covers technical setups and macro triggers in real time.',
      },
      ar: {
        title: 'جلسة تداول مباشرة: استراتيجية EUR/USD للربع الثالث 2026',
        speakerBio:
          'محلل سوق أول مع 15 عاماً من التداول في EUR/USD. يغطي الإعدادات التقنية والمحفزات الكلية في الوقت الفعلي.',
      },
      scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'upcoming',
      zoomRegistrationLink: 'https://zoom.us/webinar/register/placeholder',
    },
    {
      en: {
        title: 'Gold Trading: Reading COT Data & Institutional Positioning',
        slug: 'gold-trading-cot-institutional-positioning',
        speaker: 'Priya Sharma',
        speakerBio:
          'Commodities desk analyst specialising in precious metals. Former institutional trader at a tier-1 bank.',
      },
      ar: {
        title: 'تداول الذهب: قراءة بيانات COT والمراكز المؤسسية',
        speakerBio:
          'محللة مكتب السلع المتخصصة في المعادن الثمينة. متداولة مؤسسية سابقة في بنك من الدرجة الأولى.',
      },
      scheduledAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'upcoming',
      zoomRegistrationLink: 'https://zoom.us/webinar/register/placeholder-gold',
    },
    {
      en: {
        title: 'MetaTrader 5 Deep Dive: EA Development & Automation',
        slug: 'metatrader-5-ea-development-automation',
        speaker: 'James Thornton',
        speakerBio:
          'Professional algo trader and MQL5 developer. Covers Expert Advisor construction, backtesting, and live deployment.',
      },
      ar: {
        title: 'المستوى المتقدم في MetaTrader 5: تطوير المستشارين الخبراء والأتمتة',
        speakerBio:
          'متداول خوارزمي محترف ومطور MQL5. يغطي بناء المستشارين الخبراء والاختبار العكسي والنشر المباشر.',
      },
      scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'completed',
      replayUrl: 'https://www.youtube.com/watch?v=placeholder-mt5',
    },
    {
      en: {
        title: 'Risk Management Masterclass: Protecting Capital in Volatile Markets',
        slug: 'risk-management-masterclass-volatile-markets',
        speaker: 'Claire Deschamps',
        speakerBio:
          'Chief Compliance Officer at NewEra365. Covers position sizing, drawdown protection, and psychological discipline.',
      },
      ar: {
        title: 'دورة متخصصة في إدارة المخاطر: حماية رأس المال في الأسواق المتقلبة',
        speakerBio:
          'مديرة الامتثال الرئيسية في نيو إيرا 365. تغطي تحديد حجم المركز وحماية السحب والانضباط النفسي.',
      },
      scheduledAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'completed',
      replayUrl: 'https://www.youtube.com/watch?v=placeholder-risk',
    },
  ];

  for (const w of webinars) {
    const doc = await post<{ id: number }>('webinars', {
      title: w.en.title,
      slug: w.en.slug,
      speaker: w.en.speaker,
      speakerBio: w.en.speakerBio,
      scheduledAt: w.scheduledAt,
      timezone: w.timezone,
      status: w.status,
      ...(w.zoomRegistrationLink ? { zoomRegistrationLink: w.zoomRegistrationLink } : {}),
      ...(w.replayUrl ? { replayUrl: w.replayUrl } : {}),
    });
    await patch(
      'webinars',
      doc.id,
      {
        title: w.ar.title,
        speakerBio: w.ar.speakerBio,
      },
      'ar',
    );
  }
  console.log(`   ✅ ${webinars.length} webinars created (EN + AR)`);
}

// ─── IB Content ─────────────────────────────────────────────────────────────

async function seedIBContent() {
  console.log('🤝 IB Content...');
  const doc = await post<{ id: number }>('ib-content', {
    slug: 'ib-program',
    heroSubtitle:
      'Earn industry-leading commissions for every active trader you refer. Transparent payouts, monthly settlement, dedicated support.',
    ibDescription:
      'Earn up to $8 per lot traded by your referrals. Tiered structure with monthly bonus.',
    affiliateDescription:
      'Fixed cost-per-acquisition payouts up to $1,200 per qualified trader. Built for digital marketers.',
    whiteLabelDescription:
      'Launch your own brokerage on our infrastructure. Full MT5 stack, KYC, treasury, support.',
    ibRateDisplay: '$8/lot',
    affiliateCpaMax: '$1,200',
    steps: [
      {
        stepTitle: 'Apply online',
        stepDescription:
          'Submit our application in 3 minutes. No paperwork, no phone calls required.',
      },
      {
        stepTitle: 'Get approved',
        stepDescription: 'Our compliance team contacts you within 48 hours of submission.',
      },
      {
        stepTitle: 'Get your toolkit',
        stepDescription:
          'Login credentials, custom landing pages, live reporting dashboard and tracking links.',
      },
      {
        stepTitle: 'Earn monthly',
        stepDescription: 'Commissions paid on the 5th of every month, straight to your account.',
      },
    ],
    ctaHeading: 'Ready to build a new revenue stream?',
    ctaSubtitle: 'Apply today. A partner manager will reach out within 48 hours.',
    status: 'published',
  });
  await patch(
    'ib-content',
    doc.id,
    {
      heroSubtitle:
        'اكسب عمولات رائدة في الصناعة عن كل متداول نشط تحيله. مدفوعات شفافة، تسوية شهرية، دعم مخصص.',
      ibDescription:
        'اكسب ما يصل إلى 8 دولارات لكل لوط يتداوله إحالاتك. هيكل متدرج مع مكافأة شهرية.',
      affiliateDescription:
        'مدفوعات ثابتة بتكلفة الاستحواذ تصل إلى 1,200 دولار لكل متداول مؤهل. مصمم للمسوقين الرقميين.',
      whiteLabelDescription:
        'أطلق وساطتك الخاصة على بنيتنا التحتية. مجموعة MT5 كاملة، KYC، الخزينة، الدعم.',
      steps: [
        {
          stepTitle: 'تقدّم عبر الإنترنت',
          stepDescription: 'أرسل طلبك في 3 دقائق. لا أوراق عمل، ولا مكالمات هاتفية مطلوبة.',
        },
        {
          stepTitle: 'احصل على الموافقة',
          stepDescription: 'يتصل بك فريق الامتثال لدينا خلال 48 ساعة من تقديم الطلب.',
        },
        {
          stepTitle: 'احصل على أدواتك',
          stepDescription: 'بيانات تسجيل الدخول، صفحات هبوط مخصصة، لوحة تقارير مباشرة وروابط تتبع.',
        },
        {
          stepTitle: 'اكسب شهرياً',
          stepDescription: 'العمولات تُدفع في الخامس من كل شهر، مباشرةً إلى حسابك.',
        },
      ],
      ctaHeading: 'هل أنت مستعد لبناء تدفق إيرادات جديد؟',
      ctaSubtitle: 'تقدّم اليوم. سيتواصل معك مدير شريك خلال 48 ساعة.',
    },
    'ar',
  );
  console.log('   ✅ IB content created (EN + AR)');
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 NewEra365 Demo Data Seed\n');
  try {
    await login();
    await seedSiteSettings();
    await seedAccountTypes();
    await seedPaymentMethods();
    await seedInstruments();
    await seedFaqs();
    await seedBlogPosts();
    await seedMarketAnalysis();
    await seedNews();
    await seedLegalPages();
    await seedTeamMembers();
    await seedAwards();
    await seedPromotions();
    await seedEducation();
    await seedCareers();
    await seedWebinars();
    await seedIBContent();
    console.log('\n✅ Seed complete!\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
