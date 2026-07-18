/**
 * patch-legal-risk-warning.ts
 *
 * Risk Disclosure edit (client feedback): the lead line ran inline as one flat
 * paragraph ("IMPORTANT RISK WARNING: Trading in..."). Split it so the warning
 * label renders bold on its own line, with the warning text on the line below.
 *
 * Direct SQL (pg) rather than Payload's local API: the postgres adapter runs a
 * drizzle schema push on init that contends with a running dev server and hangs
 * headless (same reason as patch-footer-contact.ts). `body` is a localized
 * richText column on `legal_pages_locales`, so we read each locale's JSON, swap
 * the first node, and write it back.
 *
 * Idempotent: only rows whose first node still equals the original combined
 * intro are touched; re-runs skip already-patched rows.
 *
 * Dry-run by default (SELECT only); pass APPLY=1 to write.
 * Run: APPLY=1 ts-node --transpile-only src/scripts/patch-legal-risk-warning.ts
 */

import 'dotenv/config';
import { Client } from 'pg';

type Leaf = { text?: string; bold?: boolean };
type Node = { type?: string; children?: Node[] } & Leaf;

// Per-locale split of the existing intro paragraph.
const LEADS: Record<string, { lead: string; rest: string }> = {
  en: {
    lead: 'IMPORTANT RISK WARNING',
    rest: 'Trading in Contracts for Difference (CFDs) and other leveraged instruments carries a high level of risk to your capital.',
  },
  ar: {
    lead: 'تحذير مهم من المخاطر',
    rest: 'التداول في عقود الفروقات والأدوات ذات الرافعة المالية ينطوي على مخاطر عالية لرأس مالك.',
  },
};

const nodeText = (n?: Node): string =>
  n?.text !== undefined ? n.text : (n?.children ?? []).map(nodeText).join('');

async function run() {
  const apply = process.env.APPLY === '1';
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL must be set');

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`\nMode: ${apply ? 'APPLY (will write)' : 'DRY RUN (no changes)'}\n`);
  try {
    const { rows } = await client.query(
      `SELECT l.id, l._locale, l.body, pg_typeof(l.body) AS body_type
         FROM legal_pages_locales l
         JOIN legal_pages p ON p.id = l._parent_id
        WHERE p."pageType" = 'risk-disclosure'`,
    );

    if (rows.length === 0) console.log('  (no risk-disclosure rows found)');

    for (const row of rows) {
      const conf = LEADS[row._locale as string];
      const body: Node[] = Array.isArray(row.body) ? row.body : JSON.parse(row.body);
      const first = body[0];
      const original = conf ? `${conf.lead}: ${conf.rest}` : null;

      console.log(`  row #${row.id} [${row._locale}] (${row.body_type})`);
      if (!conf) {
        console.log('    skip: no lead config for this locale');
        continue;
      }
      if (!first || nodeText(first) !== original) {
        console.log(`    skip: first node is not the original intro`);
        console.log(`      found: ${JSON.stringify(nodeText(first)).slice(0, 90)}`);
        continue;
      }

      const newBody: Node[] = [
        { children: [{ text: conf.lead, bold: true }] },
        { children: [{ text: conf.rest }] },
        ...body.slice(1),
      ];
      console.log(`    before: ${JSON.stringify(nodeText(first)).slice(0, 90)}`);
      console.log(`    after:  [bold] ${conf.lead}  +  ${conf.rest.slice(0, 60)}...`);

      if (apply) {
        const res = await client.query(
          `UPDATE legal_pages_locales SET body = $1::jsonb WHERE id = $2`,
          [JSON.stringify(newBody), row.id],
        );
        console.log(`    ✅ updated ${res.rowCount} row`);
      }
    }

    if (!apply) console.log('\n🔎 DRY RUN only. Re-run with APPLY=1 to write.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('\n❌ patch-legal-risk-warning failed:', err);
  process.exit(1);
});
