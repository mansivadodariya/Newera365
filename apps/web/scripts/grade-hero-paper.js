/* Ink-on-paper grade for the light hero plate.
   Model: the dark master is light EMISSION on black; the light plate is ink
   ABSORPTION on paper. Per pixel: emission intensity -> ink alpha (gamma'd so
   faint glow dissolves into paper the way it dissolved into black), pixel hue
   kept, lightness remapped to ink density, saturation restored (screen bloom
   desaturates), composited over the site paper #F2F5F3.

   Run from apps/web: node scripts/grade-hero-paper.js
   If the output changes, RENAME it (next/image + CDN caches stale-serve same names). */
const path = require('path');
const sharp = require('sharp');

const IMAGES = path.join(__dirname, '..', 'public', 'images');
const SRC = path.join(IMAGES, 'hero-terminal-macro.jpg');
const OUT = process.argv[2] || path.join(IMAGES, 'hero-terminal-paper.jpg');

// tunables
const T0 = parseFloat(process.env.T0 ?? '0.075'); // emission floor -> pure paper
const K = parseFloat(process.env.K ?? '0.55'); // emission knee -> full ink (mid-glow reads strong on paper)
const GAMMA = parseFloat(process.env.GAMMA ?? '1.0'); // halo falloff into paper
const AMAX = parseFloat(process.env.AMAX ?? '0.95'); // max ink density
const SATBOOST = parseFloat(process.env.SATBOOST ?? '1.80');
const LMIN = parseFloat(process.env.LMIN ?? '0.20'); // neutral ink lightness
const LSPAN = parseFloat(process.env.LSPAN ?? '0.22'); // + for saturated ink
// hue-targeted trims (client 2026-07-08: greens lighter, reds quieter)
const GREEN_L = parseFloat(process.env.GREEN_L ?? '0.13'); // + ink lightness on greens
const RED_SAT = parseFloat(process.env.RED_SAT ?? '0.75'); // x saturation on reds
const RED_A = parseFloat(process.env.RED_A ?? '0.85'); // x ink density on reds
const PAPER = [242, 245, 243];

function rgb2hsl(r, g, b) {
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}
function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
function hsl2rgb(h, s, l) {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

(async () => {
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 3);

  // emission percentiles (diagnostics for T0)
  const hist = new Uint32Array(256);
  for (let i = 0; i < data.length; i += channels) {
    hist[Math.max(data[i], data[i + 1], data[i + 2])]++;
  }
  const total = width * height;
  let acc = 0;
  const pct = {};
  for (let v = 0, want = [50, 70, 85, 95], wi = 0; v < 256 && wi < want.length; v++) {
    acc += hist[v];
    while (wi < want.length && acc / total >= want[wi] / 100) {
      pct['p' + want[wi]] = v / 255;
      wi++;
    }
  }
  console.log('emission percentiles', JSON.stringify(pct), 'params', {
    T0,
    GAMMA,
    AMAX,
    SATBOOST,
    LMIN,
    LSPAN,
  });

  for (let i = 0, o = 0; i < data.length; i += channels, o += 3) {
    const r = data[i] / 255,
      g = data[i + 1] / 255,
      b = data[i + 2] / 255;
    const a0 = Math.max(r, g, b);
    let alpha = (a0 - T0) / (K - T0);
    if (alpha <= 0) {
      out[o] = PAPER[0];
      out[o + 1] = PAPER[1];
      out[o + 2] = PAPER[2];
      continue;
    }
    alpha = Math.pow(Math.min(1, alpha), GAMMA) * AMAX;
    const [h, s] = rgb2hsl(r, g, b);
    let s2 = Math.min(1, s * SATBOOST);
    if (s < 0.1) s2 *= s / 0.1; // near-neutrals: fade hue noise toward neutral ink
    // feathered hue masks so blurred hue gradients don't band
    const wG =
      h < 0.19 || h > 0.5 ? 0 : h < 0.24 ? (h - 0.19) / 0.05 : h > 0.45 ? (0.5 - h) / 0.05 : 1;
    const wR =
      h <= 0.03
        ? 1
        : h < 0.06
          ? (0.06 - h) / 0.03
          : h >= 0.97
            ? 1
            : h > 0.92
              ? (h - 0.92) / 0.05
              : 0;
    s2 *= 1 - (1 - RED_SAT) * wR;
    alpha *= 1 - (1 - RED_A) * wR;
    const lInk = LMIN + LSPAN * s2 + GREEN_L * wG;
    const [ir, ig, ib] = hsl2rgb(h, s2, lInk);
    out[o] = Math.round(((PAPER[0] / 255) * (1 - alpha) + ir * alpha) * 255);
    out[o + 1] = Math.round(((PAPER[1] / 255) * (1 - alpha) + ig * alpha) * 255);
    out[o + 2] = Math.round(((PAPER[2] / 255) * (1 - alpha) + ib * alpha) * 255);
  }

  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
    .toFile(OUT);
  console.log('wrote', OUT, width + 'x' + height);
})();
