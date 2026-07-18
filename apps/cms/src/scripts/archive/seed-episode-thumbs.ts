/**
 * seed-episode-thumbs.ts
 *
 * Regenerates every education-content (video/audio) + webinar episode thumbnail
 * as a branded ink-art composite instead of the flat dark-green placeholder
 * plate: a varied 16:9 crop of a house art plate (apps/web/public/images/
 * edge-flow.jpg | steps-silk.jpg) under the green-black scrim, kicker wordmark
 * and title — per DESIGN.md "Ink art cards" + "Imagery art direction".
 *
 * Composites are written to seed-assets/<edu-slug|webinar-slug>.jpg first, so
 * future full reseeds (seed.ts → seedImage → findRealAsset) pick them up
 * automatically. Then each file is REST-uploaded and patched onto the live doc
 * (thumbnail is non-localized → one PATCH covers EN + AR).
 *
 * Run (local): npx ts-node --transpile-only src/scripts/seed-episode-thumbs.ts
 * Run (prod):  PAYLOAD_PUBLIC_SERVER_URL=https://cms-production-580a.up.railway.app \
 *              ts-node --transpile-only src/scripts/seed-episode-thumbs.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
const ASSETS = path.resolve(__dirname, '../../seed-assets');
const PLATES = [
  path.resolve(__dirname, '../../../web/public/images/edge-flow.jpg'),
  path.resolve(__dirname, '../../../web/public/images/steps-silk.jpg'),
];

// Crop framings (fraction of max-fit 16:9 window + position within the slack).
// Cycled per plate so adjacent cards never repeat a composition.
const FRAMINGS = [
  { s: 1.0, x: 0.5, y: 0.35 },
  { s: 0.8, x: 0.2, y: 0.45 },
  { s: 0.68, x: 0.75, y: 0.3 },
  { s: 0.88, x: 0.4, y: 0.7 },
  { s: 0.72, x: 0.6, y: 0.55 },
  { s: 0.94, x: 0.85, y: 0.25 },
];

const W = 1280;
const H = 720;
const PAD = 64;

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrap(title: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Ink art card overlay: green-black scrim + hairline ring + kicker + title.
function overlaySvg(title: string): Buffer {
  let lines = wrap(title, 30);
  let fs_ = 56;
  if (lines.length > 2) {
    lines = wrap(title, 38);
    fs_ = 44;
  }
  if (lines.length > 3) {
    lines = lines.slice(0, 3);
    lines[2] = `${lines[2].slice(0, 35)}…`;
  }
  const lh = Math.round(fs_ * 1.18);
  const lastBaseline = H - 56;
  const tspans = lines
    .map((l, i) => {
      const y = lastBaseline - (lines.length - 1 - i) * lh;
      return `<text x="${PAD}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="${fs_}" font-weight="700" fill="#FFFFFF">${esc(l)}</text>`;
    })
    .join('\n    ');
  const eyebrowBaseline = lastBaseline - (lines.length - 1) * lh - fs_ - 26;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="scrim" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#03130B" stop-opacity="0.92"/>
        <stop offset="0.5" stop-color="#03130B" stop-opacity="0.38"/>
        <stop offset="1" stop-color="#03130B" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#scrim)"/>
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="2"/>
    <rect x="${PAD}" y="${eyebrowBaseline - 16}" width="4" height="16" fill="#1AD966"/>
    <text x="${PAD + 16}" y="${eyebrowBaseline}" font-family="Consolas, monospace" font-size="22" letter-spacing="6" fill="#1AD966">NEWERA365</text>
    ${tspans}
  </svg>`;
  return Buffer.from(svg);
}

async function makeThumb(
  plate: string,
  framing: (typeof FRAMINGS)[number],
  title: string,
  out: string,
) {
  const meta = await sharp(plate).metadata();
  const pw = meta.width ?? 0;
  const ph = meta.height ?? 0;
  // Max-fit 16:9 window, scaled by the framing, positioned within the slack.
  const cw0 = Math.min(pw, Math.round(ph * (16 / 9)));
  const cw = Math.round(cw0 * framing.s);
  const ch = Math.round(cw * (9 / 16));
  const left = Math.round((pw - cw) * framing.x);
  const top = Math.round((ph - ch) * framing.y);
  await sharp(plate)
    .extract({ left, top, width: cw, height: ch })
    .resize(W, H)
    .composite([{ input: overlaySvg(title) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
}

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

async function fetchDocs(
  col: string,
  query: string,
): Promise<{ id: number; slug: string; title: string }[]> {
  const res = await fetch(`${CMS}/api/${col}?${query}&locale=en&depth=0&limit=100&sort=createdAt`, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!res.ok) throw new Error(`fetch ${col} → ${res.status}`);
  return (await res.json()).docs ?? [];
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

async function setThumb(col: string, id: number, mediaId: number) {
  const res = await fetch(`${CMS}/api/${col}/${id}?locale=en`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ thumbnail: mediaId }),
  });
  if (!res.ok)
    throw new Error(`patch ${col}/${id} → ${res.status}: ${(await res.text()).slice(0, 140)}`);
}

async function run() {
  for (const p of PLATES) if (!fs.existsSync(p)) throw new Error(`missing plate ${p}`);
  console.log(`→ CMS: ${CMS}`);
  await login();
  console.log(`✅ Authenticated as ${ADMIN_EMAIL}\n`);

  const edu = await fetchDocs(
    'education-content',
    'where[contentType][in][0]=video&where[contentType][in][1]=audio',
  );
  const webinars = await fetchDocs('webinars', 'where[slug][exists]=true');
  const jobs = [
    ...edu.map((d) => ({ col: 'education-content', key: `edu-${d.slug}`, ...d })),
    ...webinars.map((d) => ({ col: 'webinars', key: `webinar-${d.slug}`, ...d })),
  ];
  console.log(`→ ${edu.length} education episodes + ${webinars.length} webinars\n`);

  fs.mkdirSync(ASSETS, { recursive: true });
  const perPlate = [0, 0];
  let done = 0;
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    const plateIdx = i % 2;
    const framing = FRAMINGS[perPlate[plateIdx]++ % FRAMINGS.length];
    const file = path.join(ASSETS, `${j.key}.jpg`);
    await makeThumb(PLATES[plateIdx], framing, j.title, file);
    const mediaId = await uploadMedia(file, j.title);
    await setThumb(j.col, j.id, mediaId);
    console.log(`✅ ${j.col}/${j.slug}: media #${mediaId} → doc #${j.id}`);
    done++;
  }
  console.log(`\n✅ Done — ${done}/${jobs.length} episode thumbnails regenerated.`);
  process.exit(0);
}

run().catch((e) => {
  console.error('\n❌ failed:', e);
  process.exit(1);
});
