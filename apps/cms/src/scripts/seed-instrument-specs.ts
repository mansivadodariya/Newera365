/**
 * seed-instrument-specs.ts
 *
 * Client-feedback round 2 (#8 detailed trading specifications): backfills
 * per-instrument specification fields (contractSize, marginRequirement,
 * tradingHours, swapLong, swapShort, minTradeSize) with broker-standard
 * INDICATIVE defaults per asset class, so the new spec panel on
 * /markets/[category] renders real content instead of dashes.
 *
 * Only fills fields that are currently NULL — never overwrites editor-set
 * values. All values are indicative placeholders for review at handoff.
 *
 * Dry-run by default; pass APPLY=1 to write.
 * Run: APPLY=1 ts-node --transpile-only src/scripts/seed-instrument-specs.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

interface SpecDefaults {
  contractSize: number;
  marginRequirement: number;
  tradingHours: string;
  swapLong: number;
  swapShort: number;
  minTradeSize: number;
}

// Indicative broker-standard values per asset class (points/day for swaps,
// % for margin, units per standard lot for contract size).
const DEFAULTS: Record<string, SpecDefaults> = {
  forex: {
    contractSize: 100_000,
    marginRequirement: 0.2,
    tradingHours: 'Mon 00:05 – Fri 23:55 (server time)',
    swapLong: -6.5,
    swapShort: 1.2,
    minTradeSize: 0.01,
  },
  indices: {
    contractSize: 10,
    marginRequirement: 1,
    tradingHours: 'Mon–Fri 01:00 – 23:00 (server time)',
    swapLong: -3.8,
    swapShort: -2.1,
    minTradeSize: 0.1,
  },
  commodities: {
    contractSize: 1_000,
    marginRequirement: 1,
    tradingHours: 'Mon–Fri 01:00 – 23:00 (server time)',
    swapLong: -4.2,
    swapShort: -1.8,
    minTradeSize: 0.01,
  },
  stocks: {
    contractSize: 1,
    marginRequirement: 5,
    tradingHours: 'Mon–Fri 16:30 – 23:00 (server time)',
    swapLong: -2.5,
    swapShort: -2.5,
    minTradeSize: 1,
  },
  etfs: {
    contractSize: 1,
    marginRequirement: 5,
    tradingHours: 'Mon–Fri 16:30 – 23:00 (server time)',
    swapLong: -2.5,
    swapShort: -2.5,
    minTradeSize: 1,
  },
  crypto: {
    contractSize: 1,
    marginRequirement: 10,
    tradingHours: '24/7',
    swapLong: -15,
    swapShort: -15,
    minTradeSize: 0.01,
  },
};

const SPEC_KEYS: (keyof SpecDefaults)[] = [
  'contractSize',
  'marginRequirement',
  'tradingHours',
  'swapLong',
  'swapShort',
  'minTradeSize',
];

async function run() {
  const apply = process.env.APPLY === '1';
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  const res = await payload.find({
    collection: 'products-instruments',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  console.log(
    `Mode: ${apply ? 'APPLY (will write)' : 'DRY RUN (no changes)'} — ${res.docs.length} instruments\n`,
  );

  let patched = 0;
  for (const doc of res.docs as unknown as Record<string, unknown>[]) {
    const assetClass = String(doc.assetClass ?? '');
    const defaults = DEFAULTS[assetClass];
    if (!defaults) {
      console.warn(`  ⚠ ${doc.symbol}: unknown asset class "${assetClass}" — skipped`);
      continue;
    }
    const patch: Record<string, unknown> = {};
    for (const key of SPEC_KEYS) {
      if (doc[key] == null) patch[key] = defaults[key];
    }
    if (Object.keys(patch).length === 0) continue;
    console.log(`  • ${doc.symbol} (${assetClass}): fill ${Object.keys(patch).join(', ')}`);
    if (apply) {
      await payload.update({
        collection: 'products-instruments',
        id: doc.id as number,
        data: patch,
        overrideAccess: true,
      });
    }
    patched += 1;
  }

  console.log(
    `\n${apply ? '✅ Backfilled' : '🔎 Would backfill'} spec fields on ${patched} instruments (null fields only; values are indicative — review at handoff).`,
  );
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-instrument-specs failed:', err);
  process.exit(1);
});
