/**
 * seed-markets-instruments.ts
 *
 * Backfills the products-instruments collection with the stocks / commodities /
 * etfs that the /markets/[category] watchlist used to show (previously hardcoded
 * as `staticRows` in MarketCategoryPage). Now that those pages render CMS
 * instruments, the CMS must hold the full set — each with a verified TradingView
 * `tvSymbol` so the live chart works exactly as before.
 *
 * Idempotent: skips any instrument whose `symbol` already exists. Safe to re-run.
 *
 * Run (from apps/cms): ts-node --transpile-only src/scripts/seed-markets-instruments.ts
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CMS_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const PASS = process.env.SEED_ADMIN_PASS;
if (!PASS) throw new Error('SEED_ADMIN_PASS must be set — there is no default admin password.');

type Instrument = {
  name: string;
  symbol: string;
  tvSymbol: string;
  assetClass: 'stocks' | 'commodities' | 'etfs';
  spread: number;
  leverage: string;
  contractSize: number;
  tradingHours: string;
  minTradeSize: number;
  pipValue: number;
  spreadIndustry: number;
  spreadStandard: number;
  spreadRaw: number;
  spreadVip: number;
  sortOrder: number;
};

const STOCK = {
  assetClass: 'stocks' as const,
  leverage: '1:20',
  contractSize: 1,
  tradingHours: 'Mon–Fri 14:30–21:00 GMT',
  minTradeSize: 0.1,
  pipValue: 1,
};
const ETF = {
  assetClass: 'etfs' as const,
  leverage: '1:20',
  contractSize: 1,
  tradingHours: 'Mon–Fri 14:30–21:00 GMT',
  minTradeSize: 0.1,
  pipValue: 1,
};
const COMMODITY = {
  assetClass: 'commodities' as const,
  leverage: '1:200',
  contractSize: 1000,
  tradingHours: 'Mon–Fri 01:00–24:00 GMT',
  minTradeSize: 0.1,
  pipValue: 10,
};

// raw = base spread; tiers mirror the existing rows (industry > standard > vip > raw).
const tiers = (raw: number) => ({
  spread: raw,
  spreadRaw: raw,
  spreadVip: +(raw * 1.4).toFixed(4),
  spreadStandard: +(raw * 1.8).toFixed(4),
  spreadIndustry: +(raw * 3).toFixed(4),
});

const INSTRUMENTS: Instrument[] = [
  // ── Stocks (existing CMS: AAPL.US, TSLA.US, MSFT.US) ──
  {
    ...STOCK,
    name: 'Amazon.com',
    symbol: 'AMZN.US',
    tvSymbol: 'NASDAQ:AMZN',
    sortOrder: 43,
    ...tiers(0.1),
  },
  {
    ...STOCK,
    name: 'NVIDIA Corp.',
    symbol: 'NVDA.US',
    tvSymbol: 'NASDAQ:NVDA',
    sortOrder: 44,
    ...tiers(0.2),
  },
  {
    ...STOCK,
    name: 'Alphabet Inc.',
    symbol: 'GOOGL.US',
    tvSymbol: 'NASDAQ:GOOGL',
    sortOrder: 45,
    ...tiers(0.1),
  },
  // ── Commodities (existing CMS: XAUUSD, XAGUSD, USOIL) ──
  {
    ...COMMODITY,
    name: 'Brent Crude',
    symbol: 'UKOIL',
    tvSymbol: 'TVC:UKOIL',
    sortOrder: 13,
    ...tiers(0.04),
  },
  {
    ...COMMODITY,
    name: 'Natural Gas',
    symbol: 'NATGAS',
    tvSymbol: 'OANDA:NATGASUSD',
    sortOrder: 14,
    ...tiers(0.005),
  },
  {
    ...COMMODITY,
    name: 'Copper',
    symbol: 'XCUUSD',
    tvSymbol: 'OANDA:XCUUSD',
    sortOrder: 15,
    ...tiers(0.02),
  },
  // ── ETFs (existing CMS: SPY.US, IWRD.UK) ──
  {
    ...ETF,
    name: 'Invesco QQQ ETF',
    symbol: 'QQQ.US',
    tvSymbol: 'NASDAQ:QQQ',
    sortOrder: 51,
    ...tiers(0.05),
  },
  {
    ...ETF,
    name: 'SPDR Gold Shares',
    symbol: 'GLD.US',
    tvSymbol: 'AMEX:GLD',
    sortOrder: 52,
    ...tiers(0.1),
  },
  {
    ...ETF,
    name: 'iShares 20Y Treasury Bond',
    symbol: 'TLT.US',
    tvSymbol: 'NASDAQ:TLT',
    sortOrder: 53,
    ...tiers(0.05),
  },
  {
    ...ETF,
    name: 'iShares MSCI Emerging Markets',
    symbol: 'EEM.US',
    tvSymbol: 'AMEX:EEM',
    sortOrder: 54,
    ...tiers(0.05),
  },
  {
    ...ETF,
    name: 'Energy Select Sector ETF',
    symbol: 'XLE.US',
    tvSymbol: 'AMEX:XLE',
    sortOrder: 55,
    ...tiers(0.05),
  },
];

async function main() {
  console.log(`🔗 CMS: ${CMS_URL}  (admin: ${EMAIL})`);
  const loginRes = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  if (!loginRes.ok)
    throw new Error(`Login failed (${loginRes.status}). Set SEED_ADMIN_EMAIL/PASS.`);
  const { token } = (await loginRes.json()) as { token: string };
  const headers = { 'Content-Type': 'application/json', Authorization: `JWT ${token}` };

  let created = 0;
  let skipped = 0;
  let failed = 0;
  for (const inst of INSTRUMENTS) {
    const existing = await fetch(
      `${CMS_URL}/api/products-instruments?where[symbol][equals]=${encodeURIComponent(inst.symbol)}&limit=1`,
      { headers },
    ).then((r) => r.json() as Promise<{ totalDocs: number }>);
    if (existing.totalDocs > 0) {
      console.log(`   ⏭️  ${inst.symbol} — already exists`);
      skipped++;
      continue;
    }
    const res = await fetch(`${CMS_URL}/api/products-instruments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...inst, usesMT5Data: false, status: 'active' }),
    });
    if (res.ok) {
      console.log(`   ✅ ${inst.symbol.padEnd(8)} ${inst.name}  (${inst.tvSymbol})`);
      created++;
    } else {
      console.error(`   ❌ ${inst.symbol}: ${res.status} ${await res.text()}`);
      failed++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ ${created} created  ⏭️  ${skipped} existing  ❌ ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
