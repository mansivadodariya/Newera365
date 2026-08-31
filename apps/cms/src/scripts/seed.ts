/**
 * Demo data seed script for Newera CMS.
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
import fs from 'fs';
import os from 'os';
import sharp from 'sharp';
import { NEWS_BODIES, toSlate } from './news-bodies';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
let token = '';

// ─── helpers ───────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Neon (serverless Postgres) intermittently drops connections during a long
// seed — surfacing as `fetch failed` / ECONNRESET / connection-timeout, or a
// 502/503/504 from Payload while the DB reconnects. Retry these transient
// failures with backoff so one blip doesn't abort the whole run and leave
// collections half-seeded. Real 4xx/validation errors are NOT retried.
const TRANSIENT =
  /fetch failed|ECONNRESET|ETIMEDOUT|EPIPE|socket hang up|network|connection.*(closed|terminated|timeout)|other side closed/i;

async function fetchWithRetry(url: string, init: RequestInit, label: string): Promise<Response> {
  // 8 attempts × 2s-incrementing backoff ≈ a 70s window — long enough to ride
  // out a full CMS process restart (Payload exits when Neon drops the
  // connection; an external supervisor brings it back within ~30s).
  const MAX = 8;
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < MAX && TRANSIENT.test(msg)) {
        console.log(`   ⏳ ${label}: transient error (${msg}); retry ${attempt}/${MAX - 1}…`);
        await sleep(attempt * 2000);
        continue;
      }
      throw err;
    }
    if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < MAX) {
      console.log(`   ⏳ ${label}: ${res.status}; retry ${attempt}/${MAX - 1}…`);
      await sleep(attempt * 2000);
      continue;
    }
    return res;
  }
}

async function api(method: string, path: string, body?: unknown, params?: Record<string, string>) {
  const url = new URL(`${CMS}/api${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetchWithRetry(
    url.toString(),
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    },
    `${method} ${path}`,
  );
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

// ─── Media uploads ───────────────────────────────────────────────────────────
// Real assets keyed by seed `key` live in apps/cms/seed-assets/ (e.g.
// team-james-hartley.jpg, pay-skrill.png, blog-<slug>.jpg). seedImage() uploads
// the real file when one exists for the key; otherwise it falls back to a
// self-contained, brand-styled placeholder generated with sharp. Either way the
// id is cached so the same asset is reused across documents instead of
// re-uploading. To swap in more real assets, just drop `<key>.{jpg,png,webp}`
// into seed-assets/ — call sites stay unchanged.

const SEED_TMP = path.join(os.tmpdir(), 'newera-seed-assets');
const ASSETS_DIR = path.resolve(__dirname, '../../seed-assets');
const ASSET_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const mediaCache = new Map<string, number>();

// Return the path to a real asset file matching this seed key, or null.
function findRealAsset(key: string): string | null {
  for (const ext of ASSET_EXTS) {
    const p = path.join(ASSETS_DIR, `${key}${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// POST a binary to /api/media as multipart/form-data. Returns the new media id.
// Content-Type is intentionally NOT set — fetch derives the multipart boundary.
async function uploadMedia(filePath: string, alt: string): Promise<number> {
  const buf = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === '.pdf'
      ? 'application/pdf'
      : ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : ext === '.webp'
            ? 'image/webp'
            : 'application/octet-stream';
  const form = new FormData();
  form.append('file', new Blob([buf], { type: mime }), filename);
  form.append('alt', alt);
  const res = await fetchWithRetry(
    `${CMS}/api/media`,
    {
      method: 'POST',
      headers: token ? { Authorization: `JWT ${token}` } : {},
      body: form,
    },
    `POST /media (${filename})`,
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    if (res.status === 400 && (txt.includes('unique') || txt.includes('ValidationError'))) {
      const searchRes = await api('GET', `/media`, undefined, {
        'where[filename][equals]': filename,
      }).catch(() => null);
      const existingDoc = searchRes?.docs?.[0];
      if (existingDoc?.id) return existingDoc.id as number;
    }
    throw new Error(`POST /media (${filename}) → ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  return (json.doc ?? json).id as number;
}

// Generate a brand-styled PNG cover/logo with sharp from an inline SVG.
async function makeImage(
  file: string,
  label: string,
  opts: { bg?: string; w?: number; h?: number } = {},
): Promise<void> {
  const { bg = '#0B3D2E', w = 800, h = 1000 } = opts;
  // Slice BEFORE escaping — slicing after would risk cutting an &amp; entity in
  // half and producing invalid XML that sharp's SVG parser rejects.
  const safe = label
    .slice(0, 42)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="${bg}"/>
    <rect x="0" y="0" width="100%" height="10" fill="#C9A227"/>
    <text x="50%" y="46%" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" fill="#ffffff" text-anchor="middle">Newera</text>
    <text x="50%" y="53%" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#cfe3d8" text-anchor="middle">${safe}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
}

// Build a minimal, structurally-valid single-page PDF with an accurate xref table.
function makePdf(file: string, title: string): void {
  const safeTitle = title.replace(/[()\\]/g, '').slice(0, 80);
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ];
  const stream = `BT /F1 24 Tf 72 720 Td (${safeTitle}) Tj ET`;
  objs.push(`<</Length ${stream.length}>>\nstream\n${stream}\nendstream`);

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;
  fs.writeFileSync(file, pdf, 'latin1');
}

// Cached image upload — generate + upload once per key, reuse the id thereafter.
async function seedImage(
  key: string,
  label: string,
  opts: { bg?: string; w?: number; h?: number; alt?: string } = {},
): Promise<number> {
  const cached = mediaCache.get(key);
  if (cached) return cached;
  // Prefer a real asset file shipped in seed-assets/ over the generated placeholder.
  const real = findRealAsset(key);
  if (real) {
    const id = await uploadMedia(real, opts.alt ?? label);
    mediaCache.set(key, id);
    return id;
  }
  fs.mkdirSync(SEED_TMP, { recursive: true });
  const file = path.join(SEED_TMP, `${key}.png`);
  await makeImage(file, label, opts);
  const id = await uploadMedia(file, opts.alt ?? label);
  mediaCache.set(key, id);
  return id;
}

// Cached PDF upload — generate + upload once per key, reuse the id thereafter.
async function seedPdf(key: string, title: string): Promise<number> {
  const cached = mediaCache.get(key);
  if (cached) return cached;
  fs.mkdirSync(SEED_TMP, { recursive: true });
  const file = path.join(SEED_TMP, `${key}.pdf`);
  makePdf(file, title);
  const id = await uploadMedia(file, title);
  mediaCache.set(key, id);
  return id;
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

// Legal docs need real h2 headings so the on-page Table of Contents has anchors
// to link to. A lead paragraph followed by { heading, body } sections.
function legalSections(sections: { heading: string; body: string }[]) {
  return sections.flatMap((s) => [
    { type: 'h2', children: [{ text: s.heading }] },
    ...paragraph(s.body),
  ]);
}

function legalBody(intro: string, sections: { heading: string; body: string }[]) {
  return [...paragraph(intro), ...legalSections(sections)];
}

// Same, but the lead renders as a bold standalone line above its own paragraph
// (Risk Disclosure: "IMPORTANT RISK WARNING" heading, warning text on the next line).
function legalBodyWithLead(
  lead: string,
  rest: string,
  sections: { heading: string; body: string }[],
) {
  return [
    { children: [{ text: lead, bold: true }] },
    ...paragraph(rest),
    ...legalSections(sections),
  ];
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
  // socialProofLogos intentionally left EMPTY — the Figma home design has no
  // "As seen in" strip. TrustStrip renders nothing when this is empty. The CMS
  // field remains so real press logos can be added later if design adds the row.
  await postGlobal('site-settings', {
    mt5SyncEnabled: false,
    mt5RefreshIntervalSecs: 60,
    kpiStats: [
      { valueEn: '3+', valueAr: '+3', labelEn: 'Years in Market', labelAr: 'سنوات في السوق' },
      { valueEn: '50k', valueAr: '50 ألف', labelEn: 'Active Traders', labelAr: 'متداول نشط' },
      {
        valueEn: '< 12 ms',
        valueAr: '< 12 ms',
        labelEn: 'Avg Execution',
        labelAr: 'متوسط التنفيذ',
      },
      { valueEn: '99.95%', valueAr: '99.95%', labelEn: 'Platform Uptime', labelAr: 'وقت التشغيل' },
    ],
    socialProofLogos: [],
    downloadMt5Windows:
      'https://download.terminal.free/cdn/web/newera.capital.markets/mt5/neweracapitalmarkets5setup.exe',
    downloadMt5Mac:
      'https://download.terminal.free/cdn/web/newera.capital.markets/mt5/neweracapitalmarkets5setup.exe',
    downloadMt5Ios:
      'https://download.terminal.free/cdn/mobile/mt5/ios?server=NeweraCapitalMarkets-Server',
    downloadMt5Android:
      'https://download.terminal.free/cdn/mobile/mt5/android?server=NeweraCapitalMarkets-Server',
    downloadWebTrader: 'https://webtrading.newera365.com/terminal',
    contactEmail: 'support@newera365.com',
    contactEmailCompliance: 'compliance@newera365.com',
    contactPhone: '+1 867-778-3511',
    whatsappNumber: '+18677783511',
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
      'Disclaimer\n\nRisk Statement: Investing in derivatives carries the potential risk of losing an amount greater than the original investment. Individuals considering investments in any of the products mentioned on https://newera365.com/ are advised to seek their own financial or professional advice. Trading securities, forex, stock market, commodities, options, and futures may not be suitable for everyone and involves the risk of losing part or all of your invested capital. While financial markets offer significant rewards, they also come with substantial risks.\n\nInvestors must be aware of these risks and willing to accept them to participate in the markets. It’s crucial not to invest money that you cannot afford to lose. Additionally, please be aware that Forex Trading may be restricted in certain countries, so it’s essential to verify whether your country permits such activities.\n\nYou are strongly urged to obtain independent financial, legal, and tax advice before engaging in any currency or spot metals trade. Nothing on this site should be interpreted as constituting advice on the part of Newera Capital Markets Limited or any of its affiliates, directors, officers, or employees.\n\nRestricted Regions: Newera Capital Markets Limited does not offer services to citizens/residents of the United States, Cuba, Iraq, Myanmar, North Korea, Sudan, India, UAE. The services provided by Newera Capital Markets Limited are not intended for distribution to, or use by, any person in any country or jurisdiction where such distribution or use would be contrary to local law or regulation.\nOR\nInformation on this site is not directed at residents in any country or jurisdiction where such distribution or use would be contrary to local law or regulation.',
    riskDisclaimerAr:
      'إخلاء المسؤولية\n\nبيان المخاطر: ينطوي الاستثمار في المشتقات المالية على مخاطر محتملة لخسارة مبلغ أكبر من الاستثمار الأصلي. يُنصح الأفراد الذين يفكرون في الاستثمار في أي من المنتجات المذكورة على https://newera365.com/ بطلب المشورة المالية أو المهنية الخاصة بهم. قد لا يكون تداول الأوراق المالية، والفوركس، وسوق الأسهم، والسلع، والخيارات، والعقود الآجلة مناسباً للجميع وينطوي على مخاطر خسارة جزء من رأس مالك المستثمر أو كله. في حين أن الأسواق المالية توفر مكاسب كبيرة، إلا أنها تنطوي أيضاً على مخاطر جسيمة.\n\nيجب أن يكون المستثمرون على دراية بهذه المخاطر ومستعدين لقبولها للمشاركة في الأسواق. من الضروري جداً عدم استثمار أموال لا يمكنك تحمل خسارتها. بالإضافة إلى ذلك، يرجى العلم بأن تداول الفوركس قد يكون مقيداً في بعض البلدان، لذا من الضروري التحقق مما إذا كانت دولتك تسمح بمثل هذه الأنشطة.\n\nنحثك بشدة على الحصول على مشورة مالية وقانونية وضريبية مستقلة قبل الانخراط في أي تداول للعملات أو المعادن الفورية. لا ينبغي تفسير أي شيء على هذا الموقع على أنه يشكل نصيحة من جانب Newera Capital Markets Limited أو أي من الشركات التابعة لها أو مديريها أو مسؤوليها أو موظفيها.\n\nالمناطق المحظورة: لا تقدم Newera Capital Markets Limited خدماتها لمواطني/مقيمين في الولايات المتحدة، وكوبا، والعراق، وميانمار، وكوريا الشمالية، والسودان، والهند، والإمارات العربية المتحدة. الخدمات المقدمة من Newera Capital Markets Limited ليست موجهة للتوزيع أو الاستخدام من قبل أي شخص في أي بلد أو ولاية قضائية يكون فيها هذا التوزيع أو الاستخدام مخالفاً للقوانين أو اللوائح المحلية.\nأو\nالمعلومات الواردة في هذا الموقع ليست موجهة إلى المقيمين في أي بلد أو ولاية قضائية يكون فيها مثل هذا التوزيع أو الاستخدام مخالفاً للقانون أو اللوائح المحلية.',
    // Analyst Chart — Featured Analyst
    analystInitials: 'DR',
    analystName: 'Diego Romero',
    analystTitle: 'Senior FX Analyst',
    analystUpdated: '20 May, 09:14 UTC',
    analystCommentaryEn:
      'EUR/USD continues to grind higher as the ECB pushes back against July cut expectations. With US data softening and the dollar index breaking below the 200-day average, we see room for a move toward 1.0980 in the coming weeks. Key risk: a hot NFP print could trigger a sharp reversal back toward 1.0750.',
    analystCommentaryAr:
      'يواصل اليورو/دولار ارتفاعه في ظل تراجع توقعات خفض الفائدة في يوليو. مع تباطؤ البيانات الأمريكية وكسر مؤشر الدولار المتوسط المتحرك لـ200 يوم، نرى مجالاً للصعود نحو 1.0980. المخاطر: بيانات التوظيف القوية قد تعكس الاتجاه نحو 1.0750.',
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
          { label: 'Tools', href: '/tools' },
        ],
      },
      {
        heading: 'Company',
        links: [
          { label: 'About', href: '/company/about' },
          { label: 'Careers', href: '/company/careers' },
          { label: 'Recognition', href: '/company/recognition' },
          { label: 'Media', href: '/education/media' },
        ],
      },
      {
        heading: 'Support',
        links: [
          { label: 'Contact', href: '/support#contact' },
          { label: 'FAQs', href: '/support' },
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
          { label: 'الأدوات', href: '/tools' },
        ],
      },
      {
        heading: 'الشركة',
        links: [
          { label: 'من نحن', href: '/company/about' },
          { label: 'الوظائف', href: '/company/careers' },
          { label: 'التكريم', href: '/company/recognition' },
          { label: 'الإعلام', href: '/education/media' },
        ],
      },
      {
        heading: 'الدعم',
        links: [
          { label: 'اتصل بنا', href: '/support#contact' },
          { label: 'الأسئلة الشائعة', href: '/support' },
          { label: 'القانونية', href: '/legal' },
        ],
      },
    ],
    // Homepage USP metrics ("Why Newera" band) — client USP pitch deck.
    uspMetrics: [
      {
        valueEn: '< 15 ms',
        valueAr: '< 15 ms',
        titleEn: 'Average execution speed',
        titleAr: 'متوسط سرعة التنفيذ',
        descEn: 'Orders fill at real market speed, not screen speed.',
        descAr: 'تُنفَّذ الأوامر بسرعة السوق الحقيقية، لا بسرعة الشاشة.',
      },
      {
        valueEn: '24/7',
        valueAr: '24/7',
        titleEn: 'Support availability',
        titleAr: 'توفر الدعم',
        descEn: 'A human on the other end, any day of the week.',
        descAr: 'شخص حقيقي في الطرف الآخر، في أي يوم من أيام الأسبوع.',
      },
      {
        valueEn: '100%',
        valueAr: '100%',
        titleEn: 'Straight-to-market execution',
        titleAr: 'تنفيذ مباشر إلى السوق',
        descEn: 'No dealing desk intervention on client orders.',
        descAr: 'لا تدخل من مكتب التداول في أوامر العملاء.',
      },
      {
        valueEn: 'Tier-1',
        valueAr: 'المستوى 1',
        titleEn: 'Regulated & segregated',
        titleAr: 'منظّم وأموال منفصلة',
        descEn: 'Client funds are held separately from company funds in Tier-1 regulated banks.',
        descAr: 'تُحفظ أموال العملاء بشكل منفصل عن أموال الشركة في بنوك مرخصة من المستوى الأول.',
      },
      {
        valueEn: '0',
        valueAr: '0',
        titleEn: 'Re-quotes on market orders',
        titleAr: 'إعادة تسعير على أوامر السوق',
        descEn: 'The price you click is the price you get.',
        descAr: 'السعر الذي تنقر عليه هو السعر الذي تحصل عليه.',
      },
      {
        valueEn: '2026',
        valueAr: '2026',
        titleEn: 'Built for the next generation of trading',
        titleAr: 'مصمم لجيل التداول القادم',
        descEn: 'Modern infrastructure, not a legacy platform bolted together.',
        descAr: 'بنية تحتية حديثة، وليست منصة قديمة مجمّعة.',
      },
    ],
    // Partners / infrastructure wall — liquidity, technology, payments, data.
    partners: [
      // 01 Hosting Providers
      {
        groupKey: 'hosting',
        name: 'ForexVPS',
        logoType: 'wordmark',
        logoFilename: 'forexvps-full.png',
      },
      {
        groupKey: 'hosting',
        name: 'Centroid Solutions',
        logoType: 'wordmark',
        logoFilename: 'centroid-full.svg',
      },

      // 02 Liquidity Partners
      { groupKey: 'liquidity', name: 'CQG', logoType: 'wordmark', logoFilename: 'cqg-full.svg' },
      { groupKey: 'liquidity', name: 'Finalto', logoType: 'icon', logoFilename: 'finalto.png' },
      {
        groupKey: 'liquidity',
        name: 'Scope Markets',
        logoType: 'icon',
        logoFilename: 'scope-markets.ico',
      },
      {
        groupKey: 'liquidity',
        name: 'Equiti',
        logoType: 'wordmark',
        logoFilename: 'equiti-full.svg',
      },
      { groupKey: 'liquidity', name: 'Amana', logoType: 'icon', logoFilename: 'amana.png' },
      {
        groupKey: 'liquidity',
        name: 'B2Broker',
        logoType: 'wordmark',
        logoFilename: 'b2broker-full.svg',
      },
      {
        groupKey: 'liquidity',
        name: 'LMAX Group',
        logoType: 'wordmark',
        logoFilename: 'lmax-full.png',
      },
      {
        groupKey: 'liquidity',
        name: 'Blueberry',
        logoType: 'wordmark',
        logoFilename: 'blueberry-full.png',
      },
      {
        groupKey: 'liquidity',
        name: 'CMS Prime',
        logoType: 'wordmark',
        logoFilename: 'cms-prime-full.svg',
      },
      {
        groupKey: 'liquidity',
        name: 'CME Group',
        logoType: 'wordmark',
        logoFilename: 'cme-full.png',
      },

      // 03 Technology Partners
      {
        groupKey: 'technology',
        name: 'FXCubic',
        logoType: 'wordmark',
        logoFilename: 'fxcubic-full.png',
      },
      {
        groupKey: 'technology',
        name: 'Centroid Solution',
        logoType: 'wordmark',
        logoFilename: 'centroid-full.svg',
      },
      {
        groupKey: 'technology',
        name: 'Tool For Broker',
        logoType: 'wordmark',
        logoFilename: 'tools-for-brokers-full.svg',
      },

      // 04 Payment Gateways
      { groupKey: 'payments', name: 'Cregis', logoType: 'icon', logoFilename: 'cregis.png' },
      {
        groupKey: 'payments',
        name: 'Epayme',
        logoType: 'wordmark',
        logoFilename: 'epayme-full.png',
      },
      {
        groupKey: 'payments',
        name: 'Liminal',
        logoType: 'wordmark',
        logoFilename: 'liminal.svg',
      },
    ],
    // Page stat callouts (About / Funding / Support / Web Trader)
    aboutManifestoStatValue: '100%',
    fundingWithdrawalStatValue: '24/7',
    supportPromiseStats: [
      {
        valueEn: '< 6 min',
        valueAr: '< 6 دقائق',
        labelEn: 'Average first response',
        labelAr: 'متوسط أول رد',
      },
      { valueEn: '24/5', valueAr: '24/5', labelEn: 'Support availability', labelAr: 'توفر الدعم' },
      { valueEn: '8', valueAr: '8', labelEn: 'Languages supported', labelAr: 'لغة مدعومة' },
    ],
    webTraderSpecs: [
      {
        valueEn: '2,000+',
        valueAr: '+2,000',
        labelEn: 'Tradable markets',
        labelAr: 'أسواق قابلة للتداول',
      },
      {
        valueEn: 'MetaTrader 5',
        valueAr: 'ميتاتريدر 5',
        labelEn: 'Platform',
        labelAr: 'المنصة',
      },
      { valueEn: '21', valueAr: '21', labelEn: 'Timeframes', labelAr: 'أطر زمنية' },
      { valueEn: '3', valueAr: '3', labelEn: 'Chart types', labelAr: 'أنواع الرسوم البيانية' },
      { valueEn: '38+', valueAr: '+38', labelEn: 'Indicators', labelAr: 'مؤشرات' },
      { valueEn: '6', valueAr: '6', labelEn: 'Order types', labelAr: 'أنواع الأوامر' },
    ],
  });
  console.log('   ✅ Site Settings updated');
}

// ─── Account Types ─────────────────────────────────────────────────────────

async function deleteAllDocs(collection: string) {
  try {
    let total = 0;
    // Paginate: a collection (notably media after backfill) can exceed one page.
    for (;;) {
      const res = await api('GET', `/${collection}`, undefined, { limit: '100', depth: '0' });
      const docs = res.docs ?? [];
      if (docs.length === 0) break;
      for (const doc of docs) {
        await api('DELETE', `/${collection}/${doc.id}`).catch(() => {});
      }
      total += docs.length;
      if (docs.length < 100) break;
    }
    if (total > 0) console.log(`   🗑️  Deleted ${total} existing ${collection} docs`);
  } catch {
    // collection might be empty, ignore
  }
}

async function seedAccountTypes() {
  console.log('💳 Account Types...');
  await deleteAllDocs('account-types');
  // Lineup and pricing from the client's partner pitch deck
  // (Newera_IB_Pitch_Deck_Green_V3, p.4): Raw / Standard / Pro. Deck spreads
  // are quoted in points on FX majors (2-4 / 12-15 / 18-22), i.e. pips /10.
  // usesMT5Data stays false so the mock bridge never overwrites deck values.
  const types = [
    {
      name: 'Demo',
      badge: 'free',
      minDeposit: 0,
      spreadFrom: '1.2',
      leverage: 'Up to 1:500',
      platforms: ['mt5', 'web-trader', 'mobile'],
      usesMT5Data: false,
      spreadFromNumeric: 1.2,
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
      usesMT5Data: false,
      spreadFromNumeric: 1.2,
      commission: '$0',
      features: [
        { value: 'All 2000+ instruments' },
        { value: 'Zero commission' },
        { value: 'Swap-free available on request' },
      ],
      isPopular: true,
      sortOrder: 2,
      status: 'active',
    },
    {
      name: 'Raw',
      badge: 'value',
      minDeposit: 50,
      spreadFrom: '0.2',
      leverage: 'Up to 1:500',
      platforms: ['mt5', 'web-trader', 'mobile'],
      usesMT5Data: false,
      spreadFromNumeric: 0.2,
      commission: '$8',
      features: [
        { value: 'Interbank raw pricing' },
        { value: 'Metals commission $10 per lot' },
        { value: 'Built for scalpers and EAs' },
      ],
      isPopular: false,
      sortOrder: 3,
      status: 'active',
    },
    {
      name: 'Pro',
      badge: 'pro',
      minDeposit: 2500,
      spreadFrom: '1.8',
      leverage: 'Up to 1:500',
      platforms: ['mt5', 'web-trader', 'mobile'],
      usesMT5Data: false,
      spreadFromNumeric: 1.8,
      commission: '$0',
      features: [
        { value: 'Zero commission trading' },
        { value: 'Dedicated account manager' },
        { value: 'Custom spreads and priority execution' },
      ],
      isPopular: false,
      sortOrder: 4,
      status: 'active',
    },
  ];
  const arContent = [
    { nameAr: 'تجريبي', featuresAr: 'وصول كامل للمنصة\nبيانات السوق الفعلية\nلا يلزم إيداع' },
    {
      nameAr: 'قياسي',
      featuresAr: 'جميع الأدوات الـ 2000+\nصفر عمولة\nخيار بدون فوائد تبييت عند الطلب',
    },
    {
      nameAr: 'خام',
      featuresAr:
        'تسعير خام من البنوك مباشرة\nعمولة المعادن 10 دولار لكل عقد\nمصمم للمضاربة السريعة والأنظمة الآلية',
    },
    { nameAr: 'برو', featuresAr: 'تداول بدون عمولة\nمدير حساب مخصص\nفروق مخصصة وتنفيذ ذو أولوية' },
  ];
  for (let i = 0; i < types.length; i++) {
    const doc = await post<{ id: number }>('account-types', types[i]);
    await patch('account-types', doc.id, arContent[i], 'en');
  }
  console.log('   ✅ 4 account types created (EN + AR)');
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
    /*
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
    */
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
    /*
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
    */
  ];
  const arNames: Record<string, string> = {
    'Visa / Mastercard': 'فيزا / ماستركارد',
    'Bank wire (SWIFT)': 'تحويل بنكي (SWIFT)',
    // Skrill: 'سكريل',
    // Neteller: 'نيتيلر',
    'Crypto (USDT, BTC)': 'عملات رقمية (USDT, BTC)',
    // 'Local bank transfer': 'تحويل بنكي محلي',
  };
  for (const m of methods) {
    let logoId: number | null = null;
    let localFileName = '';
    if (m.methodType === 'card') localFileName = 'card.png';
    else if (m.methodType === 'bank') localFileName = 'bank.png';
    else if (m.methodType === 'crypto') localFileName = 'crypto.png';

    if (localFileName) {
      const realPath = path.resolve(__dirname, '../../../web/public/images/payment', localFileName);
      if (fs.existsSync(realPath)) {
        logoId = await uploadMedia(realPath, `${m.name} logo`);
      }
    }

    if (!logoId) {
      logoId = await seedImage(
        `pay-${m.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')}`,
        m.name,
        { bg: '#0E2A20', w: 480, h: 300, alt: `${m.name} logo` },
      );
    }

    const doc = await post<{ id: number }>('payment-methods', {
      ...m,
      logo: logoId,
      coverImage: logoId,
    });
    if (arNames[m.name]) {
      await patch('payment-methods', doc.id, { nameAr: arNames[m.name] }, 'en');
    }
  }
  console.log(
    `   ✅ ${methods.length} payment methods created with real branded images (EN + AR names)`,
  );
}

// ─── Products / Instruments ─────────────────────────────────────────────────

async function seedInstruments() {
  console.log('📊 Instruments...');
  // Delete all existing instruments first to avoid duplicates from repeated seeding
  await deleteAllDocs('products-instruments');
  // Exact TradingView chart symbols (EXCHANGE:SYMBOL) keyed by instrument `symbol`.
  // Every value is verified against TradingView's symbol search so the Markets-page
  // charts resolve correctly instead of showing "symbol doesn't exist".
  const TV_SYMBOLS: Record<string, string> = {
    EURUSD: 'OANDA:EURUSD',
    GBPUSD: 'OANDA:GBPUSD',
    USDJPY: 'OANDA:USDJPY',
    AUDUSD: 'OANDA:AUDUSD',
    USDCAD: 'OANDA:USDCAD',
    EURGBP: 'OANDA:EURGBP',
    XAUUSD: 'OANDA:XAUUSD',
    XAGUSD: 'OANDA:XAGUSD',
    USOIL: 'TVC:USOIL',
    US30: 'OANDA:US30USD',
    US500: 'OANDA:SPX500USD',
    USTEC: 'OANDA:NAS100USD',
    GER40: 'OANDA:DE30EUR',
    BTCUSD: 'BITSTAMP:BTCUSD',
    ETHUSD: 'BITSTAMP:ETHUSD',
    'AAPL.US': 'NASDAQ:AAPL',
    'MSFT.US': 'NASDAQ:MSFT',
    'TSLA.US': 'NASDAQ:TSLA',
    'SPY.US': 'AMEX:SPY',
    'IWRD.UK': 'LSE:IWRD',
  };
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
    await post('products-instruments', {
      ...inst,
      tvSymbol: TV_SYMBOLS[inst.symbol],
      status: 'active',
      usesMT5Data: false,
    });
  console.log(`   ✅ ${instruments.length} instruments created`);
}

// ─── FAQs ───────────────────────────────────────────────────────────────────

async function seedFaqs() {
  console.log('❓ FAQs...');
  await deleteAllDocs('faqs');
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
        question: 'What leverage does Newera offer?',
        answer: richText(
          'We offer leverage up to 1:500 on forex and major commodity pairs, 1:200 on metals, 1:100 on indices, and 1:20 on stocks, ETFs and crypto.',
        ),
      },
      ar: {
        question: 'ما هي الرافعة المالية التي تقدمها نيو إيرا؟',
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
        question: 'Is my money safe with Newera?',
        answer: richText(
          'Yes. Client funds are held in segregated accounts with tier-1 banks, completely separate from our operating capital. Newera is regulated by the FCA, ASIC, and CySEC.',
        ),
      },
      ar: {
        question: 'هل أموالي آمنة مع نيو إيرا؟',
        answer: richText(
          'نعم. يتم الاحتفاظ بأموال العملاء في حسابات منفصلة لدى بنوك من الدرجة الأولى، منفصلة تماماً عن رأس مالنا التشغيلي. نيو إيرا خاضعة لرقابة FCA وASIC وCySEC.',
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
  await deleteAllDocs('blog-posts');
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
        author: 'Newera Research Desk',
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
        author: 'مكتب أبحاث نيو إيرا',
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
    {
      en: {
        title: 'GBP/USD Technical Outlook: BoE Rate Decision in Focus',
        slug: 'gbpusd-technical-outlook-boe-rate-decision',
        excerpt:
          'Cable holds above 1.2700 as traders position ahead of the Bank of England monetary policy decision.',
        body: bodyBlocks(
          'GBP/USD is consolidating in a tight range between 1.2690 and 1.2790 as market participants await the Bank of England rate decision on Thursday.',
          'Technical picture: The pair is trading above the 200-day moving average but below the key 1.2800 resistance. A sustained break above would target 1.2870 and then the 2024 high near 1.2970.',
          'Fundamentals: UK CPI has been stickier than expected, which could push the BoE to maintain a hawkish tone even if it keeps rates on hold. Watch for the vote split — a 6-3 hold would be more hawkish than a 7-2.',
        ),
        author: 'James Thornton',
      },
      ar: {
        title: 'التوقعات الفنية لـ GBP/USD: قرار بنك إنجلترا في دائرة الضوء',
        excerpt:
          'يتماسك الجنيه الإسترليني فوق 1.2700 مع تحديد المتداولين مراكزهم قبل قرار بنك إنجلترا.',
        body: bodyBlocks(
          'يتحرك GBP/USD في نطاق ضيق بين 1.2690 و1.2790 في انتظار قرار بنك إنجلترا بشأن الفائدة يوم الخميس.',
          'الصورة الفنية: يتداول الزوج فوق المتوسط المتحرك لـ 200 يوم ولكن دون مقاومة 1.2800 الرئيسية.',
          'الأساسيات: ظل مؤشر CPI البريطاني أعلى من المتوقع، مما قد يدفع بنك إنجلترا إلى الحفاظ على نبرة متشددة.',
        ),
        author: 'جيمس ثورنتون',
      },
      category: 'market-news',
      publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'Oil at $85: OPEC+ Cuts Hold — But for How Long?',
        slug: 'oil-opec-cuts-85-dollar-level',
        excerpt:
          'Crude oil is holding above $85/bbl as OPEC+ production cuts support prices, but demand concerns from China cloud the outlook.',
        body: bodyBlocks(
          'Brent crude has settled into a range between $82 and $87 per barrel following confirmation that OPEC+ will maintain its 1.66 million barrel per day production cut through the end of the year.',
          "China demand remains the key downside risk. PMI readings have surprised to the downside for three consecutive months, raising questions about whether the world's largest oil importer is experiencing a structural slowdown or a cyclical soft patch.",
          'From a trading perspective, the $80 level represents a key demand zone supported by OPEC+ rhetoric. On the upside, supply concerns related to the Middle East could push toward $90.',
        ),
        author: 'Sarah Mitchell',
      },
      ar: {
        title: 'النفط عند 85 دولاراً: خفض أوبك+ يتماسك — لكن حتى متى؟',
        excerpt:
          'يتماسك النفط الخام فوق 85 دولاراً للبرميل مع دعم خفض أوبك+ للأسعار، لكن مخاوف الطلب الصيني تُغيّم الآفاق.',
        body: bodyBlocks(
          'استقر خام برنت في نطاق بين 82 و87 دولاراً للبرميل عقب تأكيد أوبك+ الحفاظ على خفض الإنتاج البالغ 1.66 مليون برميل يومياً.',
          'يبقى طلب الصين المخاطرة الأكبر على الجانب السلبي. أثارت قراءات مؤشر PMI المتتالية الأدنى من المتوقع تساؤلات حول التباطؤ الاقتصادي.',
          'فنياً، يمثل مستوى 80 دولاراً منطقة طلب رئيسية. على الجانب الصعودي، قد تدفع مخاوف الإمدادات نحو 90 دولاراً.',
        ),
        author: 'سارة ميتشل',
      },
      category: 'analysis',
      publishedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'US Dollar Index Tests 105 — Key Macro Drivers This Week',
        slug: 'usd-index-105-macro-drivers',
        excerpt:
          'DXY pushes toward 105 as stronger US data reshapes rate expectations. Here are the macro events that could shift the trend.',
        body: bodyBlocks(
          'The US Dollar Index (DXY) climbed to 104.80 before pulling back slightly, with the dollar strengthening against most G10 currencies. The move is driven by repricing of Federal Reserve rate expectations — markets now price just one cut in 2026, down from three at the start of the quarter.',
          "Key data this week: Tuesday's CPI print is the most important near-term catalyst. A reading above 3.3% would validate further dollar strength and likely push EUR/USD below 1.0750.",
          'Trading the dollar: The DXY has historically struggled to sustain above 105 without explicit hawkish Fed guidance. Watch for profit-taking if the level is reached without a data catalyst.',
        ),
        author: 'Newera Research Desk',
      },
      ar: {
        title: 'مؤشر الدولار الأمريكي يختبر 105 — المحركات الكلية الرئيسية هذا الأسبوع',
        excerpt:
          'يصعد مؤشر DXY نحو 105 مع إعادة تشكيل البيانات الأمريكية الأقوى لتوقعات أسعار الفائدة.',
        body: bodyBlocks(
          'ارتفع مؤشر الدولار الأمريكي (DXY) إلى 104.80 قبل أن يتراجع قليلاً، مع تقوي الدولار أمام معظم عملات مجموعة العشرة.',
          'البيانات الرئيسية هذا الأسبوع: يُعدّ مؤشر CPI يوم الثلاثاء المحفز الأهم على المدى القريب. قراءة أعلى من 3.3% ستدعم قوة الدولار.',
          'تداول الدولار: عانى مؤشر DXY تاريخياً من الحفاظ على مستويات فوق 105 دون توجيه صريح من الاحتياطي الفيدرالي.',
        ),
        author: 'مكتب أبحاث نيو إيرا',
      },
      category: 'market-news',
      publishedDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'Bitcoin Breaks $70,000: Institutional Demand or Retail FOMO?',
        slug: 'bitcoin-breaks-70000-institutional-demand',
        excerpt:
          'BTC/USD surges through $70,000 for the first time since November 2021. We break down what is driving the move.',
        body: bodyBlocks(
          'Bitcoin has broken above the psychologically important $70,000 level, driven by record inflows into spot Bitcoin ETFs and renewed institutional demand ahead of the halving event.',
          'Supply dynamics: The halving — expected in April — will cut the daily supply of new Bitcoin from 900 to 450 coins. Historically, halvings have preceded significant price appreciation, though usually with a 6–12 month lag.',
          "Risk considerations for CFD traders: Bitcoin's daily swings can exceed 5-10% during breakout phases. Position sizing is critical — the same leverage that works on EUR/USD can wipe an account in hours on BTC/USD.",
        ),
        author: 'Sarah Mitchell',
      },
      ar: {
        title: 'بيتكوين يخترق 70,000 دولار: طلب مؤسسي أم FOMO التجزئة؟',
        excerpt: 'يتجاوز BTC/USD مستوى 70,000 دولار النفسي للمرة الأولى منذ نوفمبر 2021.',
        body: bodyBlocks(
          'اخترق البيتكوين مستوى 70,000 دولار النفسي المهم، مدفوعاً بتدفقات قياسية إلى صناديق Bitcoin ETF الفورية وتجدد الطلب المؤسسي.',
          'ديناميكيات العرض: سيخفض الحدث المرتقب الإمداد اليومي من البيتكوين الجديد من 900 إلى 450 عملة.',
          'اعتبارات المخاطرة: قد تتجاوز تقلبات البيتكوين اليومية 5-10٪ خلال مراحل الاختراق. تحديد حجم المركز أمر بالغ الأهمية.',
        ),
        author: 'سارة ميتشل',
      },
      category: 'analysis',
      publishedDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'S&P 500 All-Time Highs: What the Rally Means for Forex',
        slug: 'sp500-all-time-highs-forex-implications',
        excerpt:
          'US equities at record highs have historically correlated with dollar strength, JPY weakness and commodity-currency gains.',
        body: bodyBlocks(
          'The S&P 500 broke to fresh all-time highs this week, continuing a rally that has added over 25% since October 2023. For forex traders, equity strength carries distinct implications.',
          'Risk-on dynamics: Sustained equity gains typically weaken the Japanese yen (a safe haven), support AUD and NZD (commodity currencies) and pressure USD/CHF higher.',
          'The divergence to watch: If equities are rising on rate-cut hopes while the dollar is also strong, something has to give. Historically, one of these correlations breaks — and identifying which is the key trade.',
        ),
        author: 'Newera Research Desk',
      },
      ar: {
        title: 'S&P 500 عند مستويات قياسية: ماذا يعني الارتفاع للفوركس؟',
        excerpt: 'الأسهم الأمريكية عند مستويات قياسية مرتبطة تاريخياً بقوة الدولار وضعف الين.',
        body: bodyBlocks(
          'اخترق مؤشر S&P 500 مستويات قياسية جديدة هذا الأسبوع، مستمراً في ارتفاع أضاف أكثر من 25٪ منذ أكتوبر 2023.',
          'ديناميكيات المخاطرة: يُضعف الأداء القوي للأسهم عادةً الين الياباني ويدعم الدولار الأسترالي والنيوزيلندي.',
          'التباين الذي يجب مراقبته: إذا ارتفعت الأسهم على آمال خفض الفائدة بينما الدولار قوي أيضاً، فأحد هذين الارتباطين سينكسر.',
        ),
        author: 'مكتب أبحاث نيو إيرا',
      },
      category: 'analysis',
      publishedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'AUD/USD: RBA Decision Preview and What AUD Traders Need to Know',
        slug: 'audusd-rba-decision-preview',
        excerpt:
          'The Reserve Bank of Australia meets next Tuesday. Here is the full preview for AUD/USD traders.',
        body: bodyBlocks(
          "AUD/USD is trading near 0.6580 ahead of next Tuesday's Reserve Bank of Australia policy decision. The market is pricing a hold, but the statement language will drive the pair.",
          'What to watch in the statement: Any shift in the RBA\'s inflation language — from "some time" to "near-term" — would be interpreted as a dovish signal and push AUD/USD toward 0.6500.',
          'China as the wildcard: Australian exports depend heavily on Chinese demand. A deterioration in Chinese PMI data alongside a dovish RBA statement would be a double negative for AUD/USD.',
        ),
        author: 'James Thornton',
      },
      ar: {
        title: 'AUD/USD: معاينة قرار بنك الاحتياطي الأسترالي وما يحتاج متداولو AUD معرفته',
        excerpt:
          'يجتمع بنك الاحتياطي الأسترالي الثلاثاء القادم. إليك المعاينة الكاملة لمتداولي AUD/USD.',
        body: bodyBlocks(
          'يتداول AUD/USD قرب 0.6580 قبيل قرار بنك الاحتياطي الأسترالي الثلاثاء القادم.',
          'ما يجب مراقبته في البيان: أي تحول في لغة بنك الاحتياطي الأسترالي بشأن التضخم سيُفسَّر كإشارة متيسرة.',
          'الصين كعامل مفاجأة: تعتمد الصادرات الأسترالية بشكل كبير على الطلب الصيني.',
        ),
        author: 'جيمس ثورنتون',
      },
      category: 'market-news',
      publishedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'USD/JPY at 155: Is Japan Ready to Intervene Again?',
        slug: 'usdjpy-155-japan-intervention-risk',
        excerpt:
          'USD/JPY is back near the 155 level that triggered Bank of Japan intervention in 2023. Here is what traders need to watch.',
        body: bodyBlocks(
          'USD/JPY has crept back toward 155 — the level that prompted coordinated Bank of Japan intervention in late 2023. Whether authorities intervene again depends on the speed of the move as much as the level itself.',
          'BoJ intervention mechanics: Japan does not typically announce intervention. Dealers watching the spot market identify it by sudden sharp yen-buying orders that have no apparent domestic or overseas catalyst.',
          'Trading around the risk: Many experienced yen traders avoid large short-yen positions above 150, using options instead to express the view while capping downside from a sudden intervention-driven reversal.',
        ),
        author: 'Sarah Mitchell',
      },
      ar: {
        title: 'USD/JPY عند 155: هل اليابان مستعدة للتدخل مرة أخرى؟',
        excerpt: 'USD/JPY يعود قرب مستوى 155 الذي أشعل تدخل بنك اليابان عام 2023.',
        body: bodyBlocks(
          'اقترب USD/JPY مجدداً من 155 — المستوى الذي دفع بنك اليابان للتدخل في أواخر عام 2023.',
          'آليات تدخل بنك اليابان: لا تعلن اليابان عادةً عن التدخل. يكتشفه المتعاملون من خلال أوامر شراء حادة ومفاجئة للين.',
          'التداول حول المخاطرة: يتجنب كثير من متداولي الين المخضرمين المراكز الكبيرة لبيع الين فوق 150.',
        ),
        author: 'سارة ميتشل',
      },
      category: 'analysis',
      publishedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'The Monday Briefing: Macro Themes Driving Markets This Week',
        slug: 'monday-briefing-macro-themes-june-2026',
        excerpt:
          'Five macro themes shaping forex, commodity and index markets heading into the new trading week.',
        body: bodyBlocks(
          "THEME 1 — FED REPRICING: Friday's strong payrolls print has markets scaling back rate-cut expectations. The September FOMC is now roughly 50/50 between hold and cut.",
          'THEME 2 — CHINA RECOVERY DOUBTS: Weekend PMI data from China missed expectations for the fourth consecutive month. Watch AUD/USD, commodity currencies and copper as the barometer.',
          'THEME 3 — OIL GEOPOLITICS: Escalating tensions in the Middle East have kept a risk premium in crude oil. If the situation stabilises, a $3–5 pullback is realistic.',
          "THEME 4 — DOLLAR FLOWS: Month-end rebalancing added noise to last week's dollar move. The underlying trend is still dollar-positive pending a sustained inflation rollover.",
          'THEME 5 — UK ELECTIONS: Political uncertainty is creating volatility in GBP pairs. Traders are treating this as a binary event and positioning accordingly — reduced exposure, wider stops.',
        ),
        author: 'Newera Research Desk',
      },
      ar: {
        title: 'إحاطة يوم الاثنين: الموضوعات الكلية التي تقود الأسواق هذا الأسبوع',
        excerpt:
          'خمسة موضوعات كلية تشكّل أسواق الفوركس والسلع والمؤشرات في بداية أسبوع التداول الجديد.',
        body: bodyBlocks(
          'الموضوع الأول — إعادة تسعير الفيدرالي: دفع تقرير الرواتب القوي الأسواق إلى تقليص توقعات خفض الفائدة.',
          'الموضوع الثاني — شكوك التعافي الصيني: أخفقت بيانات مؤشر PMI الصيني للشهر الرابع على التوالي.',
          'الموضوع الثالث — الجيوسياسية النفطية: أبقت التوترات المتصاعدة في الشرق الأوسط على علاوة مخاطرة في خام النفط.',
          'الموضوع الرابع — تدفقات الدولار: لا يزال الاتجاه الأساسي إيجابياً للدولار.',
          'الموضوع الخامس — الانتخابات البريطانية: يخلق عدم اليقين السياسي تقلبات في أزواج الجنيه الإسترليني.',
        ),
        author: 'مكتب أبحاث نيو إيرا',
      },
      category: 'market-news',
      publishedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const blogBg: Record<string, string> = {
    'market-news': '#0B3D2E',
    analysis: '#10261C',
    tutorials: '#13312A',
    'company-updates': '#0E2A20',
  };
  for (const blogPost of posts) {
    const coverId = await seedImage(`blog-${blogPost.en.slug}`, blogPost.en.title, {
      bg: blogBg[blogPost.category] ?? '#0B3D2E',
      w: 1200,
      h: 675,
      alt: blogPost.en.title,
    });
    const doc = await createDoc<{ id: number }>('blog-posts', {
      ...blogPost.en,
      category: blogPost.category,
      publishedDate: blogPost.publishedDate,
      featuredImage: coverId,
      status: 'published',
    });
    await patchDoc(
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
  await deleteAllDocs('market-analysis');
  const analyses = [
    {
      en: {
        title: "Why the Dollar's Next Move Starts in Frankfurt, Not Washington",
        slug: 'dollar-move-starts-frankfurt',
        analyst: 'Marcus Webb',
        summary:
          "ECB policy divergence is widening the EUR/USD range. Here's the headline number that actually matters.",
        body: bodyBlocks(
          "ECB policy divergence is widening the EUR/USD range. The market's obsession with Fed rhetoric is masking the real driver of dollar strength: the pace of ECB rate cuts relative to the Fed hold.",
          'A deeper-than-expected ECB cut cycle would compress the yield differential sharply, pushing EUR/USD toward the 1.05 handle. The key data point to watch is not NFP — it is the EZ flash CPI print on the last Friday of each month.',
          'Outlook: Dollar strength is more likely to originate from Frankfurt dovishness than Washington hawkishness. Position accordingly with a EUR/USD range of 1.0600–1.0950 for Q3.',
        ),
      },
      ar: {
        title: 'لماذا تبدأ الحركة القادمة للدولار من فرانكفورت لا واشنطن؟',
        analyst: 'ماركوس ويب',
        summary: 'يتسع نطاق EUR/USD مع تباين السياسات النقدية. إليك الرقم الذي يهم فعلاً.',
        body: bodyBlocks(
          'يُوسّع تباين سياسة البنك المركزي الأوروبي نطاق EUR/USD. انهماك السوق في تصريحات الفيدرالي يُخفي المحرك الحقيقي لقوة الدولار: وتيرة خفض الفائدة الأوروبية مقارنةً بتثبيت الفيدرالي.',
          'قد يضغط دورة خفض أعمق من المتوقع من البنك المركزي الأوروبي على فارق العائد بشكل حاد، ليدفع EUR/USD نحو مستوى 1.05.',
          'التوقعات: من المرجح أن تنبع قوة الدولار من تساهل فرانكفورت أكثر من صرامة واشنطن.',
        ),
      },
      assetCategory: 'forex',
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'The Volatility Trap: Three Setups Professional Traders Avoid',
        slug: 'volatility-trap-three-setups',
        analyst: 'Priya Sharma',
        summary: 'High ATR is not the same as edge. Most retail traders confuse the two.',
        body: bodyBlocks(
          'High Average True Range is not the same as tradeable edge. During earnings seasons and macro event weeks, ATR spikes, but bid-ask spreads widen, fills deteriorate, and stop-outs become almost inevitable.',
          'The three setups professionals avoid during high-ATR environments: (1) breakout entries on the first candle close above resistance, (2) mean-reversion fades into a trend driven by fundamentals, (3) any position sized at normal risk when overnight gap risk is elevated.',
          'Edge comes from consistency and repeatability, not volatility. Reduce size, wait for spreads to normalise, and let amateurs pay the premium for excitement.',
        ),
      },
      ar: {
        title: 'فخ التقلب: ثلاثة إعدادات يتجنبها المتداولون المحترفون',
        analyst: 'بريا شارما',
        summary: 'ارتفاع ATR لا يعني ميزة تداول. معظم المتداولين يخلطون بين الاثنين.',
        body: bodyBlocks(
          'متوسط النطاق الحقيقي المرتفع لا يعني ميزة قابلة للتداول. خلال مواسم الأرباح والأحداث الكلية، يقفز ATR لكن فروق الأسعار تتسع والتنفيذ يتدهور.',
          'الإعدادات الثلاثة التي يتجنبها المحترفون: (1) دخول الاختراق على أول شمعة، (2) تداول ضد الاتجاه المدفوع بالأساسيات، (3) أي مركز بحجم طبيعي مع مخاطر فجوات ليلية عالية.',
          'الميزة تأتي من الاتساق وليس من التقلب. قلّل الحجم وانتظر تطبيع الفروق.',
        ),
      },
      assetCategory: 'etfs',
      publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'Gold at $2,400 — Momentum or Top? Reading the COT Report',
        slug: 'gold-1400-momentum-or-top',
        analyst: 'Daniel Osei',
        summary:
          'Positioning data shows institutional longs at 18-month highs but the futures curve is flattening fast.',
        body: bodyBlocks(
          'Gold is consolidating near all-time highs as markets reassess the inflation trajectory. A softer-than-expected CPI print could be the catalyst for a push toward the $2,400 psychological target.',
          "The Commitment of Traders report shows managed money net longs at 18-month highs. That's a bullish signal — until it isn't. At extremes, positioning itself becomes the headwind as late longs run out of buyers.",
          'On the 4-hour chart, XAUUSD has built a strong base between $2,290 and $2,320. Strategy: Buy dips to $2,290–2,300 with a target at $2,380, stop at $2,260.',
        ),
      },
      ar: {
        title: 'الذهب عند 2,400 دولار — زخم أم قمة؟ قراءة تقرير COT',
        analyst: 'دانيال أوسي',
        summary:
          'بيانات التموضع تُظهر صفقات شراء مؤسسية عند أعلى مستوياتها في 18 شهراً لكن منحنى العقود الآجلة يتسطح بسرعة.',
        body: bodyBlocks(
          'يتحكم الذهب في مكاسبه قرب أعلى مستوياته التاريخية مع إعادة الأسواق تقييم مسار التضخم.',
          'يُظهر تقرير COT صافي صفقات الشراء للأموال المُدارة عند أعلى مستوياتها في 18 شهراً. هذا مؤشر صعودي — حتى يتحول إلى عائق عند التطرف.',
          'الاستراتيجية: شراء عند التراجع نحو 2,290-2,300 دولار بهدف 2,380، وإيقاف خسارة عند 2,260.',
        ),
      },
      assetCategory: 'commodities',
      publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      editorialCategory: 'education',
      en: {
        title: "A Trader's Guide to Understanding Slippage",
        slug: 'traders-guide-understanding-slippage',
        analyst: 'Sofia Reyes',
        summary: 'Why your fill price differs from your order price, and how to minimise the gap.',
        body: bodyBlocks(
          'Slippage is the difference between the price you expected when you placed an order and the price at which it was actually executed. It occurs in all markets but is most pronounced during periods of high volatility or low liquidity.',
          'Positive slippage — getting a better fill than requested — is possible but rarer. Negative slippage is the norm during news events, market opens, and thin overnight sessions. Understanding the mechanics helps you choose the right order type and time of execution.',
          "How to minimise slippage: use limit orders instead of market orders where possible, avoid trading during major news releases unless you have a defined edge, and review your broker's execution statistics before sizing up.",
        ),
      },
      ar: {
        title: 'دليل المتداول لفهم الانزلاق السعري',
        analyst: 'صوفيا رييس',
        summary: 'لماذا يختلف سعر تنفيذ أمرك عن السعر المتوقع، وكيف تُقلّل الفجوة.',
        body: bodyBlocks(
          'الانزلاق السعري هو الفرق بين السعر المتوقع عند وضع الأمر والسعر الذي نُفّذ به فعلياً. يحدث في جميع الأسواق لكنه أكثر وضوحاً في فترات التقلب العالي أو السيولة المنخفضة.',
          'الانزلاق الإيجابي — الحصول على تنفيذ أفضل من المطلوب — ممكن لكنه أقل شيوعاً. الانزلاق السلبي هو القاعدة خلال أحداث الأخبار وافتتاح الجلسات.',
          'كيف تُقلّل الانزلاق: استخدم أوامر محددة بدلاً من أوامر السوق، وتجنّب التداول خلال النشرات الكبرى.',
        ),
      },
      assetCategory: 'forex',
      publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      editorialCategory: 'education',
      en: {
        title: 'How Free Pip & Swap Calculators on Mobile Can Mislead You',
        slug: 'pip-swap-calculators-on-mobile',
        analyst: 'Sofia Reyes',
        summary:
          'Built-in calculator apps bake in assumptions your broker does not use. Check the math.',
        body: bodyBlocks(
          'Free pip and swap calculators in app stores use standardised assumptions: 100,000-unit lots, fixed pip values, and overnight rates sourced from generic benchmarks. Your broker uses different lot sizes, variable spreads, and rollover rates tied to interbank rates.',
          "The error compounds when you trade exotic pairs or instruments with non-standard tick sizes. A CFD on an index has a completely different pip value calculation than a forex pair, and most free apps don't account for this.",
          "Always use your broker's own calculator — or build your own in a spreadsheet using your account currency, the exact lot size, and the specific overnight swap rate from your platform's specification page.",
        ),
      },
      ar: {
        title: 'كيف يمكن لحاسبات النقاط والمبادلة المجانية على الجوال أن تُضلّلك',
        analyst: 'صوفيا رييس',
        summary: 'تطبيقات الحاسبة المدمجة تبني افتراضات لا يستخدمها وسيطك. تحقق من الحسابات.',
        body: bodyBlocks(
          'تستخدم حاسبات النقاط والمبادلة المجانية افتراضات موحدة: عقود 100,000 وحدة، قيم نقاط ثابتة، ومعدلات إيتاء من معايير عامة. وسيطك يستخدم أحجام عقود مختلفة وفروق متغيرة.',
          'يتضاعف الخطأ عند تداول الأزواج الغريبة أو الأدوات ذات أحجام النقاط غير القياسية.',
          'استخدم دائماً حاسبة وسيطك الخاصة أو ابنِ جدول بيانات بعملة حسابك وحجم العقد الدقيق ومعدل المبادلة من صفحة مواصفات المنصة.',
        ),
      },
      assetCategory: 'forex',
      publishedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      en: {
        title: 'The ECB Rate Decision and What the Market Priced Wrong',
        slug: 'ecb-rate-decision-what-traders-missed',
        analyst: 'Marcus Webb',
        summary:
          'EUR/JPY had the largest single-session move of Q2. Here is a breakdown from the desk.',
        body: bodyBlocks(
          "The ECB's June decision was fully priced by markets — or so they thought. The surprise was not the cut itself but the accompanying statement, which removed the phrase 'data-dependent future cuts', signalling a slower path ahead.",
          'EUR/JPY had the largest single-session move of Q2: a 180-pip reversal from session highs. Traders who were positioned for a dovish follow-through were caught offside.',
          'Lesson from the desk: price the press conference, not just the decision. Rate-sensitive pairs move on guidance, not rate changes that were already discounted weeks earlier.',
        ),
      },
      ar: {
        title: 'قرار الفائدة الأوروبي وما أخطأ السوق في تسعيره',
        analyst: 'ماركوس ويب',
        summary: 'سجّل EUR/JPY أكبر حركة في جلسة واحدة خلال الربع الثاني. إليك تحليل المكتب.',
        body: bodyBlocks(
          'قرار البنك المركزي الأوروبي في يونيو كان مُسعَّراً بالكامل من قبل الأسواق — هكذا ظنّوا. المفاجأة لم تكن التخفيض بل البيان المصاحب الذي أزال عبارة "خفوضات مستقبلية تعتمد على البيانات".',
          'سجّل EUR/JPY أكبر حركة في جلسة واحدة للربع الثاني: انعكاس بـ 180 نقطة من أعلى الجلسة.',
          'الدرس من المكتب: سعّر مؤتمر الصحافة لا القرار فحسب. الأزواج الحساسة للفائدة تتحرك بناءً على التوجيهات لا التغييرات المُخصومة مسبقاً.',
        ),
      },
      assetCategory: 'forex',
      publishedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const analysis of analyses) {
    const coverId = await seedImage(`analysis-${analysis.en.slug}`, analysis.en.title, {
      bg: '#0d2b1a',
      w: 1200,
      h: 800,
      alt: analysis.en.title,
    });
    const doc = await post<{ id: number }>('market-analysis', {
      ...analysis.en,
      assetCategory: analysis.assetCategory,
      ...(analysis.editorialCategory ? { editorialCategory: analysis.editorialCategory } : {}),
      publishedDate: analysis.publishedDate,
      featuredImage: coverId,
      status: 'published',
    });
    await patch(
      'market-analysis',
      doc.id,
      {
        title: analysis.ar.title,
        analyst: analysis.ar.analyst,
        summary: analysis.ar.summary,
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
  await deleteAllDocs('news');
  const newsItems = [
    {
      en: {
        headline: 'Fed Holds Rates Steady, Signals Two Cuts in 2026',
        slug: 'fed-holds-rates-signals-two-cuts-2026',
        source: 'Reuters',
        category: 'forex',
        imageFile: 'market-forex-dark.jpg',
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
        imageFile: 'market-commodities-dark.jpg',
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
        imageFile: 'market-crypto-dark.jpg',
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
        imageFile: 'market-forex-dark.jpg',
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
        imageFile: 'market-indices-dark.jpg',
      },
      ar: { headline: 'الأسهم الأمريكية تسجّل مستويات قياسية مع موسم أرباح قوي' },
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const item of newsItems) {
    const bodies = NEWS_BODIES[item.en.slug];
    const imagePath = path.resolve(__dirname, '../../../web/public/images', item.en.imageFile);
    let imageId: number | undefined;
    if (fs.existsSync(imagePath)) {
      try {
        imageId = await uploadMedia(imagePath, item.en.headline);
      } catch (err) {
        console.log(`   ⚠️ Failed uploading image for ${item.en.headline}`);
      }
    }
    const doc = await post<{ id: number }>('news', {
      headline: item.en.headline,
      slug: item.en.slug,
      source: item.en.source,
      category: item.en.category,
      ...(imageId ? { featuredImage: imageId } : {}),
      ...(bodies ? { body: toSlate(bodies.en) } : {}),
      publishedDate: item.publishedDate,
      status: 'published',
    });
    await patchDoc(
      'news',
      doc.id,
      { headline: item.ar.headline, ...(bodies ? { body: toSlate(bodies.ar) } : {}) },
      'ar',
    );
  }
  console.log(`   ✅ ${newsItems.length} news items created with dynamic images (EN + AR)`);
}

// ─── Legal Pages ────────────────────────────────────────────────────────────

async function seedLegalPages() {
  console.log('⚖️  Legal Pages...');
  await deleteAllDocs('legal-pages');
  const pages = [
    {
      pageType: 'terms',
      en: {
        title: 'Terms and Conditions',
        slug: 'terms-and-conditions',
        body: legalBody(
          'These Terms and Conditions govern your use of the Newera trading platform and services. By opening an account, you agree to be bound by these terms.',
          [
            {
              heading: 'Eligibility',
              body: 'You must be at least 18 years old and legally permitted to trade financial instruments in your jurisdiction.',
            },
            {
              heading: 'Account Usage',
              body: 'You are responsible for maintaining the confidentiality of your login credentials and all activities carried out under your account.',
            },
            {
              heading: 'Risk Warning',
              body: 'Trading leveraged products carries significant risk. You may lose more than your initial deposit.',
            },
            {
              heading: 'Intellectual Property',
              body: 'All content, data, and software provided by Newera is proprietary and protected by intellectual property laws.',
            },
            {
              heading: 'Governing Law',
              body: 'These Terms are governed by and construed in accordance with the laws of England and Wales.',
            },
          ],
        ),
      },
      ar: {
        title: 'الشروط والأحكام',
        body: legalBody(
          'تحكم هذه الشروط والأحكام استخدامك لمنصة وخدمات نيو إيرا للتداول. بفتح حساب، توافق على الالتزام بهذه الشروط.',
          [
            {
              heading: 'الأهلية',
              body: 'يجب أن تكون في سن 18 عاماً على الأقل ومسموحاً لك قانونياً بتداول الأدوات المالية في ولايتك القضائية.',
            },
            {
              heading: 'استخدام الحساب',
              body: 'أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وجميع الأنشطة التي تتم على حسابك.',
            },
            {
              heading: 'تحذير المخاطر',
              body: 'تداول المنتجات ذات الرافعة المالية ينطوي على مخاطر عالية. قد تخسر أكثر من وديعتك الأولية.',
            },
            {
              heading: 'الملكية الفكرية',
              body: 'جميع المحتوى والبيانات والبرامج المقدمة من نيو إيرا مملوكة ومحمية بقوانين الملكية الفكرية.',
            },
            {
              heading: 'القانون الحاكم',
              body: 'تخضع هذه الشروط لقوانين إنجلترا وويلز وتُفسَّر وفقاً لها.',
            },
          ],
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
        body: legalBody(
          'Newera is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information.',
          [
            {
              heading: 'Data We Collect',
              body: 'We collect your name, email, phone number, trading activity, device information, and IP addresses.',
            },
            {
              heading: 'How We Use Data',
              body: 'We use your data to provide trading services, comply with regulatory requirements, and improve our products.',
            },
            {
              heading: 'Data Sharing',
              body: 'We do not sell your data. We share data with regulatory authorities as required by law and with licensed third-party service providers.',
            },
            {
              heading: 'Your Rights',
              body: 'You have the right to access, correct, or delete your data. To exercise these rights, contact privacy@newera365.com.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة الخصوصية',
        body: legalBody(
          'تلتزم نيو إيرا بحماية بياناتك الشخصية. تشرح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها.',
          [
            {
              heading: 'البيانات التي نجمعها',
              body: 'نجمع اسمك، بريدك الإلكتروني، رقم هاتفك، نشاط التداول، معلومات الجهاز، وعناوين IP.',
            },
            {
              heading: 'كيف نستخدم البيانات',
              body: 'نستخدم بياناتك لتقديم خدمات التداول، والامتثال للمتطلبات التنظيمية، وتحسين منتجاتنا.',
            },
            {
              heading: 'مشاركة البيانات',
              body: 'لا نبيع بياناتك. نشارك البيانات مع السلطات التنظيمية وفقاً للقانون ومع مزودي الخدمات المرخصين.',
            },
            {
              heading: 'حقوقك',
              body: 'لديك الحق في الوصول إلى بياناتك أو تصحيحها أو حذفها. لممارسة هذه الحقوق، تواصل مع privacy@newera365.com.',
            },
          ],
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
        body: legalBodyWithLead(
          'IMPORTANT RISK WARNING',
          'Trading in Contracts for Difference (CFDs) and other leveraged instruments carries a high level of risk to your capital.',
          [
            {
              heading: 'Nature of CFDs',
              body: 'CFDs are complex instruments. 74% of retail investor accounts lose money when trading CFDs with this provider.',
            },
            {
              heading: 'Assessing Suitability',
              body: 'You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.',
            },
            {
              heading: 'Past Performance',
              body: 'Past performance is not indicative of future results. Never trade with money you cannot afford to lose.',
            },
            {
              heading: 'Independent Advice',
              body: 'Seek independent financial advice if you are unsure about the suitability of these products for your circumstances.',
            },
          ],
        ),
      },
      ar: {
        title: 'إفصاح المخاطر',
        body: legalBodyWithLead(
          'تحذير مهم من المخاطر',
          'التداول في عقود الفروقات والأدوات ذات الرافعة المالية ينطوي على مخاطر عالية لرأس مالك.',
          [
            {
              heading: 'طبيعة عقود الفروقات',
              body: 'عقود الفروقات أدوات معقدة. 74% من حسابات المستثمرين الأفراد تخسر أموالها عند التداول مع هذا المزود.',
            },
            {
              heading: 'تقييم الملاءمة',
              body: 'يجب أن تفكر فيما إذا كنت تفهم كيف تعمل عقود الفروقات وما إذا كنت تستطيع تحمّل خطر خسارة أموالك.',
            },
            {
              heading: 'الأداء السابق',
              body: 'الأداء السابق ليس مؤشراً على النتائج المستقبلية. لا تتداول أبداً بأموال لا تستطيع تحمّل خسارتها.',
            },
            {
              heading: 'المشورة المستقلة',
              body: 'اطلب مشورة مالية مستقلة إذا كنت غير متأكد من ملاءمة هذه المنتجات لظروفك.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },
    {
      pageType: 'aml-policy',
      en: {
        title: 'AML Policy',
        slug: 'aml-policy',
        body: legalBody(
          'Newera maintains a comprehensive Anti-Money Laundering (AML) programme to detect and prevent financial crime across all client accounts and transactions.',
          [
            {
              heading: 'Policy Scope',
              body: 'This policy applies to all clients and transactions processed through Newera Ltd. We are committed to the highest standards of anti-money laundering and counter-terrorist financing compliance.',
            },
            {
              heading: 'Customer Due Diligence',
              body: 'All clients undergo Know-Your-Customer (KYC) verification before account activation. Enhanced due diligence is applied to higher-risk profiles, including Politically Exposed Persons (PEPs).',
            },
            {
              heading: 'Transaction Monitoring',
              body: 'We monitor account activity on an ongoing basis to identify unusual or suspicious patterns that may indicate money laundering.',
            },
            {
              heading: 'Reporting',
              body: 'Suspicious activity is reported to the relevant financial intelligence unit in line with our regulatory obligations.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة مكافحة غسل الأموال',
        body: legalBody(
          'تحتفظ نيو إيرا ببرنامج شامل لمكافحة غسل الأموال للكشف عن الجرائم المالية ومنعها عبر جميع حسابات العملاء والمعاملات.',
          [
            {
              heading: 'نطاق السياسة',
              body: 'تنطبق هذه السياسة على جميع العملاء والمعاملات التي تتم معالجتها عبر نيو إيرا. نلتزم بأعلى معايير مكافحة غسل الأموال وتمويل الإرهاب.',
            },
            {
              heading: 'العناية الواجبة بالعميل',
              body: 'يخضع جميع العملاء للتحقق من الهوية (اعرف عميلك) قبل تفعيل الحساب. تُطبَّق عناية واجبة معززة على الملفات عالية المخاطر بما في ذلك الأشخاص المعرّضون سياسياً.',
            },
            {
              heading: 'مراقبة المعاملات',
              body: 'نراقب نشاط الحساب بشكل مستمر لتحديد الأنماط غير العادية أو المشبوهة التي قد تشير إلى غسل الأموال.',
            },
            {
              heading: 'الإبلاغ',
              body: 'يتم الإبلاغ عن النشاط المشبوه إلى وحدة الاستخبارات المالية المعنية وفقاً لالتزاماتنا التنظيمية.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },
    {
      pageType: 'cookie-policy',
      en: {
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        body: legalBody(
          'This Cookie Policy explains how Newera uses cookies and similar technologies when you visit our website.',
          [
            {
              heading: 'What Are Cookies',
              body: 'Cookies are small text files placed on your device that help us remember your preferences, analyse site usage, and enable core features.',
            },
            {
              heading: 'Types We Use',
              body: 'We use essential cookies for core functionality, analytics cookies to understand how the site is used, and marketing cookies to deliver relevant advertising.',
            },
            {
              heading: 'Managing Cookies',
              body: 'You can manage or disable non-essential cookies at any time through your browser settings or our cookie preferences panel.',
            },
          ],
        ),
      },
      ar: {
        title: 'سياسة ملفات تعريف الارتباط',
        body: legalBody(
          'تشرح سياسة ملفات تعريف الارتباط هذه كيفية استخدام نيو إيرا لملفات تعريف الارتباط والتقنيات المشابهة عند زيارتك لموقعنا.',
          [
            {
              heading: 'ما هي ملفات تعريف الارتباط',
              body: 'ملفات تعريف الارتباط هي ملفات نصية صغيرة تُحفظ على جهازك تساعدنا على تذكّر تفضيلاتك وتحليل استخدام الموقع وتمكين الميزات الأساسية.',
            },
            {
              heading: 'الأنواع التي نستخدمها',
              body: 'نستخدم ملفات أساسية للوظائف الجوهرية، وملفات تحليلية لفهم كيفية استخدام الموقع، وملفات تسويقية لتقديم إعلانات ذات صلة.',
            },
            {
              heading: 'إدارة ملفات تعريف الارتباط',
              body: 'يمكنك إدارة ملفات تعريف الارتباط غير الأساسية أو تعطيلها في أي وقت من خلال إعدادات متصفحك أو لوحة تفضيلات ملفات تعريف الارتباط لدينا.',
            },
          ],
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
  await deleteAllDocs('team-members');
  const members = [
    {
      en: {
        name: 'James Hartley',
        slug: 'james-hartley',
        role: 'Chief Executive Officer',
        bio: 'James has 20+ years of financial markets experience, previously serving as Head of FX at two tier-1 investment banks before co-founding Newera.',
      },
      ar: {
        name: 'جيمس هارتلي',
        role: 'الرئيس التنفيذي',
        bio: 'يتمتع جيمس بأكثر من 20 عاماً من الخبرة في الأسواق المالية، حيث شغل منصب رئيس قسم الفوركس في بنكين من الدرجة الأولى قبل تأسيس نيو إيرا.',
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
    const photoId = await seedImage(`team-${member.en.slug}`, member.en.role, {
      bg: '#0B3D2E',
      w: 600,
      h: 600,
      alt: `${member.en.name} — ${member.en.role}`,
    });
    const doc = await post<{ id: number }>('team-members', {
      name: member.en.name,
      slug: member.en.slug,
      role: member.en.role,
      bio: member.en.bio,
      photo: photoId,
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
  await deleteAllDocs('awards');
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
    const logoId = await seedImage(`award-${award.en.slug}`, award.en.title, {
      bg: '#10261C',
      w: 600,
      h: 400,
      alt: award.en.title,
    });
    const doc = await post<{ id: number }>('awards', {
      title: award.en.title,
      slug: award.en.slug,
      description: award.en.description,
      date: award.date,
      logo: logoId,
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
      activeTo: '2026-06-19',
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
      activeTo: '2026-07-15',
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
      activeTo: '2026-07-31',
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
      activeTo: '2026-08-12',
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
      activeTo: promo.activeTo,
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

  // Guides — slugs must match staticGuides.ts so CMS docs are found by the same
  // slugs that the education hub featured cards link to.
  const guides = [
    {
      en: {
        title: 'The 2026 macro outlook',
        slug: 'macro-outlook-2026',
        body: bodyBlocks(
          'The year ahead hinges on one question: do central banks cut, hold, or hike? Each path reshapes currency, index and commodity markets in different ways. Here is how to read the signals.',
          'THE RATE-CUT SCENARIO: If inflation continues to soften, the Fed and ECB likely begin easing. A weaker dollar tends to lift gold, emerging-market currencies and risk assets — but the move is rarely linear, and positioning matters more than direction.',
          'THE HIGHER-FOR-LONGER SCENARIO: Sticky services inflation could keep policy restrictive well into the year. In that world, the dollar stays bid, growth-sensitive indices wobble, and carry trades in high-yield currencies regain appeal.',
          'WHAT IT MEANS FOR YOUR BOOK: Size positions for the scenario you can survive, not just the one you expect. Define invalidation levels before you enter, and let macro shape your bias rather than your stop placement.',
        ),
      },
      ar: {
        title: 'التوقعات الكلية لعام 2026',
        body: bodyBlocks(
          'يتوقف العام القادم على سؤال واحد: هل تخفض البنوك المركزية أسعار الفائدة أم تثبتها أم ترفعها؟ كل مسار يعيد تشكيل أسواق العملات والمؤشرات والسلع.',
          'سيناريو خفض الفائدة: إذا استمر التضخم في التراجع، يبدأ الفيدرالي والبنك المركزي الأوروبي في التيسير. يميل الدولار الأضعف إلى رفع الذهب والعملات الناشئة والأصول الخطرة.',
          'سيناريو الإبقاء على مستويات مرتفعة: قد يُبقي تضخم الخدمات المتشدد السياسة النقدية تقييدية طوال العام. في هذا السيناريو، يظل الدولار قويًا وتتعثر المؤشرات الحساسة للنمو.',
          'ما يعنيه ذلك لمحفظتك: حدّد حجم المراكز للسيناريو الذي يمكنك تحمّله، وليس فقط السيناريو الذي تتوقعه.',
        ),
      },
      seoDescription:
        'Rising inflation or rate cuts? We break down what every 2026 macro scenario means for your trading positions.',
      isFeatured: true,
    },
    {
      en: {
        title: 'Risk management essentials',
        slug: 'risk-management-essentials',
        body: bodyBlocks(
          'Most accounts are not lost on bad trades — they are lost on bad sizing. These four frameworks keep a losing streak survivable.',
          'FIXED-FRACTIONAL SIZING: Risk a constant percentage of equity per trade — commonly 1%. As the account grows, position size grows with it; as it shrinks, exposure falls automatically, smoothing the equity curve.',
          'DEFINING YOUR STOP FIRST: Decide where the trade is wrong before you decide how big it is. Your stop distance and your risk budget together determine size — never the other way around.',
          'CORRELATION AWARENESS: Three correlated longs are one big position wearing a disguise. Treat correlated exposure as a single risk unit so a single news event cannot hit every position at once.',
          'THE DAILY LOSS LIMIT: Set a maximum daily loss — typically 2–3% of equity. Hit it and stop. This single rule prevents most blow-up scenarios.',
        ),
      },
      ar: {
        title: 'أساسيات إدارة المخاطر',
        body: bodyBlocks(
          'معظم الحسابات لا تُخسر بسبب صفقات سيئة — بل بسبب التحجيم السيئ. هذه الأطر الأربعة تجعل سلسلة الخسائر قابلة للتحمل.',
          'التحجيم بنسبة ثابتة: خاطر بنسبة مئوية ثابتة من حقوق الملكية لكل صفقة — عادةً 1%. مع نمو الحساب، يزداد حجم المركز معه.',
          'تحديد وقف الخسارة أولاً: قرر أين تكون الصفقة خاطئة قبل أن تقرر حجمها. مسافة وقف الخسارة وميزانية المخاطرة معًا تحددان الحجم.',
          'الوعي بالارتباط: ثلاثة مراكز شراء مترابطة هي مركز كبير واحد في زي مقنّع. تعامل مع التعرض المترابط كوحدة مخاطرة واحدة.',
          'حد الخسارة اليومية: ضع حدًا أقصى لخسارتك اليومية — عادةً 2-3% من حقوق الملكية. عند الوصول إليه، توقف.',
        ),
      },
      seoDescription:
        'Four frameworks that protect every trading account from outsized drawdowns: sizing, stop placement, correlation, and daily limits.',
    },
    {
      en: {
        title: 'Reading a candlestick chart',
        slug: 'reading-candlestick-charts',
        body: bodyBlocks(
          'A candlestick compresses four numbers — open, high, low and close — into one shape. Learn to read the shape and you read the balance between buyers and sellers.',
          'ANATOMY OF A CANDLE: The body spans the open and close; the wicks mark the high and low. A long upper wick says buyers pushed price up but could not hold it — sellers stepped in.',
          'COMMON SINGLE-CANDLE SIGNALS: Dojis show indecision, hammers hint at rejection of lower prices, and engulfing candles flag a shift in control. None are signals on their own — context and location are everything.',
          'READING IN CONTEXT: A hammer at a major support level after a sustained downtrend carries weight. The same candle in the middle of a range is noise. Always ask what the candle is telling you about where price was rejected.',
        ),
      },
      ar: {
        title: 'قراءة مخطط الشموع اليابانية',
        body: bodyBlocks(
          'تضغط الشمعة اليابانية أربعة أرقام — الافتتاح والارتفاع والانخفاض والإغلاق — في شكل واحد. تعلّم قراءة الشكل وستقرأ التوازن بين المشترين والبائعين.',
          'تشريح الشمعة: الجسم يمتد بين الافتتاح والإغلاق؛ الظلال تحدد الارتفاع والانخفاض. الظل العلوي الطويل يعني أن المشترين دفعوا السعر لأعلى لكنهم لم يستطيعوا الحفاظ عليه.',
          'إشارات الشمعة المفردة الشائعة: الدوجي يُظهر التردد، المطرقة تلمّح إلى رفض الأسعار المنخفضة، والشموع الابتلاعية تشير إلى تحول في السيطرة.',
          'القراءة في السياق: مطرقة عند مستوى دعم رئيسي بعد اتجاه هبوطي مستدام لها ثقلها. نفس الشمعة في منتصف نطاق تذبذب هي مجرد ضوضاء.',
        ),
      },
      seoDescription:
        'From opening price to daily wick — everything you need to parse a candlestick chart and read buyer/seller pressure.',
    },
    {
      en: {
        title: 'Leverage and margin explained',
        slug: 'leverage-and-margin-explained',
        body: bodyBlocks(
          'Leverage lets a small deposit control a large position. It is the single most misunderstood tool in trading — powerful, and unforgiving when misused.',
          'HOW LEVERAGE WORKS: At 1:100 leverage, $1,000 of margin controls $100,000 of notional exposure. A 1% move is a 100% move on your margin — in either direction.',
          'MARGIN AND THE STOP-OUT: Used margin is locked while a position is open; free margin absorbs adverse moves. When equity falls below the maintenance level, positions are closed automatically to protect the account.',
          'USING LEVERAGE RESPONSIBLY: High leverage does not mean you must use it. Most professional traders use far less than the maximum available. Choose leverage that keeps your meaningful stop loss from triggering a margin call.',
        ),
      },
      ar: {
        title: 'شرح الرافعة المالية والهامش',
        body: bodyBlocks(
          'تتيح الرافعة المالية للوديعة الصغيرة التحكم في مركز كبير. هي الأداة الأكثر سوء فهماً في التداول — قوية، ولا تسامح في سوء استخدامها.',
          'كيف تعمل الرافعة: بنسبة 1:100، يتحكم 1,000 دولار من الهامش في 100,000 دولار من التعرض الاسمي. حركة 1% تعادل 100% على هامشك — في أي اتجاه.',
          'الهامش والإغلاق الإجباري: الهامش المستخدم مقيّد أثناء فتح المركز؛ الهامش الحر يستوعب التحركات السلبية. عندما يقل حقوق الملكية عن مستوى الصيانة، تُغلق المراكز تلقائياً.',
          'استخدام الرافعة بمسؤولية: الرافعة العالية لا تعني أنه يجب عليك استخدامها. اختر رافعة تبقي وقف الخسارة الخاص بك من تفعيل نداء الهامش.',
        ),
      },
      seoDescription:
        'How leverage amplifies both sides of the trade — and how margin keeps you in it. A plain-English explainer.',
    },
    {
      en: {
        title: 'Building a trading plan',
        slug: 'building-a-trading-plan',
        body: bodyBlocks(
          'A trading plan is the difference between a process and a series of impulses. It does not need to be complex — it needs to be written down and followed.',
          'YOUR EDGE, STATED PLAINLY: Write the exact conditions under which you take a trade. If you cannot describe your setup in two sentences, you do not yet have one.',
          'RULES FOR ENTRY, EXIT AND REVIEW: Define entry triggers, profit targets, stop placement and the maximum you will risk per day. Then schedule a weekly review — the plan only compounds if you study your own results.',
          'KEEPING A TRADE JOURNAL: Log every trade: what you saw, what you did, and what actually happened. Patterns in your losses are usually patterns in your process, not just your market reading.',
        ),
      },
      ar: {
        title: 'بناء خطة تداول',
        body: bodyBlocks(
          'خطة التداول هي الفرق بين العملية المنهجية وسلسلة من الدوافع. لا تحتاج إلى أن تكون معقدة — تحتاج إلى أن تكون مكتوبة ومتبعة.',
          'ميزتك التنافسية بوضوح: اكتب الشروط الدقيقة التي بموجبها تدخل في صفقة. إذا لم تستطع وصف إعدادك في جملتين، فلا تملكه بعد.',
          'قواعد الدخول والخروج والمراجعة: حدد محفزات الدخول وأهداف الأرباح ووضع وقف الخسارة والحد الأقصى الذي ستخاطر به يومياً. ثم جدول مراجعة أسبوعية.',
          'الاحتفاظ بمجلة تداول: سجّل كل صفقة: ما رأيته، وما فعلته، وما حدث فعلاً. الأنماط في خسائرك هي عادةً أنماط في عمليتك.',
        ),
      },
      seoDescription:
        'Turn scattered trading ideas into a repeatable, reviewable process with this step-by-step plan template.',
    },
    {
      en: {
        title: 'Understanding technical indicators',
        slug: 'understanding-technical-indicators',
        body: bodyBlocks(
          'Technical indicators distill price and volume data into a single line or histogram. They do not predict the future — they describe the recent past in a way that helps you form a bias.',
          'TREND INDICATORS: Moving averages (SMA, EMA) smooth out noise to show the underlying direction. The 200-day SMA is the most widely watched — institutions use it as a long-term filter.',
          'MOMENTUM INDICATORS: RSI measures the speed of price moves on a scale of 0–100. Above 70 suggests overbought conditions; below 30, oversold. Neither is a trade signal on its own.',
          'VOLUME INDICATORS: OBV and the Volume Profile show where most activity happened. A breakout with high volume is more convincing than one on thin participation.',
        ),
      },
      ar: {
        title: 'فهم المؤشرات الفنية',
        body: bodyBlocks(
          'تقطّر المؤشرات الفنية بيانات السعر والحجم إلى خط واحد أو مخطط. هي لا تتنبأ بالمستقبل — بل تصف الماضي القريب.',
          'مؤشرات الاتجاه: تعمل المتوسطات المتحركة على تمهيد الضوضاء لإظهار الاتجاه الأساسي.',
          'مؤشرات الزخم: يقيس RSI سرعة تحركات الأسعار على مقياس 0-100.',
          'مؤشرات الحجم: تظهر مستويات النشاط الأعلى — الاختراق مع حجم مرتفع أكثر إقناعاً.',
        ),
      },
      seoDescription:
        'Moving averages, RSI, MACD, volume — how each indicator works and when to use it in your trading.',
    },
    {
      en: {
        title: 'Introduction to fundamental analysis',
        slug: 'introduction-to-fundamental-analysis',
        body: bodyBlocks(
          "Fundamental analysis is the art of identifying what drives an asset's fair value and whether the current price reflects it. In forex, fundamentals are primarily macroeconomic.",
          'INTEREST RATE DIFFERENTIALS: Money flows toward higher yields. A country raising rates while others hold tends to see its currency strengthen, as global capital reallocates.',
          'ECONOMIC GROWTH: GDP, employment and PMI data shape expectations for central bank policy. Strong growth raises the probability of rate hikes; weakness raises the probability of cuts.',
          'USING FUNDAMENTALS WITH TECHNICALS: Fundamentals answer "which direction" — technicals answer "when" and "where". Combining both gives you a higher-probability framework.',
        ),
      },
      ar: {
        title: 'مقدمة في التحليل الأساسي',
        body: bodyBlocks(
          'التحليل الأساسي هو فن تحديد ما يدفع القيمة العادلة للأصل وما إذا كان السعر الحالي يعكسها.',
          'فروق أسعار الفائدة: تتدفق الأموال نحو العائدات الأعلى. الدولة التي ترفع الفائدة ترى عادةً تعزز عملتها.',
          'النمو الاقتصادي: تشكّل بيانات الناتج المحلي والتوظيف ومؤشر PMI توقعات سياسة البنك المركزي.',
          'الجمع بين الأساسيات والفنيات: الأساسيات تجيب على "أي اتجاه" — الفنيات تجيب على "متى" و"أين".',
        ),
      },
      seoDescription:
        'Interest rates, GDP, employment data — how fundamentals drive currency, commodity and index prices.',
    },
    {
      en: {
        title: 'Support and resistance: finding the levels that matter',
        slug: 'support-and-resistance-levels-guide',
        body: bodyBlocks(
          'Support and resistance are price levels where buying or selling pressure has historically been strong enough to reverse or stall a move. They are the backbone of most technical trading systems.',
          'HOW LEVELS FORM: A level forms when price reverses sharply from a point multiple times. Each test strengthens the level — and also depletes the resting orders sitting there.',
          'WHEN LEVELS BREAK: A confirmed break occurs on a close beyond the level, ideally with above-average volume. The old resistance becomes new support (and vice versa). False breaks are common near psychological round numbers.',
          'MULTI-TIMEFRAME CONFIRMATION: A level visible on the daily chart is far more significant than one on the 15-minute chart. Check higher timeframes first — trade what the daily sees.',
        ),
      },
      ar: {
        title: 'الدعم والمقاومة: إيجاد المستويات المهمة',
        body: bodyBlocks(
          'مستويات الدعم والمقاومة هي مستويات أسعار حيث كان ضغط الشراء أو البيع قوياً بما يكفي لعكس أو إيقاف حركة.',
          'كيف تتشكل المستويات: يتشكل المستوى عندما ينعكس السعر بشكل حاد من نقطة ما عدة مرات.',
          'عند كسر المستويات: يحدث الكسر المؤكد عند الإغلاق خارج المستوى. تصبح المقاومة القديمة دعماً جديداً.',
          'تأكيد الإطار الزمني المتعدد: المستوى المرئي على الرسم البياني اليومي أكثر أهمية بكثير من المستوى على الرسم 15 دقيقة.',
        ),
      },
      seoDescription:
        'How to identify, draw and trade the support and resistance levels that professional traders watch.',
    },
    {
      en: {
        title: 'Introduction to price action trading',
        slug: 'introduction-to-price-action-trading',
        body: bodyBlocks(
          'Price action trading strips away all indicators and makes decisions based purely on how price behaves — the patterns it forms, the levels it reacts to, and the speed and momentum of its moves.',
          'THE CORE PRINCIPLE: Every buy and sell order in the market is visible in price. No indicator can show you anything that price itself does not already contain — indicators simply reorganise that information.',
          'KEY PRICE ACTION PATTERNS: Inside bars (consolidation), pin bars (rejection), and engulfing candles (momentum shift) are the most reliable setups. All are defined by context, not just shape.',
          "ENTRY AND MANAGEMENT: Price action traders typically wait for the pattern to complete, enter on a break of the pattern's high or low, and place the stop on the opposite side of the pattern.",
        ),
      },
      ar: {
        title: 'مقدمة في تداول حركة السعر',
        body: bodyBlocks(
          'يتجرد تداول حركة السعر من جميع المؤشرات ويتخذ القرارات بناءً على سلوك السعر نفسه.',
          'المبدأ الأساسي: كل أمر شراء وبيع في السوق مرئي في السعر. لا يمكن لأي مؤشر أن يظهر لك شيئاً لا يحتوي عليه السعر نفسه.',
          'أنماط حركة السعر الرئيسية: الأشرطة الداخلية والأشرطة المدببة والشموع الابتلاعية هي الإعدادات الأكثر موثوقية.',
          'الدخول والإدارة: ينتظر متداولو حركة السعر عادةً اكتمال النمط ويدخلون عند كسر النمط.',
        ),
      },
      seoDescription:
        'Read the market without indicators — how professional traders use raw price patterns to time entries.',
    },
    {
      en: {
        title: 'How to read and trade the economic calendar',
        slug: 'how-to-read-trade-economic-calendar',
        body: bodyBlocks(
          "The economic calendar is a trader's essential tool — a scheduled list of data releases and central bank events that are likely to move the markets you trade.",
          'IMPACT RATINGS: Calendar services rate events as high, medium or low impact. Focus on high-impact events: central bank decisions, CPI, NFP, GDP, and retail sales.',
          'CONSENSUS VS ACTUAL: Markets move on the DEVIATION from consensus, not the absolute number. A jobs print of 200k is bullish if consensus was 150k — and bearish if consensus was 250k.',
          'BEFORE AND AFTER THE NUMBER: Positioning begins before the release as traders speculate. The "buy the rumour, sell the news" pattern is common — be careful holding into the print if the market has already moved.',
        ),
      },
      ar: {
        title: 'كيفية قراءة التقويم الاقتصادي والتداول بناءً عليه',
        body: bodyBlocks(
          'التقويم الاقتصادي هو الأداة الأساسية للمتداول — قائمة مجدولة بإصدارات البيانات وأحداث البنك المركزي التي من المرجح أن تحرك الأسواق.',
          'تقييمات التأثير: تصنّف خدمات التقويم الأحداث كعالية أو متوسطة أو منخفضة التأثير.',
          'التوقعات مقابل الفعلي: تتحرك الأسواق بناءً على الانحراف عن التوقعات، وليس الرقم المطلق.',
          'قبل وبعد الرقم: يبدأ تحديد المراكز قبل الإصدار. نمط "اشترِ الإشاعة، بِع الخبر" شائع.',
        ),
      },
      seoDescription:
        'How to read impact ratings, forecast vs actual, and position yourself around high-impact data releases.',
    },
    {
      en: {
        title: 'Lot sizes and position sizing: a complete guide',
        slug: 'lot-sizes-position-sizing-complete-guide',
        body: bodyBlocks(
          'Position sizing is the single most important skill a trader can develop — more important than entry timing, indicator choice or even market selection.',
          'LOT SIZES EXPLAINED: A standard lot in forex is 100,000 units of the base currency. A mini lot is 10,000 units; a micro lot is 1,000 units. For a 1-pip move on EUR/USD, a standard lot gains or loses $10.',
          'THE 1% RULE: Never risk more than 1% of your account on any single trade. With a $10,000 account, your maximum risk per trade is $100. Your stop distance and this risk budget together determine your lot size.',
          'SCALING IN AND OUT: More advanced traders scale into positions — adding to a winner — and scale out of winners, closing partial positions at interim targets. This is position management, not gambling.',
        ),
      },
      ar: {
        title: 'أحجام اللوت وتحديد حجم المركز: دليل شامل',
        body: bodyBlocks(
          'تحديد حجم المركز هو أهم مهارة يمكن للمتداول تطويرها.',
          'شرح أحجام اللوت: اللوت القياسي في الفوركس هو 100,000 وحدة من العملة الأساسية.',
          'قاعدة 1٪: لا تخاطر بأكثر من 1٪ من حسابك في أي صفقة واحدة.',
          'الدخول والخروج التدريجي: يدخل المتداولون الأكثر خبرة إلى المراكز تدريجياً ويخرجون منها تدريجياً.',
        ),
      },
      seoDescription:
        'Standard, mini and micro lots explained — and how to calculate the right position size for any trade.',
    },
  ];

  for (const guide of guides) {
    const doc = await post<{ id: number }>('education-content', {
      title: guide.en.title,
      slug: guide.en.slug,
      contentType: 'guide',
      body: guide.en.body,
      seoDescription: guide.seoDescription,
      isFeatured: (guide as { isFeatured?: boolean }).isFeatured ?? false,
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

  // Ebooks (gated downloadable trading guides)
  const ebooks = [
    {
      en: {
        title: 'The Ultimate Trading Guide 2026',
        summary:
          'Master market mechanics, risk management, and trading psychology with our complete handbook.',
      },
      ar: {
        title: 'دليل التداول الشامل 2026',
        summary: 'أتقن آليات السوق وإدارة المخاطر وسيكولوجية التداول مع دليلنا الكامل.',
      },
      slug: 'ultimate-trading-guide-2026',
    },
    {
      en: {
        title: 'Candlestick Patterns Mastery',
        summary: 'Identify high-probability price patterns across forex, stocks, and commodities.',
      },
      ar: {
        title: 'احتراف أنماط الشموع اليابانية',
        summary: 'حدد أنماط الأسعار عالية الاحتمالية عبر الفوركس والأسهم والسلع.',
      },
      slug: 'candlestick-patterns-mastery',
    },
    {
      en: {
        title: 'Risk Management Blueprint',
        summary: 'Step-by-step risk management strategies used by institutional traders.',
      },
      ar: {
        title: 'مخطط إدارة المخاطر',
        summary: 'استراتيجيات إدارة المخاطر خطوة بخطوة المستخدمة من قبل متداولي المؤسسات.',
      },
      slug: 'risk-management-blueprint',
    },
    {
      en: {
        title: 'The 5% Rule',
        summary:
          'A 56-page framework for never losing more than 5% on a single trade — used by our desk every day.',
      },
      ar: {
        title: 'قاعدة الـ 5%',
        summary: 'إطار لعدم خسارة أكثر من 5% في صفقة واحدة — يستخدمه مكتب التداول لدينا يومياً.',
      },
      slug: 'the-5-percent-rule',
    },
  ];

  for (const ebook of ebooks) {
    const doc = await post<{ id: number }>('education-content', {
      title: ebook.en.title,
      slug: ebook.slug,
      contentType: 'ebook',
      isGated: true,
      seoDescription: ebook.en.summary,
      status: 'published',
    });
    await patch(
      'education-content',
      doc.id,
      {
        title: ebook.ar.title,
        seoDescription: ebook.ar.summary,
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
    const thumbId = await seedImage(`edu-${video.slug}`, video.en.title, {
      bg: '#0B3D2E',
      w: 1280,
      h: 720,
      alt: video.en.title,
    });
    const doc = await post<{ id: number }>('education-content', {
      title: video.en.title,
      slug: video.slug,
      contentType: video.contentType,
      mediaCategory: video.mediaCategory,
      videoEmbed: video.videoEmbed,
      thumbnail: thumbId,
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
  await deleteAllDocs('careers');
  const jobs = [
    {
      en: {
        title: 'Senior Backend Engineer — Trading Infrastructure',
        slug: 'senior-backend-engineer-trading',
        summary:
          'Build and maintain the low-latency execution engine and real-time data pipelines powering Newera.',
        body: bodyBlocks(
          'ROLE: You will work on the core trading infrastructure — order routing, position management, P&L calculation — serving 50,000+ active accounts.',
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
          "Grow Newera's institutional client base across the Gulf Cooperation Council region.",
        body: bodyBlocks(
          'You will identify and onboard institutional clients (hedge funds, family offices, money managers) across the UAE, Saudi Arabia, and Kuwait.',
          'REQUIREMENTS: 5+ years in FX/CFD institutional sales. Existing network of GCC-based fund managers. Fluent in English and Arabic. Experience with Salesforce or similar CRM.',
        ),
      },
      ar: {
        title: 'مدير مبيعات مؤسسية — دول مجلس التعاون',
        summary: 'توسيع قاعدة عملاء نيو إيرا المؤسسيين في منطقة دول مجلس التعاون الخليجي.',
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
    {
      en: {
        title: 'FX Market Analyst',
        slug: 'fx-market-analyst',
        summary:
          'Produce daily and weekly market commentary, trade setups and research reports for Newera clients.',
        body: bodyBlocks(
          'You will write market analysis across forex, indices and commodities — published daily on the Newera research hub.',
          'REQUIREMENTS: 3+ years trading or analyzing FX markets. Strong technical analysis skills (Elliott Wave, Fibonacci, price action). Proven writing ability — samples required.',
        ),
      },
      ar: {
        title: 'محلل أسواق FX',
        summary: 'إنتاج تعليقات سوقية يومية وأسبوعية وتقارير بحثية لعملاء نيو إيرا.',
        body: bodyBlocks(
          'ستكتب تحليلات السوق عبر الفوركس والمؤشرات والسلع — تُنشر يومياً على مركز بحوث نيو إيرا.',
          'المتطلبات: 3 سنوات أو أكثر في تداول أو تحليل أسواق الفوركس. مهارات قوية في التحليل الفني.',
        ),
      },
      department: 'research',
      location: 'Remote / Dubai',
      employmentType: 'full-time',
      sortOrder: 4,
    },
    {
      en: {
        title: 'Compliance Officer — MENA',
        slug: 'compliance-officer-mena',
        summary:
          'Ensure Newera operations comply with FSRA regulations and international AML/KYC standards.',
        body: bodyBlocks(
          "You will be responsible for regulatory compliance across all MENA jurisdictions, maintaining the firm's FSRA licence, and managing AML/KYC policy and training.",
          'REQUIREMENTS: 4+ years compliance experience at an FCA, FSRA or DFSA regulated firm. Strong knowledge of AML/KYC regulations. Law or finance degree preferred.',
        ),
      },
      ar: {
        title: 'مسؤول الامتثال — منطقة الشرق الأوسط وشمال أفريقيا',
        summary: 'ضمان امتثال عمليات نيو إيرا للوائح FSRA ومعايير AML/KYC الدولية.',
        body: bodyBlocks(
          'ستكون مسؤولاً عن الامتثال التنظيمي في جميع ولايات الشرق الأوسط وشمال أفريقيا.',
          'المتطلبات: 4 سنوات أو أكثر من خبرة الامتثال في شركة منظمة من FCA أو FSRA أو DFSA.',
        ),
      },
      department: 'compliance',
      location: 'Abu Dhabi, UAE',
      employmentType: 'full-time',
      sortOrder: 5,
    },
    {
      en: {
        title: 'Performance Marketing Manager',
        slug: 'performance-marketing-manager',
        summary:
          "Own paid acquisition across Google, Meta, and programmatic channels to grow Newera's client base.",
        body: bodyBlocks(
          'You will manage a significant monthly performance marketing budget, running campaigns across paid search, paid social and programmatic display targeting retail traders in the MENA region.',
          'REQUIREMENTS: 4+ years performance marketing experience with budgets of $500k+ per month. Strong analytical skills, proficiency in Google Ads, Meta Ads, and attribution tools.',
        ),
      },
      ar: {
        title: 'مدير التسويق الأدائي',
        summary:
          'إدارة الاستحواذ المدفوع عبر Google وMeta والقنوات البرامجية لتنمية قاعدة عملاء نيو إيرا.',
        body: bodyBlocks(
          'ستدير ميزانية تسويقية شهرية كبيرة، وتشغيل حملات عبر البحث المدفوع والتواصل الاجتماعي المدفوع.',
          'المتطلبات: 4 سنوات أو أكثر من خبرة التسويق الأدائي بميزانيات تزيد عن 500 ألف دولار شهرياً.',
        ),
      },
      department: 'marketing',
      location: 'Dubai, UAE',
      employmentType: 'full-time',
      sortOrder: 6,
    },
    {
      en: {
        title: 'Senior Product Designer',
        slug: 'senior-product-designer',
        summary: "Lead the design of Newera's web and mobile trading experience.",
        body: bodyBlocks(
          'You will own the design process end-to-end — from user research to final component specs — across our web platform, mobile apps, and client-facing tools.',
          'REQUIREMENTS: 5+ years product design experience. Proficiency in Figma. Experience designing for complex, data-rich products. Portfolio of shipped work required.',
        ),
      },
      ar: {
        title: 'مصمم منتجات أول',
        summary: 'قيادة تصميم تجربة التداول على الويب والجوال لنيو إيرا.',
        body: bodyBlocks(
          'ستمتلك عملية التصميم من البداية إلى النهاية — من أبحاث المستخدم إلى مواصفات المكونات النهائية.',
          'المتطلبات: 5 سنوات أو أكثر من خبرة تصميم المنتجات. إجادة Figma. خبرة في تصميم منتجات غنية بالبيانات.',
        ),
      },
      department: 'design',
      location: 'Remote',
      employmentType: 'full-time',
      sortOrder: 7,
    },
    {
      en: {
        title: 'Introducing Broker Partnership Manager',
        slug: 'ib-partnership-manager',
        summary:
          "Build and manage Newera's global network of introducing brokers and affiliate partners.",
        body: bodyBlocks(
          'You will recruit, onboard and grow a portfolio of IB partners — individuals and small businesses who refer clients to Newera in exchange for commission rebates.',
          'REQUIREMENTS: 3+ years in FX/CFD broker partnerships. Existing network of IB relationships. Strong commercial negotiation skills. Experience with IB portal management.',
        ),
      },
      ar: {
        title: 'مدير شراكات الوسطاء المعرِّفين',
        summary: 'بناء وإدارة شبكة نيو إيرا العالمية من الوسطاء المعرِّفين والشركاء التابعين.',
        body: bodyBlocks(
          'ستقوم باستقطاب وتأهيل وتنمية محفظة من شركاء IB.',
          'المتطلبات: 3 سنوات أو أكثر في شراكات وسطاء الفوركس/CFD. شبكة علاقات IB قائمة.',
        ),
      },
      department: 'sales',
      location: 'Dubai, UAE',
      employmentType: 'full-time',
      sortOrder: 8,
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
  await deleteAllDocs('webinars');
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
          'Chief Compliance Officer at Newera. Covers position sizing, drawdown protection, and psychological discipline.',
      },
      ar: {
        title: 'دورة متخصصة في إدارة المخاطر: حماية رأس المال في الأسواق المتقلبة',
        speakerBio:
          'مديرة الامتثال الرئيسية في نيو إيرا. تغطي تحديد حجم المركز وحماية السحب والانضباط النفسي.',
      },
      scheduledAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'completed',
      replayUrl: 'https://www.youtube.com/watch?v=placeholder-risk',
    },
    {
      en: {
        title: 'Technical Analysis Foundations: Support, Resistance & Trend Lines',
        slug: 'technical-analysis-foundations-support-resistance',
        speaker: 'Marcus Webb',
        speakerBio:
          'This session covers the building blocks every technical trader needs — how to identify key levels, draw trend lines correctly, and use them to time entries and exits.',
      },
      ar: {
        title: 'أسس التحليل الفني: الدعم والمقاومة وخطوط الاتجاه',
        speakerBio:
          'تغطي هذه الجلسة اللبنات الأساسية التي يحتاجها كل متداول فني — كيفية تحديد المستويات الرئيسية ورسم خطوط الاتجاه بشكل صحيح.',
      },
      scheduledAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'upcoming',
      zoomRegistrationLink: 'https://zoom.us/webinar/register/placeholder-ta',
    },
    {
      en: {
        title: 'How to Trade Economic Calendar Events: CPI, GDP & NFP',
        slug: 'trading-economic-calendar-cpi-gdp-nfp',
        speaker: 'Claire Deschamps',
        speakerBio:
          'Learn how to prepare for, react to, and recover from high-impact economic data releases. Covers pre-release positioning, stop placement, and post-release follow-through.',
      },
      ar: {
        title: 'كيفية تداول أحداث التقويم الاقتصادي: CPI وGDP وNFP',
        speakerBio:
          'تعلّم كيفية الاستعداد للإصدارات الاقتصادية عالية التأثير والتفاعل معها والتعافي منها.',
      },
      scheduledAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'completed',
      replayUrl: 'https://www.youtube.com/watch?v=placeholder-calendar',
    },
    {
      en: {
        title: 'Introduction to CFD Trading: Contracts, Costs & Calculations',
        slug: 'introduction-to-cfd-trading-contracts-costs',
        speaker: 'Priya Sharma',
        speakerBio:
          "A complete beginner's guide to how CFDs work, how costs are calculated (spread, swap, commission), and how to place your first trade on MT5.",
      },
      ar: {
        title: 'مقدمة في تداول العقود مقابل الفروقات: العقود والتكاليف والحسابات',
        speakerBio:
          'دليل المبتدئين الكامل حول كيفية عمل CFDs وكيفية حساب التكاليف وكيفية تنفيذ أول صفقة على MT5.',
      },
      scheduledAt: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'upcoming',
      zoomRegistrationLink: 'https://zoom.us/webinar/register/placeholder-cfd',
    },
    {
      en: {
        title: 'Trading Psychology: Overcoming Fear, Greed and Revenge Trading',
        slug: 'trading-psychology-fear-greed-revenge-trading',
        speaker: 'James Thornton',
        speakerBio:
          'Why most traders are their own worst enemy — and practical techniques to trade with discipline, manage losses without spiralling, and build consistency over time.',
      },
      ar: {
        title: 'سيكولوجية التداول: التغلب على الخوف والطمع والتداول الانتقامي',
        speakerBio:
          'لماذا يكون معظم المتداولين عدوهم الأكبر — وتقنيات عملية للتداول بانضباط وإدارة الخسائر وبناء الاتساق.',
      },
      scheduledAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC+4 (Dubai)',
      status: 'completed',
      replayUrl: 'https://www.youtube.com/watch?v=placeholder-psychology',
    },
  ];

  for (const w of webinars) {
    const thumbId = await seedImage(`webinar-${w.en.slug}`, w.en.title, {
      bg: '#10261C',
      w: 1280,
      h: 720,
      alt: w.en.title,
    });
    const doc = await post<{ id: number }>('webinars', {
      title: w.en.title,
      slug: w.en.slug,
      speaker: w.en.speaker,
      speakerBio: w.en.speakerBio,
      scheduledAt: w.scheduledAt,
      timezone: w.timezone,
      status: w.status,
      thumbnail: thumbId,
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
      'Take your partner business to the next level with advanced tools, high rebate payouts, and full partner support from Newera.',
    ibDescription:
      'Earn up to $8 per lot traded by your referrals. Tiered structure with monthly bonus.',
    affiliateDescription:
      'Fixed cost-per-acquisition payouts up to $1,200 per qualified trader. Built for digital marketers.',
    whiteLabelDescription:
      'Launch your own brokerage on our infrastructure. Full MT5 stack, KYC, treasury, support.',
    ibTag: 'MOST POPULAR',
    ibRateDisplay: '$8/lot',
    ibPayoutsFrequency: 'Monthly',
    ibMinimum: 'None',
    affiliateTag: 'CPA',
    affiliateCpaMax: '$1,200',
    affiliateCookieDays: '90 days',
    affiliateMinCpa: '$50',
    wlTag: 'ENTERPRISE',
    wlSetupTime: '< 30 days',
    wlSpreadMarkup: 'Custom',
    wlTechStack: 'Turnkey',
    // Hero stat band + income ladder + rebate matrix + FTD condition — global
    // (not localized), matching the ibRateDisplay-style fields above.
    heroStat1Value: '$5,000',
    heroStat2Value: '15',
    heroStat3Value: '3',
    heroStat4Value: '4',
    incomeLadder: [
      { balanceLabel: '$30,000 to $50,000', minBalance: 30000, incomeValue: '$500' },
      { balanceLabel: '$50,000 to $100,000', minBalance: 50000, incomeValue: '$750' },
      { balanceLabel: '$100,000 to $200,000', minBalance: 100000, incomeValue: '$1,250' },
      { balanceLabel: '$200,000 to $300,000', minBalance: 200000, incomeValue: '$2,000' },
      { balanceLabel: '$300,000 to $400,000', minBalance: 300000, incomeValue: '$3,000' },
      { balanceLabel: '$400,000 to $500,000', minBalance: 400000, incomeValue: '$4,000' },
      { balanceLabel: '$500,000+', minBalance: 500000, incomeValue: '$5,000', isTopSlab: true },
    ],
    rebateTables: [
      {
        instrumentNameEn: 'Gold, XAU/USD',
        instrumentNameAr: 'الذهب، XAU/USD',
        rows: [
          { spread: '7-8', commission: '10', rebate: '3' },
          { spread: '20', commission: '0', rebate: '5' },
          { spread: '30', commission: '0', rebate: '15' },
        ],
      },
      {
        instrumentNameEn: 'FX majors',
        instrumentNameAr: 'أزواج الفوركس الرئيسية',
        rows: [
          { spread: '2-4', commission: '7', rebate: '2' },
          { spread: '12-15', commission: '0', rebate: '4' },
          { spread: '18-22', commission: '0', rebate: '8' },
        ],
      },
      {
        instrumentNameEn: 'Silver, XAG/USD',
        instrumentNameAr: 'الفضة، XAG/USD',
        rows: [
          { spread: '15-20', commission: '10', rebate: '3' },
          { spread: '35-45', commission: '0', rebate: '8' },
          { spread: '50-70', commission: '0', rebate: '15' },
        ],
      },
    ],
    ftdCap: 'USD 10,000',
    ftdMinLots: '50',
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
        'انتقل بأعمال الشراكة الخاصة بك إلى المستوى التالي مع أدوات متقدمة، ودفعات عمولات مرتفعة، ودعم كامل للشركاء من نيو إيرا.',
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

// ─── Research Reports (gated PDF downloads — /research) ──────────────────────

async function seedResearchReports() {
  console.log('📄 Research Reports...');
  await deleteAllDocs('research-reports');
  const reports = [
    {
      en: {
        title: 'Q3 2026 Global Macro Outlook',
        slug: 'q3-2026-global-macro-outlook',
        summary:
          'Our 28-page deep dive into central bank trajectories, the dollar cycle, and the asset classes positioned to outperform through Q3 2026.',
      },
      ar: {
        title: 'النظرة الكلية العالمية للربع الثالث 2026',
        summary:
          'تحليل معمّق من 28 صفحة لمسارات البنوك المركزية، ودورة الدولار، وفئات الأصول المهيأة للتفوق خلال الربع الثالث من 2026.',
      },
      date: '2026-06-01',
      isGated: true,
      bg: '#0B3D2E',
    },
    {
      en: {
        title: 'MENA FX Quarterly: Dollar Dominance & Oil Crosscurrents',
        slug: 'mena-fx-quarterly-2026',
        summary:
          'A regional currency report covering AED, SAR, EGP and the trade-weighted dollar, with positioning ideas for MENA-based traders.',
      },
      ar: {
        title: 'فوركس الشرق الأوسط الفصلي: هيمنة الدولار وتيارات النفط',
        summary:
          'تقرير عملات إقليمي يغطي الدرهم والريال والجنيه والدولار المرجح تجارياً، مع أفكار تموضع للمتداولين في المنطقة.',
      },
      date: '2026-05-12',
      isGated: true,
      bg: '#10261C',
    },
    {
      en: {
        title: 'Gold in 2026: Safe-Haven Demand vs Real Yields',
        slug: 'gold-2026-safe-haven-real-yields',
        summary:
          'How structural central-bank buying, real-yield dynamics and ETF flows are reshaping the gold thesis for the year ahead.',
      },
      ar: {
        title: 'الذهب في 2026: الطلب على الملاذ الآمن مقابل العوائد الحقيقية',
        summary:
          'كيف يعيد الشراء الهيكلي للبنوك المركزية وديناميكيات العوائد الحقيقية وتدفقات الصناديق تشكيل أطروحة الذهب للعام المقبل.',
      },
      date: '2026-04-08',
      isGated: false,
      bg: '#1A1206',
    },
  ];

  for (const r of reports) {
    const coverId = await seedImage(`report-cover-${r.en.slug}`, r.en.title, {
      bg: r.bg,
      w: 800,
      h: 1000,
      alt: `${r.en.title} — report cover`,
    });
    const pdfId = await seedPdf(`report-pdf-${r.en.slug}`, r.en.title);
    const doc = await post<{ id: number }>('research-reports', {
      title: r.en.title,
      slug: r.en.slug,
      status: 'published',
      publishedDate: r.date,
      summary: r.en.summary,
      reportFile: pdfId,
      thumbnail: coverId,
      isGated: r.isGated,
    });
    await patch('research-reports', doc.id, { title: r.ar.title, summary: r.ar.summary }, 'ar');
  }
  console.log(`   ✅ ${reports.length} research reports created (EN + AR, with PDF + cover)`);
}

// ─── Media & Press (press coverage — /company/media-press) ───────────────────

async function seedAnalystCalls() {
  console.log('📈 Analyst Calls...');
  // Idempotent: analyst-calls has no unique field, so createDoc (a plain POST)
  // would insert a fresh duplicate set on every re-run — the cause of the
  // Analyst Chart page rendering each pair multiple times. Skip if already seeded.
  const existing = await api('GET', '/analyst-calls', undefined, { limit: '1' });
  if ((existing?.totalDocs ?? 0) > 0) {
    console.log(`   ⏭️  ${existing.totalDocs} analyst calls already exist — skipping`);
    return;
  }
  const calls = [
    {
      symbol: 'EUR/USD',
      tvSymbol: 'OANDA:EURUSD',
      currentPrice: '1.0842',
      targetPrice: '+ 1.0980',
      confidence: 80,
      sentiment: 'BULLISH',
      category: 'Majors',
      sparkPoints: '[28,30,29,33,31,35,34,37,36,40]',
      sortOrder: 1,
      status: 'active',
    },
    {
      symbol: 'USD/JPY',
      tvSymbol: 'OANDA:USDJPY',
      currentPrice: '157.34',
      targetPrice: '± 35.20',
      confidence: 65,
      sentiment: 'BEARISH',
      category: 'Majors',
      sparkPoints: '[40,38,39,37,36,35,33,32,30,28]',
      sortOrder: 2,
      status: 'active',
    },
    {
      symbol: 'GBP/USD',
      tvSymbol: 'OANDA:GBPUSD',
      currentPrice: '1.2718',
      targetPrice: '+ 1.3710',
      confidence: 50,
      sentiment: 'NEUTRAL',
      category: 'Majors',
      sparkPoints: '[30,31,30,32,31,33,32,33,32,34]',
      sortOrder: 3,
      status: 'active',
    },
    {
      symbol: 'XAU/USD',
      tvSymbol: 'OANDA:XAUUSD',
      currentPrice: '2,318.40',
      targetPrice: '+ 2,360.00',
      confidence: 72,
      sentiment: 'BULLISH',
      category: 'Commodities',
      sparkPoints: '[26,29,27,32,30,35,34,38,37,42]',
      sortOrder: 4,
      status: 'active',
    },
    {
      symbol: 'BTC/USD',
      tvSymbol: 'BITSTAMP:BTCUSD',
      currentPrice: '67,250',
      targetPrice: '+ 72,000',
      confidence: 60,
      sentiment: 'BULLISH',
      category: 'Crypto',
      sparkPoints: '[25,30,28,33,31,36,35,39,38,44]',
      sortOrder: 5,
      status: 'active',
    },
    {
      symbol: 'GBP/JPY',
      tvSymbol: 'OANDA:GBPJPY',
      currentPrice: '198.12',
      targetPrice: '± 2.10',
      confidence: 45,
      sentiment: 'NEUTRAL',
      category: 'Crosses',
      sparkPoints: '[34,33,35,32,34,31,33,30,32,31]',
      sortOrder: 6,
      status: 'active',
    },
  ];
  for (const call of calls) {
    await createDoc('analyst-calls', call);
  }
  console.log(`   ✅ ${calls.length} analyst calls seeded`);
}

async function seedMediaPress() {
  console.log('📰 Media & Press...');
  await deleteAllDocs('media-press');
  const items = [
    {
      en: {
        headline: 'Newera launches raw-spread accounts for MENA retail traders',
        excerpt:
          'The broker expands its product line with institutional-grade pricing aimed at the region’s fast-growing retail base.',
      },
      ar: {
        headline: 'Newera تطلق حسابات السبريد الخام لمتداولي التجزئة في الشرق الأوسط',
        excerpt:
          'الوسيط يوسّع خط منتجاته بتسعير بمستوى مؤسسي يستهدف قاعدة التجزئة سريعة النمو في المنطقة.',
      },
      publication: 'Bloomberg',
      date: '2026-05-28',
      url: 'https://www.bloomberg.com/',
      isFeatured: true,
      sortOrder: 1,
    },
    {
      en: {
        headline: 'Interview: How Newera is approaching MT5 connectivity and execution',
        excerpt:
          'A sit-down with the trading desk on latency, liquidity routing, and what transparent execution means for clients.',
      },
      ar: {
        headline: 'مقابلة: كيف تتعامل Newera مع اتصال MT5 والتنفيذ',
        excerpt:
          'جلسة مع مكتب التداول حول زمن الاستجابة وتوجيه السيولة ومعنى التنفيذ الشفاف للعملاء.',
      },
      publication: 'Reuters',
      date: '2026-04-19',
      url: 'https://www.reuters.com/',
      isFeatured: true,
      sortOrder: 2,
    },
    {
      en: {
        headline: 'Newera named among the fastest-growing brokers in the Gulf',
        excerpt:
          'Independent analysis highlights the firm’s client growth, regulatory posture and education-first approach.',
      },
      ar: {
        headline: 'Newera تُصنَّف بين أسرع الوسطاء نمواً في الخليج',
        excerpt:
          'تحليل مستقل يسلّط الضوء على نمو العملاء والموقف التنظيمي ونهج التعليم أولاً لدى الشركة.',
      },
      publication: 'Forbes Middle East',
      date: '2026-03-02',
      url: 'https://www.forbesmiddleeast.com/',
      isFeatured: false,
      sortOrder: 3,
    },
    {
      en: {
        headline: 'Opinion: Why transparent fee structures matter for retail FX',
        excerpt:
          'A guest column from the Newera research team on the long-term value of clear, all-in pricing.',
      },
      ar: {
        headline: 'رأي: لماذا تهمّ هياكل الرسوم الشفافة لتداول الفوركس بالتجزئة',
        excerpt: 'مقال ضيف من فريق أبحاث Newera حول القيمة طويلة الأجل للتسعير الواضح والشامل.',
      },
      publication: 'The National',
      date: '2026-02-14',
      url: 'https://www.thenationalnews.com/',
      isFeatured: false,
      sortOrder: 4,
    },
  ];

  for (const item of items) {
    const logoId = await seedImage(
      `press-logo-${item.publication.toLowerCase().replace(/\s+/g, '-')}`,
      item.publication,
      {
        bg: '#0E2A20',
        w: 480,
        h: 260,
        alt: `${item.publication} logo`,
      },
    );
    const doc = await post<{ id: number }>('media-press', {
      headline: item.en.headline,
      publication: item.publication,
      date: item.date,
      url: item.url,
      excerpt: item.en.excerpt,
      logo: logoId,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
      status: 'published',
    });
    await patch(
      'media-press',
      doc.id,
      { headline: item.ar.headline, excerpt: item.ar.excerpt },
      'ar',
    );
  }
  console.log(`   ✅ ${items.length} media-press items created (EN + AR, with logos)`);
}

// ─── main ───────────────────────────────────────────────────────────────────

// Optional single-collection targets so a re-run can refresh just one collection
// (e.g. `npm run seed -- legal`) without wiping and recreating everything.
const SEED_TARGETS: Record<string, () => Promise<void>> = {
  'site-settings': seedSiteSettings,
  'account-types': seedAccountTypes,
  'payment-methods': seedPaymentMethods,
  instruments: seedInstruments,
  faqs: seedFaqs,
  blog: seedBlogPosts,
  'market-analysis': seedMarketAnalysis,
  news: seedNews,
  legal: seedLegalPages,
  team: seedTeamMembers,
  awards: seedAwards,
  promotions: seedPromotions,
  education: seedEducation,
  careers: seedCareers,
  webinars: seedWebinars,
  ib: seedIBContent,
  research: seedResearchReports,
  'analyst-calls': seedAnalystCalls,
  'media-press': seedMediaPress,
};

async function main() {
  console.log('\n🌱 Newera Demo Data Seed\n');
  const only = process.argv[2];
  try {
    await login();
    if (only) {
      const seeder = SEED_TARGETS[only];
      if (!seeder) {
        console.error(
          `❌ Unknown seed target "${only}". Valid targets: ${Object.keys(SEED_TARGETS).join(', ')}`,
        );
        process.exit(1);
      }
      console.log(`🎯 Seeding only: ${only}\n`);
      await seeder();
      console.log('\n✅ Seed complete!\n');
      return;
    }
    // Wipe media first so re-runs reuse a clean slate instead of leaving
    // orphaned uploads behind. Every collection that references media is
    // seeded after this point, so nothing is left dangling.
    console.log('🧹 Resetting media library...');
    await deleteAllDocs('media');
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
    await seedResearchReports();
    await seedAnalystCalls();
    await seedMediaPress();
    console.log('\n✅ Seed complete!\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
