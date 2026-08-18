/* Generates 4K TradingView-style terminal chart images (light + dark) for the
   hero panel. Deterministic (seeded RNG). Run from apps/web: node scripts/generate-hero-terminal.js

   IMPORTANT: after regenerating, bump TERMINAL_V in
   packages/ui/src/components/HeroMarketPanel.tsx — the file names never
   change, so caches (browser + Next image optimizer) serve stale bytes
   otherwise.

   Transparent background — the hero renders these borderless with a CSS edge
   fade, so only the chart elements themselves are painted. Feature sizes
   (candle width, stroke, font) are tuned for a ~900px display slot: at 3840px
   source that's ~4.3x, so a 4.5px wick reads as a crisp 1px line on screen. */
const sharp = require('sharp');
const path = require('path');

const W = 3840;
const H = 2160;
const AXIS_W = 250; // right price-scale strip
const CHART_W = W - AXIS_W;
const PRICE_MIN = 335;
const PRICE_MAX = 562;
const PAD_TOP = 60;
const PAD_BOT = 40;

const y = (p) => PAD_TOP + ((PRICE_MAX - p) / (PRICE_MAX - PRICE_MIN)) * (H - PAD_TOP - PAD_BOT);

// mulberry32 seeded RNG
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Piecewise-linear price path shaped like the reference screenshot:
// rise → peak → choppy decline to a bottom → session gap → strong rally.
const KEYS = [
  [0.0, 438],
  [0.06, 425],
  [0.12, 455],
  [0.2, 480],
  [0.27, 505],
  [0.31, 470],
  [0.36, 445],
  [0.4, 478],
  [0.44, 468],
  [0.48, 430],
  [0.52, 405],
  [0.56, 385],
  [0.6, 368],
  [0.635, 374],
  // gap up after the divider
  [0.66, 428],
  [0.72, 452],
  [0.78, 466],
  [0.84, 482],
  [0.9, 498],
  [0.95, 510],
  [0.985, 518],
];
function pathPrice(t) {
  for (let i = 1; i < KEYS.length; i++) {
    if (t <= KEYS[i][0]) {
      const [t0, p0] = KEYS[i - 1];
      const [t1, p1] = KEYS[i];
      return p0 + ((t - t0) / (t1 - t0)) * (p1 - p0);
    }
  }
  return KEYS[KEYS.length - 1][1];
}

const N = 118;
const rand = rng(42);
const candles = [];
let prevClose = pathPrice(0);
for (let i = 0; i < N; i++) {
  const t = i / (N - 1);
  if (t > 0.628 && t < 0.662) continue; // blank space around the divider
  const base = pathPrice(t);
  const close = base + (rand() - 0.5) * 10;
  const open = Math.abs(t - 0.665) < 0.012 ? close + (rand() - 0.5) * 4 : prevClose;
  const hi = Math.max(open, close) + rand() * 5;
  const lo = Math.min(open, close) - rand() * 5;
  const vol = 0.15 + rand() * 0.5 + (rand() > 0.93 ? rand() * 0.55 : 0);
  candles.push({ t, open, close, hi, lo, vol });
  prevClose = close;
}
// Final isolated pre-market spike (big red candle, gapped above the rally)
candles.push({ t: 1.0, open: 552, close: 531.5, hi: 554.5, lo: 529, vol: 0.95 });

/* Candle colors deliberately vivid (brand green + saturated red) — muted
   TradingView teals washed out at hero size (client feedback). */
const THEMES = {
  light: {
    bg: '#ffffff',
    grid: 'rgba(42,46,57,0.08)',
    axisLine: 'rgba(42,46,57,0.16)',
    text: '#5f6672',
    up: '#00b050',
    down: '#f6465d',
    volUp: 'rgba(0,176,80,0.42)',
    volDown: 'rgba(246,70,93,0.42)',
    crosshair: '#9598a1',
    crossTag: '#131722',
    crossTagText: '#ffffff',
  },
  dark: {
    // A hair lighter than the page's near-black so the faded panel still
    // reads as a surface, mirroring white-over-green in the light theme.
    bg: '#0c0e12',
    grid: 'rgba(255,255,255,0.08)',
    axisLine: 'rgba(255,255,255,0.16)',
    text: '#9aa2ac',
    up: '#1ad966',
    down: '#ff5b6c',
    volUp: 'rgba(26,217,102,0.45)',
    volDown: 'rgba(255,91,108,0.45)',
    crosshair: 'rgba(255,255,255,0.4)',
    crossTag: '#363a45',
    crossTagText: '#ffffff',
  },
};

function buildSvg(c) {
  const s = [];
  s.push(
    `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, Helvetica, sans-serif">`,
  );
  s.push(`<rect width="${W}" height="${H}" fill="${c.bg}"/>`);

  // horizontal grid + price labels every 10
  for (let p = 340; p <= 550; p += 10) {
    const yy = y(p);
    s.push(
      `<line x1="0" y1="${yy}" x2="${CHART_W}" y2="${yy}" stroke="${c.grid}" stroke-width="3"/>`,
    );
    s.push(
      `<text x="${CHART_W + 34}" y="${yy + 16}" font-size="46" fill="${c.text}">${p.toFixed(2)}</text>`,
    );
  }
  // vertical grid
  for (let i = 1; i < 14; i++) {
    const xx = (CHART_W / 14) * i;
    s.push(`<line x1="${xx}" y1="0" x2="${xx}" y2="${H}" stroke="${c.grid}" stroke-width="3"/>`);
  }
  // price-scale separator
  s.push(
    `<line x1="${CHART_W}" y1="0" x2="${CHART_W}" y2="${H}" stroke="${c.axisLine}" stroke-width="3"/>`,
  );

  // crosshair pair — vertical + horizontal dashed lines meeting at a cursor
  // point ON the rally (upper-right), like a real chart cursor. Deliberately
  // off-center: a symmetric center cross read badly (client feedback).
  const CROSS_T = 0.86;
  const crossPrice = 487.94;
  const gx = CROSS_T * CHART_W;
  const cy = y(crossPrice);
  s.push(
    `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" stroke="${c.crosshair}" stroke-width="3" stroke-dasharray="12 14"/>`,
  );
  s.push(
    `<line x1="0" y1="${cy}" x2="${CHART_W}" y2="${cy}" stroke="${c.crosshair}" stroke-width="3" stroke-dasharray="12 14"/>`,
  );
  s.push(
    `<rect x="${CHART_W + 6}" y="${cy - 40}" width="${AXIS_W - 14}" height="80" rx="10" fill="${c.crossTag}"/>`,
  );
  s.push(
    `<text x="${CHART_W + 34}" y="${cy + 17}" font-size="44" font-weight="bold" fill="${c.crossTagText}">${crossPrice.toFixed(2)}</text>`,
  );

  // volume bars (bottom band)
  const VOL_MAX_H = 280;
  const bw = (CHART_W / (N + 4)) * 0.62;
  for (const k of candles) {
    const xx = k.t * (CHART_W - bw * 2) + bw;
    const up = k.close >= k.open;
    const vh = k.vol * VOL_MAX_H;
    s.push(
      `<rect x="${(xx - bw / 2).toFixed(1)}" y="${(H - PAD_BOT - vh).toFixed(1)}" width="${bw.toFixed(1)}" height="${vh.toFixed(1)}" fill="${up ? c.volUp : c.volDown}"/>`,
    );
  }
  // volume tag bottom-right
  s.push(
    `<rect x="${CHART_W + 6}" y="${H - PAD_BOT - 110}" width="${AXIS_W - 14}" height="76" rx="10" fill="${c.down}"/>`,
  );
  s.push(
    `<text x="${CHART_W + 30}" y="${H - PAD_BOT - 58}" font-size="42" font-weight="bold" fill="#ffffff">51.62M</text>`,
  );

  // candles
  for (const k of candles) {
    const xx = k.t * (CHART_W - bw * 2) + bw;
    const up = k.close >= k.open;
    const col = up ? c.up : c.down;
    const top = y(Math.max(k.open, k.close));
    const bot = y(Math.min(k.open, k.close));
    s.push(
      `<line x1="${xx.toFixed(1)}" y1="${y(k.hi).toFixed(1)}" x2="${xx.toFixed(1)}" y2="${y(k.lo).toFixed(1)}" stroke="${col}" stroke-width="4.5"/>`,
    );
    s.push(
      `<rect x="${(xx - bw / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(bot - top, 5).toFixed(1)}" fill="${col}"/>`,
    );
  }

  // pre-market dotted levels + tags (orange 538.50, red 533.50) — drawn after
  // the candles so the tags sit on top of the final pre-market spike
  for (const [price, color, label] of [
    [538.5, '#f89e4f', 'Pre 538.50'],
    [533.5, '#f23645', '533.50'],
  ]) {
    const yy = y(price);
    s.push(
      `<line x1="0" y1="${yy}" x2="${CHART_W}" y2="${yy}" stroke="${color}" stroke-width="3.5" stroke-dasharray="4 12" opacity="0.85"/>`,
    );
    const w = label.length > 7 ? 336 : AXIS_W - 14;
    const rx = CHART_W - (w - (AXIS_W - 8));
    s.push(`<rect x="${rx}" y="${yy - 38}" width="${w}" height="76" rx="10" fill="${color}"/>`);
    s.push(
      `<text x="${rx + 30}" y="${yy + 16}" font-size="42" font-weight="bold" fill="#ffffff">${label}</text>`,
    );
  }

  // "Vol 22.23M" header, top-left
  s.push(`<text x="40" y="92" font-size="48" fill="${c.text}">Vol</text>`);
  s.push(`<text x="142" y="92" font-size="48" fill="${c.up}">22.23M</text>`);

  s.push('</svg>');
  return s.join('\n');
}

(async () => {
  const outDir = path.join(__dirname, '../public/images');
  for (const [name, theme] of Object.entries(THEMES)) {
    const svg = buildSvg(theme);
    const out = path.join(outDir, `hero-terminal-${name}.png`);
    // Rasterize the 4K vector, then lanczos-downscale to exactly 2x the max
    // display slot (~860 CSS px). Served unoptimized, so the browser does a
    // single clean 2:1 (or 1:1 on retina) scale — going straight from 3840
    // through the image optimizer is what made the chart look soft.
    await sharp(Buffer.from(svg))
      .resize(1720, null, { kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toFile(out);
    const { size } = require('fs').statSync(out);
    console.log(out, (size / 1024).toFixed(0) + 'KB');
  }
})();
