/**
 * seed-ebooks-only.ts
 *
 * ADDITIVE, idempotent seeder for gated EBOOKS on /ebooks.
 *
 * Why this exists: seed.ts only ever created guide / glossary / video education
 * content — no `ebook` rows. So /ebooks always fell back to placeholder data with
 * no real `contentId`, and the "Send me the PDF" gate (POST /api/education/gate)
 * errored with "Content not available." This script seeds real gated ebook
 * records, each with a generated cover image + downloadable PDF, so the gate works
 * end to end.
 *
 * Like seed-extra-content.ts it uses Payload's LOCAL API (overrideAccess) and only
 * creates rows whose slug does not already exist — safe to re-run.
 *
 * Run from apps/cms:
 *   ts-node --transpile-only src/scripts/seed-ebooks-only.ts
 */

import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import payload from 'payload';

const TMP = path.join(os.tmpdir(), 'newera-ebook-seed');

// ─── Asset generators (mirrors the helpers in seed.ts) ───────────────────────

// Brand-styled PNG cover via sharp + inline SVG.
async function makeCover(file: string, label: string): Promise<void> {
  const safe = label
    .slice(0, 42)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">
    <rect width="100%" height="100%" fill="#0B3D2E"/>
    <rect x="0" y="0" width="100%" height="12" fill="#C9A227"/>
    <text x="50%" y="46%" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" fill="#ffffff" text-anchor="middle">Newera365</text>
    <text x="50%" y="53%" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#cfe3d8" text-anchor="middle">${safe}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
}

// Minimal, structurally-valid multi-line single-page PDF with an accurate xref.
function makePdf(file: string, title: string, lines: string[]): void {
  const clean = (s: string) => s.replace(/[()\\]/g, '').slice(0, 90);
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ];
  let stream = `BT /F1 24 Tf 72 720 Td (${clean(title)}) Tj`;
  for (const line of lines) {
    stream += ` 0 -32 Td /F1 13 Tf (${clean(line)}) Tj`;
  }
  stream += ' ET';
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

// ─── Ebook content ───────────────────────────────────────────────────────────

interface Ebook {
  slug: string;
  en: { title: string; summary: string; pdf: string[] };
  ar: { title: string; summary: string };
}

const ebooks: Ebook[] = [
  {
    slug: 'the-5-percent-rule',
    en: {
      title: 'The 5% Rule',
      summary:
        'A 56-page framework for never losing more than 5% on a single trade — used by our desk every day.',
      pdf: [
        'A framework for never losing more than 5% on a single trade.',
        '1. Define your account risk budget before the session opens.',
        '2. Size every position from the stop distance, not gut feel.',
        '3. The 1% per-trade rule and how it compounds protection.',
        '4. Common mistakes that blow up the rule — and how to avoid them.',
        'Newera365 — Free Guide',
      ],
    },
    ar: {
      title: 'قاعدة الـ 5%',
      summary:
        'إطار من 56 صفحة لعدم خسارة أكثر من 5% في صفقة واحدة — يستخدمه مكتب التداول لدينا يومياً.',
    },
  },
  {
    slug: 'position-sizing-blueprint',
    en: {
      title: 'The Position Sizing Blueprint',
      summary: 'A complete guide to calculating lot sizes, risk per trade and account allocation.',
      pdf: [
        'Standard, mini and micro lots explained in plain numbers.',
        'How to convert a stop-loss distance into the correct lot size.',
        'The 1% rule applied across different account sizes.',
        'Scaling in and out: position management without the guesswork.',
        'Newera365 — Free Guide',
      ],
    },
    ar: {
      title: 'مخطط تحديد حجم المركز',
      summary: 'دليل شامل لحساب أحجام اللوت والمخاطرة لكل صفقة وتوزيع الحساب.',
    },
  },
  {
    slug: 'trading-psychology-inner-game',
    en: {
      title: 'Trading Psychology: The Inner Game',
      summary: 'How to eliminate emotional decision-making from your trading process.',
      pdf: [
        'Why discipline beats prediction over a full trading year.',
        'Building a pre-trade checklist that removes emotion.',
        'Handling drawdowns without revenge trading.',
        'Routines used by professional traders to stay consistent.',
        'Newera365 — Free Guide',
      ],
    },
    ar: {
      title: 'سيكولوجية التداول: اللعبة الداخلية',
      summary: 'كيفية التخلص من القرارات العاطفية في عملية التداول لديك.',
    },
  },
  {
    slug: 'technical-analysis-foundations',
    en: {
      title: 'Technical Analysis Foundations',
      summary: 'Every chart pattern, indicator and setup that has a proven statistical edge.',
      pdf: [
        'Support, resistance and trend — the only three things that matter first.',
        'The handful of indicators worth your screen space.',
        'Chart patterns with a measurable historical edge.',
        'Building a repeatable setup checklist from the above.',
        'Newera365 — Free Guide',
      ],
    },
    ar: {
      title: 'أساسيات التحليل الفني',
      summary: 'كل نمط رسم بياني ومؤشر وإعداد له ميزة إحصائية مثبتة.',
    },
  },
];

async function uploadMedia(filePath: string, alt: string): Promise<number> {
  const doc = await payload.create({
    collection: 'media',
    data: { alt } as never,
    filePath,
  });
  return doc.id as number;
}

async function ensureEbook(item: Ebook): Promise<'created' | 'skipped'> {
  const existing = await payload.find({
    collection: 'education-content',
    where: { slug: { equals: item.slug } },
    limit: 1,
    locale: 'en',
  });
  if (existing.docs.length) return 'skipped';

  // Generate + upload the cover image and the downloadable PDF.
  const coverFile = path.join(TMP, `${item.slug}-cover.png`);
  const pdfFile = path.join(TMP, `${item.slug}.pdf`);
  await makeCover(coverFile, item.en.title);
  makePdf(pdfFile, item.en.title, item.en.pdf);
  const thumbnailId = await uploadMedia(coverFile, `${item.en.title} cover`);
  const pdfId = await uploadMedia(pdfFile, `${item.en.title} (PDF)`);

  const doc = await payload.create({
    collection: 'education-content',
    locale: 'en',
    data: {
      title: item.en.title,
      slug: item.slug,
      contentType: 'ebook',
      status: 'published',
      isGated: true,
      pdfFile: pdfId,
      thumbnail: thumbnailId,
      seoDescription: item.en.summary,
    } as never,
  });
  await payload.update({
    collection: 'education-content',
    id: doc.id,
    locale: 'ar',
    data: {
      title: item.ar.title,
      seoDescription: item.ar.summary,
    } as never,
  });
  return 'created';
}

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  fs.mkdirSync(TMP, { recursive: true });
  await payload.init({ secret, local: true });

  let created = 0;
  let skipped = 0;
  console.log('\n📚 Ebooks (additive, gated, with PDF)...');
  for (const item of ebooks) {
    const r = await ensureEbook(item);
    console.log(`   ${r === 'created' ? '✅ created' : '⏭️  exists '} ${item.slug}`);
    if (r === 'created') created++;
    else skipped++;
  }

  console.log(`\n✅ Done — ${created} created, ${skipped} already present (EN + AR + PDF).`);
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-ebooks-only failed:', err);
  process.exit(1);
});
