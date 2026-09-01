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
    contactAddressEn: null,
    contactAddressAr: null,
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
        heading: 'arkets',
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
        heading: 'ompany',
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
    // 1. Terms & Conditions (from Website-Terms-Conditions.pdf)
    {
      pageType: 'terms',
      en: {
        title: 'Terms and Conditions',
        slug: 'terms-and-conditions',
        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED ("the Company / NCML") (Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of International Business Companies Act, Saint Lucia. Your access to and use of this website is subject to these terms and conditions, our Terms and Conditions of Service (as applicable to your jurisdiction of residence), and any notices, disclaimers or other statements contained on this website (referred to collectively as "Terms"). By using this website, you agree to be subject to the Terms.',
          [
            {
              heading: 'Preamble',
              body: 'NEWERA CAPITAL MARKETS LIMITED (“the Company / NCML”) (Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of the International Business Companies Act, Saint Lucia. Your access to and use of this website is subject to these terms and conditions, our Terms and Conditions of Service (as applicable to your jurisdiction of residence), and any notices, disclaimers or other statements contained on this website (referred to collectively as “Terms”). By using this website, you agree to be subject to the Terms.',
            },
            {
              heading: 'Accuracy of information',
              body: 'Although the content of this website is based on information that we consider to be reliable and endeavour to keep current, we do not warrant that any information on this website is current or accurate as of the date (and time) of its availability. To the extent permitted by laws, we do not accept any responsibility arising in any way from errors in, or omissions from, the information on this website. The products and services described on this website vary from time to time and may not always be available or may be restricted.',
            },
            {
              heading: 'Visitors to this website',
              body: 'The information on this website is not intended for distribution to, or use by, any person in any country or jurisdiction where its distribution or use would be contrary to local laws or regulations. Visitors to this website are responsible for ascertaining the terms of and complying with any local laws or regulations that they are subject to. Strictly, you must be over eighteen (18) years of age to use our services.',
            },
            {
              heading: 'General information only',
              body: 'The information on this website is general in nature and does not take into account your personal investment objectives, financial situation or means. It also does not constitute a recommendation that you enter into a particular transaction, nor is it a representation that any product described on this website is suitable or appropriate for you. The Company is not a financial advisor. None of the material contained on this website should be construed as business, financial, investment, hedging, trading, legal, regulatory, tax, or accounting advice. Nor should you use the content of this website as the primary basis for any investment decisions that you wish to make. We encourage you to seek independent advice before deciding whether to acquire our services. Also, please ensure that you read and understand our legal documents before you decide whether to use our services.',
            },
            {
              heading: 'Copyright and trademark',
              body: 'Except where it is necessary for you to view this website on your browser, or as permitted under the applicable laws or the Terms, none of the information or content on this website is permitted to be reproduced, adapted, uploaded to a third party, distributed or transmitted in any form by any process without the Company’s written consent. Newera Capital Markets Limited and the NCML logo are registered trademarks of the Company. Apple, the Apple logo, Mac, iPhone, iPad, and iPod touch are trademarks of Apple Inc., registered in the United States and other countries. App Store is a service mark of Apple Inc. Android is a trademark of Google Inc., while Windows is a registered trademark of Microsoft Corporation in the United States and other countries.',
            },
            {
              heading: 'Third party content',
              body: 'From time to time, this website may contain links to other websites or resources provided by third parties. We provide you with third-party links/resources solely for your information and convenience. We do not make any representations or warranties about the content, suitability or appropriateness of the content or products contained in any third-party websites or resources.',
            },
            {
              heading: 'Disclaimer and limitation of liability',
              body: 'To the maximum extent permitted by laws, we will not be liable in any way for loss or damage suffered by you through use of or access to this website, or our failure to provide this website.',
            },
            {
              heading: 'Review of website terms & conditions',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated. This Website Terms & Conditions is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
            },
          ],
        ),
      },
      ar: {
        title: 'الشروط والأحكام',
        body: legalBody(
          'تأسست شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / NCML") (رقم الشركة: 2023-00564) في 8 نوفمبر 2023 بموجب الفصل 12.14، المادة 6 من قانون الشركات التجارية الدولية في سانت لوسيا. يخضع وصولك إلى هذا الموقع واستخدامك له لهذه الشروط والأحكام، وشروط وأحكام الخدمة الخاصة بنا (حسب ما ينطبق على ولايتك القضائية)، وأي إشعارات أو إخلاء مسؤولية أو بيانات أخرى واردة في هذا الموقع (المشار إليها مجتمعة باسم "الشروط"). من خلال استخدام هذا الموقع، فإنك توافق على الالتزام بهذه الشروط.',
          [
            {
              heading: 'مقدمة',
              body: 'تم تأسيس شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / NCML") (رقم الشركة: 2023-00564) في 8 نوفمبر 2023 بموجب الفصل 12.14، القسم 6 من قانون الشركات التجارية الدولية في سانت لوسيا. يخضع وصولك إلى هذا الموقع الإلكتروني واستخدامك له لهذه الشروط والأحكام، وشروط وأحكام الخدمة الخاصة بنا (حسبما ينطبق على الولاية القضائية لمحل إقامتك)، وأي إشعارات أو إخلاءات مسؤولية أو بيانات أخرى واردة في هذا الموقع الإلكتروني (ويُشار إليها مجتمعة باسم "الشروط"). باستخدامك لهذا الموقع الإلكتروني، فإنك توافق على الالتزام بهذه الشروط.',
            },
            {
              heading: 'دقة المعلومات',
              body: 'على الرغم من أن محتوى هذا الموقع يستند إلى معلومات نعتبرها موثوقة ونسعى جاهدين لإبقائها محدثة، إلا أننا لا نضمن أن أي معلومات على هذا الموقع محدثة أو دقيقة اعتبارًا من تاريخ (ووقت) توفرها. وإلى الحد الذي تسمح به القوانين، فإننا لا نتحمل أي مسؤولية تنشأ بأي شكل من الأشكال عن الأخطاء أو السهو في المعلومات الواردة في هذا الموقع. تختلف المنتجات والخدمات الموضحة على هذا الموقع من وقت لآخر، وقد لا تكون متاحة دائمًا أو قد تكون خاضعة لقيود.',
            },
            {
              heading: 'زوار هذا الموقع',
              body: 'المعلومات الواردة في هذا الموقع ليست مخصصة للتوزيع على أو الاستخدام من قبل أي شخص في أي بلد أو ولاية قضائية يكون فيها هذا التوزيع أو الاستخدام مخالفًا للقوانين أو اللوائح المحلية. يتحمل زوار هذا الموقع مسؤولية التحقق من الشروط والامتثال لأي قوانين أو لوائح محلية يخضعون لها. يجب أن يكون عمرك أكثر من ثمانية عشر (18) عامًا لاستخدام خدماتنا.',
            },
            {
              heading: 'معلومات عامة فقط',
              body: 'المعلومات الواردة في هذا الموقع عامة بطبيعتها ولا تأخذ في الاعتبار أهدافك الاستثمارية الشخصية أو وضعك المالي أو إمكانياتك. كما أنها لا تشكل توصية بالدخول في معاملة معينة، وليست إقرارًا بأن أي منتج موضح على هذا الموقع مناسب أو ملائم لك. الشركة ليست مستشارًا ماليًا. لا ينبغي تفسير أي من المواد الواردة في هذا الموقع على أنها نصيحة تجارية أو مالية أو استثمارية أو تحوطية أو تداولية أو قانونية أو تنظيمية أو ضريبية أو محاسبية. ولا ينبغي استخدام محتوى هذا الموقع كأساس رئيسي لأي قرارات استثمارية ترغب في اتخاذها. نشجعك على طلب مشورة مستقلة قبل اتخاذ قرار بشأن الحصول على خدماتنا. كما يرجى التأكد من قراءة وفهم وثائقنا القانونية قبل اتخاذ قرار بشأن استخدام خدماتنا.',
            },
            {
              heading: 'حقوق الطبع والنشر والعلامات التجارية',
              body: 'باستثناء ما هو ضروري لعرض هذا الموقع على متصفحك، أو كما هو مسموح به بموجب القوانين المعمول بها أو الشروط، لا يُسمح بإعادة إنتاج أي من المعلومات أو المحتوى الموجود على هذا الموقع أو تكييفه أو تحميله إلى طرف ثالث أو توزيعه أو نقله بأي شكل من الأشكال أو بأي وسيلة دون موافقة خطية من الشركة. تعد Newera Capital Markets Limited وشعار NCML علامات تجارية مسجلة للشركة. وتعد Apple وشعار Apple وMac وiPhone وiPad وiPod touch علامات تجارية لشركة Apple Inc. مسجلة في الولايات المتحدة وبلدان أخرى. App Store هي علامة خدمة لشركة Apple Inc. Android هي علامة تجارية لشركة Google Inc.، بينما Windows هي علامة تجارية مسجلة لشركة Microsoft Corporation في الولايات المتحدة وبلدان أخرى.',
            },
            {
              heading: 'محتوى الأطراف الثالثة',
              body: 'من وقت لآخر، قد يحتوي هذا الموقع على روابط لمواقع إلكترونية أو موارد أخرى تقدمها أطراف ثالثة. نحن نقدم لك روابط وموارد الأطراف الثالثة فقط لأغراض المعلومات والراحة. ولا نقدم أي تعهدات أو ضمانات بشأن المحتوى أو ملاءمة أو مناسبة المحتوى أو المنتجات الموجودة في أي مواقع إلكترونية أو موارد تابعة لأطراف ثالثة.',
            },
            {
              heading: 'إخلاء المسؤولية وتحديد المسؤولية',
              body: 'إلى أقصى حد تسمح به القوانين، لن نكون مسؤولين بأي شكل من الأشكال عن أي خسارة أو ضرر تتكبده من خلال استخدام هذا الموقع أو الوصول إليه، أو نتيجة لفشلنا في توفير هذا الموقع.',
            },
            {
              heading: 'مراجعة الشروط والأحكام الخاصة بالموقع',
              body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (كل ستة أشهر على الأقل) لتقييم فعاليتها وتحديثها. هذه الشروط والأحكام الخاصة بالموقع مدعومة من الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في أعمالها وتعاملاتها مع العملاء.',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 2. Privacy Policy (from Privacy Policies.docx)
    {
      pageType: 'privacy-policy',
      en: {
        title: 'Privacy Policy',
        slug: 'privacy-policy',

        body: legalBody('', [
          {
            heading: 'Privacy policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED (“the Company / Newera Capital”) is committed to protecting its customers’ and other website users’ (“the Client / the Clients”) privacy and developing technology that gives the Clients the most powerful, satisfying, and safe online experience. This Privacy Policy (the “Policy”) applies to the Newera Capital website and governs data collection and usage. By using the Newera Capital website, the Clients would indicate their consent to the data practices described in this Policy.',
          },
          {
            heading: 'Collection of the clients’ personal information',
            body: 'In accordance with applicable Anti-Money Laundering and Counter-Terrorism Financing regulations and laws, Newera Capital has an obligation to collect information and verify the identity of its Clients. This information is referred to as Know Your Client information or KYC information. Specifically, the information we collect for KYC identification may include identity, contact details, National Identifier, Socio-demographic, transactional, financial, contractual, documentary data, etc. Newera Capital will carry out its customer identification and verification procedures.\n\nWhen submitting a Client’s application form to open a live or demo account with Newera Capital, he/she will be providing entities within the Newera Capital group of companies (collectively, the “Newera Capital Group”), and its affiliated entities with their personal information. By applying for and/or opening a live or demo Newera Capital account, the Client acknowledges and agrees that their consent is voluntarily provided to the Newera Capital Group and its affiliated entities, including Newera Capital Markets Limited.\n\nPersonal information refers to any information about the Client that identifies the Client or by which the Client’s identity can reasonably be ascertained.\n\nNewera Capital will also maintain records of all transactions and activities on the Client’s account(s), including, but not limited to, details of liquidations on the Client’s account(s). Newera Capital may also collect information about the Client from publicly available sources such as company registers. At any time, upon request, the Client may gain access to the information Newera Capital holds about the Client. Newera Capital may also record telephone conversations between the Client and persons working for Newera Capital. Such recordings, or transcripts from such recordings, may be used to resolve any dispute between the Client and Newera Capital and with a view to satisfying Newera Capital’s statutory obligations, including requests from regulators and other government bodies. Newera Capital will also collect and hold information about the Client when the Client completes an online application or other type of form or operates and deals on the Client’s Account through Newera Capital’s websites.\n\nNewera Capital may collect sensitive information about a Client if:\n\nThe collection is required or authorized by applicable laws or court/tribunal order;\n\nThe Client consents to the collection and the information is reasonably necessary for Newera Capital’s functions and activities;\n\nNewera Capital reasonably believes that collection is necessary to lessen or prevent a serious threat to the life, health, or safety of an individual or the public, and it is unreasonable or impracticable to obtain the Clients’ consent to the collection;\n\nNewera Capital has reason to suspect that unlawful activity or misconduct of a serious nature that relates to Newera Capital’s functions or activities is being or may be engaged in;\n\nNewera Capital believes that the collection is reasonably necessary to assist in locating a person who has been reported as missing.\n\nThe Clients are not directly imposed to give Newera Capital their personal information in the application forms. However, without the information required, Newera Capital may not be able to open an account and/or provide services to them. While Newera Capital makes every effort to ensure that all information it holds about Clients is accurate, complete, and up to date, Clients need to notify Newera Capital promptly if there are any changes to the Clients’ personal information. Should the Clients have any questions or complaints about their privacy, the Clients should contact Newera Capital. From time to time, Newera Capital may receive personal information about the Clients’ from third-party sources, but only where Newera Capital has checked that these third parties either have their consent or are otherwise legally permitted or required to disclose their personal information to us. Newera Capital uses the information received from these third parties to enhance services provided to the Clients, such as providing curated content that is relevant to services and topics they are interested in.\n\nWhen the Clients visit Newera Capital website, Newera Capital may collect certain information automatically from the Clients’ devices. In some countries, including countries in the European Economic Area (EEA) and PRC, this information may be considered personal information under applicable data protection laws. Specifically, the information collected automatically may include information like the Clients’ IP address, device type, unique device identification numbers, browser-type, broad geographic location (for example, country or city-level location), and other technical information.\n\nNewera Capital may also collect information about how the Clients’ devices interact with Newera Capital website, including the pages accessed and links clicked. Collecting this information enables Newera Capital to better understand the visitors who come to its website, where they come from, and which content at Newera Capital website they are interested in.\n\nAlso, Newera Capital uses this information for its internal analytics purposes and to improve the quality and relevance of Newera Capital website.\n\nNewera Capital encourages the Clients to review the privacy policies of websites they choose to link so that they can understand how those websites collect, use, and share the Clients’ information. Newera Capital is not responsible for the privacy policies or other content on websites outside of the Newera Capital (and its sister Companies) websites.\n\nIn all cases, Newera Capital strives to limit the amount of information to be collected and stored to only those that are necessary, so that it could provide the Clients with the relevant services.',
          },
          {
            heading: 'Use of the clients’ personal information',
            body: 'Newera Capital collects and uses the Clients’ personal information to operate its website and deliver the services that the Clients need. Newera Capital also uses the Clients’ personally identifiable information to inform them of other products or services offered by Newera Capital and its affiliates. Newera Capital does not sell, rent, or lease its customer lists to third parties.\n\nNewera Capital may, from time to time, contact the Clients on behalf of external business partners about a particular offering that may be of their interest. In those cases, the Clients’ unique identifiable information (e-mail, name, address, telephone number) is not transferred to the third party.\n\nIn addition, Newera Capital may share data with trusted partners for a business purpose, for instance, to perform statistical analysis, send them email or postal mail, provide customer support, amongst others. All such third parties are prohibited from using the Clients’ personal information except to provide Newera Capital related services and they are required to maintain the confidentiality of the Clients’ information.\n\nNewera Capital does not use or disclose sensitive personal information, such as race, religion, or political affiliations, without the Clients’ explicit consent.\n\nNewera Capital keeps track of the websites and pages that the Clients visit within Newera Capital, in order to determine what Newera Capital services are most popular. This data is used to deliver customized content and advertising within Newera Capital to Clients, whose behavior indicates that they are interested in a particular subject.\n\nNewera Capital websites will disclose the Clients’ personal information, without notice, only if required to do so by law or in the good faith belief that such action is necessary to:\n\nConform to the requirements of the law or comply with legal process served on Newera Capital or the website;\n\nProtect and defend the rights or property of Newera Capital; and,\n\nAct under exigent circumstances to protect the personal safety of users of Newera Capital, or the',
          },
          {
            heading: 'Use of cookies',
            body: 'The Newera Capital website uses “cookies” to help the Clients personalize their online experience. A cookie is a text file that is placed on the Client’s hard disk by a Web page server. Cookies cannot be used to run programs or deliver viruses to their computer.\n\nCookies are uniquely assigned to the Clients and can only be read by a web server in the domain that issued the cookies to the Clients. One of the primary purposes of cookies is to provide a convenience feature to save the Clients’ time.\n\nThe purpose of a cookie is to tell the Web server that the Clients have returned to a specific page. For example, if the Clients personalize Newera Capital pages or register with Newera Capital’s website or services, a cookie helps to recall the Clients’ specific information on subsequent visits.\n\nThis simplifies the process of recording the Clients’ personal information, such as billing addresses, shipping addresses, and so on. When a particular Client returns to the same Newera Capital website, the information he/she previously provided can be retrieved, so that they can easily use the customized Newera Capital website.\n\nThe Clients have the ability to accept or decline cookies. Most Web browsers automatically accept cookies, but the Clients can usually modify their browser setting to decline cookies if they prefer.\n\nIf the Clients choose to decline cookies, they may not be able to fully experience the interactive features of the Newera Capital services or websites visited.',
          },
          {
            heading: 'Security of the clients’ personal information',
            body: 'Newera Capital secures the Clients’ personal information from unauthorized access, use, or disclosure. Newera Capital secures the personally identifiable information that the Clients provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure.\n\nWhen Newera Capital transmits personal information (such as a credit card number) to other websites, it is protected through the use of encryption, which includes (but is not limited to) Secure Socket Layer (SSL) protocol.',
          },
          {
            heading: 'Languages',
            body: 'Language of communication between the Company and the Client shall be in English. All binding contractual documentation is available in English.\n\nUpon its sole discretion, the Company may communicate with the Client in another language than English; however, in case of any discrepancy between the meanings of any communications and/or meanings, or any other communications forming part of this Policy or any other agreements, information or communication in any other language, the meaning of the English Language version shall prevail.\n\nThe Company or third parties may have provided the Client with translations of this Policy. The original English versions shall be the only legally binding version. In case of discrepancies between the English version and other translations in the Client’s possession, the original English version provided by the Company on the website shall prevail.',
          },
          {
            heading: 'Review of privacy policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy, and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Privacy Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة الخصوصية',
        slug: 'privacy-policy',

        body: legalBody('', [
          {
            heading: 'سياسة الخصوصية',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة / Newera Capital") بحماية خصوصية عملائها ومستخدمي موقعها الإلكتروني الآخرين ("العميل / العملاء") وتطوير التكنولوجيا التي تمنح العملاء تجربة إلكترونية قوية ومرضية وآمنة. تنطبق سياسة الخصوصية هذه ("السياسة") على موقع Newera Capital الإلكتروني وتنظم جمع البيانات واستخدامها. باستخدام موقع Newera Capital، يوافق العملاء على ممارسات البيانات الموضحة في هذه السياسة.',
          },
          {
            heading: 'جمع المعلومات الشخصية للعملاء',
            body: 'وفقاً للوائح والقوانين المعمول بها لمكافحة غسل الأموال ومكافحة تمويل الإرهاب، تلتزم Newera Capital بجمع المعلومات والتحقق من هوية عملائها. ويشار إلى هذه المعلومات باسم معلومات اعرف عميلك أو معلومات KYC. وعلى وجه التحديد، قد تشمل المعلومات التي نجمعها لأغراض تحديد هوية العميل معلومات الهوية وبيانات الاتصال والرقم الوطني والبيانات الاجتماعية والديموغرافية والمعاملات والبيانات المالية والتعاقدية والوثائقية وما إلى ذلك. وستقوم Newera Capital بتنفيذ إجراءات تحديد هوية العملاء والتحقق منها.\n\nعند تقديم نموذج طلب العميل لفتح حساب حقيقي أو تجريبي لدى Newera Capital، سيقوم العميل بتقديم معلوماته الشخصية إلى الكيانات التابعة لمجموعة شركات Newera Capital (ويشار إليها مجتمعة باسم "مجموعة Newera Capital") والكيانات التابعة لها. ومن خلال التقدم لفتح و/أو فتح حساب حقيقي أو تجريبي لدى Newera Capital، يقر العميل ويوافق على أن موافقته مقدمة طوعاً إلى مجموعة Newera Capital والكيانات التابعة لها، بما في ذلك Newera Capital Markets Limited.\n\nتشير المعلومات الشخصية إلى أي معلومات عن العميل تحدد هويته أو يمكن من خلالها تحديد هويته بشكل معقول.\n\nستحتفظ Newera Capital أيضاً بسجلات لجميع المعاملات والأنشطة على حسابات العميل، بما في ذلك، على سبيل المثال لا الحصر، تفاصيل عمليات التصفية على حسابات العميل. وقد تجمع Newera Capital أيضاً معلومات عن العميل من مصادر متاحة للعامة مثل سجلات الشركات. ويمكن للعميل، في أي وقت وبناءً على طلبه، الوصول إلى المعلومات التي تحتفظ بها Newera Capital عنه. وقد تقوم Newera Capital أيضاً بتسجيل المحادثات الهاتفية بين العميل والأشخاص العاملين لدى Newera Capital. ويمكن استخدام هذه التسجيلات أو النصوص المفرغة منها لحل أي نزاع بين العميل وNewera Capital وبهدف الوفاء بالالتزامات القانونية للشركة، بما في ذلك طلبات الجهات التنظيمية والهيئات الحكومية الأخرى. كما ستجمع Newera Capital المعلومات المتعلقة بالعميل وتحتفظ بها عندما يكمل العميل طلباً إلكترونياً أو أي نوع آخر من النماذج أو يدير ويتعامل على حسابه من خلال مواقع Newera Capital الإلكترونية.\n\nيجوز لـ Newera Capital جمع معلومات حساسة عن العميل إذا:\n\nكان جمع المعلومات مطلوباً أو مصرحاً به بموجب القوانين المعمول بها أو أمر محكمة/هيئة قضائية؛\n\nوافق العميل على جمع المعلومات وكانت المعلومات ضرورية بشكل معقول لوظائف وأنشطة Newera Capital؛\n\nاعتقدت Newera Capital بشكل معقول أن جمع المعلومات ضروري لتقليل أو منع تهديد خطير لحياة أو صحة أو سلامة فرد أو الجمهور، وكان الحصول على موافقة العملاء على جمع المعلومات غير معقول أو غير عملي؛\n\nكان لدى Newera Capital سبب للاشتباه في أن نشاطاً غير قانوني أو سوء سلوك خطير يتعلق بوظائف أو أنشطة Newera Capital يتم أو قد يتم ارتكابه؛\n\nاعتقدت Newera Capital أن جمع المعلومات ضروري بشكل معقول للمساعدة في تحديد مكان شخص تم الإبلاغ عن فقدانه.\n\nلا يُفرض على العملاء بشكل مباشر تقديم معلوماتهم الشخصية إلى Newera Capital في نماذج الطلب. ومع ذلك، من دون المعلومات المطلوبة، قد لا تتمكن Newera Capital من فتح حساب و/أو تقديم الخدمات لهم. وبينما تبذل Newera Capital كل جهد لضمان أن جميع المعلومات التي تحتفظ بها عن العملاء دقيقة وكاملة ومحدثة، يجب على العملاء إخطار Newera Capital فوراً بأي تغييرات تطرأ على معلوماتهم الشخصية. وإذا كان لدى العملاء أي أسئلة أو شكاوى بشأن خصوصيتهم، فيجب عليهم الاتصال بـ Newera Capital. ومن وقت لآخر، قد تتلقى Newera Capital معلومات شخصية عن العملاء من مصادر تابعة لأطراف ثالثة، ولكن فقط بعد أن تتحقق Newera Capital من أن هذه الأطراف الثالثة لديها موافقة العملاء أو أنها مخولة أو ملزمة قانوناً بالكشف عن معلوماتهم لنا. وتستخدم Newera Capital المعلومات الواردة من هذه الأطراف الثالثة لتعزيز الخدمات المقدمة للعملاء، مثل توفير محتوى منسق ذي صلة بالخدمات والموضوعات التي يهتمون بها.\n\nعندما يزور العملاء موقع Newera Capital، قد تجمع Newera Capital بعض المعلومات تلقائياً من أجهزة العملاء. وفي بعض البلدان، بما في ذلك دول المنطقة الاقتصادية الأوروبية (EEA) وجمهورية الصين الشعبية (PRC)، قد تعتبر هذه المعلومات معلومات شخصية بموجب قوانين حماية البيانات المعمول بها. وعلى وجه التحديد، قد تشمل المعلومات التي يتم جمعها تلقائياً معلومات مثل عنوان IP الخاص بالعملاء، ونوع الجهاز، وأرقام تعريف الجهاز الفريدة، ونوع المتصفح، والموقع الجغرافي العام (على سبيل المثال، مستوى الدولة أو المدينة)، وغيرها من المعلومات التقنية.\n\nقد تجمع Newera Capital أيضاً معلومات حول كيفية تفاعل أجهزة العملاء مع موقع Newera Capital، بما في ذلك الصفحات التي تم الوصول إليها والروابط التي تم النقر عليها. ويتيح جمع هذه المعلومات لـ Newera Capital فهم الزوار الذين يأتون إلى موقعها بشكل أفضل، ومن أين يأتون، والمحتوى الموجود على موقع Newera Capital الذي يهتمون به.\n\nكما تستخدم Newera Capital هذه المعلومات لأغراض التحليلات الداخلية ولتحسين جودة وملاءمة موقع Newera Capital.\n\nتشجع Newera Capital العملاء على مراجعة سياسات الخصوصية للمواقع التي يختارون الوصول إليها حتى يتمكنوا من فهم كيفية قيام تلك المواقع بجمع معلومات العملاء واستخدامها ومشاركتها. ولا تتحمل Newera Capital مسؤولية سياسات الخصوصية أو أي محتوى آخر على المواقع خارج مواقع Newera Capital (وشركاتها الشقيقة).\n\nوفي جميع الحالات، تسعى Newera Capital إلى الحد من كمية المعلومات التي يتم جمعها وتخزينها بحيث تقتصر فقط على المعلومات الضرورية، حتى تتمكن من تقديم الخدمات ذات الصلة للعملاء.',
          },
          {
            heading: 'استخدام المعلومات الشخصية للعملاء',
            body: 'تجمع Newera Capital المعلومات الشخصية للعملاء وتستخدمها لتشغيل موقعها الإلكتروني وتقديم الخدمات التي يحتاجها العملاء. كما تستخدم Newera Capital المعلومات الشخصية القابلة للتعريف الخاصة بالعملاء لإبلاغهم بالمنتجات أو الخدمات الأخرى التي تقدمها Newera Capital والشركات التابعة لها. ولا تبيع Newera Capital قوائم عملائها أو تؤجرها أو تؤجرها من الباطن إلى أطراف ثالثة.\n\nقد تتواصل Newera Capital من وقت لآخر مع العملاء نيابةً عن شركاء أعمال خارجيين بشأن عرض معين قد يكون محل اهتمامهم. وفي هذه الحالات، لا يتم نقل المعلومات التعريفية الفريدة للعملاء (البريد الإلكتروني والاسم والعنوان ورقم الهاتف) إلى الطرف الثالث.\n\nبالإضافة إلى ذلك، قد تشارك Newera Capital البيانات مع شركاء موثوقين لغرض تجاري، مثل إجراء التحليل الإحصائي وإرسال البريد الإلكتروني أو البريد العادي وتقديم دعم العملاء، من بين أمور أخرى. ويُحظر على جميع هذه الأطراف الثالثة استخدام المعلومات الشخصية للعملاء إلا لتقديم الخدمات المتعلقة بـ Newera Capital، كما يُطلب منهم الحفاظ على سرية معلومات العملاء.\n\nلا تستخدم Newera Capital أو تفصح عن المعلومات الشخصية الحساسة، مثل العرق أو الدين أو الانتماءات السياسية، دون موافقة صريحة من العملاء.\n\nتتبع Newera Capital المواقع والصفحات التي يزورها العملاء داخل Newera Capital، من أجل تحديد خدمات Newera Capital الأكثر شعبية. وتستخدم هذه البيانات لتقديم محتوى وإعلانات مخصصة داخل Newera Capital للعملاء الذين يشير سلوكهم إلى اهتمامهم بموضوع معين.\n\nستفصح مواقع Newera Capital عن المعلومات الشخصية للعملاء، دون إشعار، فقط إذا كان ذلك مطلوباً بموجب القانون أو إذا كان هناك اعتقاد حسن النية بأن هذا الإجراء ضروري من أجل:\n\nالامتثال لمتطلبات القانون أو الامتثال لإجراءات قانونية تم تقديمها إلى Newera Capital أو الموقع الإلكتروني؛\n\nحماية والدفاع عن حقوق أو ممتلكات Newera Capital؛ و،\n\nالتصرف في ظروف عاجلة لحماية السلامة الشخصية لمستخدمي Newera Capital، أو',
          },
          {
            heading: 'استخدام ملفات تعريف الارتباط',
            body: 'يستخدم موقع Newera Capital ملفات تعريف الارتباط ("cookies") لمساعدة العملاء على تخصيص تجربتهم الإلكترونية. وملف تعريف الارتباط هو ملف نصي يتم وضعه على القرص الصلب للعميل بواسطة خادم صفحة ويب. ولا يمكن استخدام ملفات تعريف الارتباط لتشغيل البرامج أو توصيل الفيروسات إلى أجهزة الكمبيوتر الخاصة بهم.\n\nيتم تخصيص ملفات تعريف الارتباط للعملاء بشكل فريد ولا يمكن قراءتها إلا بواسطة خادم ويب في النطاق الذي أصدر ملفات تعريف الارتباط للعملاء. ومن الأغراض الرئيسية لملفات تعريف الارتباط توفير ميزة تسهيل الاستخدام لتوفير وقت العملاء.\n\nالغرض من ملف تعريف الارتباط هو إخبار خادم الويب بأن العملاء عادوا إلى صفحة معينة. فعلى سبيل المثال، إذا قام العملاء بتخصيص صفحات Newera Capital أو سجلوا في موقع Newera Capital أو خدماتها، فإن ملف تعريف الارتباط يساعد على استعادة معلومات العملاء المحددة في الزيارات اللاحقة.\n\nوهذا يبسط عملية تسجيل المعلومات الشخصية للعملاء، مثل عناوين الفواتير وعناوين الشحن وما إلى ذلك. وعندما يعود عميل معين إلى موقع Newera Capital نفسه، يمكن استرجاع المعلومات التي قدمها سابقاً، حتى يتمكن من استخدام موقع Newera Capital المخصص له بسهولة.\n\nلدى العملاء القدرة على قبول ملفات تعريف الارتباط أو رفضها. وتقبل معظم متصفحات الويب ملفات تعريف الارتباط تلقائياً، ولكن يمكن للعملاء عادةً تعديل إعدادات المتصفح لرفضها إذا رغبوا في ذلك.\n\nإذا اختار العملاء رفض ملفات تعريف الارتباط، فقد لا يتمكنون من الاستفادة الكاملة من الميزات التفاعلية لخدمات Newera Capital أو المواقع التي تتم زيارتها.',
          },
          {
            heading: 'أمان المعلومات الشخصية للعملاء',
            body: 'تحمي Newera Capital المعلومات الشخصية للعملاء من الوصول أو الاستخدام أو الإفصاح غير المصرح به. وتحمي Newera Capital المعلومات الشخصية القابلة للتعريف التي يقدمها العملاء على خوادم الكمبيوتر في بيئة خاضعة للرقابة وآمنة ومحمية من الوصول أو الاستخدام أو الإفصاح غير المصرح به.\n\nعندما تنقل Newera Capital معلومات شخصية (مثل رقم بطاقة الائتمان) إلى مواقع إلكترونية أخرى، يتم حمايتها من خلال استخدام التشفير، والذي يشمل، على سبيل المثال لا الحصر، بروتوكول Secure Socket Layer (SSL).',
          },
          {
            heading: 'اللغات',
            body: 'تكون لغة التواصل بين الشركة والعميل هي اللغة الإنجليزية. وجميع الوثائق التعاقدية الملزمة متاحة باللغة الإنجليزية.\n\nوفقاً لتقديرها الخاص، يجوز للشركة التواصل مع العميل بلغة أخرى غير الإنجليزية؛ ومع ذلك، في حال وجود أي تعارض بين معاني أي اتصالات و/أو معانٍ، أو أي اتصالات أخرى تشكل جزءاً من هذه السياسة أو أي اتفاقيات أو معلومات أو اتصالات أخرى بأي لغة أخرى، فإن معنى النسخة باللغة الإنجليزية هو الذي يسود.\n\nقد تكون الشركة أو أطراف ثالثة قد قدمت للعميل ترجمات لهذه السياسة. وتكون النسخ الإنجليزية الأصلية هي النسخة الوحيدة الملزمة قانوناً. وفي حال وجود تعارض بين النسخة الإنجليزية وأي ترجمات أخرى بحوزة العميل، تسود النسخة الإنجليزية الأصلية التي توفرها الشركة على الموقع الإلكتروني.',
          },
          {
            heading: 'مراجعة سياسة الخصوصية',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (مرة واحدة على الأقل كل ستة أشهر) للتحقق من فعاليتها وتحديثها.\n\nتحظى سياسة الخصوصية هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 3. Cookie Policy (from Cookie-Policy.pdf)
    {
      en: {
        title: 'Cookie Policy',
        slug: 'cookie-policy',

        body: legalBody('', [
          {
            heading: 'Cookie policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED (“the Company”) (Company No.: 2023-00564) was incorporated on 8 November 2023 under Cap 12.14, Section 6 of International Business Companies Act, Saint Lucia.',
          },
          {
            heading: 'Policy objective',
            body: 'When you use our Website, NCML will use cookies to distinguish you from other users of NCML Website. This would enable the Company to provide you with a more relevant and effective experience when browsing NCML Website, including presenting websites in accordance to your needs or preferences. Hence, this will allow us to improve the site generally.\n\nThis Cookie Policy provides you with comprehensive information about the cookies we use and the way we are using them. You should also read NCML Privacy Policy in conjunction with this Policy.',
          },
          {
            heading: 'What is a cookie?',
            body: 'Cookies are small files of information that often include a unique identification number or value, which are stored on your computer’s hard drive as a result of using NCML Website. Unless you have adjusted your browser setting so that it will refuse cookies, NCML system will issue cookies as soon as you visit NCML Website.\n\nCookies are frequently used on many websites on the internet and you can choose if and how a cookie will be accepted by changing your preferences and options in your browser. Some of our business partners (e.g. advertisers) use cookies on NCML Website(s). We have no access to, or control over, these cookies.\n\nThe cookies do not contain personally identifying information nor are they used to identify you. You may choose to disable the cookies. However, you may not be able to access some parts of NCML Website if you choose to disable the cookie acceptance in your browser, particularly the secure parts of the Website.',
          },
          {
            heading: 'How to delete and block cookies',
            body: 'You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website. For further information about disabling cookies, please refer to www.allaboutcookies.org',
          },
          {
            heading: 'Your consent',
            body: 'By continuing to use NCML Website, you are agreeing to the Company to place cookies on your computer for analysing the way you use NCML Website. If you do not wish to accept cookies in connection with your use of this Website, you must stop using NCML Website.',
          },
          {
            heading: 'The way in which we use cookies',
            body: 'SESSION COOKIES\n\nWe use session cookies for the following purposes:\n\ni. To allow you to carry information across pages of NCML site and avoid having to re-enter information.\nii. Within registration to allow you to access stored information.\niii. Non personal data for tagging purposes only (by random number).',
          },
          {
            heading: 'Persistent cookies',
            body: 'The Company uses persistent cookies for the following purposes:\n\ni. To help us recognise you as a unique visitor (by number) when you return to NCML website and to allow us tailor content or advertisements to match your preferred interests, plus to avoid showing you the same adverts repeatedly.\nii. To compile anonymous, aggregated statistics. This would allow us to understand how users use NCML site so that we can improve the structure of NCML Website.\niii. To internally identify you by account name, name, email address, customer identification number, currency, and location (geographic and computer ID/IP address).\niv. To differentiate users who are on the same network. This would enable us to correctly allocate transactions to the appropriate account.\nv. Within research surveys to ensure you are not invited to complete a questionnaire too often or after you have already done so.',
          },
          {
            heading: 'Third party cookies',
            body: 'Third parties serve cookies via this site. These are used for the following purposes:\n\ni. To serve advertisements on NCML site and track whether these advertisements are clicked on by users.\nii. To control how often you are shown with a particular advertisement.\niii. To tailor content to your preferences.\niv. To count the number of anonymous users of NCML site.\nv. For website usage analysis.',
          },
          {
            heading: 'Use of web beacons',
            body: 'Some of NCML Web pages may contain electronic images known as Web beacons (sometimes known as clear gifs) that allow the Company to count users who have visited these pages. Web beacons collect only limited information which including a cookie number, time and date of a page viewed and a description of the page on which the Web beacon resides. NCML could also carry web beacons placed by third party advertisers. These beacons do not carry any personally identifiable information and are only used to track the effectiveness of a particular campaign.\n\nIf you wish to know more about cookies please consult the help menu on your web browser or visit independent information providers such as www.allaboutcookies.org. Also, if you have any questions regarding NCML privacy or security measures, please email to info@newera365.com.',
          },
          {
            heading: 'Review of cookie policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Cookie Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employee and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة ملفات تعريف الارتباط',
        slug: 'cookie-policy',

        body: legalBody('', [
          {
            heading: 'سياسة ملفات تعريف الارتباط',
            body: 'شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") (رقم الشركة: 2023-00564) تأسست في 8 نوفمبر 2023 بموجب الفصل 12.14، القسم 6 من قانون الشركات التجارية الدولية في سانت لوسيا.',
          },
          {
            heading: 'هدف السياسة',
            body: 'عند استخدامك لموقعنا الإلكتروني، تستخدم NCML ملفات تعريف الارتباط لتمييزك عن المستخدمين الآخرين لموقع NCML. يتيح ذلك للشركة تزويدك بتجربة أكثر ملاءمة وفعالية أثناء تصفح موقع NCML، بما في ذلك عرض محتوى ومواقع إلكترونية وفقاً لاحتياجاتك أو تفضيلاتك. وبالتالي، يساعدنا ذلك على تحسين الموقع بشكل عام.\n\nتوفر سياسة ملفات تعريف الارتباط هذه معلومات شاملة حول ملفات تعريف الارتباط التي نستخدمها والطريقة التي نستخدمها بها. كما يجب عليك قراءة سياسة الخصوصية الخاصة بـ NCML بالتزامن مع هذه السياسة.',
          },
          {
            heading: 'ما هو ملف تعريف الارتباط؟',
            body: 'ملفات تعريف الارتباط هي ملفات معلومات صغيرة غالباً ما تتضمن رقماً أو قيمة تعريفية فريدة، ويتم تخزينها على القرص الصلب لجهاز الكمبيوتر الخاص بك نتيجة استخدام موقع NCML. ما لم تقم بتعديل إعدادات المتصفح الخاص بك لرفض ملفات تعريف الارتباط، سيقوم نظام NCML بإصدار ملفات تعريف الارتباط بمجرد زيارتك لموقع NCML.\n\nتُستخدم ملفات تعريف الارتباط بشكل متكرر في العديد من المواقع الإلكترونية على الإنترنت، ويمكنك اختيار ما إذا كنت تريد قبول ملفات تعريف الارتباط وكيفية قبولها من خلال تغيير التفضيلات والخيارات في متصفحك. يستخدم بعض شركائنا التجاريين، مثل المعلنين، ملفات تعريف الارتباط على مواقع NCML. وليس لدينا إمكانية الوصول إلى ملفات تعريف الارتباط هذه أو التحكم فيها.\n\nلا تحتوي ملفات تعريف الارتباط على معلومات تعريف شخصية ولا تُستخدم لتحديد هويتك. يمكنك اختيار تعطيل ملفات تعريف الارتباط. ومع ذلك، قد لا تتمكن من الوصول إلى بعض أجزاء موقع NCML إذا اخترت تعطيل قبول ملفات تعريف الارتباط في متصفحك، وخاصة الأجزاء الآمنة من الموقع.',
          },
          {
            heading: 'كيفية حذف ملفات تعريف الارتباط وحظرها',
            body: 'يمكنك اختيار قبول ملفات تعريف الارتباط أو رفضها. تقبل معظم متصفحات الويب ملفات تعريف الارتباط تلقائياً، ولكن يمكنك عادةً تعديل إعدادات المتصفح لرفضها إذا كنت تفضل ذلك. وقد يمنعك ذلك من الاستفادة الكاملة من الموقع. لمزيد من المعلومات حول تعطيل ملفات تعريف الارتباط، يرجى الرجوع إلى www.allaboutcookies.org',
          },
          {
            heading: 'موافقتك',
            body: 'من خلال الاستمرار في استخدام موقع NCML، فإنك توافق على قيام الشركة بوضع ملفات تعريف الارتباط على جهاز الكمبيوتر الخاص بك لتحليل الطريقة التي تستخدم بها موقع NCML. إذا كنت لا ترغب في قبول ملفات تعريف الارتباط فيما يتعلق باستخدامك لهذا الموقع، فيجب عليك التوقف عن استخدام موقع NCML.',
          },
          {
            heading: 'الطريقة التي نستخدم بها ملفات تعريف الارتباط',
            body: 'ملفات تعريف الارتباط الخاصة بالجلسة\n\nنستخدم ملفات تعريف الارتباط الخاصة بالجلسة للأغراض التالية:\n\ni. السماح لك بنقل المعلومات عبر صفحات موقع NCML وتجنب الحاجة إلى إعادة إدخال المعلومات.\nii. ضمن عملية التسجيل للسماح لك بالوصول إلى المعلومات المخزنة.\niii. البيانات غير الشخصية لأغراض وضع العلامات فقط (باستخدام رقم عشوائي).',
          },
          {
            heading: 'ملفات تعريف الارتباط الدائمة',
            body: 'تستخدم الشركة ملفات تعريف الارتباط الدائمة للأغراض التالية:\n\ni. مساعدتنا في التعرف عليك كزائر فريد (عن طريق الرقم) عند عودتك إلى موقع NCML والسماح لنا بتخصيص المحتوى أو الإعلانات لتتناسب مع اهتماماتك المفضلة، بالإضافة إلى تجنب عرض نفس الإعلانات عليك بشكل متكرر.\nii. تجميع إحصاءات مجهولة ومجمعة. يتيح لنا ذلك فهم كيفية استخدام المستخدمين لموقع NCML حتى نتمكن من تحسين هيكل الموقع.\niii. التعرف عليك داخلياً من خلال اسم الحساب والاسم وعنوان البريد الإلكتروني ورقم تعريف العميل والعملة والموقع (الموقع الجغرافي ومعرف الكمبيوتر/عنوان IP).\niv. التمييز بين المستخدمين الموجودين على نفس الشبكة. يتيح لنا ذلك تخصيص المعاملات بشكل صحيح للحساب المناسب.\nv. ضمن استطلاعات البحث لضمان عدم دعوتك لإكمال استبيان بشكل متكرر أو بعد أن تكون قد أكملته بالفعل.',
          },
          {
            heading: 'ملفات تعريف الارتباط الخاصة بالأطراف الثالثة',
            body: 'تقوم أطراف ثالثة بتقديم ملفات تعريف الارتباط عبر هذا الموقع. وتُستخدم هذه الملفات للأغراض التالية:\n\ni. عرض الإعلانات على موقع NCML وتتبع ما إذا كان المستخدمون قد نقروا على هذه الإعلانات.\nii. التحكم في عدد مرات عرض إعلان معين عليك.\niii. تخصيص المحتوى وفقاً لتفضيلاتك.\niv. حساب عدد المستخدمين المجهولين لموقع NCML.\nv. تحليل استخدام الموقع.',
          },
          {
            heading: 'استخدام إشارات الويب',
            body: 'قد تحتوي بعض صفحات NCML على صور إلكترونية تُعرف باسم إشارات الويب (وتُعرف أحياناً باسم clear gifs) والتي تسمح للشركة بحساب المستخدمين الذين زاروا هذه الصفحات. تجمع إشارات الويب معلومات محدودة فقط، بما في ذلك رقم ملف تعريف الارتباط ووقت وتاريخ عرض الصفحة ووصف الصفحة التي توجد عليها إشارة الويب. وقد تستخدم NCML أيضاً إشارات ويب موضوعة بواسطة معلنين من أطراف ثالثة. ولا تحمل هذه الإشارات أي معلومات تعريف شخصية، وتُستخدم فقط لتتبع فعالية حملة معينة.\n\nإذا كنت ترغب في معرفة المزيد عن ملفات تعريف الارتباط، يرجى الرجوع إلى قائمة المساعدة في متصفح الويب الخاص بك أو زيارة مزودي المعلومات المستقلين مثل www.allaboutcookies.org. كما يمكنك إرسال أي أسئلة تتعلق بتدابير الخصوصية أو الأمان الخاصة بـ NCML إلى info@newera365.com.',
          },
          {
            heading: 'مراجعة سياسة ملفات تعريف الارتباط',
            body: 'تلتزم NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام (مرة واحدة على الأقل كل ستة أشهر) للتحقق من فعاليتها وتحديثها.\n\nتحظى سياسة ملفات تعريف الارتباط هذه بدعم الإدارة. وتلتزم NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 4. AML, KYC & Due Diligence Policy (from AML-KYC-Due-Diligence.pdf)
    {
      pageType: 'aml-policy',
      en: {
        title: 'Anti Money Laundering, Know Your Customer & Due Diligence Policy',
        slug: 'aml-kyc-due-diligence',

        body: legalBody('', [
          {
            heading: 'Policy objective',
            body: 'NEWERA CAPITAL MARKETS LIMITED has established procedures and controls to prevent and detect money laundering and terrorist financing activities. These procedures include customer identification procedures (KYC), record keeping procedures, internal reporting procedures, internal controls and communication procedures, and employee awareness and training relating to money laundering and suspicious transactions.\n\nThe Company maintains appropriate procedures for identifying customers, keeping records relating to customer identity and transactions, reporting information that gives rise to knowledge or suspicion of money laundering activities to the Compliance Officer (CO), and implementing internal controls designed to forestall and prevent money laundering.\n\nThe Company also ensures that employees are made aware of the procedures for preventing money laundering and applicable legislation and are provided with appropriate training in the recognition and handling of transactions suspected to be associated with money laundering and suspicious transactions.',
          },
          {
            heading: 'Compliance',
            body: 'Compliance with the Company’s Anti Money Laundering procedures is of the utmost importance. Not only is it important to maintain the Company’s integrity, but failure to comply may constitute a criminal offence and call into question whether or not the Company and the employee concerned is fit and proper to conduct the business for which the Company has been licensed. Failures by individuals to comply with the money laundering procedures set forth in this policy can therefore result in summary dismissal.',
          },
          {
            heading:
              'Targeted financial sanctions on terrorism financing, proliferation financing and under other un-sanctions regimes',
            body: 'The Company is required to keep abreast of the relevant United Nations Security Council Resolutions (UNSCR) lists relating to combating the financing of terrorism, including applicable sanctions against individuals and entities belonging or related to Taliban, ISIL (Da’esh) and Al-Qaida, as well as new UNSCR lists published by the UNSC or its relevant Sanctions Committee.\n\nThe Company must maintain a sanctions database which includes, at a minimum, the applicable UNSCR lists and other relevant sanctions information. The Company shall refer to the Consolidated UNSCR List published through the relevant United Nations resources and maintain the information until the specified entities, designated countries or persons are delisted by the UNSC or its relevant Sanctions Committee.\n\nThe Company shall conduct sanctions screening on existing, potential and new customers against the applicable Domestic List and UNSCR List. Where applicable, screening shall be conducted as part of the Customer Due Diligence (CDD) process and ongoing due diligence.',
          },
          {
            heading: 'Dealing with false positives',
            body: 'The Company shall take appropriate measures to ensure that potential matches against applicable sanctions lists are true matches and to eliminate false positives.\n\nFurther inquiries may be conducted and additional information and identification documents may be requested from the customer, counterparty or credible sources to assist in determining whether a potential match is a true match.\n\nIn cases involving similar or common names, the Company may direct queries to the relevant authorities to ascertain whether or not the customer is a specified or designated entity.',
          },
          {
            heading: 'Customer sanctions matches',
            body: 'Upon determination and confirmation of a customer’s identity as a specified entity, designated person and/or related party, the Company shall immediately take appropriate action, including freezing the customer’s funds, properties, other financial assets and economic resources, or where applicable, blocking transactions to prevent the dissipation of such funds, assets and resources.\n\nThe Company will reject a potential customer where there is a confirmed positive name match.',
          },
          {
            heading: 'Client due diligence (CDD)',
            body: 'The Company must ensure as soon as reasonably practical after the first contact has been made, and in any event before transferring or paying any money out to a third party, that satisfactory evidence is produced or such other measures are taken as will produce satisfactory evidence of the identity of any customer or counterparty (an “applicant”). If a client appears to be acting on behalf of another person, identification obligations extend to obtaining sufficient evidence of that third party’s identity.\n\nWhere satisfactory evidence is not supplied, the Company will not proceed with any further business and may bring to an end any understanding it has reached with the client unless the applicable regulatory authority has been informed where required. If there is knowledge or a suspicion of money laundering, it will be reported without delay to the Compliance Officer in accordance with these procedures.\n\nFurther identification requirements shall be carried out using the Company’s applicable document checklist.',
          },
          {
            heading: 'Methods of identification',
            body: 'The Company will ensure that it is dealing with a real person or legal entity and obtain sufficient evidence to establish that the applicant is that person or organization. When reliance is placed on any third party to identify or confirm the identity of an applicant, the overall legal responsibility to ensure that the procedures and evidence obtained are satisfactory rests with the Company.\n\nAs no single form of identification can be fully guaranteed as genuine or as representing the correct identity, the identification process will need to be cumulative. No single document or source of data, except for a database constructed from a number of other reliable data sources, must therefore be used to verify both name and permanent address.\n\nThe Company will take all required measures, according to applicable laws and regulations issued by regulatory authorities, to establish the identity of its clients and, where applicable, their respective beneficial owners in accordance with the Company’s KYC policy.',
          },
          {
            heading: 'Due diligence',
            body: 'In addition to identification information, it is essential to collect and record information covering the following for all categories of clients:\n\ni. Source of wealth, including a description of the economic activity which has generated the net worth;\n\nii. Estimated net worth;\n\niii. Source of funds to be invested;\n\niv. References or other documentation to corroborate reputation information where available;\n\nv. Independent background checks through a reputable screening system;\n\nvi. Whether an individual, director or shareholder is a Politically Exposed Person (PEP). If yes, additional information and documentation will be requested.',
          },
          {
            heading: 'Individual customers',
            body: 'The identity of an individual customer will be established to the Company’s satisfaction by reference to official identity papers or such other evidence as may be appropriate under the circumstances. Information on identity will include, without limitation, full name, date of birth, nationality and complete residential address. Identification documents must be current at the time of account opening.\n\nDocuments used for client identification purposes will typically include:\n\ni. A passport, national identity card or an equivalent document in the relevant jurisdiction;\n\nii. A separate document confirming the residential address, such as a utility bill, bank statement or acknowledgement of address issued by a relevant official.',
          },
          {
            heading: 'Corporate customers',
            body: 'Where the applicant company is listed on a recognized or approved stock exchange, or where there is independent evidence showing that the applicant is a wholly owned subsidiary or subsidiary under the control of such a company, no further steps to verify identity over and above the usual commercial checks and due diligence will normally be required.\n\nWhere the applicant is an unquoted company, it will be subject to a procedure aimed at identifying it, confirming its existence, good standing and the authority of persons acting on its behalf.\n\nDocumentation required for such purposes may change depending on each particular jurisdiction and will typically include:\n\ni. Certificate of incorporation, certificate of trade or equivalent evidence showing that the company is incorporated in a particular jurisdiction under the respective legislation;\n\nii. Certificate of Incumbency or an equivalent document listing the current directors of the company;\n\niii. Statutes, Memorandum and Articles of Association or equivalent documents confirming the authority of the respective officers of the company to legally bind it and the manner in which this may be done;\n\niv. An extract from the Commercial Register of the country of incorporation may also be used to confirm the aforementioned information, if such information is provided in the extract.',
          },
          {
            heading: 'Review of anti money laundering, know your customer & due diligence policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this policy and it will be reviewed regularly, at least every six months, for effectiveness and updated where required.\n\nThis Anti Money Laundering, Know Your Customer & Due Diligence Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employees and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة مكافحة غسل الأموال واعرف عميلك والعناية الواجبة',
        slug: 'aml-kyc-due-diligence',

        body: legalBody('', [
          {
            heading: 'هدف السياسة',
            body: 'وضعت شركة NEWERA CAPITAL MARKETS LIMITED إجراءات وضوابط لمنع واكتشاف أنشطة غسل الأموال وتمويل الإرهاب. وتشمل هذه الإجراءات إجراءات التعرف على العملاء (KYC)، وإجراءات حفظ السجلات، وإجراءات الإبلاغ الداخلي، والضوابط وإجراءات الاتصال الداخلية، وتوعية الموظفين وتدريبهم فيما يتعلق بغسل الأموال والمعاملات المشبوهة.\n\nتحافظ الشركة على إجراءات مناسبة لتحديد هوية العملاء، والاحتفاظ بالسجلات المتعلقة بهوية العملاء ومعاملاتهم، والإبلاغ إلى مسؤول الامتثال (CO) عن أي معلومات تؤدي إلى معرفة أو اشتباه في انخراط أحد العملاء في أنشطة غسل الأموال، وتنفيذ ضوابط داخلية تهدف إلى منع ومكافحة غسل الأموال.\n\nكما تضمن الشركة توعية الموظفين بالإجراءات الخاصة بمنع غسل الأموال والتشريعات المعمول بها، وتزويدهم بالتدريب المناسب للتعرف على المعاملات المشتبه في ارتباطها بغسل الأموال والمعاملات المشبوهة والتعامل معها.',
          },
          {
            heading: 'الامتثال',
            body: 'يُعد الامتثال لإجراءات مكافحة غسل الأموال الخاصة بالشركة أمراً بالغ الأهمية. فهو ضروري ليس فقط للحفاظ على نزاهة الشركة، بل إن عدم الامتثال قد يشكل جريمة جنائية ويثير التساؤل حول مدى أهلية الشركة والموظف المعني لممارسة النشاط الذي تم ترخيص الشركة من أجله. ولذلك، قد يؤدي عدم التزام الأفراد بإجراءات مكافحة غسل الأموال المنصوص عليها في هذه السياسة إلى الفصل الفوري من العمل.',
          },
          {
            heading:
              'العقوبات المالية المستهدفة المتعلقة بتمويل الإرهاب وتمويل الانتشار وبموجب أنظمة العقوبات الأخرى',
            body: 'يتعين على الشركة متابعة قوائم قرارات مجلس الأمن التابع للأمم المتحدة (UNSCR) ذات الصلة بمكافحة تمويل الإرهاب، بما في ذلك العقوبات المعمول بها ضد الأفراد والكيانات التابعة أو المرتبطة بطالبان وتنظيم داعش (داعش) والقاعدة، بالإضافة إلى قوائم قرارات مجلس الأمن الجديدة التي ينشرها مجلس الأمن التابع للأمم المتحدة أو لجانه المختصة بالعقوبات.\n\nيجب على الشركة الاحتفاظ بقاعدة بيانات للعقوبات تتضمن، كحد أدنى، قوائم قرارات مجلس الأمن ذات الصلة ومعلومات العقوبات الأخرى ذات الصلة. ويجب على الشركة الرجوع إلى قائمة العقوبات الموحدة المنشورة من خلال المصادر ذات الصلة التابعة للأمم المتحدة، والاحتفاظ بالمعلومات حتى يتم رفع أسماء الكيانات أو الدول أو الأشخاص المحددين من قبل مجلس الأمن أو لجنة العقوبات المختصة.\n\nتجري الشركة فحصاً للعقوبات على العملاء الحاليين والمحتملين والجدد مقابل القائمة المحلية وقائمة قرارات مجلس الأمن ذات الصلة. وحيثما ينطبق ذلك، يتم إجراء الفحص كجزء من عملية العناية الواجبة بالعميل (CDD) والعناية الواجبة المستمرة.',
          },
          {
            heading: 'التعامل مع النتائج الإيجابية الكاذبة',
            body: 'تتخذ الشركة التدابير المناسبة لضمان أن حالات التطابق المحتملة مع قوائم العقوبات هي تطابقات حقيقية، وذلك للقضاء على النتائج الإيجابية الكاذبة.\n\nقد يتم إجراء استفسارات إضافية وطلب معلومات ووثائق تعريف إضافية من العميل أو الطرف المقابل أو مصادر موثوقة للمساعدة في تحديد ما إذا كان التطابق المحتمل هو تطابق حقيقي.\n\nفي الحالات التي تتضمن أسماء متشابهة أو شائعة، يجوز للشركة توجيه الاستفسار إلى السلطات المختصة للتأكد مما إذا كان العميل كياناً محدداً أو شخصاً معيناً أم لا.',
          },
          {
            heading: 'تطابقات العملاء مع قوائم العقوبات',
            body: 'عند تحديد وتأكيد هوية العميل باعتباره كياناً محدداً أو شخصاً معيناً و/أو طرفاً ذا صلة، يتعين على الشركة اتخاذ الإجراءات المناسبة فوراً، بما في ذلك تجميد أموال العميل وممتلكاته وأصوله المالية الأخرى وموارده الاقتصادية، أو، حيثما ينطبق ذلك، حظر المعاملات لمنع تبديد هذه الأموال والأصول والموارد.\n\nسترفض الشركة أي عميل محتمل في حال وجود تطابق إيجابي مؤكد في الاسم.',
          },
          {
            heading: 'العناية الواجبة بالعميل (CDD)',
            body: 'يجب على الشركة، في أقرب وقت ممكن عملياً بعد إجراء الاتصال الأول، وعلى أي حال قبل تحويل أو دفع أي أموال إلى طرف ثالث، التأكد من تقديم أدلة مرضية أو اتخاذ تدابير أخرى توفر دليلاً مرضياً على هوية أي عميل أو طرف مقابل ("مقدم الطلب"). وإذا بدا أن العميل يتصرف نيابةً عن شخص آخر، تمتد التزامات تحديد الهوية لتشمل الحصول على أدلة كافية على هوية ذلك الطرف الثالث.\n\nفي حال عدم تقديم أدلة مرضية، لن تتابع الشركة أي أعمال إضافية وقد تنهي أي تفاهم تم التوصل إليه مع العميل، ما لم يتم إبلاغ الجهة التنظيمية المختصة عند الاقتضاء. وإذا كانت هناك معرفة أو اشتباه بوجود غسل أموال، فسيتم الإبلاغ عنه دون تأخير إلى مسؤول الامتثال وفقاً لهذه الإجراءات.\n\nيجب تنفيذ متطلبات تحديد الهوية الإضافية باستخدام قائمة المستندات المعتمدة لدى الشركة.',
          },
          {
            heading: 'طرق تحديد الهوية',
            body: 'ستتأكد الشركة من أنها تتعامل مع شخص حقيقي أو كيان قانوني، وستحصل على أدلة كافية لإثبات أن مقدم الطلب هو ذلك الشخص أو المنظمة. وعندما يتم الاعتماد على طرف ثالث لتحديد أو تأكيد هوية أي مقدم طلب، تظل المسؤولية القانونية الكاملة لضمان كفاية الإجراءات والأدلة التي تم الحصول عليها على عاتق الشركة.\n\nنظراً لأنه لا يمكن ضمان صحة أو دقة أي مستند تعريف بشكل كامل، يجب أن تكون عملية تحديد الهوية تراكمية. ولذلك، لا يجوز استخدام مستند واحد أو مصدر واحد للبيانات، باستثناء قاعدة بيانات تم إنشاؤها من عدد من مصادر البيانات الموثوقة الأخرى، للتحقق من الاسم والعنوان الدائم في الوقت نفسه.\n\nستتخذ الشركة جميع التدابير المطلوبة، وفقاً للقوانين واللوائح المعمول بها والصادرة عن السلطات التنظيمية، لإثبات هوية عملائها، وحيثما ينطبق ذلك، المستفيدين الحقيقيين منهم وفقاً لسياسة اعرف عميلك (KYC) الخاصة بالشركة.',
          },
          {
            heading: 'العناية الواجبة',
            body: 'بالإضافة إلى معلومات تحديد الهوية، من الضروري جمع وتسجيل المعلومات التالية لجميع فئات العملاء:\n\n1. مصدر الثروة، بما في ذلك وصف النشاط الاقتصادي الذي أدى إلى تكوين صافي الثروة؛\n\n2. صافي الثروة التقديري؛\n\n3. مصدر الأموال التي سيتم استثمارها؛\n\n4. المراجع أو المستندات الأخرى التي تدعم معلومات السمعة، حيثما كانت متاحة؛\n\n5. عمليات التحقق المستقلة من الخلفية من خلال نظام فحص موثوق؛\n\n6. ما إذا كان الفرد أو المدير أو المساهم من الأشخاص السياسيين البارزين (PEPs). وفي حال كان كذلك، سيتم طلب معلومات ووثائق إضافية.',
          },
          {
            heading: 'العملاء الأفراد',
            body: 'سيتم إثبات هوية العميل الفرد بما يرضي الشركة من خلال وثائق الهوية الرسمية أو أي أدلة أخرى مناسبة وفقاً للظروف. وستشمل معلومات الهوية، على سبيل المثال لا الحصر، الاسم الكامل وتاريخ الميلاد والجنسية والعنوان السكني الكامل. ويجب أن تكون وثائق تحديد الهوية سارية عند فتح الحساب.\n\nتشمل المستندات المستخدمة عادةً لأغراض تحديد هوية العميل ما يلي:\n\n1. جواز السفر أو بطاقة الهوية الوطنية أو وثيقة معادلة في الولاية القضائية ذات الصلة؛\n\n2. مستند منفصل يؤكد عنوان السكن، مثل فاتورة خدمات أو كشف حساب مصرفي أو إثبات عنوان صادر عن جهة رسمية مختصة.',
          },
          {
            heading: 'العملاء من الشركات',
            body: 'إذا كانت الشركة مقدمة الطلب مدرجة في بورصة معترف بها أو معتمدة، أو إذا كانت هناك أدلة مستقلة تثبت أن مقدم الطلب شركة تابعة مملوكة بالكامل أو شركة تابعة خاضعة لسيطرة مثل هذه الشركة، فلن تكون هناك حاجة عادةً إلى اتخاذ خطوات إضافية للتحقق من الهوية بخلاف الفحوصات التجارية المعتادة وإجراءات العناية الواجبة.\n\nإذا كان مقدم الطلب شركة غير مدرجة، فستخضع لإجراءات تهدف إلى تحديد هويتها، وتأكيد وجودها وحسن وضعها القانوني وسلطة الأشخاص الذين يتصرفون نيابةً عنها.\n\nقد تختلف المستندات المطلوبة لهذه الأغراض حسب كل ولاية قضائية، وتشمل عادةً ما يلي:\n\n1. شهادة التأسيس أو شهادة التجارة أو ما يعادلها، بما يثبت أن الشركة تأسست في ولاية قضائية معينة وفقاً للتشريعات المعمول بها؛\n\n2. شهادة شغل المناصب أو وثيقة معادلة تسرد المديرين الحاليين للشركة؛\n\n3. النظام الأساسي ومذكرة وعقد التأسيس أو المستندات المعادلة التي تؤكد سلطة مسؤولي الشركة المعنيين في إلزام الشركة قانونياً والطريقة التي يمكن بها القيام بذلك؛\n\n4. يجوز أيضاً استخدام مستخرج من السجل التجاري في بلد التأسيس لتأكيد المعلومات المذكورة أعلاه، إذا كانت هذه المعلومات متوفرة في المستخرج.',
          },
          {
            heading: 'مراجعة سياسة مكافحة غسل الأموال واعرف عميلك والعناية الواجبة',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، بما لا يقل عن مرة واحدة كل ستة أشهر، للتحقق من فعاليتها وتحديثها عند الحاجة.\n\nتحظى سياسة مكافحة غسل الأموال واعرف عميلك والعناية الواجبة هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 5. Client Agreement & Terms and Conditions (from Client-Agreement-and-Terms-Condition.docx)
    {
      pageType: 'client-agreement',
      en: {
        title: 'Client Agreement & Terms and Conditions',
        slug: 'client-agreement-terms-conditions',
        body: legalBody(
          'NEWERA CAPITAL MARKETS LIMITED (“the Company” / “NCML”) is registered under the International Business Companies Act in Saint Lucia, with the Company Registration and Regulation Authority of Saint Lucia.',
          [
            {
              heading: 'Objective',
              body: 'These Terms and Conditions (“Agreement”), entered by and between the Company and You (the “Client”) (hereinafter both referred to as “Parties”), contain the terms and conditions governing the contractual relationship between both Parties and govern each transaction entered into or outstanding between the Company on or after the execution of this Agreement.\n\nThe relationship between the Client and the Company shall be governed by these Terms & Conditions. As this Agreement is a distance contract, signing the Agreement is not required and the Agreement has the same judicial power and rights as a regular signed agreement.\n\nThe Agreement together with other documents including Risk Disclosure, Order Execution Policy, Conflicts of Interest Policy, Privacy Policy, Anti Fraud (and Financial Crime) Policy, Anti Money Laundering, Know Your Customer & Due Diligence Policy constitute the entire Agreement between the Company and the Client and set out the basis on which the services are rendered to the Client.',
            },
            {
              heading: 'Definitions and interpretation of terms',
              body: 'In this Agreement the following terms shall, unless the context otherwise requires, have the following meanings and may be used in the singular or plural as appropriate:\n\nApplicable Law – The laws, orders, legally binding guidelines or directives of Saint Lucia including but not limited to the International Business Companies Act, Banking Act, Anti-Terrorism Act - Cap. 3.16, Anti-Terrorism (Amendment) Act No. 28 of 2019, Anti-Terrorism (Amendment) Act No. 8 of 2023, Money Laundering (Prevention) Act Cap. 12.20, related amendments and regulations, Proceeds of Crime Act - Cap. 3.04 and any other related laws, orders, legally binding guidelines or directives.\n\nApplicable Laws or Rules – The applicable laws and the rules of any relevant Authority or exchange in force from time to time. Where these Terms conflict with Applicable Rules, the latter shall prevail.\n\nBusiness Day – A day other than Saturday, Sunday and Public Holidays applicable to Saint Lucia on which Saint Lucia Banks are generally open for business.\n\nCalculation Agent – Newera Capital Markets Limited (Company No.: 2023-00564).\n\nClients’ Money – Money of any currency belonging to you that we receive or hold for you or on your behalf in the course of providing the Services, treated as clients’ money held in trust in a designated account.\n\nClosing Date – The date on which the close-out of an open Transaction is effective.\n\nClosing Level – The level at which a Transaction is closed.\n\nComplaints Policy – Our complaints policy which is updated from time to time and can be found on our Website for the use of clients.\n\nContract Specifications – The section of our Website designated as the “Contract Specifications”, as amended from time to time.\n\nCredit Support Provider – With respect to the counterparty, a party providing credit support in respect of the obligations of the Counterparty.\n\nDaily Financing Fee – The charge which we apply daily to the Open Position. Details are set out in the Contract Specifications.\n\nElectronic Trading Services – Any electronic services, together with related software, including trading, direct market access, order routing or information services that we grant you access to or make available to you directly or through a third-party service provider and used by you to view information and/or enter into Transactions.\n\nExpiry Transaction – A Transaction which has a set contract period at the end of which it expires automatically.\n\nForce Majeure Event – An event beyond the reasonable control of an affected party or its suppliers and contractors, including Market Disruption, acts or restraints of governments or public authorities, war, weapons, nuclear/radioactive/biological/chemical contamination, revolution, strikes, lock-outs, fire, flood, natural disaster, explosion, unavoidable accidents, terrorist action, utility or transport failure, suspension or limitation of trading, telecommunications failures, epidemic or pandemic, settlement equipment or system failures.\n\nFinancial Instrument – Options and contracts for difference in foreign exchange offered for trading by us or our Group Company pursuant to this Agreement.\n\nGroup – In relation to Newera Capital Markets Limited, that company, its subsidiaries and holding companies from time to time and subsidiaries of its holding companies.\n\nGroup Company – Any member or affiliate of the Group.\n\nLast Dealing Time – The last day and time before which a Transaction may be dealt in, as set out in the customer account application or otherwise notified to you, or the last day/time on which the underlying instrument may be dealt in on the relevant Underlying Market.\n\nLinked Transaction – Two or more Transactions for which we agree not to call for or apply the full amount of Margin due to the relationship between such Transactions.\n\nManifest Error / Manifestly Erroneous – A manifest or obvious misquote by us based on a price source on which we have relied in connection with a Transaction, having regard to current market conditions at the time the Transaction is entered into.\n\nMargin – A deposit of funds or acceptable collateral securing your liability to us for losses which may be incurred in respect of a Transaction or where additional security is required due to adverse price movement.\n\nMarket – Any market subject to government or state laws with established trading rules and trading hours.\n\nMarket Disruption – Any circumstance where we reasonably believe the relevant market or exchange relating to a Transaction is suspended, closed, materially impaired or cannot be relied upon.\n\nMarket Rules – The laws, rules, customs and practices applicable to any exchange, clearing house, organization or market involved in the conclusion, execution or settlement of a Transaction.\n\nMarket Spread – The difference between bid and offer prices for a Transaction of equivalent size in an instrument or related Instrument in the Underlying Market.\n\nMoney Laundering Requirements – All applicable anti-money laundering laws and rules to which Newera Capital Markets Limited, Group Companies and you are subject.\n\nNormal Market Size – The maximum number of stocks, shares, contracts or other units that we reasonably believe the Underlying Market to be good for at the relevant time.\n\nOnline Facility – Our website, online trading platform and account review facility.\n\nOpen Position – A Transaction which has not been closed in whole or in part under this Agreement.\n\nOrder Execution Policy – The policy available on the Website for clients’ information.\n\nPayment Date – The date on which you will settle the amount due to us under a Transaction in the currency and account specified by us.\n\nReference Asset – Property of any description, an index or other factor designated in a Contract for Difference or Margin transaction to which reference is made to fluctuations in value or price for determining profits or losses.\n\nRisk Warning – The risk warning provided on the Website.\n\nRolling Daily Transaction – A Transaction which does not automatically expire at the end of the Business Day but is automatically rolled over to the next Business Day.\n\nSpread – The difference between the lower and higher figures of a quoted two-way price for an investment.\n\nTermination Payment – An amount payable by you to us in accordance with clause 38.\n\nTermination Date – The date of termination of this Agreement between you and us.\n\nTransaction – A transaction in options, futures, contracts for difference in foreign exchange, precious metals, commodities or other financial instruments and products entered into between you and us, including any transaction liable to Margin.\n\nUndated Transaction – A Transaction with an indefinite contract period that is not capable of expiring automatically.\n\nUndated Buy Transaction – A Transaction to buy with an indefinite contract period.\n\nUndated Sell Transaction – A Transaction to sell with an indefinite contract period.\n\nUnderlying Market – The exchange, similar body or liquidity pool on which an Instrument is traded or trading.\n\nWebsite – Any of our websites which provides Electronic Trading Services to you and other clients through internet addresses designated by us from time to time.',
            },
            {
              heading: 'Commencement',
              body: 'This Agreement supersedes any previous agreement between the Client and the Company on the same subject matter and takes effect when the Client indicates acceptance via the Main Website. This Agreement applies to all Transactions contemplated under this Agreement.',
            },
            {
              heading: 'Introduction',
              body: '1.1 This Client Agreement provides the terms and conditions governing services provided by Newera Capital Markets Limited (“we”, “our” or “us”). Newera Capital Markets Limited is a company limited by shares, registration number 2023-00564, incorporated under International Business Companies Act, Cap 12.14, Section 6. Our registered address is Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia.\n\n1.2 We shall deal with you as principal unless we inform you in writing that we are dealing with you as agent. You shall enter into Transactions as principal unless otherwise agreed in writing.\n\n1.3 By opening an Account through our Online Facility, electronically accepting these Terms and using or continuing to use our services, you agree to be bound by this Agreement and any amendments notified to you.\n\n1.4 You agree to notify us immediately of any variation or alteration to information provided by you in connection with these Terms.\n\n1.5 Defined terms shall have the meanings assigned to them in this Agreement and otherwise shall have their common trade and commercial meaning in the financial services industry.',
            },
            {
              heading: 'Registration information',
              body: 'Newera Capital Markets Limited is a registered trading name of Newera Capital Markets Limited. It was incorporated under Cap 12.14, Section 6 of the International Business Companies Act, bearing registration number 2023-00564 and registered with the company registration and regulatory Authorities of Saint Lucia.',
            },
            {
              heading: 'Our services',
              body: '3.1 Subject to this Agreement and acceptance of your application, we shall maintain one or more accounts registered in your name and provide execution-only dealing services relating to Foreign Exchange (“FX”) and Contracts for Difference (“CFDs”), including foreign exchange contracts, metals, equity indices and commodities and such other dealings as we deem fit. Services may include other financial products offered through the Online Facility.\n\n3.2 Orders for execution of a Transaction shall, unless otherwise agreed, be given electronically through the Online Facility to buy at the quoted offer price (“Long Position”) or sell at the quoted bid price (“Short Position”).\n\n3.3 Unless agreed in writing, you shall not be entitled or required to deliver any Reference Asset and shall not acquire any interest in a Reference Asset.\n\n3.4 We have the right to close any Transaction in our sole and absolute discretion without notice.\n\n3.5 We do not provide advice or personal recommendations regarding Transactions. You rely on your own assessment. Any research or analysis provided by us is only one source of information and is not a guarantee or recommendation.\n\n3.6 Professional Services retained by us are solely for us. You are responsible for obtaining your own legal, accounting, tax or other professional advice at your own expense.\n\n3.7 Unless specifically agreed in writing, providing Services does not create fiduciary, trustee, agency, joint venture or partnership duties or relationships.',
            },
            {
              heading: 'Our obligation to know our client',
              body: '4.1 We are required to identify information including the Client’s name, identification or passport number, registration information for entities, nature of business, source of funds, address proof, business documents, banking information and other Transaction details. Customer Due Diligence, Know Your Customer and Enhanced Due Diligence may be required.\n\n4.2 You agree to provide all information required as part of our CDD procedures and authorize us or our agents to investigate your identity, credit standing and current or past investment activity and contact banks, brokers and other relevant parties.\n\n4.3 We shall not be liable for delay or failure to process an application or Transaction where requested documentation has not been provided.\n\n4.4 We reserve the right to amend, correct or delete information on our trading platform where such information is incorrect, missing or unnecessary after comparison with KYC documentation.',
            },
            {
              heading: 'Providing a quote',
              body: '5.1 Upon request, we may provide a relevant non-binding quotation containing applicable charges. Quotations may be based on bid/offer prices in the Underlying Market or prices fixed by us. You agree to applicable opening and closing charges according to your selected account type.\n\n5.2 Quoted rates are applicable at the time issued and may change. Spreads and Market Spreads may increase significantly and may differ between opening and closing. Where the Underlying Market is closed, quoted rates will reflect our reasonable assessment of the market price.\n\n5.3 You may request a quotation during normal trading hours for the relevant Instrument.\n\n5.4 A quotation is not an offer. An offer is formed when you initiate a Transaction and we accept it. A Transaction is opened or closed only when your offer has been received and accepted, evidenced by written confirmation.\n\n5.5 We may reject an offer where quotation requirements are not met, including where the quotation is indicative, obtained improperly, expired, manifestly erroneous, outside Minimum or Normal Market Size, affected by Force Majeure or an Event of Default, communication has terminated, or the Transaction would exceed applicable limits.\n\n5.6 We may refuse Transactions larger than Normal Market Size and may apply special conditions.\n\n5.7 Where our quotation moves in your favour before acceptance, we may pass the price improvement to you at our discretion.\n\n5.8 Where an Instrument trades on multiple Underlying Markets, we may base prices on aggregate bid/offer prices in those markets.',
            },
            {
              heading: 'Risk warning',
              body: '6.1 Trading in options and CFDs in foreign exchange, precious metals, commodities and other financial instruments involves a high level of risk and may not be suitable for everyone. You should consider your investment objectives, experience and risk appetite and should not invest more than you can afford to risk. We are not responsible for losses, liabilities, costs or expenses incurred through trading.\n\n6.2 Off-exchange Transactions involve significant risks including leverage, creditworthiness, limited regulatory protection and market volatility which may materially affect prices or liquidity.',
            },
            {
              heading: 'Dealing procedures',
              body: '7.1 Once a Transaction has been executed in whole or in part, it cannot be cancelled to the extent executed.\n\n7.2 We may limit the number of open positions and may refuse Transactions to open or increase positions.\n\nElectronic Trading\n\n7.3 We are not obliged to accept, execute or cancel Transactions submitted through Electronic Trading Services and are not responsible for inaccurate or unreceived transmissions or losses caused by weak internet connections, outages, application/software failures or device issues.\n\n7.4 You acknowledge risks associated with postal services, telephone, fax, email, instant messaging, VoIP and similar communication methods, including transmission errors, interruption, technical defects, data corruption, viruses, power failures, network failures, fraud, forgery, unauthorized interception and manipulation. Electronic trading systems may fail and orders may not execute or may execute incorrectly. You bear these risks and authorize us to accept instructions through such means.\n\n7.5 Except for gross negligence, willful default or fraud, we are not liable for losses arising from loss or delay in transmission or wrongful interception of Orders. If you doubt an Order’s validity, you must contact us immediately by telephone.\n\n7.6 We may modify, update, upgrade, suspend, terminate or discontinue Electronic Facilities or any part thereof without notice and are not liable for such actions.\n\n7.7 We are not liable for consequential or other losses arising from failure, malfunction, delay, interruption, termination or unauthorized access involving our systems or third-party systems and services.\n\nAgents\n\n7.8 We are not obliged to act on instructions from an agent where we reasonably believe the agent lacks authority. We may close or void Transactions opened before such determination.\n\nInfringement of Law\n\n7.9 We may refuse to open or close a Transaction where doing so may be impracticable or infringe applicable law, rules or Terms. We may close or void Transactions opened before such determination.\n\nSituations not covered by this Agreement\n\n7.10 Situations not covered by these Terms or Contract Specifications will be resolved in good faith and fairness, having regard to market practice and treatment by hedging brokers.\n\nBorrowing charges and transactions becoming un-borrowable\n\n7.11 For Sell Transactions, we may pass stock borrowing charges to you. If charges are unpaid or the Instrument becomes unavailable to borrow, we may immediately close the Transaction and you may incur a loss. You must reimburse applicable fines, penalties or charges imposed on us in connection with your Transactions.\n\n7.12 If an underlying share becomes un-borrowable, we may increase Margin requirements, close the relevant Transaction or alter the Last Dealing Time.',
            },
            {
              heading: 'Opening a transaction',
              body: '8.1 A Transaction is opened by buying or selling. Buying is a Buy, Long or Long Position; selling is a Sell, Short or Short Position.\n\n8.2 Each Transaction must specify the number of shares, contracts or other units of the underlying Instrument.\n\n8.3 Each Transaction is binding on you even if applicable credit or dealing limits are exceeded.\n\n8.4 Commission may be charged when opening or closing a Transaction. Commission terms will be notified in writing. If no rate is notified, the standard rate published on our Website applies, or if no rate is published, 0.01% of the relevant Transaction value.\n\n8.5 Unless otherwise agreed, sums payable upon opening a Transaction are due when the Opening Level is determined.\n\n8.6 Fees are subject to clause 25.',
            },
            {
              heading: 'Multiple transactions',
              body: 'MT5 and XOH\n\n9.1 Where trading on MT5 or XOH, Buy and Sell Transactions in the same Instrument may exist simultaneously while both remain open, subject to applicable margin requirements.\n\n9.2 Where a Buy is open and a subsequent Sell is entered, a smaller Sell may partially close the Buy, an equal Sell may close it entirely, and a larger Sell may close the Buy and open a Sell for the excess.\n\n9.3 Where a Sell is open and a subsequent Buy is entered, a smaller Buy may partially close the Sell, an equal Buy may close it entirely, and a larger Buy may close the Sell and open a Buy for the excess.',
            },
            {
              heading: 'Closing a transaction',
              body: '10.1 On MT5 and XOH, to close a Transaction in whole or part, you must enter into an opposite Transaction in the same Reference Asset.\n\n10.2 We will net the first and second Transaction and display the aggregate position on the trading platform.\n\n10.3 Spreads may widen significantly and may differ between opening and closing. Prices quoted when markets are closed will reflect our reasonable assessment of market conditions. Our quotations are not guaranteed to be within a particular percentage of the Underlying Market. You may use our prices only for your own trading and may not redistribute them.\n\n10.4 We are not obliged to close a trade at your request. If we agree, the close-out value will be calculated using prevailing market conditions and may include associated costs.\n\n10.5 We may close Transactions without notice where underlying shares cannot be borrowed, borrowed assets must be returned, or we cannot establish or maintain a hedge position or a hedging disruption occurs.\n\n10.6 For Transactions closed by us, the Closing Date and closing price will be determined by us, no further payments or deliveries are required except settlement payments, and settlement amounts become immediately due.\n\n10.7 Obligations arising from close-out will be satisfied by net settlement and the net amount is immediately payable.\n\n10.8 In case of a dispute regarding a Transaction, we may cancel, terminate, reverse or close out the relevant position.\n\nUndated Transactions\n\n10.9 Subject to these Terms and requirements for Linked Transactions, you may close an Undated Transaction at any time.\n\n10.10 When closing an Undated Buy, the Closing Level is the lower figure quoted by us; when closing an Undated Sell, it is the higher figure quoted by us.\n\nExpiry Transactions\n\n10.11 Unless otherwise informed, if you do not close an Expiry Transaction before the Last Dealing Time, we will close it when the price is ascertained using the applicable last traded or official closing price and our applicable Spread.\n\n10.12 You are responsible for knowing the Last Dealing Time and applicable Spread.\n\n10.13 We do not automatically roll over Transactions which expire. You are responsible for knowing the next contract period. Any rollover is at our discretion and may result in losses.',
            },
            {
              heading: 'Aggregation of orders',
              body: 'We may aggregate your instruction to close a Transaction with instructions from other clients where we reasonably believe this is in the overall best interests of clients. Aggregation may result in a less favourable price and we shall not be liable for such outcome.',
            },
            {
              heading: 'Confirmations',
              body: '12.1 After execution of a Transaction, we will confirm its details electronically or through the Online Facility. Unless there is a material error, the confirmation is conclusive and binding unless you object in writing as soon as possible and no later than one Business Day after dispatch. An error in confirmation does not affect the validity of the underlying Transaction.\n\n12.2 Disputes regarding confirmation accuracy shall be handled under clause 35.',
            },
            {
              heading: 'Hedging disruption',
              body: '13.1 If we determine that a hedging disruption has occurred or may occur, including delays, disruption, suspension or reduction in payments or settlement, we may take action necessary to hedge our Transaction price risk.\n\n13.2 You are liable for increased costs or expenses resulting from hedging disruption, including costs of unwinding, establishing or re-establishing a hedge. We may deduct such costs from your account or demand payment. Failure to pay may constitute an Event of Default.',
            },
            {
              heading: 'Market suspension and delisting',
              body: '14.1 If trading in a Reference Asset is suspended, we will value the Transaction using the last traded price before suspension or a reasonably determined closing price.\n\n14.2 If suspension continues for five Business Days, the parties may agree a Closing Date and value. Otherwise the Transaction remains open until suspension ends or the Transaction is otherwise closed. We may terminate the Transaction and amend Margin requirements.\n\n14.3 If the principal Market announces that a Reference Asset has ceased or will cease to be listed, traded or quoted and is not immediately re-listed, re-traded or re-quoted, the applicable date will be the Closing Date and the closing price will be notified by us.',
            },
            {
              heading: 'Payments',
              body: '15.1 Client accounts are denominated in United States Dollars (USD). Payments in another currency will be converted to USD and applicable conversion charges will be borne by you.\n\n15.2 On each Payment Date, subject to no Event of Default and no Early Termination Date, you must make payments due under Transactions in the currency and to the account specified by us.\n\n15.3 Mutual payment obligations will automatically be netted so that only the excess payable by the party owing the larger amount is due.\n\n15.4 You are responsible for third-party transfer and banking fees and applicable charges imposed by us. Payments are received when clear funds are received.\n\n15.5 You must ensure payments are correctly identified and include required account details.\n\n15.6 Where your account has a positive balance, you may request withdrawal. We may withhold, deduct or refuse payment where you instruct payment to a third party, have loss-making open positions, fall below required Margin, or have actual or contingent liability to us or associates.\n\n15.7 Delays in receipt of funds may affect your positions and we are not responsible for losses arising from payment delays.\n\n15.8 Payments will generally be made without tax deduction unless required by law. Where withholding is required, we will notify you, make the required payment, provide evidence and, where required by law, make additional payment so the other party receives the amount it would have received without the withholding.',
            },
            {
              heading: 'Margin payments',
              body: '16.1 Transactions in options or CFDs may require Margin payments to cover unrealized losses. Our execution-only services operate through Straight Through Processing and margins provided are directly from the liquidity provider.\n\n16.1.1 Margin may be required when entering a Transaction and daily throughout its life when the Transaction moves against you.\n\n16.1.2 Leveraged Transactions require Margin as a proportion of the contract value. For example, leverage of 100:1 requires approximately 1% Margin. Small underlying price movements can therefore create substantial gains or losses.\n\n16.1.3 Margin must be provided in the specified currency and within the specified time. Margin calls are made as a courtesy and we are not obliged to make them. You must monitor your account.\n\n16.1.4 You may lose your initial deposit and may need to provide additional Margin. Failure to meet Margin requirements may result in liquidation and responsibility for resulting losses.\n\n16.1.5 Margin may be cash or other assets acceptable to us.\n\n16.1.6 If you fail to provide Margin, we may close some or all of your positions at any time.',
            },
            {
              heading: 'Settlement',
              body: 'Unless otherwise agreed in writing, Transactions are settled on a payment-on-delivery basis. Required documents and cleared funds must be provided in time for settlement. We are not obliged to settle where documents or cleared funds are unavailable. If either party defaults on payment, interest may be payable at the applicable overdraft rate. We may purchase investments to cover your liability and debit your account for losses. In case of a Transaction dispute, we may cancel, terminate, reverse or close the relevant position.',
            },
            {
              heading: 'Set-off',
              body: '18.1 We may, without notice, set off any liability we have to you against any liability you owe to us or any Group Company, whether present or future, liquidated or unliquidated, regardless of currency.\n\n18.2 Where liabilities are in different currencies, we may convert them at a reasonable exchange rate. Exercise of these rights is without prejudice to other rights or remedies.',
            },
            {
              heading: 'Manifest error',
              body: '19.1 We may, without your consent, void or amend a Transaction containing a Manifest Error. If amended, the level will be one we reasonably believe would have been fair at the time. We may consider the Underlying Market and information sources when determining a Manifest Error.\n\n19.2 Except for fraud, omission, willful default or negligence, we are not liable for losses, costs, claims or expenses resulting from a Manifest Error.\n\n19.3 If you received money from us because of a Manifest Error, you must return an equal amount without delay.',
            },
            {
              heading: 'Market conduct',
              body: '20.1 We may take reasonable action to ensure compliance with Market Rules, Money Laundering Requirements and applicable laws, including selling or closing Transactions.\n\n20.2 We may report Transactions to relevant authorities as required by law or rules.\n\n20.3 We may hedge our liability by opening analogous positions with other institutions or in the Underlying Market.\n\n20.4 You warrant that you understand laws relating to market abuse, short selling and insider dealing and will not submit non-compliant Orders. We may monitor trading, void or amend Transactions resulting from abusive practices, increase spreads and require repayment of amounts received from such Transactions.',
            },
            {
              heading: 'Improper trading',
              body: '21.1 We do not guarantee the speed or uninterrupted operation of MT5/XOH. To the extent permitted by Saint Lucian law, we exclude liability for losses caused by platform delays, suspension, improper or unlawful trading activity or failure to use the most current platform.\n\n21.2 Where we reasonably believe improper, unlawful or unfair trading may have occurred, we may immediately suspend the relevant trading account to investigate.\n\n21.3 Latency trading involves high-volume transactions opened and closed within unusually short periods and exploiting price differences. Where we reasonably believe latency is being unfairly exploited, we may void trades, return deposited funds net of earlier withdrawals and close the account.',
            },
            {
              heading: 'Expert advisors',
              body: '22.1 You may use an Expert Adviser, being a robotic algorithmic trading system, on MT5/XOH. Expert Advisers are inherently risky and we do not encourage or endorse their use.\n\n22.2 To the fullest extent permitted by law, we are indemnified against liability for losses arising from use, faults, omissions, negligence or failure of an Expert Adviser or technical errors involving your device, software or applications.',
            },
            {
              heading: 'System maintenance',
              body: '23.1 We may conduct system maintenance on the online trading platform. We will endeavour to perform maintenance outside trading hours but may conduct it at any time.\n\n23.2 If maintenance occurs while the market is open, we will notify you where possible but are not liable for losses arising from maintenance or suspension of the platform.',
            },
            {
              heading: 'Events of default',
              body: '24.1 An Event of Default may occur where you fail to make a payment when due and do not remedy the failure within the applicable period, fail to remedy another obligation within 30 days after notice where capable of remedy, or a representation or warranty is materially incorrect or misleading.\n\nAn Event of Default may also occur in relation to a Credit Support Provider where it is dissolved, becomes insolvent, cannot pay debts, enters arrangements with creditors, becomes subject to insolvency, bankruptcy, winding-up, judicial management, receivership or similar proceedings, or experiences an analogous event under applicable law.\n\n24.2 An Event of Default may also occur where amounts owed by you or your Credit Support Provider are unpaid when due or become prematurely payable because of default, or where obligations under specified financial transactions are breached.',
            },
            {
              heading: 'Our fees and charges',
              body: '25.1 Fees and charges will be notified in writing from time to time. Charges, expenses, applicable taxes and duties incurred under these Terms are payable by you. Foreign currency transactions may incur charges at prevailing rates and you may also incur taxes or costs not imposed or collected by us.\n\n25.2 Where an Open Position exists at the daily close of business, we will charge a Daily Financing Fee. The calculation basis is set out in the Contract Specifications and may be changed with notice.\n\n25.3 We may share fees and charges with Group Companies or third parties and provide details upon request.\n\n25.4 We may make or receive fees, commissions or non-monetary benefits from third parties in connection with our services. Further details may be provided upon request.',
            },
            {
              heading: 'Inactivity fee',
              body: '26.1 If there has been no activity on your account for 180 calendar days or more, the account will be considered inactive.\n\n26.2 Activity includes placing or closing a trade or maintaining an open position.\n\n26.3 A monthly inactivity fee may be applied in accordance with the account currency. We will notify clients in advance if such a fee becomes payable.',
            },
            {
              heading: 'Our authority and our duties',
              body: '27.1 These Terms do not oblige us to enter into Transactions or accept instructions and we are not required to give reasons for declining. We may act on instructions reasonably believed to be genuine and will not do anything contrary to law or Applicable Rules.\n\n27.2 We normally deal with you as principal and may provide two-way prices. Retail Clients may rely on bid and offer prices displayed for retail investors on a consistent basis.\n\n27.3 Transactions are handled under our Order Execution Policy. We seek competitive prices but do not warrant that displayed prices always represent the best market prices. Volatility and costs may increase Spreads and Transaction costs.\n\n27.4 We may appoint agents or contractors.\n\n27.5 Information provided about Transactions is believed accurate and reliable when given but is not a guarantee of completeness, accuracy or outcome.\n\n27.6 Market conditions and pricing may change between the time information is provided and the time you enter a trade.',
            },
            {
              heading: 'Exclusion of liability / indemnities',
              body: '28.1 Nothing excludes liability that cannot legally be excluded. Except for gross negligence, willful default or fraud, we, our directors, officers, employees and agents are not liable for losses arising from acts, negligence or omissions under these Terms or the acts or solvency of third parties with whom we deal in good faith.\n\n28.2 If proceedings are brought by or against us concerning a Transaction with you, you agree to cooperate fully. Except for gross negligence, omission, willful default or fraud, you must reimburse and hold us, our Group Companies, directors, officers, employees and agents harmless from actions, claims, liabilities, losses, damages and expenses arising from dealing with you under these Terms.',
            },
            {
              heading: 'Your authority and your obligations',
              body: '29.1 You represent and warrant that:\n\n29.1.1 If you are a company, LLP, limited partnership or partnership, you have full authority to enter Transactions and perform obligations and have obtained all required authorizations and consents.\n\n29.1.2 If you are an individual or sole proprietor, you are of full age, sound mind and have capacity to enter Transactions. The normal minimum age is eighteen (18).\n\n29.1.3 Your obligations are legal, valid and binding.\n\n29.1.4 Payments may be made free and clear of applicable taxes unless legally required otherwise.\n\n29.1.5 Information provided by you is true, accurate and complete in all material respects.\n\n29.1.6 You do not rely on us for advice, forecasts, estimates of future trends or tax consequences.\n\n29.1.7 You act for your own account, make independent decisions and rely on your own judgment and advisers. Communications from us are not investment advice or recommendations and are not guarantees of results.\n\n29.1.8 You understand and accept the terms, conditions and risks of Transactions and are capable of assuming those risks.\n\n29.1.9 You enter Transactions as principal and not as agent or fiduciary.\n\n29.1.10 You are aware of applicable laws and rules relating to Electronic Trading Services and will comply with them.\n\n29.2 You are responsible for all applicable taxes and information required by tax authorities. Any tax information provided by us is not tax advice.',
            },
            {
              heading: 'Authorised third party',
              body: '30.1 Where necessary, you may authorize someone to manage your account. You do so at your own risk and both you and the Authorized Third Party must submit the required signed Power of Attorney documentation.\n\n30.2 You are liable for acts or omissions of an Authorized Third Party and we may rely on their instructions. We are not responsible for monitoring their activities.\n\n30.3 If an account was opened electronically and we do not hold your original signature, you must provide an identity document such as a passport or driving licence to appoint an Authorized Third Party.',
            },
            {
              heading: 'Clients’ money',
              body: '31.1 Money received by us in respect of your account is treated as Clients’ Money and held in trust.\n\n31.2 Unless otherwise instructed, Clients’ Money will be paid to designated Clients’ Money bank accounts separate from our own money. No interest is paid and you waive entitlement to interest.\n\n31.3 We exercise due skill, care and diligence when selecting third-party banks and brokers and review their adequacy periodically. We are not responsible for acts, omissions, insolvency or similar events of third-party banks or brokers or resulting shortfalls.\n\n31.4 Clients’ Money accounts are pooled accounts and clients have a claim to a rateable proportion of the pooled funds.\n\n31.5 We and our Group Companies use our own funds for hedging and do not pass Clients’ Money to hedging counterparties or use it as working capital.\n\n31.6 We may transfer Clients’ Money to another legal entity, including a Group Company, where business is transferred, provided the money continues to be held in accordance with this Agreement.\n\n31.7 For joint accounts, we exercise due care to ensure withdrawals are paid to the source and party initiating the deposit. Profit payments or withdrawals may be made to either party with appropriate approval and due diligence.\n\n31.8 We may release and cease treating unclaimed Clients’ Money as Clients’ Money where legally permitted, there has been no movement for six years, reasonable tracing steps have been taken and records are retained. Unclaimed money will be treated according to Section 154 of the Banking Act, Saint Lucia.',
            },
            {
              heading: 'Overnight financing and rollover',
              body: 'Rolling Daily Transactions and Undated CFD contracts are available across various Markets and Underlying Markets. Each market has its own conditions and Spread, which may vary. Such contracts automatically roll into the next trading session and a Daily Financing Fee debit or credit applies where a Transaction remains open from one trading session to the next.',
            },
            {
              heading: 'Temporary credit agreement',
              body: '33.1 Any temporary credit arrangement will be subject to separate terms, conditions and limits. We may alter credit arrangements at any time. Dealing on credit does not limit potential losses. Your financial liability may exceed any credit or account limit. You must repay temporary credit within the stipulated period.',
            },
            {
              heading: 'Conflicts of interest',
              body: '34.1 We, a Group Company or another connected person may have an interest, relationship or arrangement material to an Investment, Transaction or Service. Conflicts may arise where there is an incentive to favour us or a Group Company.\n\n34.2 We seek to manage conflicts between our interests and those of clients and between clients in accordance with our legal obligations. Our Conflicts Policy identifies potential conflicts and procedures for managing them.\n\n34.3 Where appropriate management of a conflict and fair treatment can only be achieved by declining a Transaction, we may decline the Transaction and shall not be liable for resulting losses, damages, claims or demands.',
            },
            {
              heading: 'Complaints',
              body: '35.1 We have a written Complaints Policy to ensure complaints about our services are dealt with fairly and promptly and in accordance with our applicable dispute resolution arrangements.\n\n35.2 Complaints should be directed to our Client Services Department or Compliance Department by email at compliance@newera365.com.\n\n35.3 The relevant department will investigate the complaint and attempt to resolve it.',
            },
            {
              heading: 'Amendments',
              body: '36.1 We may amend these Terms by giving reasonable advance written notice by post, email or through the Online Facility. Where reasonable notice is impractical, such as sudden changes in commercial terms or Rules, changes may take immediate effect.\n\n36.2 Amendments become effective on the date stated in the notice. Amendments requested by you must be agreed formally. Unless otherwise agreed, amendments do not affect outstanding Transactions or existing rights and obligations. If you do not accept an amendment, you may close open Transactions and your account in accordance with these Terms.',
            },
            {
              heading: 'Termination',
              body: '37.1 Subject to clause 37.2, you may terminate this Agreement by written notice at any time. We may terminate the Terms by giving at least thirty (30) days’ written notice unless circumstances require a shorter period.\n\n37.2 We may terminate immediately without notice if you become unable to pay debts, enter an arrangement with creditors, become subject to winding-up, judicial management, receivership, liquidation, bankruptcy or similar proceedings, materially breach obligations under these Terms or applicable law, or a Force Majeure Event occurs.\n\n37.3 Termination does not affect legal or equitable rights and obligations already accrued.',
            },
            {
              heading: 'Payments on termination',
              body: '38.1 We, as Calculation Agent, acting in good faith and reasonably, will determine the Close-out Amount that would preserve the economic equivalent of payments that would otherwise have been required after an Early Termination Date.\n\n38.2 The Termination Payment equals the Close-out Amount plus amounts due but unpaid to the non-Affected Party, less amounts due but unpaid to the Affected Party, together with applicable interest.\n\n38.3 If the Termination Payment is positive, the Affected Party pays the non-Affected Party. If negative, the non-Affected Party pays the Affected Party.\n\n38.4 The non-Affected Party may reduce the Termination Payment by set-off against amounts payable under other agreements or instruments between the parties.\n\n38.5 The recoverable amount is agreed to be a reasonable pre-estimate of loss and liquidated damages rather than a penalty.\n\n38.6 In calculating the Close-out Amount, the Calculation Agent may consider third-party replacement Transaction quotations, relevant market data and comparable internal information, and may consider reasonable hedge termination, liquidation or re-establishment costs.\n\n38.6.4 Newera Capital Markets Limited shall act as Calculation Agent and shall exercise judgment in good faith and commercially reasonably.',
            },
            {
              heading: 'Personal data protection',
              body: '39.1 We will observe the requirements of the Privacy and Data Protection Bill in performing our obligations and comply with applicable requests or directions arising from it.\n\n39.2 We will use personal and sensitive personal data to provide Services, assess risks and enforce rights. This may involve sharing information confidentially with Group Companies, third-party service providers, agents, auditors, advocates, solicitors, bankers, brokers, tax advisers, professional advisers and subcontractors.\n\n39.3 Personal data may be transferred outside Saint Lucia to jurisdictions with different privacy standards. We will take appropriate steps to protect such information. Our full privacy commitment is available on our Website.\n\n39.4 We may conduct identity and credit-reference searches and use scoring methods to verify identity and credit rating. Records may be retained and used to assist other companies with identity verification.\n\n39.5 We may contact you by telephone, email or other electronic communication, fax or post regarding services offered by us, Group Companies or selected third parties connected with our business. You agree that we may contact you at reasonable times.\n\n39.6 “Your information” includes information about your Transactions.\n\n39.7 If you require a copy of information we hold about you, please write to us at the address specified for notices.',
            },
            {
              heading: 'Monitoring and recording',
              body: 'Emails sent by you may be monitored and telephone conversations between us may be recorded. Recordings remain our sole property and may be used as evidence in the event of a dispute.',
            },
            {
              heading: 'Communications (including electronic communications)',
              body: '41.1 Unless otherwise agreed or required by Applicable Law or Rules, we will communicate with you and send documents and information to you in Saint Lucia. You agree to communicate with us and send documents and information to us in Saint Lucia.\n\n41.2 Unless otherwise agreed, you accept communication by post, telephone, fax, email or through the Online Facility for dealing services and related purposes.\n\n41.3 Notices required to be in writing may be delivered personally, by registered post, courier, fax or email. Notices to us should be sent to your usual point of contact or the Managing Director. Notices to you will be sent to the address, fax number or email address you specify. You must notify us of changes to your contact details.\n\n41.4 Notices are deemed received when personally delivered, according to the applicable postal delivery period, when courier delivery is signed, when fax/email is transmitted unless a non-delivery response is received, or when uploaded and available through the Online Facility.\n\n41.5 Service of legal proceedings is subject to statutory provisions applicable in the relevant jurisdiction.',
            },
            {
              heading: 'Intellectual property',
              body: 'All intellectual property rights in the Online Facility, advertising materials, information, materials, prices, charts, business methods, databases and settlement specifications relating to this Agreement remain our property or that of the relevant third-party provider. You may not distribute, republish, copy, reproduce, sell, sublicense, transfer or disseminate them unless expressly agreed by us in writing.',
            },
            {
              heading: 'Third parties’ rights',
              body: '43.1 The provisions of this Agreement are not enforceable by anyone other than the Parties and our Group Companies, subject to applicable third-party rights.\n\n43.2 We may cancel instructions previously given by you provided we have not acted upon them.\n\n43.3 Once a Transaction has been executed in whole or part, you cannot cancel the Order to the extent it has been executed.',
            },
            {
              heading: 'Website',
              body: 'We have taken reasonable measures to ensure the accuracy of information on the Website. Website content may be changed at any time with or without notice as we deem fit and proper.',
            },
            {
              heading: 'Severability',
              body: 'Any term, condition, provision, covenant or undertaking in this Agreement which is illegal, void, voidable, prohibited or unenforceable will be ineffective only to the extent of such illegality, voidness, prohibition or unenforceability and will not invalidate the remaining provisions of the Agreement.',
            },
            {
              heading: 'Force majeure',
              body: 'We shall not be responsible or liable for any liability, loss, damage, cost or expense incurred or suffered by you or anyone claiming through you as a result of a Force Majeure Event.',
            },
            {
              heading: 'Governing law and jurisdiction',
              body: 'Any non-contractual disputes, claims or differences arising out of or under this Agreement or any Transaction shall be governed and resolved in accordance with the Applicable Laws of Saint Lucia. The courts of Saint Lucia shall have exclusive jurisdiction to resolve disputes arising under this Agreement.',
            },
            {
              heading: 'Review of terms & conditions',
              body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improving this document. It will be reviewed regularly, at least every six months, for effectiveness and updated.\n\nThis Client’s Agreement (and Terms & Conditions) is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this document to all employees and displaying it in its business with clients.\n\nSigned by:\n\nDate:',
            },
          ],
        ),
      },
      ar: {
        title: 'اتفاقية العميل والشروط والأحكام',
        body: legalBody(
          'شركة NEWERA CAPITAL MARKETS LIMITED («الشركة» / «NCML») مسجلة بموجب قانون الشركات التجارية الدولية في سانت لوسيا، لدى هيئة تسجيل وتنظيم الشركات في سانت لوسيا.',
          [
            {
              heading: 'الهدف',
              body: 'تتضمن هذه الشروط والأحكام («الاتفاقية») المبرمة بين الشركة وبينك («العميل») الشروط والأحكام التي تحكم العلاقة التعاقدية بين الطرفين وتحكم كل معاملة يتم إبرامها أو تكون قائمة بين الشركة والعميل في أو بعد تنفيذ هذه الاتفاقية.\n\nتخضع العلاقة بين العميل والشركة لهذه الشروط والأحكام. وبما أن هذه الاتفاقية عقد عن بُعد، فلا يشترط توقيعها وتتمتع الاتفاقية بنفس القوة والحقوق القانونية التي تتمتع بها الاتفاقية الموقعة بشكل عادي.\n\nتشكل هذه الاتفاقية، إلى جانب المستندات الأخرى بما في ذلك إفصاح المخاطر، وسياسة تنفيذ الأوامر، وسياسة تضارب المصالح، وسياسة الخصوصية، وسياسة مكافحة الاحتيال والجرائم المالية، وسياسة مكافحة غسل الأموال ومعرفة العميل والعناية الواجبة، الاتفاق الكامل بين الشركة والعميل وتحدد الأساس الذي يتم بموجبه تقديم الخدمات للعميل.',
            },
            {
              heading: 'التعريفات وتفسير المصطلحات',
              body: 'في هذه الاتفاقية، يكون للمصطلحات التالية، ما لم يقتضِ السياق خلاف ذلك، المعاني الموضحة أدناه، ويمكن استخدامها بصيغة المفرد أو الجمع حسب الاقتضاء:\n\nالقانون المعمول به – القوانين والأوامر والإرشادات الملزمة قانوناً والتوجيهات في سانت لوسيا، بما في ذلك قانون الشركات التجارية الدولية، وقانون البنوك، وقوانين مكافحة الإرهاب، وقوانين مكافحة غسل الأموال واللوائح ذات الصلة، وقانون عائدات الجريمة وأي قوانين أو أوامر أو توجيهات أخرى ذات صلة.\n\nالقوانين أو القواعد المعمول بها – القوانين المعمول بها وقواعد أي سلطة أو بورصة ذات صلة والنافذة من وقت لآخر. وفي حال تعارض هذه الشروط مع القواعد المعمول بها، تسود القواعد المعمول بها.\n\nيوم العمل – أي يوم باستثناء السبت والأحد والعطلات الرسمية في سانت لوسيا تكون فيه البنوك في سانت لوسيا مفتوحة عادة للعمل.\n\nوكيل الحساب – شركة Newera Capital Markets Limited، رقم الشركة 2023-00564.\n\nأموال العملاء – الأموال بأي عملة التي تخصك والتي نستلمها أو نحتفظ بها لك أو نيابة عنك أثناء تقديم الخدمات والتي نتعامل معها كأموال عملاء محتفظ بها على سبيل الأمانة في حساب مخصص.\n\nتاريخ الإغلاق – التاريخ الذي يصبح فيه إغلاق المعاملة المفتوحة نافذاً.\n\nمستوى الإغلاق – المستوى الذي يتم عنده إغلاق المعاملة.\n\nسياسة الشكاوى – سياسة الشكاوى الخاصة بنا كما يتم تحديثها من وقت لآخر والمتاحة للعملاء على موقعنا الإلكتروني.\n\nمواصفات العقود – القسم من موقعنا الإلكتروني المخصص لمواصفات العقود، كما يتم تعديله من وقت لآخر.\n\nمزود دعم الائتمان – الطرف الذي يقدم دعماً ائتمانياً فيما يتعلق بالتزامات الطرف المقابل.\n\nرسوم التمويل اليومية – الرسوم التي نطبقها يومياً على المركز المفتوح وفقاً لمواصفات العقود.\n\nخدمات التداول الإلكتروني – الخدمات الإلكترونية والبرامج ذات الصلة، بما في ذلك التداول والوصول المباشر إلى السوق وتوجيه الأوامر وخدمات المعلومات التي نتيحها لك مباشرة أو من خلال مزود خدمة من طرف ثالث.\n\nمعاملة انتهاء الصلاحية – المعاملة التي لها فترة تعاقدية محددة وتنتهي تلقائياً عند انتهائها.\n\nحدث القوة القاهرة – حدث خارج عن السيطرة المعقولة للطرف المتأثر، بما في ذلك اضطرابات السوق والحروب والإضرابات والحرائق والفيضانات والكوارث الطبيعية والأعطال في المرافق أو شبكات النقل أو الاتصالات والأوبئة والجوائح وأعطال أنظمة التسوية أو المعدات وغيرها من الأحداث المماثلة.\n\nالأداة المالية – الخيارات وعقود الفروقات في العملات الأجنبية المقدمة للتداول بموجب هذه الاتفاقية.\n\nالمجموعة – الشركة وأي شركات تابعة أو شركات قابضة أو شركات تابعة لشركة قابضة تابعة لها من وقت لآخر.\n\nشركة المجموعة – أي عضو أو شركة تابعة أو مرتبطة بالمجموعة.\n\nآخر وقت للتعامل – آخر يوم ووقت يمكن قبلَه التعامل في معاملة وفقاً لطلب الحساب أو الإخطار المقدم لك أو وفقاً للسوق الأساسي ذي الصلة.\n\nالمعاملة المرتبطة – معاملتان أو أكثر لا نطلب بشأنهما كامل مبلغ الهامش بسبب العلاقة بين المعاملات.\n\nالخطأ الواضح – تسعير خاطئ أو واضح من جانبنا استناداً إلى مصدر سعر اعتمدنا عليه فيما يتعلق بمعاملة مع مراعاة ظروف السوق الحالية.\n\nالهامش – وديعة أموال أو ضمانات مقبولة لتأمين التزاماتك تجاهنا عن الخسائر المحتملة.\n\nالسوق – أي سوق يخضع للقوانين الحكومية أو قوانين الدولة وله قواعد وأوقات تداول محددة.\n\nاضطراب السوق – أي حالة نعتقد فيها بشكل معقول أن السوق أو البورصة ذات الصلة متوقفة أو مغلقة أو متضررة بشكل جوهري أو لا يمكن الاعتماد عليها.\n\nقواعد السوق – القوانين والقواعد والأعراف والممارسات الخاصة بأي بورصة أو غرفة مقاصة أو منظمة أو سوق ذات صلة بإبرام أو تنفيذ أو تسوية المعاملة.\n\nفرق السوق – الفرق بين أسعار العرض والطلب لمعاملة ذات حجم مماثل في الأداة أو الأداة ذات الصلة في السوق الأساسي.\n\nمتطلبات مكافحة غسل الأموال – جميع قوانين وقواعد مكافحة غسل الأموال المعمول بها والتي تخضع لها الشركة وشركات المجموعة والعميل.\n\nحجم السوق الطبيعي – الحد الأقصى لعدد الأسهم أو العقود أو الوحدات الأخرى التي نعتقد بشكل معقول أن السوق الأساسي قادر على استيعابها في الوقت المعني.\n\nالمنشأة الإلكترونية – موقعنا الإلكتروني ومنصة التداول الإلكترونية ومنشأة مراجعة الحساب.\n\nالمركز المفتوح – معاملة لم يتم إغلاقها كلياً أو جزئياً بموجب هذه الاتفاقية.\n\nسياسة تنفيذ الأوامر – السياسة المتاحة للعملاء على الموقع الإلكتروني.\n\nتاريخ الدفع – التاريخ الذي تقوم فيه بتسوية المبلغ المستحق لنا بموجب المعاملة وبالعملة والحساب اللذين نحددهما.\n\nالأصل المرجعي – أي ممتلكات أو مؤشر أو عامل آخر مشار إليه في عقد الفروقات أو معاملة الهامش لتحديد الأرباح أو الخسائر.\n\nتحذير المخاطر – تحذير المخاطر المتاح على الموقع الإلكتروني.\n\nالمعاملة اليومية المتجددة – معاملة لا تنتهي تلقائياً في نهاية يوم العمل ولكن يتم ترحيلها تلقائياً إلى يوم العمل التالي.\n\nفرق السعر – الفرق بين الرقمين الأدنى والأعلى في السعر ذي الاتجاهين.\n\nدفعة الإنهاء – المبلغ المستحق الدفع لنا وفقاً للبند 38.\n\nتاريخ الإنهاء – تاريخ إنهاء هذه الاتفاقية بينك وبيننا.\n\nالمعاملة – أي معاملة في الخيارات أو العقود الآجلة أو عقود الفروقات في العملات الأجنبية أو المعادن الثمينة أو السلع أو غيرها من الأدوات والمنتجات المالية.\n\nالمعاملة غير المؤرخة – معاملة ذات فترة تعاقدية غير محددة لا تنتهي تلقائياً.\n\nمعاملة شراء غير مؤرخة – معاملة شراء ذات فترة غير محددة.\n\nمعاملة بيع غير مؤرخة – معاملة بيع ذات فترة غير محددة.\n\nالسوق الأساسي – البورصة أو الجهة المماثلة أو مجمع السيولة الذي يتم فيه تداول الأداة.\n\nالموقع الإلكتروني – أي من مواقعنا الإلكترونية التي توفر خدمات التداول الإلكتروني للعملاء.',
            },
            {
              heading: 'بدء الاتفاقية',
              body: 'تحل هذه الاتفاقية محل أي اتفاقية سابقة بين العميل والشركة بشأن الموضوع نفسه، وتصبح نافذة عندما يشير العميل إلى قبوله لها عبر الموقع الإلكتروني الرئيسي. وتنطبق هذه الاتفاقية على جميع المعاملات المشمولة بها.',
            },
            {
              heading: 'المقدمة',
              body: '1.1 تحدد اتفاقية العميل هذه الشروط والأحكام التي تحكم الخدمات التي تقدمها شركة Newera Capital Markets Limited («نحن» أو «لنا»). الشركة شركة محدودة بالأسهم، رقم تسجيلها 2023-00564، تأسست بموجب قانون الشركات التجارية الدولية، الفصل 12.14، القسم 6، وعنوانها المسجل Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia.\n\n1.2 نتعامل معك بصفتنا أصلاً ما لم نخطرك كتابياً بأننا نتعامل معك كوكيل. وتدخل أنت في المعاملات بصفتك أصلاً ما لم نتفق كتابياً على خلاف ذلك.\n\n1.3 من خلال فتح حساب عبر المنشأة الإلكترونية، وقبول الشروط إلكترونياً، واستخدام خدماتنا أو الاستمرار في استخدامها، فإنك توافق على الالتزام بهذه الاتفاقية وأي تعديلات يتم إخطارك بها.\n\n1.4 توافق على إخطارنا فوراً بأي تغيير في المعلومات التي قدمتها لنا.\n\n1.5 يكون للمصطلحات المعرفة في هذه الاتفاقية المعاني المحددة لها، وما عدا ذلك يكون لها معناها التجاري المعتاد في قطاع الخدمات المالية.',
            },
            {
              heading: 'معلومات التسجيل',
              body: 'شركة Newera Capital Markets Limited هي اسم تجاري مسجل لشركة Newera Capital Markets Limited، وقد تأسست بموجب الفصل 12.14، القسم 6 من قانون الشركات التجارية الدولية، برقم التسجيل 2023-00564 ومسجلة لدى سلطات تسجيل وتنظيم الشركات في سانت لوسيا.',
            },
            {
              heading: 'خدماتنا',
              body: '3.1 وفقاً لهذه الاتفاقية وقبول طلب فتح الحساب، نحتفظ بحساب أو أكثر باسمك ونقدم خدمات تنفيذ فقط فيما يتعلق بالعملات الأجنبية وعقود الفروقات، بما في ذلك العملات الأجنبية والمعادن ومؤشرات الأسهم والسلع وغيرها من المنتجات المالية التي قد نقدمها عبر المنشأة الإلكترونية.\n\n3.2 يتم تقديم أوامر تنفيذ المعاملات إلكترونياً من خلال المنشأة الإلكترونية للشراء بسعر العرض أو البيع بسعر الطلب المعروض.\n\n3.3 ما لم يتم الاتفاق كتابياً، لا يحق لك استلام الأصل المرجعي أو تسليمه ولا تكتسب أي مصلحة فيه.\n\n3.4 يحق لنا إغلاق أي معاملة وفقاً لتقديرنا المطلق ودون إشعار.\n\n3.5 لا نقدم المشورة أو التوصيات الشخصية بشأن المعاملات، ويعتمد العميل على تقييمه الخاص.\n\n3.6 أي خدمات قانونية أو محاسبية أو ضريبية أو مهنية يتم الحصول عليها من قبلنا تكون لصالحنا فقط، ويتحمل العميل مسؤولية الحصول على مشورته المهنية الخاصة.\n\n3.7 لا يؤدي تقديم الخدمات إلى إنشاء علاقة ائتمانية أو ائتمانية/أمانة أو وكالة أو مشروع مشترك أو شراكة ما لم يتم الاتفاق كتابياً.',
            },
            {
              heading: 'التزامنا بمعرفة العميل',
              body: '4.1 يجب علينا تحديد معلومات العميل، بما في ذلك الاسم ورقم الهوية أو جواز السفر ومعلومات التسجيل للكيانات وطبيعة العمل ومصدر الأموال وإثبات العنوان والمستندات التجارية والمعلومات المصرفية وتفاصيل المعاملات. وقد تكون هناك حاجة إلى العناية الواجبة ومعرفة العميل والعناية الواجبة المعززة.\n\n4.2 توافق على تقديم جميع المعلومات المطلوبة ضمن إجراءات العناية الواجبة وتفوضنا أو وكلاءنا بالتحقق من هويتك ووضعك الائتماني ونشاطك الاستثماري الحالي والسابق والاتصال بالبنوك والوسطاء والأطراف ذات الصلة.\n\n4.3 لا نتحمل المسؤولية عن التأخير أو عدم معالجة الطلب أو المعاملة إذا لم تقدم المستندات المطلوبة.\n\n4.4 نحتفظ بالحق في تعديل أو تصحيح أو حذف المعلومات على منصة التداول عندما تكون غير صحيحة أو ناقصة أو غير ضرورية بعد مقارنتها بمستندات معرفة العميل.',
            },
            {
              heading: 'تقديم عرض الأسعار',
              body: '5.1 قد نقدم، بناءً على طلبك، عرض أسعار غير ملزم يتضمن الرسوم ذات الصلة. قد تستند الأسعار إلى أسعار العرض والطلب في السوق الأساسي أو الأسعار التي نحددها.\n\n5.2 تكون الأسعار صالحة في وقت إصدارها وقد تتغير. ويمكن أن تتسع فروق الأسعار بشكل كبير وقد تختلف بين فتح وإغلاق المعاملة.\n\n5.3 يمكنك طلب عرض أسعار خلال ساعات التداول العادية للأداة ذات الصلة.\n\n5.4 عرض السعر ليس عرضاً لإبرام معاملة. يتم إنشاء العرض عندما تبدأ المعاملة ونقبلها، ويثبت التنفيذ من خلال تأكيد كتابي.\n\n5.5 يجوز لنا رفض العرض إذا لم يتم استيفاء متطلبات السعر، بما في ذلك انتهاء العرض أو وجود خطأ واضح أو تجاوز حجم السوق أو وجود قوة قاهرة أو حالة تخلف عن السداد أو تجاوز الحدود.\n\n5.6 يجوز لنا رفض المعاملات التي تتجاوز حجم السوق الطبيعي وفرض شروط خاصة.\n\n5.7 إذا تحرك السعر لصالحك قبل قبول العرض، يجوز لنا تمرير التحسن السعري إليك وفقاً لتقديرنا.\n\n5.8 إذا تم تداول الأداة في عدة أسواق أساسية، يجوز لنا الاعتماد على أسعار العرض والطلب المجمعة.',
            },
            {
              heading: 'تحذير المخاطر',
              body: '6.1 ينطوي التداول في الخيارات وعقود الفروقات والعملات الأجنبية والمعادن الثمينة والسلع والأدوات المالية الأخرى على مستوى عالٍ من المخاطر وقد لا يكون مناسباً للجميع. يجب مراعاة أهدافك الاستثمارية وخبرتك وقدرتك على تحمل المخاطر وعدم استثمار مبلغ يتجاوز قدرتك على تحمل الخسارة.\n\n6.2 تنطوي المعاملات خارج البورصة على مخاطر كبيرة، بما في ذلك الرافعة المالية والجدارة الائتمانية والحماية التنظيمية المحدودة وتقلبات السوق.',
            },
            {
              heading: 'إجراءات التعامل',
              body: '7.1 إذا تم تنفيذ المعاملة كلياً أو جزئياً، فلا يمكن إلغاؤها في حدود الجزء المنفذ.\n\n7.2 نحتفظ بالحق في تحديد عدد المراكز المفتوحة ورفض المعاملات التي تفتح أو تزيد المراكز.\n\nالتداول الإلكتروني\n\n7.3 لسنا ملزمين بقبول أو تنفيذ أو إلغاء المعاملات المقدمة عبر خدمات التداول الإلكتروني ولا نتحمل المسؤولية عن عمليات النقل غير الدقيقة أو غير المستلمة أو الخسائر الناتجة عن ضعف الاتصال بالإنترنت أو الأعطال أو مشاكل البرامج أو الأجهزة.\n\n7.4 يقر العميل بالمخاطر المرتبطة بالبريد والهاتف والفاكس والبريد الإلكتروني والرسائل الفورية وخدمات VoIP وغيرها من وسائل الاتصال، بما في ذلك أخطاء النقل والتأخير والفيروسات والأعطال والاحتيال والتزوير والاعتراض غير المصرح به. يتحمل العميل هذه المخاطر.\n\n7.5 باستثناء الإهمال الجسيم أو التقصير المتعمد أو الاحتيال، لا نتحمل المسؤولية عن الخسائر الناتجة عن فقدان أو تأخير نقل الأوامر أو اعتراضها.\n\n7.6 يجوز لنا تعديل أو تحديث أو ترقية أو تعليق أو إنهاء المنشآت الإلكترونية دون إشعار، ولا نتحمل المسؤولية عن هذه الإجراءات.\n\n7.7 لا نتحمل المسؤولية عن الخسائر الناتجة عن فشل أو عطل أو تأخير أو انقطاع أو استخدام غير مصرح به لأنظمتنا أو أنظمة الأطراف الثالثة.\n\nالوكلاء\n\n7.8 لسنا ملزمين بتنفيذ تعليمات وكيل إذا اعتقدنا بشكل معقول أنه يتصرف دون سلطة أو يتجاوز سلطته.\n\nمخالفة القانون\n\n7.9 يجوز لنا رفض أو إغلاق أي معاملة إذا اعتقدنا بشكل معقول أنها قد تكون غير عملية أو مخالفة للقانون أو القواعد.\n\nالحالات غير المشمولة\n\n7.10 تتم معالجة الحالات غير المشمولة بحسن نية وعدالة مع مراعاة ممارسات السوق.\n\nرسوم الاقتراض والمعاملات التي تصبح غير قابلة للاقتراض\n\n7.11 يجوز تمرير رسوم اقتراض الأسهم إلى العميل، وقد نغلق المعاملة إذا أصبحت الأداة غير قابلة للاقتراض.\n\n7.12 إذا أصبح السهم الأساسي غير قابل للاقتراض، يجوز لنا زيادة متطلبات الهامش أو إغلاق المعاملة أو تغيير آخر وقت للتعامل.',
            },
            {
              heading: 'فتح معاملة',
              body: '8.1 يتم فتح المعاملة بالشراء أو البيع. الشراء يسمى شراء أو مركزاً طويلاً، والبيع يسمى بيعاً أو مركزاً قصيراً.\n\n8.2 يجب تحديد عدد الأسهم أو العقود أو الوحدات في كل معاملة.\n\n8.3 تكون المعاملة ملزمة حتى إذا تجاوز العميل حدود الائتمان أو التداول.\n\n8.4 قد يتم فرض عمولة عند فتح أو إغلاق المعاملة. وإذا لم يتم إخطار العميل بمعدل العمولة، يطبق المعدل القياسي المنشور على الموقع أو 0.01% من قيمة المعاملة إذا لم يكن هناك معدل منشور.\n\n8.5 تكون المبالغ المستحقة عند فتح المعاملة واجبة الدفع عند تحديد مستوى الافتتاح.\n\n8.6 تخضع الرسوم للبند 25.',
            },
            {
              heading: 'المعاملات المتعددة',
              body: 'عند التداول على منصتي MT5 وXOH، يمكن أن توجد معاملات شراء وبيع متزامنة للأداة نفسها مع مراعاة متطلبات الهامش.\n\nإذا كان هناك شراء مفتوح وتم إدخال بيع لاحق، فقد يؤدي البيع الأصغر إلى إغلاق جزء من الشراء، والمساوي إلى إغلاقه بالكامل، والأكبر إلى إغلاق الشراء وفتح بيع بالجزء الزائد.\n\nوبالمثل، إذا كان هناك بيع مفتوح وتم إدخال شراء لاحق، فقد يؤدي الشراء الأصغر إلى إغلاق جزء من البيع، والمساوي إلى إغلاقه بالكامل، والأكبر إلى إغلاق البيع وفتح شراء بالجزء الزائد.',
            },
            {
              heading: 'إغلاق المعاملة',
              body: '10.1 لإغلاق معاملة على MT5 أو XOH، يجب الدخول في معاملة معاكسة للأصل المرجعي نفسه.\n\n10.2 نقوم بتسوية المعاملة الأولى والثانية وعرض المركز الإجمالي على منصة التداول.\n\n10.3 قد تتسع فروق الأسعار بشكل كبير وقد تختلف عند الإغلاق. الأسعار أثناء إغلاق السوق تعكس تقديرنا المعقول لظروف السوق. ولا يجوز استخدام أسعارنا إلا لأغراض التداول الخاصة بك ولا يجوز إعادة توزيعها.\n\n10.4 لسنا ملزمين بإغلاق الصفقة بناءً على طلبك. وإذا وافقنا، يتم حساب قيمة الإغلاق وفقاً لظروف السوق السائدة وقد تشمل التكاليف المرتبطة.\n\n10.5 يجوز لنا إغلاق المعاملات دون إشعار إذا تعذر اقتراض الأسهم أو وجب إعادة الأصول المقترضة أو تعذر إنشاء أو الحفاظ على التحوط.\n\n10.6 عند إغلاق المعاملة من جانبنا، نحدد تاريخ الإغلاق والسعر وتصبح مبالغ التسوية مستحقة فوراً.\n\n10.7 تتم تسوية الالتزامات الناتجة عن الإغلاق على أساس صافي المبلغ المستحق.\n\n10.8 في حالة وجود نزاع حول أي معاملة، يجوز لنا إلغاء أو إنهاء أو عكس أو إغلاق المركز.\n\nالمعاملات غير المؤرخة\n\n10.9 يجوز للعميل إغلاق المعاملة غير المؤرخة وفقاً لهذه الشروط.\n\n10.10 عند إغلاق شراء غير مؤرخ يكون مستوى الإغلاق هو الرقم الأقل الذي نقتبسه، وعند إغلاق بيع غير مؤرخ يكون الرقم الأعلى.\n\nمعاملات انتهاء الصلاحية\n\n10.11 إذا لم يغلق العميل المعاملة قبل آخر وقت للتعامل، يجوز لنا إغلاقها وفقاً للسعر الأخير أو سعر الإغلاق الرسمي والفرق المطبق.\n\n10.12 يتحمل العميل مسؤولية معرفة آخر وقت للتعامل وفروق الأسعار.\n\n10.13 لا نقوم تلقائياً بترحيل المعاملات التي تنتهي صلاحيتها، ويكون أي ترحيل وفقاً لتقديرنا.',
            },
            {
              heading: 'تجميع الأوامر',
              body: 'يجوز لنا تجميع تعليمات العميل لإغلاق المعاملات مع تعليمات عملاء آخرين عندما نعتقد بشكل معقول أن ذلك يصب في المصلحة العامة للعملاء. وقد يؤدي التجميع إلى الحصول على سعر أقل ملاءمة.',
            },
            {
              heading: 'التأكيدات',
              body: '12.1 بعد تنفيذ المعاملة، نؤكد تفاصيلها إلكترونياً أو عبر المنشأة الإلكترونية. ويعتبر التأكيد نهائياً وملزماً ما لم يعترض العميل كتابياً في أقرب وقت ممكن وبحد أقصى خلال يوم عمل واحد.\n\n12.2 تتم معالجة النزاعات المتعلقة بدقة التأكيد وفقاً للبند 35.',
            },
            {
              heading: 'اضطراب التحوط',
              body: 'إذا قررنا حدوث أو احتمال حدوث اضطراب في التحوط، يجوز لنا اتخاذ الإجراءات اللازمة للتحوط من مخاطر أسعار المعاملات. ويتحمل العميل التكاليف الإضافية الناتجة عن اضطراب التحوط، وقد يتم خصمها من الحساب أو طلب دفعها.',
            },
            {
              heading: 'تعليق السوق وإلغاء الإدراج',
              body: 'إذا تم تعليق التداول في أصل مرجعي، يتم تقييم المعاملة باستخدام آخر سعر تداول أو سعر إغلاق نحدده بشكل معقول. وإذا استمر التعليق خمسة أيام عمل، يجوز الاتفاق على تاريخ وقيمة الإغلاق. وإذا تم إلغاء إدراج الأصل ولم تتم إعادة إدراجه، يصبح التاريخ المحدد تاريخ الإغلاق.',
            },
            {
              heading: 'المدفوعات',
              body: '15.1 حسابات العملاء مقومة بالدولار الأمريكي. ويتم تحويل المدفوعات بعملات أخرى إلى الدولار الأمريكي وتتحمل أنت رسوم التحويل.\n\n15.2 يجب دفع المبالغ المستحقة في تاريخ الدفع وبالعملة والحساب المحددين.\n\n15.3 تتم تسوية الالتزامات المتبادلة على أساس صافي المبلغ.\n\n15.4 يتحمل العميل رسوم التحويلات البنكية ورسوم الأطراف الثالثة.\n\n15.5 يجب تحديد المدفوعات بشكل صحيح وإدخال تفاصيل الحساب المطلوبة.\n\n15.6 يجوز طلب سحب الرصيد الإيجابي، ويجوز لنا حجب أو خصم أو رفض الدفع في حالات معينة، بما في ذلك وجود مراكز خاسرة أو عدم كفاية الهامش أو وجود التزام فعلي أو محتمل.\n\n15.7 لا نتحمل المسؤولية عن الخسائر الناتجة عن تأخر وصول الأموال.\n\n15.8 يتم إجراء المدفوعات دون خصم ضريبي ما لم يطلب القانون ذلك، وفي حالة الخصم الإلزامي يتم اتخاذ الإجراءات المطلوبة قانوناً.',
            },
            {
              heading: 'مدفوعات الهامش',
              body: '16.1 قد تتطلب معاملات الخيارات وعقود الفروقات دفعات هامش لتغطية الخسائر غير المحققة.\n\n16.1.1 قد يكون الهامش مطلوباً عند فتح المعاملة وعلى أساس يومي أثناء استمرارها.\n\n16.1.2 تتطلب المعاملات ذات الرافعة المالية هامشاً يمثل جزءاً من قيمة العقد. وتؤدي التحركات الصغيرة في السعر الأساسي إلى تحركات كبيرة في قيمة الصفقة.\n\n16.1.3 يجب توفير الهامش بالعملة وفي الوقت المحددين. وعلى العميل مراقبة حسابه ولا نلتزم بإجراء نداءات الهامش.\n\n16.1.4 قد يخسر العميل إيداعه الأولي ويطلب منه توفير هامش إضافي.\n\n16.1.5 يمكن تقديم الهامش نقداً أو بأصول نقبلها.\n\n16.1.6 إذا لم يتم توفير الهامش، يجوز لنا إغلاق بعض أو جميع المراكز.',
            },
            {
              heading: 'التسوية',
              body: 'ما لم يتم الاتفاق كتابياً على خلاف ذلك، تتم تسوية المعاملات على أساس الدفع مقابل التسليم. يجب تقديم المستندات والأموال اللازمة في الوقت المناسب. وإذا تخلف أي طرف عن الدفع، فقد تستحق الفائدة. ويجوز لنا شراء استثمارات لتغطية الالتزامات وخصم الخسائر من الحساب. وفي حالة النزاع، يجوز لنا إلغاء أو إنهاء أو عكس أو إغلاق المعاملة.',
            },
            {
              heading: 'المقاصة',
              body: 'يجوز لنا، دون إشعار، إجراء مقاصة بين أي التزام لنا تجاهك وأي التزام عليك تجاهنا أو تجاه شركة من شركات المجموعة، سواء كان حالياً أو مستقبلياً وبغض النظر عن العملة.',
            },
            {
              heading: 'الخطأ الواضح',
              body: 'يجوز لنا دون موافقتك إلغاء أو تعديل أي معاملة تحتوي على خطأ واضح. وإذا تم تعديلها، يكون المستوى هو المستوى الذي نعتقد بشكل معقول أنه عادل وقت إبرام المعاملة. ولا نتحمل المسؤولية عن الخسائر الناتجة عن الخطأ الواضح باستثناء حالات الاحتيال أو التقصير المتعمد أو الإهمال.',
            },
            {
              heading: 'سلوك السوق',
              body: 'يجوز لنا اتخاذ الإجراءات اللازمة للامتثال لقواعد السوق ومتطلبات مكافحة غسل الأموال والقوانين المعمول بها، بما في ذلك بيع أو إغلاق المعاملات. ويجوز لنا الإبلاغ عن المعاملات إلى السلطات المختصة. كما يجوز لنا التحوط لالتزاماتنا. ويقر العميل بفهمه لقوانين إساءة استخدام السوق والبيع على المكشوف والتعامل بناءً على معلومات داخلية.',
            },
            {
              heading: 'التداول غير السليم',
              body: 'لا نضمن سرعة أو استمرارية منصة MT5/XOH. وإلى أقصى حد يسمح به القانون، لا نتحمل المسؤولية عن الخسائر الناتجة عن التأخير أو تعليق المنصة أو النشاط التجاري غير السليم أو غير القانوني أو عدم استخدام أحدث إصدار من المنصة.\n\nيجوز لنا تعليق الحساب فوراً للتحقيق في التداول غير السليم أو غير القانوني أو غير العادل.\n\nيشمل تداول الكمون المعاملات ذات الحجم المرتفع التي تفتح وتغلق خلال فترات قصيرة بشكل غير معتاد لاستغلال فروق الأسعار. وإذا اعتقدنا أن هذا السلوك يتم استغلاله بشكل غير عادل، يجوز لنا إلغاء الصفقات وإغلاق الحساب.',
            },
            {
              heading: 'المستشارون الخبراء',
              body: 'يجوز للعميل استخدام Expert Adviser، وهو نظام تداول خوارزمي آلي، على MT5/XOH. ويعتبر التداول باستخدامه محفوفاً بالمخاطر ولا نشجع أو نؤيد استخدامه. وإلى أقصى حد يسمح به القانون، لا نتحمل المسؤولية عن الخسائر الناتجة عن استخدامه أو أعطاله أو أخطائه.',
            },
            {
              heading: 'صيانة النظام',
              body: 'يجوز لنا إجراء صيانة لمنصة التداول الإلكترونية. وسنسعى إلى إجراء الصيانة خارج ساعات التداول ولكن يجوز تنفيذها في أي وقت. وإذا حدثت الصيانة أثناء فتح السوق، قد نخطرك بذلك ولا نتحمل المسؤولية عن الخسائر الناتجة عنها.',
            },
            {
              heading: 'حالات التخلف عن السداد',
              body: 'تحدث حالة التخلف عن السداد إذا فشل العميل في دفع مبلغ مستحق ولم يعالج الإخفاق خلال المدة المحددة، أو فشل في معالجة التزام آخر خلال 30 يوماً من الإخطار، أو كانت أي إقرارات أو ضمانات مقدمة غير صحيحة أو مضللة بشكل جوهري.\n\nوقد تحدث حالة التخلف أيضاً بالنسبة لمزود دعم الائتمان عند حله أو إعساره أو عدم قدرته على دفع الديون أو خضوعه لإجراءات الإفلاس أو التصفية أو الإدارة القضائية أو الحراسة أو أي إجراء مماثل.\n\nكما قد تحدث حالة التخلف عندما تصبح المبالغ المستحقة غير مدفوعة أو واجبة الدفع قبل موعدها بسبب التخلف أو عند الإخلال بالتزامات معينة بموجب المعاملات المالية.',
            },
            {
              heading: 'الرسوم والتكاليف',
              body: 'سيتم إخطار العميل بالرسوم والتكاليف كتابياً من وقت لآخر. ويتحمل العميل الرسوم والمصروفات والضرائب والرسوم القانونية المتعلقة بهذه الشروط. ويتم فرض رسوم التمويل اليومية على المراكز المفتوحة وفقاً لمواصفات العقود. ويجوز مشاركة الرسوم والعمولات مع شركات المجموعة أو الأطراف الثالثة. وقد نتلقى أو ندفع رسوماً أو عمولات أو مزايا غير نقدية من أطراف ثالثة.',
            },
            {
              heading: 'رسوم عدم النشاط',
              body: 'يعتبر الحساب غير نشط إذا لم يحدث نشاط لمدة 180 يوماً تقويمياً أو أكثر. ويشمل النشاط فتح أو إغلاق صفقة أو الحفاظ على مركز مفتوح. وقد يتم فرض رسوم عدم نشاط شهرية بعد إخطار العميل.',
            },
            {
              heading: 'سلطتنا وواجباتنا',
              body: 'لا تلزمنا هذه الشروط بالدخول في أي معاملات أو قبول التعليمات، ولا نلتزم بإعطاء أسباب للرفض. يجوز لنا الاعتماد على التعليمات التي نعتقد بشكل معقول أنها صحيحة وحقيقية.\n\nنتعامل عادة مع العميل كأصيل وقد نقدم أسعاراً ثنائية الاتجاه. تتم معالجة المعاملات وفق سياسة تنفيذ الأوامر. ونسعى لتقديم أسعار تنافسية ولكن لا نضمن أن الأسعار المعروضة تمثل دائماً أفضل أسعار السوق.\n\nيجوز لنا تعيين وكلاء أو متعاقدين. والمعلومات المقدمة عن المعاملات لا تشكل ضماناً للنتائج.',
            },
            {
              heading: 'استبعاد المسؤولية والتعويضات',
              body: 'لا يستبعد أي شيء المسؤولية التي لا يجوز استبعادها قانوناً. وباستثناء الإهمال الجسيم أو التقصير المتعمد أو الاحتيال، لا نتحمل المسؤولية عن الخسائر الناتجة عن أفعالنا أو إغفالاتنا أو أفعال الأطراف الثالثة التي نتعامل معها بحسن نية.\n\nإذا نشأت إجراءات قانونية تتعلق بمعاملة مع العميل، يجب على العميل التعاون معنا. ويتعين عليه تعويضنا وتعويض شركات المجموعة ومديرينا وموظفينا ووكلائنا عن المطالبات والخسائر والأضرار والمصروفات الناتجة عن التعامل معه بموجب هذه الشروط.',
            },
            {
              heading: 'صلاحيات العميل والتزاماته',
              body: 'يقر العميل ويضمن أنه يملك الصلاحية القانونية للدخول في المعاملات وتنفيذ التزاماته، وأنه بلغ سن الرشد وهو في كامل الأهلية، وأن جميع المعلومات المقدمة صحيحة وكاملة، وأنه لا يعتمد على الشركة للحصول على المشورة الاستثمارية أو الضريبية، وأنه يتصرف لحسابه الخاص، ويفهم ويقبل المخاطر، ويدخل في المعاملات بصفته أصلاً، ويلتزم بجميع القوانين والقواعد المعمول بها.\n\nيتحمل العميل مسؤولية الضرائب المستحقة عليه وأي معلومات مطلوبة من السلطات الضريبية.',
            },
            {
              heading: 'الطرف الثالث المفوض',
              body: 'يجوز للعميل تفويض شخص لإدارة حسابه على مسؤوليته الخاصة، ويجب تقديم مستند التفويض المطلوب. يتحمل العميل مسؤولية أفعال أو إغفالات الطرف الثالث المفوض، ويجوز لنا الاعتماد على تعليماته. وإذا تم فتح الحساب إلكترونياً، قد نطلب وثيقة هوية لتعيين الطرف الثالث.',
            },
            {
              heading: 'أموال العملاء',
              body: 'يتم التعامل مع الأموال المستلمة في حساب العميل كأموال عملاء محتفظ بها على سبيل الأمانة. ويتم الاحتفاظ بها في حسابات منفصلة مخصصة لأموال العملاء ولا يتم دفع فائدة عليها.\n\nنبذل العناية اللازمة عند اختيار البنوك والوسطاء من الأطراف الثالثة، ولا نتحمل المسؤولية عن إعسارهم أو أفعالهم أو أي نقص ناتج عن ذلك.\n\nتكون حسابات أموال العملاء مجمعة ويكون لكل عميل حق نسبي في الأموال الموجودة في التجميع.\n\nيجوز نقل أموال العملاء إلى كيان قانوني آخر عند نقل الأعمال بشرط استمرار الاحتفاظ بها وفقاً لهذه الاتفاقية.\n\nفي الحسابات المشتركة، نتحقق من مصدر الإيداعات والموافقات اللازمة قبل إجراء المدفوعات.\n\nيجوز الإفراج عن الأموال غير المطالب بها وفقاً للقانون إذا لم يحدث أي نشاط لمدة ست سنوات وتم اتخاذ خطوات معقولة لتحديد مكان العميل.',
            },
            {
              heading: 'التمويل الليلي والترحيل',
              body: 'تتوفر المعاملات اليومية المتجددة والعقود غير المؤرخة لعقود الفروقات في أسواق مختلفة. ويتم ترحيل هذه العقود تلقائياً إلى جلسة التداول التالية، وتتم إضافة أو خصم رسوم التمويل اليومية عند الاحتفاظ بالمعاملة من جلسة إلى أخرى.',
            },
            {
              heading: 'اتفاقية الائتمان المؤقت',
              body: 'تخضع أي تسهيلات ائتمانية مؤقتة لشروط وحدود منفصلة. ويجوز لنا تعديل ترتيبات الائتمان في أي وقت. ولا يحد الائتمان من الخسائر المحتملة، وقد تتجاوز مسؤولية العميل المالية حدود الائتمان. ويجب سداد الائتمان خلال المدة المحددة.',
            },
            {
              heading: 'تضارب المصالح',
              body: 'قد يكون للشركة أو لشركة من شركات المجموعة أو لشخص مرتبط بها مصلحة أو علاقة أو ترتيب يؤثر على المعاملة أو الخدمة. نسعى إلى إدارة تضارب المصالح وفقاً لالتزاماتنا القانونية وسياسة تضارب المصالح الخاصة بنا.\n\nوفي بعض الحالات قد يكون رفض المعاملة هو الوسيلة المناسبة لإدارة تضارب المصالح، ويجوز لنا رفض المعاملة دون تحمل المسؤولية عن الخسائر الناتجة.',
            },
            {
              heading: 'الشكاوى',
              body: 'لدينا سياسة شكاوى مكتوبة لضمان التعامل مع الشكاوى بعدالة وسرعة. يجب توجيه الشكاوى إلى قسم خدمات العملاء أو قسم الامتثال عبر البريد الإلكتروني compliance@newera365.com، وسيتم التحقيق في الشكوى ومحاولة حلها.',
            },
            {
              heading: 'التعديلات',
              body: 'يجوز لنا تعديل أي جزء من هذه الشروط من خلال تقديم إشعار كتابي معقول عبر البريد أو البريد الإلكتروني أو المنشأة الإلكترونية. وفي الحالات التي يتعذر فيها تقديم إشعار مسبق، يجوز أن يصبح التعديل نافذاً فوراً.\n\nتصبح التعديلات نافذة في التاريخ المحدد في الإشعار. وإذا لم يرغب العميل في قبول التعديل، يجوز له إغلاق المعاملات المفتوحة وحسابه وفقاً لهذه الشروط.',
            },
            {
              heading: 'الإنهاء',
              body: '37.1 يجوز للعميل إنهاء هذه الاتفاقية بإشعار كتابي في أي وقت. ويجوز لنا إنهاؤها بإشعار كتابي مدته ثلاثون (30) يوماً على الأقل ما لم تتطلب الظروف فترة أقصر.\n\n37.2 يجوز لنا الإنهاء فوراً ودون إشعار إذا أصبح العميل غير قادر على سداد ديونه أو دخل في ترتيب مع دائنيه أو خضع للتصفية أو الإدارة القضائية أو الإفلاس أو الحراسة أو خالف التزاماته بشكل جوهري أو وقع حدث قوة قاهرة.\n\n37.3 لا يؤثر الإنهاء على الحقوق والالتزامات القانونية أو العادلة التي نشأت قبل الإنهاء.',
            },
            {
              heading: 'المدفوعات عند الإنهاء',
              body: 'يقوم وكيل الحساب، بحسن نية وبطريقة معقولة، بتحديد مبلغ الإغلاق الذي يحافظ على المعادل الاقتصادي للمدفوعات التي كانت ستستحق بعد تاريخ الإنهاء المبكر.\n\nيتم تحديد دفعة الإنهاء من خلال مبلغ الإغلاق والمبالغ المستحقة غير المدفوعة مطروحاً منها المبالغ المستحقة للطرف المتأثر، بالإضافة إلى الفائدة المسموح بها قانوناً.\n\nإذا كانت دفعة الإنهاء موجبة، يدفعها الطرف المتأثر للطرف غير المتأثر، وإذا كانت سالبة يدفع الطرف غير المتأثر المبلغ للطرف المتأثر.\n\nيجوز إجراء المقاصة مع الالتزامات بموجب اتفاقيات أخرى. ويجوز لوكيل الحساب النظر في عروض المعاملات البديلة وبيانات السوق والتكاليف المتعلقة بإنهاء أو إعادة إنشاء التحوط.',
            },
            {
              heading: 'حماية البيانات الشخصية',
              body: 'نلتزم بمتطلبات قوانين حماية البيانات المعمول بها. نستخدم البيانات الشخصية والبيانات الحساسة لتقديم الخدمات وتقييم المخاطر وإنفاذ حقوقنا، وقد نشاركها بشكل سري مع شركات المجموعة ومقدمي الخدمات والوكلاء والمراجعين والمحامين والبنوك والوسطاء والمستشارين.\n\nقد يتم نقل البيانات خارج سانت لوسيا إلى دول ذات معايير مختلفة لحماية البيانات، وسنتخذ الخطوات المناسبة لحمايتها.\n\nيجوز لنا إجراء عمليات تحقق من الهوية والائتمان واستخدام المعلومات لمساعدة شركات أخرى في التحقق من الهوية.\n\nقد نتواصل مع العميل عبر الهاتف أو البريد الإلكتروني أو وسائل الاتصال الأخرى بشأن الخدمات. وتشمل «معلوماتك» معلومات معاملاتك. ويمكنك طلب نسخة من المعلومات التي نحتفظ بها عنك وفقاً للإجراءات المحددة.',
            },
            {
              heading: 'المراقبة والتسجيل',
              body: 'قد تتم مراقبة رسائل البريد الإلكتروني التي يرسلها العميل وقد يتم تسجيل المكالمات الهاتفية بيننا. وتظل التسجيلات ملكاً لنا ويمكن استخدامها كدليل في حالة النزاع.',
            },
            {
              heading: 'الاتصالات، بما في ذلك الاتصالات الإلكترونية',
              body: 'ما لم يتم الاتفاق على خلاف ذلك أو يتطلب القانون خلاف ذلك، تتم المراسلات وإرسال المستندات في سانت لوسيا. ويوافق العميل على التواصل معنا وإرسال المستندات وفقاً لذلك.\n\nيجوز لنا التواصل عبر البريد والهاتف والفاكس والبريد الإلكتروني والمنشأة الإلكترونية.\n\nيجب تقديم الإخطارات كتابةً ويمكن إرسالها شخصياً أو بالبريد المسجل أو البريد السريع أو الفاكس أو البريد الإلكتروني. ويتحمل العميل مسؤولية تحديث بيانات الاتصال الخاصة به.\n\nتعتبر الإخطارات مستلمة عند التسليم الشخصي أو وفقاً لمواعيد التسليم بالبريد أو عند توقيع إيصال البريد السريع أو عند إرسال الفاكس أو البريد الإلكتروني ما لم يتم استلام إشعار بعدم التسليم أو عند رفع الإشعار على المنشأة الإلكترونية.\n\nتخضع المستندات والإجراءات القانونية للأحكام القانونية في الولاية القضائية ذات الصلة.',
            },
            {
              heading: 'الملكية الفكرية',
              body: 'تظل جميع حقوق الملكية الفكرية في المنشأة الإلكترونية والمواد الإعلانية والمعلومات والأسعار والرسوم البيانية وأساليب العمل وقواعد البيانات ومواصفات التسوية ملكاً لنا أو للطرف الثالث الذي قدمها. ولا يجوز للعميل توزيعها أو إعادة نشرها أو نسخها أو إعادة إنتاجها أو بيعها أو ترخيصها من الباطن أو نقلها دون موافقة خطية.',
            },
            {
              heading: 'حقوق الأطراف الثالثة',
              body: '43.1 لا يجوز لأي شخص غير الأطراف وشركات المجموعة، حسبما يسمح القانون، إنفاذ أحكام هذه الاتفاقية.\n\n43.2 يجوز لنا إلغاء التعليمات التي قدمها العميل مسبقاً إذا لم نكن قد تصرفنا بناءً عليها.\n\n43.3 إذا تم تنفيذ المعاملة كلياً أو جزئياً، فلا يمكن إلغاء الأمر في حدود الجزء المنفذ.',
            },
            {
              heading: 'الموقع الإلكتروني',
              body: 'اتخذنا إجراءات معقولة لضمان دقة المعلومات الموجودة على الموقع الإلكتروني. ويجوز تغيير محتوى الموقع في أي وقت مع أو دون إشعار وفقاً لما نراه مناسباً.',
            },
            {
              heading: 'قابلية الفصل',
              body: 'إذا كان أي شرط أو حكم أو التزام في هذه الاتفاقية غير قانوني أو باطل أو غير قابل للتنفيذ، فإنه يكون غير نافذ بالقدر المتعلق بذلك فقط، دون التأثير على صحة أو قابلية تنفيذ بقية أحكام الاتفاقية.',
            },
            {
              heading: 'القوة القاهرة',
              body: 'لا نتحمل المسؤولية عن أي التزام أو خسارة أو ضرر أو تكلفة أو مصروف تتكبده أو يتكبده أي شخص يدعي من خلالك نتيجة حدث قوة قاهرة.',
            },
            {
              heading: 'القانون الحاكم والاختصاص القضائي',
              body: 'تخضع أي نزاعات أو مطالبات أو خلافات غير تعاقدية ناشئة عن هذه الاتفاقية أو أي معاملة بموجبها لقوانين سانت لوسيا المعمول بها. وتكون محاكم سانت لوسيا صاحبة الاختصاص الحصري في حل النزاعات الناشئة بموجب هذه الاتفاقية.',
            },
            {
              heading: 'مراجعة الشروط والأحكام',
              body: 'تلتزم NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه الوثيقة، وستتم مراجعتها بانتظام، مرة واحدة على الأقل كل ستة أشهر، للتحقق من فعاليتها وتحديثها.\n\nتحظى اتفاقية العميل (والشروط والأحكام) هذه بدعم الإدارة. وتلتزم NEWERA CAPITAL MARKETS LIMITED بتوفير هذه الوثيقة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.\n\nتم التوقيع بواسطة:\n\nالتاريخ:',
            },
          ],
        ),
      },
      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 6. Anti-Fraud & Financial Crime Policy (from Anti-Fraud-and-Financial-Crime-Policy.pdf)
    {
      pageType: 'anti-fraud-policy',
      en: {
        title: 'Anti Fraud (and Financial Crime) Policy',
        slug: 'anti-fraud-financial-crime',

        body: legalBody('', [
          {
            heading: 'Policy objective',
            body: 'NEWERA CAPITAL MARKETS LIMITED (“the Company”) is committed to the highest possible standards for openness, transparency and accountability in all of its affairs. We wish to promote a culture of honesty and opposition to fraud (and financial crime) in any form.\n\nThe purpose of this policy is to provide:\n\ni. A clear definition of what we mean by “Fraud”;\n\nii. A definitive statement to employees forbidding fraudulent activity in all its forms;\n\niii. A summary to staff regarding their responsibilities for identifying exposure to fraudulent activity and/or detecting such fraudulent activity when it occurs;\n\niv. Guidance to employees as to action which should be taken where they suspect any fraudulent activity;\n\nv. Clear guidance as to responsibilities for conducting investigations into fraud related activities;\n\nvi. Protection to employees in circumstances where they may be victimized as a consequence of reporting, or being a witness to fraudulent activities.',
          },
          {
            heading: 'What is fraud',
            body: 'Fraud involves an act of intentional deceit to secure (by the act or omission of another person) an unfair or unlawful gain for oneself or another or a loss to another. Acts such as deception, bribery, forgery, extortion, corruption, conspiracy, embezzlement, misappropriation, and collusion may or may not constitute fraud, but are also included within the scope of this policy.\n\nThe main types of frauds are:\n\ni. Theft - This may include the removal or misuse of funds, assets or cash;\n\nii. False accounting - Dishonestly destroying, defacing, concealing, or falsifying any account, record or document required for any accounting purpose for personal gain or gain of another, or with the intent to cause loss to the Company or furnishing information which is or may be misleading, false or deceptive.',
          },
          {
            heading: 'Examples of fraud',
            body: 'i. False accounting, including deliberate misstatement of financial information for personal and/or financial gain;\n\nii. Theft including trade secrets, intellectual property, equipment etc.;\n\niii. Using false payment instructions, invoices or cheques in order to receive a payment to one’s own account, or to a third-party account in exchange for a benefit;\n\niv. Falsification of payroll records, unsubstantiated expenses claims, accepting or providing bribes or kickbacks in exchange for business whether or not for the Company’s benefit;\n\nv. Acts by intermediaries, including any act or omission knowingly committed with the intent to obtain a benefit through deceit. This would include, but not limited to: forgery or intentionally presenting false information on an application or in connection with the renewal or reinstatement or in support of a claim or refund; the manipulation of customer information in order to unlawfully obtain customer funds; fraudulent representations in sales and marketing activities; and embezzlement or theft of company or client assets;\n\nvi. Any other act(s) that the Management/Board of Directors found inappropriate, dishonest and contrary with the Company’s regulations and/or laws as imposed by the Competent Authority(ies).',
          },
          {
            heading: 'Responsibilities of the employees',
            body: 'It is the responsibility of all employees to carry their work in such a way as to prevent fraud (or financial crime) occurring in the workplace. Employees must also be alert for occurrences of fraud, be aware that unusual transactions or behaviors could be indications of fraud and report potential case of fraud.\n\nEmployees must stay alert to the signs of fraud and report suspicion of fraud immediately, regardless of value to the Senior Manager/Manager, or Compliance Officer or anonymously via the Company’s website. The Board of Directors must immediately be notified if the alleged fraud involves manipulation, omissions or misrepresentation of financial reports/results.\n\ni. If your subordinate reports any suspected fraud then you should, in turn, report the matter to Board of Directors and/or Compliance Officer;\n\nii. Do not alert the suspected individual or other unauthorized persons in an effort to determine facts or suspicion. All cases of suspected fraud will be handled with utmost care/confidentiality;\n\niii. Attend any relevant training programs provided by the Company to understand your obligations. Work in accordance with the Operating Principles;\n\niv. Line Functions are required to establish and maintain sufficient controls to ensure that fraud risk is properly monitored and mitigated. All employees should adhere to relevant procedures in their areas of responsibility;\n\nv. Co-operate in investigations and do not willfully or knowingly state anything which you believe is false or you do not believe to be true.',
          },
          {
            heading: 'Dealing with reports of suspected fraud (or financial crime)',
            body: 'The Company is committed to fraud control with an emphasis on proactive prevention, putting in place detection measures in its effort to reduce possibilities which could lead to fraud. We believe in zero tolerance to fraud. Thus, when a fraud is detected, suspected or alleged, we are committed to fully investigate the matter. We will work closely with the relevant authorities to ensure that justice is served and implement the relevant measures in order to recover as well as to minimize loss.',
          },
          {
            heading: 'Confidentiality',
            body: 'The Company treats all information received pertaining to fraud (and financial crime) as strictly confidential. Any employee who suspects a dishonest or fraudulent activity must notify the Board of Directors and should not attempt to personally conduct investigations or interview/interrogations related to any suspected fraudulent act.',
          },
          {
            heading: 'Actions arising from fraud investigations',
            body: 'Persons who are found to be guilty of fraud (and/or any other financial crime) will be dealt with in accordance with the Company’s fraud policy. Proven allegation of fraud may result in dismissal (and any other action in accordance to the applicable laws & regulations).',
          },
          {
            heading: 'Review of anti fraud (and financial crime) policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Anti Fraud (and Financial Crime) Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employee and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة مكافحة الاحتيال والجرائم المالية',
        slug: 'anti-fraud-financial-crime',

        body: legalBody('', [
          {
            heading: 'هدف السياسة',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") بأعلى المعايير الممكنة للانفتاح والشفافية والمساءلة في جميع شؤونها. وتسعى الشركة إلى تعزيز ثقافة النزاهة ومكافحة الاحتيال والجرائم المالية بجميع أشكالها.\n\nتهدف هذه السياسة إلى توفير ما يلي:\n\n1. تعريف واضح لما يُقصد بمصطلح "الاحتيال"؛\n\n2. بيان واضح للموظفين يحظر النشاط الاحتيالي بجميع أشكاله؛\n\n3. ملخص للموظفين بشأن مسؤولياتهم في تحديد مخاطر التعرض للنشاط الاحتيالي و/أو اكتشاف مثل هذا النشاط عند حدوثه؛\n\n4. إرشادات للموظفين بشأن الإجراءات التي يجب اتخاذها عند الاشتباه في أي نشاط احتيالي؛\n\n5. إرشادات واضحة بشأن المسؤوليات المتعلقة بإجراء التحقيقات في الأنشطة المرتبطة بالاحتيال؛\n\n6. حماية الموظفين في الحالات التي قد يتعرضون فيها للإيذاء أو الانتقام نتيجة الإبلاغ عن الأنشطة الاحتيالية أو الشهادة عليها.',
          },
          {
            heading: 'ما هو الاحتيال',
            body: 'ينطوي الاحتيال على فعل من أفعال الخداع المتعمد بهدف الحصول، من خلال فعل أو امتناع شخص آخر، على مكسب غير عادل أو غير قانوني للنفس أو للغير، أو التسبب في خسارة للغير. وقد تشكل أعمال مثل الخداع والرشوة والتزوير والابتزاز والفساد والتآمر والاختلاس وسوء استخدام الأموال والتواطؤ احتيالاً أو لا تشكل، إلا أنها تدخل أيضاً ضمن نطاق هذه السياسة.\n\nتشمل الأنواع الرئيسية للاحتيال ما يلي:\n\n1. السرقة - قد تشمل إزالة أو إساءة استخدام الأموال أو الأصول أو النقد؛\n\n2. المحاسبة الزائفة - إتلاف أو تشويه أو إخفاء أو تزوير أي حساب أو سجل أو مستند مطلوب لأي غرض محاسبي لتحقيق مكسب شخصي أو مكسب للغير، أو بقصد التسبب في خسارة للشركة، أو تقديم معلومات قد تكون مضللة أو كاذبة أو خادعة.',
          },
          {
            heading: 'أمثلة على الاحتيال',
            body: '1. المحاسبة الزائفة، بما في ذلك التحريف المتعمد للمعلومات المالية لتحقيق مكاسب شخصية و/أو مالية؛\n\n2. السرقة، بما في ذلك الأسرار التجارية والملكية الفكرية والمعدات وما إلى ذلك؛\n\n3. استخدام تعليمات دفع أو فواتير أو شيكات مزيفة بهدف تلقي دفعة في الحساب الشخصي أو حساب طرف ثالث مقابل منفعة؛\n\n4. تزوير سجلات الرواتب، أو مطالبات المصروفات غير المدعومة، أو قبول أو تقديم رشاوى أو عمولات غير مشروعة مقابل الأعمال، سواء كان ذلك لمصلحة الشركة أم لا؛\n\n5. الأفعال التي يرتكبها الوسطاء، بما في ذلك أي فعل أو امتناع يتم ارتكابه عن علم وبقصد الحصول على منفعة من خلال الخداع. ويشمل ذلك، على سبيل المثال لا الحصر، التزوير أو تقديم معلومات كاذبة عمداً في طلب أو فيما يتعلق بالتجديد أو إعادة التفعيل أو دعماً لمطالبة أو استرداد؛ والتلاعب بمعلومات العملاء بهدف الحصول بشكل غير قانوني على أموال العملاء؛ والتصريحات الاحتيالية في أنشطة المبيعات والتسويق؛ واختلاس أو سرقة أصول الشركة أو العملاء؛\n\n6. أي أفعال أخرى ترى الإدارة أو مجلس الإدارة أنها غير مناسبة أو غير نزيهة أو مخالفة لأنظمة الشركة و/أو القوانين التي تفرضها السلطات المختصة.',
          },
          {
            heading: 'مسؤوليات الموظفين',
            body: 'تقع على عاتق جميع الموظفين مسؤولية أداء أعمالهم بطريقة تمنع حدوث الاحتيال أو الجرائم المالية في مكان العمل. كما يجب على الموظفين أن يظلوا يقظين تجاه حالات الاحتيال، وأن يدركوا أن المعاملات أو السلوكيات غير المعتادة قد تكون مؤشرات على الاحتيال، وأن يقوموا بالإبلاغ عن الحالات المحتملة للاحتيال.\n\nيجب على الموظفين البقاء يقظين تجاه علامات الاحتيال والإبلاغ فوراً عن أي اشتباه في الاحتيال، بغض النظر عن قيمة المبلغ، إلى المدير الأول أو المدير أو مسؤول الامتثال، أو بشكل مجهول عبر موقع الشركة الإلكتروني. ويجب إخطار مجلس الإدارة فوراً إذا كان الاحتيال المزعوم يتضمن تلاعباً أو حذفاً أو تحريفاً في التقارير أو النتائج المالية.\n\n1. إذا أبلغ أحد مرؤوسيك عن أي احتيال مشتبه به، فيجب عليك بدورك إبلاغ مجلس الإدارة و/أو مسؤول الامتثال بالأمر؛\n\n2. لا تقم بتنبيه الشخص المشتبه به أو أي أشخاص غير مصرح لهم في محاولة لتحديد الحقائق أو الاشتباه. سيتم التعامل مع جميع حالات الاحتيال المشتبه بها بأقصى درجات العناية والسرية؛\n\n3. حضور أي برامج تدريب ذات صلة تقدمها الشركة لفهم التزاماتك، والعمل وفقاً لمبادئ التشغيل؛\n\n4. يتعين على وظائف الخط الأول إنشاء والحفاظ على ضوابط كافية لضمان مراقبة مخاطر الاحتيال والتخفيف منها بشكل مناسب. ويجب على جميع الموظفين الالتزام بالإجراءات ذات الصلة في مجالات مسؤولياتهم؛\n\n5. التعاون في التحقيقات وعدم الإدلاء عمداً أو عن علم بأي معلومات تعتقد أنها كاذبة أو لا تعتقد أنها صحيحة.',
          },
          {
            heading: 'التعامل مع بلاغات الاحتيال المشتبه به أو الجرائم المالية',
            body: 'تلتزم الشركة بمكافحة الاحتيال مع التركيز على الوقاية الاستباقية، ووضع تدابير للكشف عنه ضمن جهودها للحد من الاحتمالات التي قد تؤدي إلى الاحتيال. وتؤمن الشركة بعدم التسامح مطلقاً مع الاحتيال. ولذلك، عند اكتشاف أو الاشتباه أو الادعاء بوجود احتيال، تلتزم الشركة بالتحقيق الكامل في الأمر. كما ستعمل بشكل وثيق مع السلطات المختصة لضمان تحقيق العدالة وتنفيذ التدابير اللازمة لاسترداد الخسائر وتقليلها.',
          },
          {
            heading: 'السرية',
            body: 'تتعامل الشركة مع جميع المعلومات المتعلقة بالاحتيال والجرائم المالية التي تتلقاها باعتبارها معلومات سرية للغاية. ويجب على أي موظف يشتبه في وجود نشاط غير نزيه أو احتيالي إخطار مجلس الإدارة، ولا يجوز له محاولة إجراء التحقيقات أو المقابلات أو الاستجوابات المتعلقة بأي فعل احتيالي مشتبه به بنفسه.',
          },
          {
            heading: 'الإجراءات الناتجة عن تحقيقات الاحتيال',
            body: 'سيتم التعامل مع الأشخاص الذين تثبت إدانتهم بالاحتيال و/أو أي جريمة مالية أخرى وفقاً لسياسة الشركة الخاصة بالاحتيال. وقد يؤدي إثبات ادعاء الاحتيال إلى الفصل من العمل، بالإضافة إلى أي إجراء آخر وفقاً للقوانين واللوائح المعمول بها.',
          },
          {
            heading: 'مراجعة سياسة مكافحة الاحتيال والجرائم المالية',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، بما لا يقل عن مرة واحدة كل ستة أشهر، للتحقق من فعاليتها وتحديثها.\n\nتحظى سياسة مكافحة الاحتيال والجرائم المالية هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 8. Conflicts of Interests Policy (from Conflicts-of-Interests-Policy.pdf)
    {
      pageType: 'conflicts-of-interest',
      en: {
        title: 'Conflicts of Interests Policy',
        slug: 'conflicts-of-interests',

        body: legalBody('', [
          {
            heading: 'Policy objective',
            body: 'This Conflicts of Interests Policy (“the Policy”) is issued in accordance with the applicable Saint Lucia legislations including (but not limited to) International Business Companies Act and others, to which Newera Capital Markets Limited (“the Company”) is required to take all reasonable steps to detect and avoid conflicts of interest within the Company’s organization & operation.\n\nThe Company is committed to act honestly, fairly and professionally and in the best interests of its Clients and to comply, in particular, with the principles set out in the above and other relevant legislations when providing services of Money Broking business.\n\nThe purpose of this Policy is to set out the Company’s approach in identifying and managing conflicts of interest which may arise during the course of its normal business activities. In addition, this Policy identifies circumstances which may give rise to a conflict of interest. It is applied to all its directors, employees, any persons directly or indirectly linked to the Company (hereinafter called “Related Persons”) and refers to all interactions with all Clients.',
          },
          {
            heading: 'Criteria of identifying conflicts of interest',
            body: 'When the Company deals with or on behalf of the Client, the Company, an associate or some other person connected with the Company, may have an interest, relationship or arrangement that is material in relation to the transaction concerned or that conflicts with the Client’s interest. The Company hereby identifies and discloses a range of situations and circumstances which may give rise to a conflict of interest and potentially but not necessarily be detrimental to the interests of one or more Clients.\n\nFor the purpose of identifying the types of conflicts of interest that may arise in the course of providing investment services whose existence may damage the interest of a Client, the Company will take into account (whether the Company or a relevant person) any of the following situations:\n\ni. The Company or a relevant person is likely to make a financial gain, or avoid a financial loss, at the expense of the Clients;\n\nii. The Company or a relevant person has an interest in the outcome of a service provided to the Clients or of a transaction carried out on behalf of the Client, which is district from the Client’s interest in that outcome;\n\niii. The Company or a relevant person has a financial or other incentive to favor the interest of another Client or group of Clients over the interests of the Clients;\n\niv. The Company or a relevant person carries on the same business as the Clients;\n\nv. The Company or a relevant person receives or will receive from a person other that the Client an inducement in relation to a service provided to the Client, in the form of monies, goods or services, other than the standard commission or fee for that service.',
          },
          {
            heading: 'Identification of conflict of interest',
            body: 'While it is not feasible to define precisely or create an exhaustive list of all relevant conflicts of interest that may arise (as per the current nature, scale and complexity of the Company’s business), the following list includes circumstances which constitute or may give rise to a conflict of interest entailing a material risk of damage to the interests of one or more Clients, as a result of Services:\n\ni. The Company may be advising and providing other services to associates or other Clients of the Company who may have interesting Financial Instruments or Underlying Assets, which are in conflict or in competition with the Clients’ interests;\n\nii. The Company may have an interest in maximizing trading volumes in order to increase its commission revenue, which is inconsistent with the Client’s personal objective of minimizing transaction costs;\n\niii. The Company may receive commissions and/or other inducements from its Liquidity provider for the transmission of Clients’ Orders;\n\niv. The Company’s employee bonus scheme may award its employees based on the financial results of the Company which are linked/associated with the trading volume generated by Clients;\n\nv. The Company or a Related person has an interest in the outcome of a service provided to the Client or of a transaction carried out on behalf of the Client, which is distinct from the Client’s interest in that outcome;\n\nvi. The Company or a Related person has a financial or other incentive to favor the interest of another Client or group of Clients over the interests of the Client;\n\nvii. The Company or a related person carries on the same business as the Client;\n\nviii. The Company may have relationships with many third-party product providers/financial institutions who may remunerate the Company via inducements/commissions/fees and the Company may favor one over another in the recommendation process if higher inducements/commissions/fees are provided;\n\nix. We may compensate providers of strategies which are copied by other clients, based on number of subscribers they have.',
          },
          {
            heading: 'Procedures and controls for managing conflicts of interest',
            body: 'In general, the procedures and controls that the Company follows to manage the identified conflicts of interest include the following measures (list is not exhaustive):\n\ni. The Company undertakes ongoing monitoring of business activities to ensure that internal controls are appropriate;\n\nii. The Company undertakes effective procedures to prevent or control the exchange of information between Related Persons engaged in activities involving a risk of a conflict of interest where the exchange of that information may harm the interests of one or more Clients;\n\niii. The separate supervision of Related Persons whose principal functions involve providing services to Clients whose interests may conflict, or who otherwise represent different interests that may conflict, including those of the Company;\n\niv. Measures to prevent or limit any person from exercising inappropriate influence over the way in which the Related Person carries out investment services;\n\nv. Measures to prevent or control the simultaneous or sequential involvement of a Related Person in separate investment services where such involvement may impair the proper management of conflicts of interest.\n\nvi. A policy designed to limit the conflict of interest arising from the giving and receiving of inducements.\n\nvii. Chinese walls restricting the flow of confidential and inside information within the Company, and physical separation of departments.\n\nviii. Procedures governing access to electronic data.\n\nix. Segregation of duties that may give rise to conflicts of interest if carried on by the same individual.\n\nx. Personal account dealing requirements applicable to Related Persons in relation to their own investments.\n\nxi. Establishment of Compliance Department to monitor and report on the above to the Company’s Board of Directors.\n\nxii. Prohibition on officers and employees of the Company having external business interests conflicting with the interests of the Company without the prior approval of the Company’s Board of Directors.\n\nxiii. A “need-to-know” policy governing the dissemination of confidential or inside information within the Company.\n\nxiv. Appointment of Internal Auditor to ensure that appropriate systems and controls are maintained and report to the Company’s Board of Directors.\n\nxv. Establishment of the “four-eyes” principle in supervising the Company’s activities.',
          },
          {
            heading: 'Client’s consent',
            body: 'By entering into a Client Agreement with the Company for the provision of Services, the Client is consenting to an application of this Policy on him. Further, the Client consents to and authorizes the Company to deal with the Client in any manner which the Company considers appropriate, notwithstanding any conflict of interest or the existence of any material interest in a Transaction, without prior reference to the Client. In the event that the Company is unable to deal with a conflict-of-interest situation it shall revert to the Client.',
          },
          {
            heading: 'Disclosure of information',
            body: 'If during the course of a business relationship with a client or group of Clients, the organizational or administrative arrangements/measures in place are not sufficient to avoid or manage a conflict of interest relating to that Client or group of Clients, the Company will disclose the conflict of interest before undertaking further business with the Client or group of Clients.',
          },
          {
            heading: 'Languages',
            body: 'Language of communication between the Company and the Client shall be in English. All binding contractual documentation is available in English.\n\nUpon its sole discretion the Company, may communicate with the Client in other language than English, however in case of any discrepancy between the meanings of any communications and/or meanings, or any other communications forming part of this Policy or any other agreements, information or communication in any other language, the meaning of the English Language version shall prevail.\n\nThe Company or third parties may have provided the Clients with translations of this Policy. The original English versions shall be the only legally binding version. In case of discrepancies between the English version and other translations in the Client’s possession, the original English version provided by the Company on the website shall prevail.',
          },
          {
            heading: 'Review of conflicts of interests policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Conflicts of Interests Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employee and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة تضارب المصالح',
        slug: 'conflicts-of-interests',

        body: legalBody('', [
          {
            heading: 'هدف السياسة',
            body: 'تم إصدار سياسة تضارب المصالح هذه ("السياسة") وفقاً للتشريعات المعمول بها في سانت لوسيا، بما في ذلك، على سبيل المثال لا الحصر، قانون الشركات التجارية الدولية وغيره من القوانين ذات الصلة، والتي يتعين بموجبها على شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") اتخاذ جميع الخطوات المعقولة لاكتشاف وتجنب تضارب المصالح داخل تنظيم الشركة وعملياتها.\n\nتلتزم الشركة بالتصرف بأمانة وعدالة ومهنية وبما يخدم مصالح عملائها على أفضل وجه، والامتثال، على وجه الخصوص، للمبادئ المنصوص عليها في التشريعات المذكورة أعلاه وغيرها من التشريعات ذات الصلة عند تقديم خدمات الوساطة المالية.\n\nتهدف هذه السياسة إلى تحديد نهج الشركة في تحديد وإدارة حالات تضارب المصالح التي قد تنشأ أثناء سير أنشطتها التجارية المعتادة. بالإضافة إلى ذلك، تحدد هذه السياسة الظروف التي قد تؤدي إلى تضارب في المصالح. وتنطبق على جميع أعضاء مجلس الإدارة والموظفين وأي أشخاص مرتبطين بالشركة بشكل مباشر أو غير مباشر (ويشار إليهم فيما بعد باسم "الأشخاص المرتبطين")، وتشمل جميع التعاملات مع جميع العملاء.',
          },
          {
            heading: 'معايير تحديد تضارب المصالح',
            body: 'عندما تتعامل الشركة مع العميل أو نيابةً عنه، قد يكون للشركة أو لأحد شركائها أو لأي شخص آخر مرتبط بالشركة مصلحة أو علاقة أو ترتيب جوهري يتعلق بالمعاملة المعنية أو يتعارض مع مصلحة العميل. وتحدد الشركة وتفصح بموجب هذا عن مجموعة من الحالات والظروف التي قد تؤدي إلى تضارب في المصالح، والتي قد تكون، ولكن ليس بالضرورة، ضارة بمصالح واحد أو أكثر من العملاء.\n\nلغرض تحديد أنواع تضارب المصالح التي قد تنشأ أثناء تقديم خدمات الاستثمار والتي قد يؤدي وجودها إلى الإضرار بمصلحة العميل، ستأخذ الشركة في الاعتبار، سواء كانت الشركة أو الشخص المعني، أي من الحالات التالية:\n\n1. من المحتمل أن تحقق الشركة أو الشخص المعني مكسباً مالياً أو تتجنب خسارة مالية على حساب العملاء؛\n\n2. لدى الشركة أو الشخص المعني مصلحة في نتيجة خدمة مقدمة للعملاء أو معاملة يتم تنفيذها نيابةً عن العميل، وتكون هذه المصلحة مختلفة عن مصلحة العميل في تلك النتيجة؛\n\n3. لدى الشركة أو الشخص المعني حافز مالي أو حافز آخر لتفضيل مصلحة عميل آخر أو مجموعة من العملاء على مصالح العميل؛\n\n4. تقوم الشركة أو الشخص المعني بمزاولة نفس النشاط التجاري الذي يمارسه العملاء؛\n\n5. تتلقى الشركة أو الشخص المعني، أو سيحصل، من شخص آخر غير العميل على حافز يتعلق بخدمة مقدمة للعميل، في شكل أموال أو سلع أو خدمات، بخلاف العمولة أو الرسوم القياسية الخاصة بتلك الخدمة.',
          },
          {
            heading: 'تحديد تضارب المصالح',
            body: 'على الرغم من أنه ليس من الممكن تحديد أو وضع قائمة شاملة ودقيقة لجميع حالات تضارب المصالح ذات الصلة التي قد تنشأ، وفقاً لطبيعة وحجم وتعقيد أعمال الشركة الحالية، فإن القائمة التالية تشمل الظروف التي تشكل أو قد تؤدي إلى تضارب في المصالح ينطوي على خطر مادي للإضرار بمصالح واحد أو أكثر من العملاء نتيجة للخدمات:\n\n1. قد تقدم الشركة المشورة وخدمات أخرى إلى شركائها أو عملاء آخرين في الشركة ممن قد تكون لديهم مصالح في أدوات مالية أو أصول أساسية تتعارض أو تتنافس مع مصالح العملاء؛\n\n2. قد يكون للشركة مصلحة في زيادة أحجام التداول من أجل زيادة إيرادات العمولات، وهو ما يتعارض مع هدف العميل الشخصي المتمثل في تقليل تكاليف المعاملات؛\n\n3. قد تتلقى الشركة عمولات و/أو حوافز أخرى من مزود السيولة الخاص بها مقابل نقل أوامر العملاء؛\n\n4. قد يمنح نظام مكافآت موظفي الشركة مكافآت للموظفين بناءً على النتائج المالية للشركة المرتبطة بحجم التداول الناتج عن العملاء؛\n\n5. لدى الشركة أو أحد الأشخاص المرتبطين بها مصلحة في نتيجة خدمة مقدمة للعميل أو معاملة يتم تنفيذها نيابةً عن العميل، وتكون هذه المصلحة مختلفة عن مصلحة العميل في تلك النتيجة؛\n\n6. لدى الشركة أو أحد الأشخاص المرتبطين بها حافز مالي أو حافز آخر لتفضيل مصلحة عميل آخر أو مجموعة من العملاء على مصلحة العميل؛\n\n7. تقوم الشركة أو أحد الأشخاص المرتبطين بها بمزاولة نفس النشاط التجاري الذي يمارسه العميل؛\n\n8. قد تكون للشركة علاقات مع العديد من مزودي المنتجات من الأطراف الثالثة أو المؤسسات المالية الذين قد يكافئون الشركة من خلال الحوافز أو العمولات أو الرسوم، وقد تفضل الشركة أحدهم على الآخر في عملية التوصية إذا تم تقديم حوافز أو عمولات أو رسوم أعلى؛\n\n9. قد نعوض مقدمي الاستراتيجيات التي يتم نسخها من قبل عملاء آخرين بناءً على عدد المشتركين لديهم.',
          },
          {
            heading: 'الإجراءات والضوابط لإدارة تضارب المصالح',
            body: 'بشكل عام، تشمل الإجراءات والضوابط التي تتبعها الشركة لإدارة حالات تضارب المصالح المحددة التدابير التالية، مع العلم أن القائمة ليست شاملة:\n\n1. تقوم الشركة بالمراقبة المستمرة للأنشطة التجارية لضمان ملاءمة الضوابط الداخلية؛\n\n2. تتبع الشركة إجراءات فعالة لمنع أو التحكم في تبادل المعلومات بين الأشخاص المرتبطين المشاركين في أنشطة تنطوي على خطر تضارب المصالح، عندما يكون تبادل هذه المعلومات قد يضر بمصالح واحد أو أكثر من العملاء؛\n\n3. الإشراف المنفصل على الأشخاص المرتبطين الذين تتمثل وظائفهم الرئيسية في تقديم الخدمات للعملاء الذين قد تتعارض مصالحهم، أو الذين يمثلون مصالح مختلفة قد تتعارض، بما في ذلك مصالح الشركة؛\n\n4. اتخاذ تدابير لمنع أو الحد من ممارسة أي شخص لتأثير غير مناسب على الطريقة التي يقوم بها الشخص المرتبط بتنفيذ خدمات الاستثمار؛\n\n5. اتخاذ تدابير لمنع أو التحكم في المشاركة المتزامنة أو المتتابعة للشخص المرتبط في خدمات استثمارية منفصلة عندما قد تؤثر هذه المشاركة على الإدارة السليمة لتضارب المصالح؛\n\n6. سياسة تهدف إلى الحد من تضارب المصالح الناشئ عن تقديم واستلام الحوافز؛\n\n7. وجود حواجز معلوماتية ("Chinese walls") تقيد تدفق المعلومات السرية والمعلومات الداخلية داخل الشركة، بالإضافة إلى الفصل المادي بين الأقسام؛\n\n8. إجراءات تنظم الوصول إلى البيانات الإلكترونية؛\n\n9. فصل المهام التي قد تؤدي إلى تضارب المصالح إذا تم تنفيذها من قبل الشخص نفسه؛\n\n10. متطلبات التعامل على الحساب الشخصي المطبقة على الأشخاص المرتبطين فيما يتعلق باستثماراتهم الخاصة؛\n\n11. إنشاء قسم للامتثال لمراقبة ما سبق والإبلاغ عنه إلى مجلس إدارة الشركة؛\n\n12. حظر قيام مسؤولي وموظفي الشركة بمصالح تجارية خارجية تتعارض مع مصالح الشركة دون الحصول على موافقة مسبقة من مجلس إدارة الشركة؛\n\n13. سياسة "الحاجة إلى المعرفة" التي تحكم نشر المعلومات السرية أو الداخلية داخل الشركة؛\n\n14. تعيين مدقق داخلي لضمان الحفاظ على الأنظمة والضوابط المناسبة والإبلاغ عنها إلى مجلس إدارة الشركة؛\n\n15. تطبيق مبدأ "الأعين الأربع" في الإشراف على أنشطة الشركة.',
          },
          {
            heading: 'موافقة العميل',
            body: 'من خلال الدخول في اتفاقية عميل مع الشركة لتقديم الخدمات، يوافق العميل على تطبيق هذه السياسة عليه. كما يوافق العميل ويفوض الشركة بالتعامل معه بأي طريقة تراها الشركة مناسبة، بغض النظر عن وجود أي تضارب في المصالح أو وجود مصلحة جوهرية في معاملة ما، دون الرجوع مسبقاً إلى العميل. وفي حال عدم تمكن الشركة من التعامل مع حالة تضارب المصالح، فسوف تعود إلى العميل.',
          },
          {
            heading: 'الإفصاح عن المعلومات',
            body: 'إذا كانت الترتيبات أو التدابير التنظيمية أو الإدارية القائمة غير كافية، أثناء علاقة العمل مع العميل أو مجموعة من العملاء، لتجنب أو إدارة تضارب المصالح المتعلق بذلك العميل أو مجموعة العملاء، فسوف تفصح الشركة عن تضارب المصالح قبل القيام بأي أعمال إضافية مع العميل أو مجموعة العملاء.',
          },
          {
            heading: 'اللغات',
            body: 'تكون لغة التواصل بين الشركة والعميل هي اللغة الإنجليزية. وجميع الوثائق التعاقدية الملزمة متاحة باللغة الإنجليزية.\n\nيجوز للشركة، وفقاً لتقديرها الخاص، التواصل مع العميل بلغة أخرى غير الإنجليزية، إلا أنه في حال وجود أي تعارض بين معاني أي اتصالات و/أو أي اتصالات أخرى تشكل جزءاً من هذه السياسة أو أي اتفاقيات أو معلومات أو اتصالات أخرى بأي لغة أخرى، فإن معنى النسخة باللغة الإنجليزية هو الذي يسود.\n\nقد تكون الشركة أو أطراف ثالثة قد قدمت للعملاء ترجمات لهذه السياسة. وتكون النسخ الإنجليزية الأصلية هي النسخ الوحيدة الملزمة قانوناً. وفي حال وجود أي تعارض بين النسخة الإنجليزية وأي ترجمات أخرى بحوزة العميل، تسود النسخة الإنجليزية الأصلية التي توفرها الشركة على موقعها الإلكتروني.',
          },
          {
            heading: 'مراجعة سياسة تضارب المصالح',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، بما لا يقل عن مرة واحدة كل ستة أشهر، للتحقق من فعاليتها وتحديثها.\n\nتحظى سياسة تضارب المصالح هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 9. Customer Complaint Handling Policy (from Customer-Complaint-Handling-Policy.pdf)
    {
      pageType: 'complaint-handling',
      en: {
        title: 'Customer Complaint Handling Policy',
        slug: 'complaint-handling',

        body: legalBody('', [
          {
            heading: 'Policy objective',
            body: 'NEWERA CAPITAL MARKETS LIMITED value complaints received from its customer in order to improve and provide better customer services.\n\nThis policy is intended to ensure that complaints and worries are listened and dealt properly, and that all complaints or comments received from the Clients are taken seriously. NEWERA CAPITAL MARKETS LIMITED is committed to consistent, fair and confidential complaint handling and to resolving complaints as quickly as possible. NEWERA CAPITAL MARKETS LIMITED aims to make it easy for Clients to make a complaint if they are dissatisfied and we will treat all Clients making complaint(s) professionally.',
          },
          {
            heading: 'Receiving and recording complaints',
            body: 'An email account has been created as the Company’s complaint handing channel, to enable NEWERA CAPITAL MARKETS LIMITED receive and respond to complaints from Clients. This latest feature would ensure all complaints are to be directed to a specific email account i.e. escalation@newera365.com handled by the Complaint Handling Officers.\n\nHowever, should staffs continue to receive complaint sent directly to them, he/she will redirect the said email on the same day it was received, to the designated complaint handling email account for further action by the Complaint Handling Officers.\n\nEach email complaint received from a client will be acknowledged by the Complaint Handling Officers as soon as the complaint email was received.\n\nDetails of all communication with the Client and any actions taken to resolve the complaint will be recorded and filed NEWERA CAPITAL MARKETS LIMITED physical and cloud storage. These records can be made available for inspection by the Board of Directors.\n\nRecorded complaints will also be monitored for any ongoing trends by management. This would enable the relevant efforts to be taken for resolving any ongoing issues.',
          },
          {
            heading: 'Responding to complaints',
            body: 'Every client making a complaint will be treated with courtesy. All communication with the complainant should be polite and courteous. Where possible, complaints will be resolved on the spot basis.',
          },
          {
            heading: 'Escalations of complaints',
            body: 'If the Complaint Handling Officer is unable to solve the complaint within a given timeframe, he/she will seek for assistance from the Senior Manager/Manager/Trust Officer to deal with the complaint, and the Client will be informed and given a new timeframe for resolution.',
          },
          {
            heading: 'Informing customers of progress',
            body: 'NEWERA CAPITAL MARKETS LIMITED will strive to resolve all complaints within seven (7) working days. Client will be given an approximate timeframe at the time they make their complaint. Client will be informed regarding progress of their complaint regularly, especially if there are any delays or changes to what has been agreed.\n\nClient will also be informed of any changes to services provided as a result of their complaint.\n\nWhere appropriate, Clients who managed to get their complaint resolved will be contacted at a later date. This is to assess their level of satisfactory regarding how the complaint was handled.',
          },
          {
            heading: 'Review of complaint handling policy and procedures',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Complaint Handling Policy & Procedures is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employee and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة التعامل مع شكاوى العملاء',
        slug: 'complaint-handling',

        body: legalBody('', [
          {
            heading: 'هدف السياسة',
            body: 'تقدر شركة NEWERA CAPITAL MARKETS LIMITED الشكاوى الواردة من عملائها بهدف تحسين وتقديم خدمات أفضل للعملاء.\n\nتهدف هذه السياسة إلى ضمان الاستماع إلى الشكاوى والمخاوف والتعامل معها بالشكل المناسب، وضمان التعامل بجدية مع جميع الشكاوى أو التعليقات الواردة من العملاء. تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتعامل مع الشكاوى بطريقة متسقة وعادلة وسرية، والعمل على حل الشكاوى في أسرع وقت ممكن. وتهدف الشركة إلى تسهيل تقديم العملاء للشكاوى في حال عدم رضاهم، كما ستتعامل مع جميع العملاء الذين يقدمون الشكاوى بطريقة مهنية.',
          },
          {
            heading: 'استلام الشكاوى وتسجيلها',
            body: 'تم إنشاء حساب بريد إلكتروني ليكون قناة الشركة للتعامل مع الشكاوى، لتمكين شركة NEWERA CAPITAL MARKETS LIMITED من استلام الشكاوى والرد عليها من العملاء. وتضمن هذه الخاصية توجيه جميع الشكاوى إلى حساب بريد إلكتروني محدد، وهو escalation@newera365.com، والذي يتولى التعامل معه موظفو التعامل مع الشكاوى.\n\nومع ذلك، إذا استمر الموظفون في تلقي الشكاوى المرسلة إليهم مباشرة، فيجب عليهم إعادة توجيه البريد الإلكتروني المذكور في نفس اليوم الذي تم استلامه فيه إلى حساب البريد الإلكتروني المخصص للتعامل مع الشكاوى لاتخاذ الإجراءات اللازمة من قبل موظفي التعامل مع الشكاوى.\n\nسيتم تأكيد استلام كل شكوى يتم تلقيها عبر البريد الإلكتروني من أحد العملاء من قبل موظفي التعامل مع الشكاوى بمجرد استلام بريد الشكوى.\n\nسيتم تسجيل وتوثيق تفاصيل جميع الاتصالات مع العميل وأي إجراءات تم اتخاذها لحل الشكوى وحفظها في التخزين الفعلي والسحابي لشركة NEWERA CAPITAL MARKETS LIMITED. ويمكن إتاحة هذه السجلات للفحص من قبل مجلس الإدارة.\n\nكما ستتم مراقبة الشكاوى المسجلة من قبل الإدارة للكشف عن أي اتجاهات مستمرة. وسيمكن ذلك من اتخاذ الجهود والإجراءات المناسبة لمعالجة أي مشكلات مستمرة.',
          },
          {
            heading: 'الرد على الشكاوى',
            body: 'سيتم التعامل مع كل عميل يقدم شكوى بكل احترام. يجب أن تكون جميع الاتصالات مع مقدم الشكوى مهذبة ومحترمة. وحيثما أمكن، سيتم حل الشكاوى على الفور.',
          },
          {
            heading: 'تصعيد الشكاوى',
            body: 'إذا لم يتمكن موظف التعامل مع الشكاوى من حل الشكوى ضمن الإطار الزمني المحدد، فسوف يطلب المساعدة من المدير الأول أو المدير أو مسؤول الائتمان للتعامل مع الشكوى، وسيتم إبلاغ العميل ومنحه إطاراً زمنياً جديداً للحل.',
          },
          {
            heading: 'إبلاغ العملاء بالتقدم',
            body: 'ستسعى شركة NEWERA CAPITAL MARKETS LIMITED إلى حل جميع الشكاوى خلال سبعة (7) أيام عمل. وسيتم تزويد العميل بإطار زمني تقريبي في وقت تقديم شكواه. وسيتم إبلاغ العميل بانتظام بحالة وتقدم شكواه، وخاصة في حال وجود أي تأخيرات أو تغييرات عما تم الاتفاق عليه.\n\nسيتم أيضاً إبلاغ العميل بأي تغييرات تطرأ على الخدمات المقدمة نتيجة لشكواه.\n\nوحيثما يكون ذلك مناسباً، سيتم التواصل في وقت لاحق مع العملاء الذين تم حل شكواهم، وذلك لتقييم مستوى رضاهم عن طريقة التعامل مع الشكوى.',
          },
          {
            heading: 'مراجعة سياسة وإجراءات التعامل مع شكاوى العملاء',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، بما لا يقل عن مرة واحدة كل ستة أشهر، للتحقق من فعاليتها وتحديثها.\n\nتحظى سياسة وإجراءات التعامل مع الشكاوى هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 10. Deposit & Withdrawal Policy (from Deposit-Withdrawal-Policy.pdf)
    {
      pageType: 'deposit-withdrawal',
      en: {
        title: 'Deposit & Withdrawal Policy',
        slug: 'deposit-withdrawal',

        body: legalBody('', [
          {
            heading: 'Policy objective',
            body: 'This Deposit & Withdrawal Policy (“the Policy”) is intended to provide the Clients with summary of NEWERA CAPITAL MARKETS LIMITED (“the Company”) policies & terms with regards to deposit & withdrawal matters. This Policy applies to all Clients who have opened trading account with the Company.',
          },
          {
            heading: 'The policy',
            body: 'i. The Client gives his/her consent and authorizes the Company to make deposits and withdrawals from the Client’s Bank Account on the Client’s behalf, including but not limited to, the settlement of Transactions performed by or on behalf of the Client, for payment of all amounts due by or on behalf of the Client to the Company or any other person.\n\nii. The Client has the right to withdraw the funds which are not used for margin covering, free from any obligations (i.e., Free Margin) from the Client’s Account without closing the said account.\n\niii. Unless the Parties otherwise agree, in writing, any amount payable by the Company to the Client, shall be transferred directly to the Client’s personal account. Fund transfer requests are processed by the Company within the time period specified on the Company’s Main Website and the time needed for crediting into the Client’s personal account will depend on the Client’s Bank Account provider.\n\niv. Client’s withdrawals should be made using the same method used by the Client to fund his Client Account and to the same remitter. The Company reserves the right to decline a withdrawal with a specific payment method and will suggest another payment method where the Client needs to proceed with a new withdrawal request or request further documentation while processing the withdrawal request. Where applicable, the Company reserves the right to send Client’s funds only in the currency as these funds were deposited. Where applicable, if the Company is not satisfied with any documentation provided by the Client, then we will reverse the withdrawal transaction and deposit the amount back to the Client’s Account net of any charges/fees charged by the Client’s Bank Account providers.\n\nv. Clients’ fund transfer requests and withdrawals will be performed from the Company’s Client portal located on its Main Website.\n\nvi. The Client acknowledges that in case where a Client’s Bank Account is freezed for any given period and for any given reason the Company assumes no responsibility. Furthermore, the Client acknowledges that he has read and understood the additional information provided on each payment method available on the Company’s Client portal.',
          },
          {
            heading: 'Review of deposit & withdrawal policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Deposit & Withdrawal Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employee and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة الإيداع والسحب',
        slug: 'deposit-withdrawal',

        body: legalBody('', [
          {
            heading: 'هدف السياسة',
            body: 'تهدف سياسة الإيداع والسحب هذه ("السياسة") إلى تزويد العملاء بملخص لسياسات وشروط شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") المتعلقة بمسائل الإيداع والسحب. تنطبق هذه السياسة على جميع العملاء الذين قاموا بفتح حساب تداول لدى الشركة.',
          },
          {
            heading: 'السياسة',
            body: '1. يمنح العميل موافقته ويفوض الشركة بإجراء عمليات الإيداع والسحب من حسابه المصرفي نيابةً عنه، بما في ذلك، على سبيل المثال لا الحصر، تسوية المعاملات التي يتم تنفيذها من قبل العميل أو نيابةً عنه، ودفع جميع المبالغ المستحقة من العميل أو نيابةً عنه للشركة أو لأي شخص آخر.\n\n2. يحق للعميل سحب الأموال التي لا يتم استخدامها لتغطية الهامش، والخالية من أي التزامات (أي الهامش الحر)، من حساب العميل دون إغلاق الحساب المذكور.\n\n3. ما لم يتفق الطرفان على خلاف ذلك كتابةً، يتم تحويل أي مبلغ مستحق الدفع من الشركة إلى العميل مباشرةً إلى حساب العميل الشخصي. تتم معالجة طلبات تحويل الأموال من قبل الشركة خلال الفترة الزمنية المحددة على الموقع الإلكتروني الرئيسي للشركة، بينما يعتمد الوقت اللازم لإيداع الأموال في الحساب الشخصي للعميل على مزود الحساب المصرفي الخاص بالعميل.\n\n4. يجب إجراء عمليات السحب الخاصة بالعميل باستخدام نفس الطريقة التي استخدمها العميل لتمويل حسابه، وإلى نفس المرسل. تحتفظ الشركة بالحق في رفض السحب باستخدام طريقة دفع محددة، وستقترح طريقة دفع أخرى عندما يحتاج العميل إلى تقديم طلب سحب جديد أو طلب مستندات إضافية أثناء معالجة طلب السحب. وحيثما ينطبق ذلك، تحتفظ الشركة بالحق في إرسال أموال العميل فقط بالعملة التي تم بها إيداع هذه الأموال. وحيثما ينطبق ذلك، إذا لم تكن الشركة راضية عن أي مستندات قدمها العميل، فستقوم بعكس معاملة السحب وإعادة المبلغ إلى حساب العميل بعد خصم أي رسوم أو تكاليف تم فرضها من قبل مزودي الحساب المصرفي الخاص بالعميل.\n\n5. سيتم تنفيذ طلبات تحويل الأموال وعمليات السحب الخاصة بالعملاء من خلال بوابة العميل التابعة للشركة والموجودة على موقعها الإلكتروني الرئيسي.\n\n6. يقر العميل بأنه في حالة تجميد حسابه المصرفي لأي فترة زمنية ولأي سبب كان، فإن الشركة لا تتحمل أي مسؤولية عن ذلك. كما يقر العميل بأنه قد قرأ وفهم المعلومات الإضافية المقدمة بشأن كل طريقة دفع متاحة على بوابة العميل التابعة للشركة.',
          },
          {
            heading: 'مراجعة سياسة الإيداع والسحب',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، بما لا يقل عن مرة واحدة كل ستة أشهر، للتحقق من فعاليتها وتحديثها.\n\nتحظى سياسة الإيداع والسحب هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 11. Order Execution Policy (from Order-Execution-Policy.pdf)
    {
      pageType: 'order-execution',
      en: {
        title: 'Order Execution Policy',
        slug: 'order-execution',
        body: legalBody('', [
          {
            heading: 'Policy objective',
            body: 'This Order Execution Policy (“the Policy”) is intended to provide you with a general overview as to how NEWERA CAPITAL MARKETS LIMITED (the “Company”) execute Orders on behalf of its clients, the factors which can affect the timing of execution and the way in which market volatility plays a part in Order handling. This Policy applies to all Clients who place Orders with the Company.',
          },
          {
            heading: 'Interpretation of terms',
            body: 'In this Policy:\n\n“Base Currency” shall mean the first currency in the Currency Pair against which the Client buys or sells the Quote Currency.\n\n“Completed Transaction” in a Contract for Difference (CFD) shall mean two counter deals of the same size (opening a position and closing a position): buy then sell and vice versa.\n\n“Financial Instrument” shall mean the Financial Instruments under the Company’s license which can be found on the Company’s website. It is understood that the Company does not necessarily offer all the Financial Instruments which appear on its license but only those marketed on its website, from time to time.\n\n“Long Position” for CFD trading shall mean a buy position that appreciates in value if Underlying Market prices increase. For example, in respect of Currency Pairs: buying the Base Currency against the Quote Currency.\n\n“Margin” shall mean the necessary guarantee funds so as to open or maintain Open Positions in a CFD Transaction.\n\n“Margin Call” shall mean the situation when the Company informs the Client to deposit additional funds when the Client does not have enough Margin to open or maintain Open Positions.\n\n“Open Position” shall mean any Long Position or a Short Position which is not a Completed Transaction. “Order” shall mean an instruction from the Client to trade in Financial Instruments.\n\n“Quote Currency” shall mean the second currency in the Currency Pair which can be bought or sold by the Client for the Base Currency.\n\n“Short Position” for CFD trading shall mean a sell position that appreciates in value if Underlying Market prices fall. For example, in respect of Currency Pairs: selling the Base Currency against the Quote Currency. Short Position is the opposite of a Long Position.\n\n“Slippage” shall mean the difference between the expected price of a Transaction in a CFD or any other Financial Instrument, and the price the Transaction is actually executed at. Slippage often occurs during periods of higher volatility (for example due to news events) making an Order at a specific price impossible to execute, when market Orders are used, and also when large Orders are executed when there may not be enough interest at the desired price level to maintain the expected price of trade.\n\n“Transaction” shall mean any CFD or other transaction arranged for execution on behalf of the Client under this Policy.\n\n“Underlying Asset” shall mean the object or underlying asset in a CFD or any other Financial Instrument which may be Currency Pairs, Futures, Metals, Equity Indices, Stocks and Commodities. It is understood that the list is subject to change and clients must refer each time on the Platform.\n\n“Underlying Market” shall mean the relevant market where the Underlying Asset of a CFD or any other Financial Instrument is traded.\n\n“Website” shall mean the Company’s website at <insert> and/or any other website as the Company may maintain from time to time.\n\nWords importing the singular shall import the plural and vice versa. Words importing the masculine shall import the feminine and vice versa. Words denoting persons include corporations, partnerships, other unincorporated bodies and all other legal entities and vice versa. Paragraph headings are for ease of reference only and shall not affect interpretation of this policy.\n\nAny reference to any act or regulation or Law shall be that act or regulation or Law as amended, modified, supplemented, consolidated, re-enacted or replaced from time to time, all guidance noted, directives, statutory instruments, regulations or orders made pursuant to such and any statutory provision of which that statutory provision is a re-enactment, replacement or modification.',
          },
          {
            heading: 'Disclaimer',
            body: 'You hereby acknowledge that there are inherent risks in trading in Financial Instruments. While this Policy is intended to inform you of the risks associated with trading in Financial Instruments, the Policy is not exhaustive of all risks related, or connected to, entering Orders and Transactions or trading using any trading platform offered by the Company.',
          },
          {
            heading: 'No guarantees',
            body: 'The Company shall make all commercially reasonable efforts to obtain the best possible result for you, given the conditions relating to your Order. The Company may but are not required to take into account certain factors, such as, prices, costs, speed, likeliness of execution and settlement, size, nature and/or any other information relevant to the execution of your Order.\n\nThere are no guarantees that your Order will be accepted or executed by us, nor are there guarantees regarding the speed, timing, or price at which your Order will be executed. Further, Order speed, timing, pricing and execution may vary between Clients trading the same Financial Instrument, due to several factors, including but not limited to Order type, market volatility and latency. This Policy does not form an obligation on our part to you.',
          },
          {
            heading: 'Margin and margin requirements',
            body: 'The Company will generally decline any Order if your available Margin is less than the Margin Requirement necessary to place an Order or maintain an Open Position. The Company may liquidate, on a nonmanager basis by way of an auto-close functionality, all Open Positions and/or cancel any pending Orders without prior notice or your consent, if your Margin is less than your Margin Requirement.\n\nIn instances where your Open Position is liquidated, and your Trading Account realizes a negative balance, you are liable for all losses and must immediately make a payment to us for the full and total amount due.\n\nYou should be aware that the system(s) may automatically issue you a Margin Call warning and further, that Margin Call warnings may vary based on certain limits configured in the system(s).',
          },
          {
            heading: 'Execution practices in financial instruments',
            body: 'You are warned that Slippage may occur when trading in Financial Instruments. This is the situation when at the time that an Order is presented for execution, the specific price showed to the Client may not be available; therefore, the Order will be executed close to or a number of pips away from the Client’s requested price.\n\nSo, Slippage is the difference between the expected price of an Order, and the price the Order is actually executed at. If the execution price is better than the price requested by the Client, this is referred to as positive slippage. If the executed price is worse than the price requested by the Client, this is referred to as negative slippage.\n\nPlease be advised that Slippage is a normal element when trading in Financial Instruments. Slippage more often occurs during periods of illiquidity or higher volatility, for example due to news announcements, economic events and market openings and other factors, making an Order at a specific price impossible to execute.\n\nIn other words, your Orders may not be executed at declared prices. It is noted that Slippage can occur also during stop loss, take profit and other types of Orders.\n\nThe Company does not guarantee the execution of your pending Orders at the price specified. However, it is confirmed that your Order will be executed at the next best available market price from the price you have specified under your pending Order.',
          },
          {
            heading: 'Types of order(s) in trading financial instruments',
            body: 'The particular characteristics of an Order may affect the execution of the Client’s Order. Please see below the different types of Orders that a client can be placed:',
          },
          {
            heading: 'Market order(s)',
            body: 'A market Order is an Order to buy or sell a Financial Instrument at the current price. Execution of this Order results in opening a trade position. Financial Instruments are bought at ASK price and sold at BID price. Stop loss and Take profit Orders can be attached to a market Order. All types of accounts orders offered by the Company are executed as market Orders.',
          },
          {
            heading: 'Pending order(s)',
            body: 'The Company offers the following types of pending Orders: buy limit, buy stop, sell limit or sell stop Orders to accounts used to receive and transmit and execute Client Orders in Financial Instruments or to receive, transmit, execute and place Client Orders for execution with Company’s liquidity providers.\n\nA Pending Order is an Order that allows the user to buy or sell a Financial Instrument at a pre-defined price in the future. These Pending orders are executed once the price reaches the requested level.\n\nHowever, it is noted that under certain trading conditions it may not be possible to execute these Orders at the Client’s requested price. In this case, the Company has the right to execute the Order at the first available price.\n\nThis may occur, for example, at times of rapid price fluctuations of the price, rises or falls in one trading session to such an extent that, under the rules of the relevant exchange, trading is suspended or restricted, or there is lack of liquidity, or this may occur at the opening of trading sessions.\n\nIt is noted that Stop loss and Take profit may be attached to a pending Order. Also, pending orders are good till cancel.',
          },
          {
            heading: 'Take profit',
            body: 'Take profit Order is intended for gaining the profit when the financial instrument price has reached a certain level. Execution of this Order results in complete closing of the whole position.\n\nIt is always connected to an Open position or a pending Order. The Order can be requested only together with a market or a pending Order.\n\nUnder this type of Order, the Company’s trading platform checks Long Positions with BID price for meeting of this Order provisions (the order is always set above the current Bid price), and it does with ASK price for Short Positions (the Order is always set below the current ASK price).\n\nTake Profit Orders are executed once the price reaches the requested level (stated prices).',
          },
          {
            heading: 'Stop loss',
            body: 'The stop Order is used for minimizing of losses if the Financial Instrument price has started to move in an unprofitable direction. If the Financial Instrument price reaches this level, the whole position will be closed automatically.\n\nSuch Orders are always connected to an open Position or a pending Order. They can be requested only together with a market or a pending Order.\n\nUnder this type of Orders, the Company’s trading platform checks Long Positions with BID price for meeting of this Order provisions (the Order is always set below the current BID price), and it does with ASK price for Short Positions (the Order is always set above the current ASK price).\n\nStop loss Orders are executed at the first available price.',
          },
          {
            heading: 'Clients’ consent',
            body: 'You hereby agree and consent to be bound by this Order Execution Policy.\n\nYou further agree and consent that by placing trade(s) in any other Financial Instrument(s) than Financial Instrument(s) you will become a Client of the Company, however the funds that you deposited might remain safeguarded with an intermediary broker.\n\nThis Policy may be amended from time to time. Any amendment to this Policy shall be deemed to be accepted by you when you signify your acceptance of this Policy and its amendments by executing an Order in the trading platform the Company may provide.\n\nBy executing the Order, you confirm that you have read, understood and agree to be bound by this Policy. It is your responsibility to ensure that you have the most updated version of this Policy.',
          },
          {
            heading: 'Languages',
            body: 'Language of communication between the Company and the Client shall be in English. All binding contractual documentation is available in English.\n\nUpon its sole discretion the Company may communicate with the Client in other language than English, however in case of any discrepancy between the meanings of any communications and/or meanings, or any other communications forming part of this Policy or any other agreements, information or communication in any other language, the meaning of the English Language version shall prevail.\n\nThe Company or third parties may have provided the Client with translations of this Policy. The original English versions shall be the only legally binding version. In case of discrepancies between the English version and other translations in the Client’s possession, the original English version provided by the Company on the website shall prevail.',
          },
          {
            heading: 'Review of order execution policy',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Order Execution Policy is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employee and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة تنفيذ الأوامر',
        slug: 'order-execution-policy',

        body: legalBody('', [
          {
            heading: 'هدف السياسة',
            body: 'تهدف سياسة تنفيذ الأوامر هذه ("السياسة") إلى تزويدكم بنظرة عامة عن كيفية قيام شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") بتنفيذ الأوامر نيابةً عن عملائها، والعوامل التي يمكن أن تؤثر على توقيت التنفيذ، وكيفية تأثير تقلبات السوق على معالجة الأوامر. تنطبق هذه السياسة على جميع العملاء الذين يضعون أوامر لدى الشركة.',
          },
          {
            heading: 'تفسير المصطلحات',
            body: 'في هذه السياسة:\n\n"العملة الأساسية" تعني العملة الأولى في زوج العملات التي يقوم العميل مقابلها بشراء أو بيع عملة التسعير.\n\n"المعاملة المكتملة" في عقد الفروقات (CFD) تعني صفقتين متعاكستين بنفس الحجم، وهما فتح المركز وإغلاقه: شراء ثم بيع والعكس صحيح.\n\n"الأداة المالية" تعني الأدوات المالية المشمولة ضمن ترخيص الشركة والمتاحة على موقع الشركة الإلكتروني. ومن المفهوم أن الشركة لا تقدم بالضرورة جميع الأدوات المالية الواردة في ترخيصها، وإنما تقدم فقط الأدوات التي يتم تسويقها على موقعها الإلكتروني من وقت لآخر.\n\n"المركز الطويل" في تداول عقود الفروقات يعني مركز شراء ترتفع قيمته إذا ارتفعت أسعار السوق الأساسية. وعلى سبيل المثال، بالنسبة لأزواج العملات: شراء العملة الأساسية مقابل عملة التسعير.\n\n"الهامش" يعني الأموال الضامنة اللازمة لفتح أو الحفاظ على المراكز المفتوحة في معاملة عقود الفروقات.\n\n"طلب الهامش" يعني الحالة التي تقوم فيها الشركة بإبلاغ العميل بضرورة إيداع أموال إضافية عندما لا يكون لديه هامش كافٍ لفتح أو الحفاظ على المراكز المفتوحة.\n\n"المركز المفتوح" يعني أي مركز طويل أو مركز قصير لم يصبح بعد معاملة مكتملة. ويعني "الأمر" تعليمات من العميل للتداول في الأدوات المالية.\n\n"عملة التسعير" تعني العملة الثانية في زوج العملات والتي يمكن للعميل شراؤها أو بيعها مقابل العملة الأساسية.\n\n"المركز القصير" في تداول عقود الفروقات يعني مركز بيع ترتفع قيمته إذا انخفضت أسعار السوق الأساسية. وعلى سبيل المثال، بالنسبة لأزواج العملات: بيع العملة الأساسية مقابل عملة التسعير. والمركز القصير هو عكس المركز الطويل.\n\n"الانزلاق السعري" يعني الفرق بين السعر المتوقع للمعاملة في عقد الفروقات أو أي أداة مالية أخرى والسعر الذي يتم تنفيذ المعاملة به فعلياً. وغالباً ما يحدث الانزلاق السعري خلال فترات التقلبات المرتفعة، مثل الأحداث الإخبارية، مما يجعل تنفيذ الأمر بسعر محدد أمراً مستحيلاً، وكذلك عند استخدام أوامر السوق أو تنفيذ أوامر كبيرة عندما لا يكون هناك اهتمام كافٍ عند مستوى السعر المطلوب للحفاظ على سعر التداول المتوقع.\n\n"المعاملة" تعني أي معاملة لعقد فروقات أو معاملة أخرى يتم ترتيب تنفيذها نيابةً عن العميل بموجب هذه السياسة.\n\n"الأصل الأساسي" يعني الأصل أو الشيء الأساسي في عقد الفروقات أو أي أداة مالية أخرى، والتي قد تشمل أزواج العملات والعقود الآجلة والمعادن ومؤشرات الأسهم والأسهم والسلع. ومن المفهوم أن هذه القائمة قابلة للتغيير ويجب على العملاء الرجوع إلى المنصة في كل مرة.\n\n"السوق الأساسي" يعني السوق ذي الصلة الذي يتم فيه تداول الأصل الأساسي لعقد الفروقات أو أي أداة مالية أخرى.\n\n"الموقع الإلكتروني" يعني موقع الشركة على الإنترنت على العنوان <insert> و/أو أي موقع إلكتروني آخر قد تديره الشركة من وقت لآخر.\n\nتشمل الكلمات التي تشير إلى المفرد الجمع والعكس صحيح. وتشمل الكلمات التي تشير إلى المذكر المؤنث والعكس صحيح. وتشمل الكلمات التي تشير إلى الأشخاص الشركات والشراكات والكيانات الأخرى غير المؤسسة وجميع الكيانات القانونية الأخرى والعكس صحيح. وتستخدم عناوين الفقرات لتسهيل الرجوع إليها فقط ولا تؤثر على تفسير هذه السياسة.\n\nأي إشارة إلى أي قانون أو لائحة أو تشريع تعني ذلك القانون أو اللائحة أو التشريع بصيغته المعدلة أو المضافة أو الموحدة أو المعاد إصدارها أو المستبدلة من وقت لآخر، بما في ذلك جميع الإرشادات والتوجيهات والأدوات أو الأوامر النظامية الصادرة بموجبها وأي حكم قانوني يمثل إعادة إصدار أو استبدالاً أو تعديلاً لذلك الحكم.',
          },
          {
            heading: 'إخلاء المسؤولية',
            body: 'يقر العميل بموجب هذا بأن التداول في الأدوات المالية ينطوي على مخاطر متأصلة. وعلى الرغم من أن هذه السياسة تهدف إلى إعلام العميل بالمخاطر المرتبطة بالتداول في الأدوات المالية، فإن هذه السياسة لا تشمل جميع المخاطر المتعلقة أو المرتبطة بإدخال الأوامر والمعاملات أو التداول باستخدام أي منصة تداول تقدمها الشركة.',
          },
          {
            heading: 'عدم وجود ضمانات',
            body: 'ستبذل الشركة جميع الجهود المعقولة تجارياً للحصول على أفضل نتيجة ممكنة للعميل، مع مراعاة الظروف المتعلقة بأمره. ويجوز للشركة، ولكن ليس مطلوباً منها، أن تأخذ في الاعتبار عوامل معينة مثل الأسعار والتكاليف والسرعة واحتمالية التنفيذ والتسوية والحجم والطبيعة و/أو أي معلومات أخرى ذات صلة بتنفيذ الأمر.\n\nلا توجد أي ضمانات بأن يتم قبول الأمر أو تنفيذه من قبل الشركة، كما لا توجد ضمانات بشأن سرعة أو توقيت أو السعر الذي سيتم تنفيذ الأمر به. علاوة على ذلك، قد تختلف سرعة الأمر وتوقيته وتسعيره وتنفيذه بين العملاء الذين يتداولون في الأداة المالية نفسها بسبب عدة عوامل، بما في ذلك، على سبيل المثال لا الحصر، نوع الأمر وتقلبات السوق وزمن الاستجابة. ولا تشكل هذه السياسة التزاماً من جانب الشركة تجاه العميل.',
          },
          {
            heading: 'الهامش ومتطلبات الهامش',
            body: 'ترفض الشركة عادةً أي أمر إذا كان الهامش المتاح للعميل أقل من متطلبات الهامش اللازمة لوضع الأمر أو الحفاظ على مركز مفتوح. ويجوز للشركة تصفية جميع المراكز المفتوحة و/أو إلغاء أي أوامر معلقة دون إشعار مسبق أو موافقة العميل، من خلال وظيفة الإغلاق التلقائي، إذا كان الهامش أقل من متطلبات الهامش.\n\nفي الحالات التي تتم فيها تصفية المركز المفتوح ويصبح رصيد حساب التداول سالباً، يكون العميل مسؤولاً عن جميع الخسائر ويجب عليه فوراً دفع كامل المبلغ المستحق للشركة.\n\nيجب أن يكون العميل على علم بأن النظام أو الأنظمة قد تصدر تلقائياً تحذيراً بطلب الهامش، كما قد تختلف تحذيرات طلب الهامش بناءً على حدود معينة مهيأة في النظام أو الأنظمة.',
          },
          {
            heading: 'ممارسات تنفيذ الأدوات المالية',
            body: 'يتم تحذير العميل من احتمال حدوث انزلاق سعري عند التداول في الأدوات المالية. ويحدث ذلك عندما لا يكون السعر المحدد المعروض للعميل متاحاً في الوقت الذي يتم فيه تقديم الأمر للتنفيذ، وبالتالي سيتم تنفيذ الأمر بالقرب من السعر المطلوب أو بفارق عدد من النقاط عن السعر الذي طلبه العميل.\n\nوبالتالي، فإن الانزلاق السعري هو الفرق بين السعر المتوقع للأمر والسعر الذي يتم تنفيذ الأمر به فعلياً. وإذا كان سعر التنفيذ أفضل من السعر الذي طلبه العميل، فيُشار إلى ذلك بالانزلاق الإيجابي. وإذا كان سعر التنفيذ أسوأ من السعر الذي طلبه العميل، فيُشار إلى ذلك بالانزلاق السلبي.\n\nيرجى العلم بأن الانزلاق السعري عنصر طبيعي في التداول في الأدوات المالية. ويحدث الانزلاق السعري بشكل أكثر شيوعاً خلال فترات انخفاض السيولة أو ارتفاع التقلبات، على سبيل المثال بسبب الإعلانات الإخبارية والأحداث الاقتصادية وافتتاح الأسواق وعوامل أخرى، مما يجعل تنفيذ الأمر بسعر محدد أمراً مستحيلاً.\n\nوبعبارة أخرى، قد لا يتم تنفيذ أوامر العميل بالأسعار المعلنة. كما يمكن أن يحدث الانزلاق السعري أيضاً أثناء أوامر وقف الخسارة وجني الأرباح وأنواع الأوامر الأخرى.\n\nلا تضمن الشركة تنفيذ الأوامر المعلقة بالسعر المحدد. ومع ذلك، يتم تأكيد تنفيذ الأمر بأفضل سعر سوق متاح تالٍ للسعر الذي حدده العميل في الأمر المعلق.',
          },
          {
            heading: 'أنواع الأوامر في تداول الأدوات المالية',
            body: 'قد تؤثر الخصائص الخاصة بالأمر على تنفيذ أمر العميل. وفيما يلي الأنواع المختلفة من الأوامر التي يمكن للعميل وضعها:',
          },
          {
            heading: 'أوامر السوق',
            body: 'أمر السوق هو أمر لشراء أو بيع أداة مالية بالسعر الحالي. ويؤدي تنفيذ هذا الأمر إلى فتح مركز تداول. ويتم شراء الأدوات المالية بسعر الطلب (ASK) وبيعها بسعر العرض (BID). ويمكن إرفاق أوامر وقف الخسارة وجني الأرباح بأمر السوق. ويتم تنفيذ جميع أنواع أوامر الحسابات التي تقدمها الشركة كأوامر سوق.',
          },
          {
            heading: 'الأوامر المعلقة',
            body: 'تقدم الشركة الأنواع التالية من الأوامر المعلقة: أمر شراء محدد، وأمر شراء بإيقاف، وأمر بيع محدد، وأمر بيع بإيقاف، للحسابات المستخدمة لاستلام أوامر العملاء في الأدوات المالية ونقلها وتنفيذها أو لاستلام أوامر العملاء ونقلها وتنفيذها ووضعها للتنفيذ مع مزودي السيولة التابعين للشركة.\n\nالأمر المعلق هو أمر يسمح للمستخدم بشراء أو بيع أداة مالية بسعر محدد مسبقاً في المستقبل. ويتم تنفيذ هذه الأوامر المعلقة بمجرد وصول السعر إلى المستوى المطلوب.\n\nومع ذلك، تجدر الإشارة إلى أنه في ظل ظروف تداول معينة قد لا يكون من الممكن تنفيذ هذه الأوامر بالسعر الذي طلبه العميل. وفي هذه الحالة، يحق للشركة تنفيذ الأمر بأول سعر متاح.\n\nوقد يحدث ذلك، على سبيل المثال، في أوقات التقلبات السريعة في الأسعار، أو عندما ترتفع الأسعار أو تنخفض خلال جلسة تداول واحدة إلى حد يؤدي، وفقاً لقواعد البورصة ذات الصلة، إلى تعليق التداول أو تقييده، أو عند وجود نقص في السيولة، أو عند افتتاح جلسات التداول.\n\nيمكن إرفاق أوامر وقف الخسارة وجني الأرباح بالأمر المعلق. كما أن الأوامر المعلقة تظل سارية حتى الإلغاء.',
          },
          {
            heading: 'جني الأرباح',
            body: 'يهدف أمر جني الأرباح إلى تحقيق الربح عندما يصل سعر الأداة المالية إلى مستوى معين. ويؤدي تنفيذ هذا الأمر إلى إغلاق المركز بالكامل.\n\nيرتبط هذا الأمر دائماً بمركز مفتوح أو أمر معلق. ولا يمكن طلب الأمر إلا مع أمر سوق أو أمر معلق.\n\nفي هذا النوع من الأوامر، تتحقق منصة التداول التابعة للشركة من المراكز الطويلة باستخدام سعر BID للتحقق من استيفاء شروط الأمر، ويكون الأمر دائماً محدداً فوق سعر BID الحالي، بينما يتم التحقق من المراكز القصيرة باستخدام سعر ASK، ويكون الأمر دائماً محدداً تحت سعر ASK الحالي.\n\nيتم تنفيذ أوامر جني الأرباح بمجرد وصول السعر إلى المستوى المطلوب (الأسعار المحددة).',
          },
          {
            heading: 'وقف الخسارة',
            body: 'يُستخدم أمر وقف الخسارة لتقليل الخسائر إذا بدأ سعر الأداة المالية في التحرك في اتجاه غير مربح. وإذا وصل سعر الأداة المالية إلى هذا المستوى، فسيتم إغلاق المركز بالكامل تلقائياً.\n\nترتبط هذه الأوامر دائماً بمركز مفتوح أو أمر معلق. ولا يمكن طلبها إلا مع أمر سوق أو أمر معلق.\n\nفي هذا النوع من الأوامر، تتحقق منصة التداول التابعة للشركة من المراكز الطويلة باستخدام سعر BID للتحقق من شروط الأمر، ويكون الأمر دائماً محدداً تحت سعر BID الحالي، بينما يتم التحقق من المراكز القصيرة باستخدام سعر ASK، ويكون الأمر دائماً محدداً فوق سعر ASK الحالي.\n\nيتم تنفيذ أوامر وقف الخسارة بأول سعر متاح.',
          },
          {
            heading: 'موافقة العملاء',
            body: 'يوافق العميل بموجب هذا على الالتزام بسياسة تنفيذ الأوامر هذه.\n\nكما يوافق العميل على أنه من خلال وضع صفقات في أي أدوات مالية أخرى، سيصبح عميلاً للشركة، إلا أن الأموال التي قام بإيداعها قد تظل محفوظة لدى وسيط وسيط.\n\nيجوز تعديل هذه السياسة من وقت لآخر. ويُعتبر أي تعديل على هذه السياسة مقبولاً من العميل عندما يؤكد قبوله لهذه السياسة وتعديلاتها من خلال تنفيذ أمر على منصة التداول التي قد توفرها الشركة.\n\nمن خلال تنفيذ الأمر، يؤكد العميل أنه قرأ هذه السياسة وفهمها ويوافق على الالتزام بها. وتقع على عاتق العميل مسؤولية التأكد من حصوله على أحدث نسخة من هذه السياسة.',
          },
          {
            heading: 'اللغات',
            body: 'تكون لغة التواصل بين الشركة والعميل هي اللغة الإنجليزية. وجميع الوثائق التعاقدية الملزمة متاحة باللغة الإنجليزية.\n\nيجوز للشركة، وفقاً لتقديرها الخاص، التواصل مع العميل بلغة أخرى غير الإنجليزية، إلا أنه في حال وجود أي تعارض بين معاني أي اتصالات و/أو أي اتصالات أخرى تشكل جزءاً من هذه السياسة أو أي اتفاقيات أو معلومات أو اتصالات أخرى بأي لغة أخرى، فإن معنى النسخة باللغة الإنجليزية هو الذي يسود.\n\nقد تكون الشركة أو أطراف ثالثة قد قدمت للعميل ترجمات لهذه السياسة. وتكون النسخ الإنجليزية الأصلية هي النسخ الوحيدة الملزمة قانوناً. وفي حال وجود أي تعارض بين النسخة الإنجليزية وأي ترجمات أخرى بحوزة العميل، تسود النسخة الإنجليزية الأصلية التي توفرها الشركة على موقعها الإلكتروني.',
          },
          {
            heading: 'مراجعة سياسة تنفيذ الأوامر',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، بما لا يقل عن مرة واحدة كل ستة أشهر، للتحقق من فعاليتها وتحديثها.\n\nتحظى سياسة تنفيذ الأوامر هذه بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها في تعاملاتها التجارية مع العملاء.',
          },
        ]),
      },

      effectiveDate: '2026-01-01',
      version: 'v1.0',
    },

    // 12. Suspicious Activity Reporting Policy (from Suspicious-Activity-Reporting-Policy-and-Procedures.pdf)
    {
      pageType: 'suspicious-activity-reporting',
      en: {
        title: 'Suspicious Activity Reporting (SAR) Policy & Procedures',
        slug: 'suspicious-activity-reporting',

        body: legalBody('', [
          {
            heading: 'Policy objective',
            body: 'Based on the guidelines issued by the Financial Services Regulatory Authority on Anti-Money Laundering and Counter Financing of Terrorism (AML/CFT) for Banking Sector, NEWERA CAPITAL MARKETS LIMITED (“the Company”) has implemented the following internal Suspicious Activity Report (“SAR”) policy and procedures to monitor suspicious transaction and to address its reporting obligation.\n\nThe following policy and procedures are developed for identifying, evaluating and investigating, reporting as well as record keeping of potential suspicious situation/transactions (including attempted or proposed).',
          },
          {
            heading: 'Entifying',
            body: 'The Company’s employees need to ensure that all potential/existing customers do not engage in criminal activity, money laundering or terrorist financing. They must monitor carefully at all unusual transactions to see if there is anything suspicious about the customer.\n\nThere are many reasons why an employee might become suspicious about a transaction/activity. Often it is just because of something unusual for a business, maybe a customer behaved strangely, or perhaps customer made unusual requests that did not seem to make sense.\n\nThe Company’s employees may be guided by the examples provided in the Company’s internal measures for “Mechanism or Red Flag to indicate occurrence of suspicious transaction”, to assist them in identifying any attempted or proposed suspicious transaction.',
          },
          {
            heading: 'Evaluating and investigating',
            body: 'Whenever a Company’s employee detects any “red flag” that fits the list indicated above or senses any unusual activity/transaction, he/she must directly inform the AML Compliance Officer (“CO”) without delay.\n\nUpon receiving any internal SAR from the Company’s employees, the CO will first evaluate the grounds for suspicion and he will make an initial decision of whether a customer/transaction is potentially suspicious.\n\nThe employee may be required to investigate the Customer/transaction further under the direction of the CO. This may include gathering additional information from the customer or from third party sources to assist in determining whether the customer/transaction is indeed suspicious and to eliminate “false positive”.\n\nThese procedures should reflect the principle of confidentiality, where employees are to ensure that investigation is conducted swiftly and that reports contain relevant information and are produced and submitted to the CO in a secured and confidential manner, within five (5) working days from the commencement of investigation.',
          },
          {
            heading: 'Reporting',
            body: 'Internal Suspicious Activity Report (“SAR”) prepared by the Company’s employee must be reviewed by the CO within three (3) working days from receiving such report.\n\nThe CO is to complete his/her review within five (5) working days. Under the circumstances where a report requires further investigation, the timeframe can be exceeded up to a month.\n\nOnce the CO has finished review of the details, he/she should determine if that particular event rendered an attempted or proposed suspicious transaction.\n\nThe CO will consult with the Company’s Board of Directors to make the decision as to whether the customer/transaction is suspicious and whether a filing to the Authority(ies) is necessary.\n\nCO shall submit the STR using the specified reporting template, to both of the following authorities:',
          },
          {
            heading: 'Financial services regulatory authority',
            body: '6th Floor Francis Compton Building Waterfront, Castries St. Lucia W.I. Tel: +758 468-2990. Fax: +758 451-7655. Email: finsersup@gosl.gov.lc',
          },
          {
            heading: 'Financial intelligence authority',
            body: 'P.O. Box GM959, Gablewoods North P.O., Castries LC02 501, Saint Lucia. Tel. +758 451-7126. Fax. +758 453-6199. Email: slufia@candw.lc\n\nThe CO will inform the Company’s Board of Directors of any report submitted. The fact that a report has been made is confidential.\n\nThe CO, as well as the Company’s employees shall ensure that in the course of submitting the SAR, such reports are treated with the highest level of confidentiality. No one, other than those involved in the investigation and reporting should be told about a SAR, except for the law enforcement or other competent authorities.\n\nHowever, under the circumstances where the CO decides that there are no reasonable grounds for suspicion and no SAR is necessary to be submitted to the relevant authorities, the CO must document and file the decision, supported by the relevant supporting documentary evidence, which will be made available to the relevant supervisory authorities upon request.',
          },
          {
            heading: 'Reporting',
            body: 'The DCO shall maintain a complete file on all internally generated reports and any supporting documentary evidence, regardless of whether such report has been submitted. In the case of a filed report, a backup documentation is necessary.\n\nThe following are some of the information maintained for record keeping, which includes but is not limited to:\n\nMaintain a record of identifying information provided by the Customer.\n\nWhere the Company relies upon a document to verify identity, the Company must maintain a copy of the document with clear evidence that the Company relied on and any identifying information it may contain.\n\nRecord the methods and result of any additional measures undertaken to verify the identity of the Customer.\n\nRecord the resolution of any discrepancy in the identifying information obtained.\n\nThe nature or circumstances surrounding the transaction; and\n\nBusiness background of the person conducting the transaction that is connected to the unlawful activity.\n\nAll transaction and identification records are to be retained for a minimum period of six (6) years, following the completion of transaction.',
          },
          {
            heading: 'Review of suspicious activity reporting policy and procedures',
            body: 'NEWERA CAPITAL MARKETS LIMITED is committed to continuously improve this policy and it will be reviewed regularly (at least every six months) for effectiveness and updated.\n\nThis Suspicious Activity Reporting Policy and Procedures is supported by management. NEWERA CAPITAL MARKETS LIMITED commits to providing this policy to all employee and displaying it in its business with clients.',
          },
        ]),
      },

      ar: {
        title: 'سياسة وإجراءات الإبلاغ عن الأنشطة المشبوهة (SAR)',
        slug: 'suspicious-activity-reporting',

        body: legalBody('', [
          {
            heading: 'هدف السياسة',
            body: 'استناداً إلى الإرشادات الصادرة عن هيئة تنظيم الخدمات المالية بشأن مكافحة غسل الأموال وتمويل الإرهاب (AML/CFT) للقطاع المصرفي، قامت شركة NEWERA CAPITAL MARKETS LIMITED ("الشركة") بتطبيق سياسة وإجراءات داخلية للإبلاغ عن الأنشطة المشبوهة ("SAR") بهدف مراقبة المعاملات المشبوهة والوفاء بالتزاماتها المتعلقة بالإبلاغ.\n\nتم وضع هذه السياسة والإجراءات لتحديد وتقييم والتحقيق في الحالات أو المعاملات المحتملة المشبوهة، والإبلاغ عنها، وحفظ السجلات المتعلقة بها، بما في ذلك المعاملات التي تمت محاولتها أو اقتراحها.',
          },
          {
            heading: 'التحديد',
            body: 'يتعين على موظفي الشركة التأكد من أن جميع العملاء المحتملين والحاليين لا يشاركون في أنشطة إجرامية أو غسل الأموال أو تمويل الإرهاب. ويجب عليهم مراقبة جميع المعاملات غير المعتادة بعناية لمعرفة ما إذا كان هناك أي أمر مشبوه يتعلق بالعميل.\n\nهناك العديد من الأسباب التي قد تجعل الموظف يشتبه في معاملة أو نشاط معين. وغالباً ما يكون السبب هو وجود شيء غير معتاد بالنسبة لطبيعة العمل، أو أن العميل تصرف بطريقة غريبة، أو قدم طلبات غير معتادة لا تبدو منطقية.\n\nيمكن لموظفي الشركة الاسترشاد بالأمثلة الواردة في التدابير الداخلية للشركة بشأن "الآليات أو المؤشرات الحمراء التي تشير إلى حدوث معاملة مشبوهة"، للمساعدة في تحديد أي معاملة مشبوهة تمت محاولتها أو اقتراحها.',
          },
          {
            heading: 'التقييم والتحقيق',
            body: 'عند اكتشاف أي موظف في الشركة لأي "مؤشر أحمر" يندرج ضمن القائمة المشار إليها أعلاه أو عند ملاحظة أي نشاط أو معاملة غير معتادة، يجب عليه إبلاغ ضابط الامتثال لمكافحة غسل الأموال ("CO") مباشرة ودون تأخير.\n\nعند استلام أي تقرير داخلي عن نشاط مشبوه من موظفي الشركة، يقوم ضابط الامتثال أولاً بتقييم أسباب الاشتباه واتخاذ قرار أولي بشأن ما إذا كان العميل أو المعاملة يحتمل أن تكون مشبوهة.\n\nقد يُطلب من الموظف إجراء مزيد من التحقيق في العميل أو المعاملة تحت توجيه ضابط الامتثال. وقد يشمل ذلك جمع معلومات إضافية من العميل أو من مصادر خارجية للمساعدة في تحديد ما إذا كان العميل أو المعاملة مشبوهة بالفعل واستبعاد حالات الاشتباه غير الصحيحة.\n\nيجب أن تعكس هذه الإجراءات مبدأ السرية، حيث يتعين على الموظفين التأكد من إجراء التحقيق بسرعة وأن تحتوي التقارير على المعلومات ذات الصلة وأن يتم إعدادها وتقديمها إلى ضابط الامتثال بطريقة آمنة وسرية خلال خمسة (5) أيام عمل من بدء التحقيق.',
          },
          {
            heading: 'الإبلاغ',
            body: 'يجب أن تتم مراجعة تقرير النشاط المشبوه الداخلي ("SAR") الذي يعده موظف الشركة من قبل ضابط الامتثال خلال ثلاثة (3) أيام عمل من تاريخ استلام التقرير.\n\nيتعين على ضابط الامتثال إكمال مراجعته خلال خمسة (5) أيام عمل. وفي الحالات التي يتطلب فيها التقرير مزيداً من التحقيق، يمكن تمديد الإطار الزمني لمدة تصل إلى شهر واحد.\n\nبعد أن ينتهي ضابط الامتثال من مراجعة التفاصيل، يجب عليه تحديد ما إذا كانت الواقعة المعنية تتعلق بمعاملة مشبوهة تمت محاولتها أو اقتراحها.\n\nيتشاور ضابط الامتثال مع مجلس إدارة الشركة لاتخاذ القرار بشأن ما إذا كان العميل أو المعاملة مشبوهة وما إذا كان تقديم تقرير إلى السلطة أو السلطات المختصة ضرورياً.\n\nيقوم ضابط الامتثال بتقديم تقرير المعاملة المشبوهة ("STR") باستخدام نموذج الإبلاغ المحدد إلى كل من السلطات التالية:',
          },
          {
            heading: 'هيئة تنظيم الخدمات المالية',
            body: 'الطابق السادس، مبنى فرانسيس كومبتون، الواجهة البحرية، كاستريس، سانت لوسيا. هاتف: +758 468-2990. فاكس: +758 451-7655. البريد الإلكتروني: finsersup@gosl.gov.lc',
          },
          {
            heading: 'هيئة الاستخبارات المالية',
            body: 'P.O. Box GM959، Gablewoods North P.O.، Castries LC02 501، سانت لوسيا. هاتف: +758 451-7126. فاكس: +758 453-6199. البريد الإلكتروني: slufia@candw.lc\n\nيقوم ضابط الامتثال بإبلاغ مجلس إدارة الشركة بأي تقرير تم تقديمه. وتظل حقيقة تقديم التقرير سرية.\n\nيجب على ضابط الامتثال وجميع موظفي الشركة ضمان التعامل مع تقارير الأنشطة المشبوهة بأعلى مستوى من السرية أثناء عملية تقديم التقرير. ولا يجوز إبلاغ أي شخص، باستثناء المشاركين في التحقيق والإبلاغ، بوجود تقرير عن نشاط مشبوه، باستثناء جهات إنفاذ القانون أو السلطات المختصة الأخرى.\n\nومع ذلك، إذا قرر ضابط الامتثال عدم وجود أسباب معقولة للاشتباه وعدم ضرورة تقديم تقرير عن النشاط المشبوه إلى السلطات المختصة، فيجب عليه توثيق القرار وحفظه مع المستندات والأدلة الداعمة ذات الصلة، والتي يجب إتاحتها للجهات الرقابية المختصة عند الطلب.',
          },
          {
            heading: 'الإبلاغ',
            body: 'يتعين على ضابط الامتثال المعين ("DCO") الاحتفاظ بملف كامل لجميع التقارير الداخلية التي تم إعدادها وجميع المستندات والأدلة الداعمة، بغض النظر عما إذا كان التقرير قد تم تقديمه أم لا. وفي حالة تقديم التقرير، يجب الاحتفاظ بالوثائق الداعمة المناسبة.\n\nتشمل المعلومات التي يتم الاحتفاظ بها لأغراض حفظ السجلات، على سبيل المثال لا الحصر، ما يلي:\n\nالاحتفاظ بسجل لمعلومات تحديد الهوية التي قدمها العميل.\n\nعندما تعتمد الشركة على مستند للتحقق من الهوية، يجب على الشركة الاحتفاظ بنسخة من المستند مع دليل واضح على اعتماد الشركة عليه وأي معلومات تعريفية قد يتضمنها.\n\nتسجيل طرق ونتائج أي إجراءات إضافية تم اتخاذها للتحقق من هوية العميل.\n\nتسجيل كيفية حل أي اختلاف في معلومات تحديد الهوية التي تم الحصول عليها.\n\nطبيعة أو ظروف المعاملة؛\n\nالخلفية التجارية للشخص الذي يقوم بالمعاملة والمرتبطة بالنشاط غير القانوني.\n\nيجب الاحتفاظ بجميع سجلات المعاملات وسجلات تحديد الهوية لمدة لا تقل عن ست (6) سنوات بعد إتمام المعاملة.',
          },
          {
            heading: 'مراجعة سياسة وإجراءات الإبلاغ عن الأنشطة المشبوهة',
            body: 'تلتزم شركة NEWERA CAPITAL MARKETS LIMITED بالتحسين المستمر لهذه السياسة، وستتم مراجعتها بانتظام، بما لا يقل عن مرة كل ستة أشهر، للتأكد من فعاليتها وتحديثها عند الضرورة.\n\nتحظى سياسة وإجراءات الإبلاغ عن الأنشطة المشبوهة بدعم الإدارة. وتلتزم شركة NEWERA CAPITAL MARKETS LIMITED بتوفير هذه السياسة لجميع الموظفين وعرضها بالشكل المناسب في تعاملاتها التجارية مع العملاء.',
          },
        ]),
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
