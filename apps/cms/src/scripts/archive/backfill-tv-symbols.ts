/**
 * backfill-tv-symbols.ts
 *
 * Populates products_instruments.tv_symbol with the exact TradingView chart
 * symbol (EXCHANGE:SYMBOL) for each existing instrument, matched by `symbol`.
 *
 * Why: the Markets pages render a TradingView chart per instrument. Without an
 * exact, CMS-managed symbol the old code guessed a prefix (e.g. OANDA:AAPL,
 * AMEX:QQQ) and TradingView showed "This symbol doesn't exist". Every value
 * below is verified against TradingView's symbol search.
 *
 * Idempotent — safe to re-run. Only updates rows whose tv_symbol differs, so it
 * never clobbers an editor's manual override with the same value.
 *
 * Prereq: run migrate-missing-columns.ts first so the tv_symbol column exists.
 * Connects via the DIRECT Neon endpoint (not the pooler), like the sibling
 * migration script.
 *
 * Run: ts-node --transpile-only src/scripts/backfill-tv-symbols.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

// symbol (CMS lookup key) → exact TradingView symbol. Keep in sync with the
// TV_SYMBOLS map in seed.ts.
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

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  const poolerUrl = process.env.DATABASE_URL ?? '';
  const direct = poolerUrl.replace(/-pooler\./, '.');
  if (direct === poolerUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      '[backfill] DATABASE_URL has no "-pooler" host segment — using it as-is. ' +
        'Set DATABASE_URL_DIRECT to be explicit.',
    );
  }
  return direct;
}

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  const connectionString = getDirectConnectionString();
  console.log('🔗 Connecting to Neon (direct endpoint)...');
  console.log(`   ${connectionString.replace(/:([^:@]+)@/, ':***@')}\n`);

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });

  await client.connect();
  console.log('✅ Connected\n');

  let updated = 0;
  let unchanged = 0;
  let missing = 0;

  for (const [symbol, tvSymbol] of Object.entries(TV_SYMBOLS)) {
    // Only write when the value actually changes — keeps the run idempotent and
    // avoids touching rows an editor may have customised to the same value.
    const res = await client.query(
      `UPDATE products_instruments
         SET tv_symbol = $1
       WHERE symbol = $2
         AND (tv_symbol IS DISTINCT FROM $1)`,
      [tvSymbol, symbol],
    );
    if (res.rowCount && res.rowCount > 0) {
      console.log(`   ✅ ${symbol.padEnd(9)} → ${tvSymbol}`);
      updated += res.rowCount;
    } else {
      // Either already correct, or the instrument isn't in the DB.
      const exists = await client.query(`SELECT 1 FROM products_instruments WHERE symbol = $1`, [
        symbol,
      ]);
      if (exists.rowCount && exists.rowCount > 0) {
        console.log(`   ⏭️  ${symbol.padEnd(9)} — already ${tvSymbol}`);
        unchanged++;
      } else {
        console.log(`   ⚠️  ${symbol.padEnd(9)} — no row with this symbol (skipped)`);
        missing++;
      }
    }
  }

  // Surface any active instruments still missing a tv_symbol so they can be
  // filled in via the admin UI.
  const gaps = await client.query(
    `SELECT symbol FROM products_instruments
     WHERE status = 'active' AND (tv_symbol IS NULL OR tv_symbol = '')
     ORDER BY symbol`,
  );

  await client.end();

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ ${updated} updated   ⏭️  ${unchanged} already set   ⚠️  ${missing} not found`);
  if (gaps.rowCount && gaps.rowCount > 0) {
    console.log(
      `\n⚠️  ${gaps.rowCount} active instrument(s) still have no tvSymbol — set them in the admin:`,
    );
    console.log(`   ${gaps.rows.map((r) => r.symbol).join(', ')}`);
  }
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
