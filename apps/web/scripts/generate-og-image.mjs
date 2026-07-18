// Generates the social share image (og:image / twitter card) at
// public/og-image.jpg, 1200x630. Composites the hero ink plate with a
// legibility veil, the white wordmark, an accent tick, and the tagline,
// following DESIGN.md (full-bleed ink plate, accent #00B050, no em dashes).
//
// Regenerate:  node apps/web/scripts/generate-og-image.mjs
// This is a dev-supplied default. The client brand team may replace the
// output asset without touching this script or the metadata wiring.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// sharp lives in the cms workspace; resolve it from there regardless of hoisting.
const require = createRequire(resolve(process.cwd(), 'apps/cms/package.json'));
const sharp = require('sharp');

const PUB = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const W = 1200;
const H = 630;
const ACCENT = '#00B050';

// 1. Hero plate, cover-cropped to the og aspect.
const plate = await sharp(resolve(PUB, 'images/hero-signal-peak.jpg'))
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .toBuffer();

// 2. Legibility veil: a start-side scrim behind the copy plus a slight overall
//    darken so the white wordmark and tagline stay crisp over the glow.
const veil = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#020704" stop-opacity="0.82"/>
        <stop offset="0.55" stop-color="#020704" stop-opacity="0.42"/>
        <stop offset="1" stop-color="#020704" stop-opacity="0.18"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#020704" fill-opacity="0.28"/>
    <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  </svg>`,
);

// 3. White wordmark on transparent (the header's dark-mode logo), sized to a
//    comfortable height. Native 266x52.
const LOGO_H = 58;
const logo = await sharp(resolve(PUB, 'images/logo-dark.png'))
  .resize({ height: LOGO_H })
  .toBuffer();
const logoMeta = await sharp(logo).metadata();
const LOGO_W = logoMeta.width ?? LOGO_H;

const PAD = 90;
const logoTop = 132;

// 4. Copy block: accent tick + eyebrow, headline, tagline.
const textTop = logoTop + LOGO_H + 70;
const copy = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .eyebrow { font-family: 'Segoe UI', Arial, sans-serif; font-size: 22px; font-weight: 600; letter-spacing: 3px; fill: #57e08a; }
      .headline { font-family: 'Segoe UI', Arial, sans-serif; font-size: 66px; font-weight: 700; fill: #ffffff; }
      .tagline { font-family: 'Segoe UI', Arial, sans-serif; font-size: 30px; font-weight: 400; fill: rgba(255,255,255,0.80); }
    </style>
    <rect x="${PAD}" y="${textTop - 4}" width="34" height="4" rx="2" fill="${ACCENT}"/>
    <text x="${PAD + 48}" y="${textTop + 12}" class="eyebrow">FOREX AND CFD TRADING</text>
    <text x="${PAD}" y="${textTop + 90}" class="headline">Trade the markets</text>
    <text x="${PAD}" y="${textTop + 160}" class="headline">with precision.</text>
    <text x="${PAD}" y="${textTop + 224}" class="tagline">Tight spreads. Fast MT5 execution. English and Arabic.</text>
  </svg>`,
);

await sharp(plate)
  .composite([
    { input: veil, top: 0, left: 0 },
    { input: logo, top: logoTop, left: PAD },
    { input: copy, top: 0, left: 0 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(resolve(PUB, 'og-image.jpg'));

console.log(`Wrote public/og-image.jpg (${W}x${H}), logo ${LOGO_W}x${LOGO_H}`);
