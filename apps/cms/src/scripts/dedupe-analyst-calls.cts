/**
 * dedupe-analyst-calls.ts
 *
 * Removes duplicate rows from the `analyst_calls` table. The AnalystCalls
 * collection has no unique field, and the seed helper (`createDoc`) does a plain
 * POST, so every re-run of `seedAnalystCalls` inserts a fresh set of rows. The
 * seed was run against the shared Neon DB more than once, leaving 2–3 copies of
 * every call — which the Analyst Chart page (/research/analyst-chart) renders as
 * each pair appearing multiple times.
 *
 * Fix: keep the lowest `id` per `symbol` and delete the rest. Idempotent — a
 * second run deletes nothing. Transactional, with before/after counts. Set
 * DRY_RUN=1 to print the duplicate report and roll back without deleting.
 *
 * Connects via the DIRECT Neon endpoint (PgBouncer session-mode restrictions
 * don't apply there), matching migrate-analyst-calls-table.ts.
 *
 * `.cts` so Node 24 runs it directly (native TS type-stripping, CommonJS) —
 * ts-node is broken on Node 24 in this repo.
 *
 * Run (from apps/cms):  node src/scripts/dedupe-analyst-calls.cts
 *           dry-run:    DRY_RUN=1 node src/scripts/dedupe-analyst-calls.cts
 */

const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  const poolerUrl = process.env.DATABASE_URL ?? '';
  return poolerUrl.replace(/-pooler\./, '.');
}

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

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

  try {
    await client.query('BEGIN');

    const before = await client.query<{ symbol: string; copies: string }>(
      `SELECT symbol, COUNT(*)::text AS copies
         FROM analyst_calls
        GROUP BY symbol
        ORDER BY symbol;`,
    );
    console.log('📊 Rows per symbol (before):');
    for (const r of before.rows) console.log(`   ${r.symbol.padEnd(10)} ${r.copies}`);
    const totalBefore = before.rows.reduce((n, r) => n + Number(r.copies), 0);
    const dupes = before.rows.reduce((n, r) => n + (Number(r.copies) - 1), 0);
    console.log(`   → ${totalBefore} rows total, ${dupes} duplicate(s) to remove\n`);

    // Keep the lowest id per symbol; delete every higher-id copy.
    const del = await client.query(
      `DELETE FROM analyst_calls a
             USING analyst_calls b
             WHERE a.symbol = b.symbol
               AND a.id > b.id;`,
    );
    console.log(`🗑️  Deleted ${del.rowCount} duplicate row(s)`);

    const after = await client.query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM analyst_calls;`);
    console.log(`📊 Rows total (after): ${after.rows[0]?.n}\n`);

    if (dryRun) {
      await client.query('ROLLBACK');
      console.log('🔙 DRY_RUN — rolled back, no changes committed.');
    } else {
      await client.query('COMMIT');
      console.log('✅ Committed — analyst_calls de-duplicated.');
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Rolled back. Error:', err instanceof Error ? err.message : err);
    await client.end();
    process.exit(1);
  }

  await client.end();
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
