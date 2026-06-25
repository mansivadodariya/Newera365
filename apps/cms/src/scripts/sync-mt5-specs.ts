/* eslint-disable no-console */
// Syncs real instrument specs (broker symbol + swaps) from the MT5 Manager Web
// API into products-instruments. Live ticks are not yet enabled on the manager
// login (NE-003), so this syncs the daily-stable specs only — bid/ask stay
// CMS-manual. Dry-run by default; pass --apply to write.
//
//   npx ts-node --transpile-only src/scripts/sync-mt5-specs.ts          (dry run)
//   npx ts-node --transpile-only src/scripts/sync-mt5-specs.ts --apply  (write)
//
// MT5 creds are read from apps/mt5-service/.env; DATABASE_URL from apps/cms/.env.
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { Mt5WebApiClient } from '../mt5/webApiClient';

function loadEnv(p: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const APPLY = process.argv.includes('--apply');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const cmsEnv = loadEnv(path.join(__dirname, '..', '..', '.env'));
const mtEnv = loadEnv(path.join(__dirname, '..', '..', '..', 'mt5-service', '.env'));

// Candidate broker-symbol names to probe per instrument. The broker names are
// inconsistent (forex=EURUSD.r, metals=XAUUSD bare), so we try the likely forms.
function candidates(symbol: string, _assetClass: string): string[] {
  const base = symbol.replace(/\.(US|UK)$/i, '');
  const out: string[] = [];
  const add = (s: string) => {
    if (s && !out.includes(s)) out.push(s);
  };
  add(symbol);
  add(`${symbol}.r`);
  add(base);
  add(`${base}.r`);
  add(`${base}.US`);
  add(`#${base}`);
  return out;
}

async function main(): Promise<void> {
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const client = new Mt5WebApiClient({
    host: mtEnv.MT5_HOST,
    port: Number(mtEnv.MT5_PORT || 443),
    login: mtEnv.MT5_LOGIN,
    password: mtEnv.MT5_PASSWORD,
    certSha256: mtEnv.MT5_CERT_SHA256 || undefined,
  });
  if (!mtEnv.MT5_LOGIN || !mtEnv.MT5_PASSWORD)
    throw new Error('MT5_LOGIN/MT5_PASSWORD missing in apps/mt5-service/.env');

  const db = new pg.Client({
    connectionString: cmsEnv.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();
  const rows = (
    await db.query(
      'select symbol, "assetClass" ac from products_instruments order by "assetClass", symbol',
    )
  ).rows;

  console.log(`Probing MT5 for ${rows.length} instruments (${APPLY ? 'APPLY' : 'DRY RUN'})…\n`);
  const resolved: Array<{
    symbol: string;
    broker: string;
    swapL: number | null;
    swapS: number | null;
    mode: string;
  }> = [];
  const unresolved: string[] = [];

  for (const { symbol, ac } of rows) {
    let hit: { broker: string; cfg: Record<string, unknown> } | null = null;
    for (const cand of candidates(symbol, ac)) {
      // Retry transient 504/timeout (a throw) up to 3x; retcode 13 "Not found"
      // returns normally and just falls through to the next candidate.
      let res: Awaited<ReturnType<typeof client.getRaw>> | null = null;
      for (let attempt = 0; attempt < 3 && !res; attempt++) {
        try {
          res = await client.getRaw(`/api/symbol/get?symbol=${encodeURIComponent(cand)}`);
        } catch {
          await sleep(300);
        }
      }
      if (res && String(res.retcode ?? '').startsWith('0') && res.answer) {
        hit = { broker: cand, cfg: res.answer as Record<string, unknown> };
        break;
      }
    }
    if (!hit) {
      unresolved.push(symbol);
      console.log(`  ${symbol.padEnd(12)} ${String(ac).padEnd(11)} -> UNRESOLVED`);
      continue;
    }
    const swapL = num(hit.cfg.SwapLong);
    const swapS = num(hit.cfg.SwapShort);
    const mode = String(hit.cfg.SwapMode ?? '?');
    resolved.push({ symbol, broker: hit.broker, swapL, swapS, mode });
    console.log(
      `  ${symbol.padEnd(12)} ${String(ac).padEnd(11)} -> ${hit.broker.padEnd(12)} swapL=${swapL} swapS=${swapS} (SwapMode=${mode})`,
    );
  }

  console.log(
    `\nResolved ${resolved.length}/${rows.length}. Unresolved: ${unresolved.join(', ') || 'none'}`,
  );

  if (!APPLY) {
    console.log(
      '\nDRY RUN — no changes written. Re-run with --apply to persist mt5_symbol + swap_rate_long/short.',
    );
    await db.end();
    return;
  }

  let updated = 0;
  for (const r of resolved) {
    await db.query(
      'update products_instruments set mt5_symbol=$1, swap_rate_long=$2, swap_rate_short=$3 where symbol=$4',
      [r.broker, r.swapL, r.swapS, r.symbol],
    );
    updated++;
  }
  console.log(`\nAPPLIED — updated ${updated} instruments (mt5_symbol + real swaps).`);
  await db.end();
}

main().catch((e) => {
  console.error('sync failed:', e);
  process.exit(1);
});
