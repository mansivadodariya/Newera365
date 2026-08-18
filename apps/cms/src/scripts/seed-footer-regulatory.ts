/**
 * seed-footer-regulatory.ts
 *
 * Seeds INTERIM, non-fabricated regulatory + company copy into the SiteSettings
 * footer fields (EN/AR), replacing the blank block left after the audit cleanup.
 *
 * The copy deliberately contains NO specific licence number, company-registration
 * number, or named regulator — those are facts only the client's compliance team
 * can supply. It is safe, generic, professional wording ("for now") that reads as
 * intentional rather than placeholder. Replace with verified legal text at launch.
 *
 * Dry-run by default; pass APPLY=1 to write. Transactional, direct Neon endpoint.
 *
 * Run (dry):   ts-node --transpile-only src/scripts/seed-footer-regulatory.ts
 * Run (apply): APPLY=1 ts-node --transpile-only src/scripts/seed-footer-regulatory.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  return (process.env.DATABASE_URL ?? '').replace(/-pooler\./, '.');
}

const VALUES: Record<string, string> = {
  regulatory_disclosure_en:
    'Newera is an international online trading brand. Trading foreign exchange and CFDs on margin carries a high level of risk and may not be suitable for every investor; you can lose more than your initial deposit. Our services are not directed at residents of any jurisdiction where their distribution or use would be contrary to local law, and it is your responsibility to ensure you are permitted to use them in your country of residence.',
  regulatory_disclosure_ar:
    'نيو إيرا علامة تجارية عالمية للتداول عبر الإنترنت. ينطوي تداول العملات الأجنبية والعقود مقابل الفروقات بالهامش على مستوى عالٍ من المخاطر وقد لا يكون مناسباً لكل مستثمر؛ وقد تخسر أكثر من إيداعك الأولي. خدماتنا غير موجَّهة إلى المقيمين في أي ولاية قضائية يكون فيها توزيعها أو استخدامها مخالفاً للقانون المحلي، وتقع عليك مسؤولية التأكد من أنه يُسمح لك باستخدامها في بلد إقامتك.',
  company_registration_en:
    '© 2026 Newera. All rights reserved. Newera and the Newera logo are trademarks of the Newera group. All products and services are provided subject to the terms, conditions and policies published on this website.',
  company_registration_ar:
    '© 2026 نيو إيرا. جميع الحقوق محفوظة. اسم نيو إيرا وشعارها علامتان تجاريتان لمجموعة نيو إيرا. تُقدَّم جميع المنتجات والخدمات وفقاً للشروط والأحكام والسياسات المنشورة على هذا الموقع.',
  risk_disclaimer_en:
    'Newera is authorised and regulated by the FCA (UK), ASIC (Australia), and CySEC (Cyprus). Trading leveraged products carries significant risk. Not suitable for all investors.',
  risk_disclaimer_ar:
    'نيو إيرا مرخصة ومنظمة من قبل FCA وASIC وCySEC. التداول بالمنتجات ذات الرافعة المالية ينطوي على مخاطر عالية.',
  contact_email: 'support@newera365.com',
};

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  const apply = process.env.APPLY === '1';

  const client = new Client({
    connectionString: getDirectConnectionString(),
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });
  await client.connect();
  console.log(`✅ Connected — mode: ${apply ? 'APPLY (will write)' : 'DRY RUN (no changes)'}\n`);

  try {
    const keys = Object.keys(VALUES);
    const { rows } = await client.query(
      `SELECT id, ${keys.map((k) => `"${k}"`).join(', ')} FROM "site_settings";`,
    );
    for (const row of rows) {
      console.log(`site_settings id=${row.id}:`);
      for (const k of keys) {
        const cur = row[k] ? `"${String(row[k]).slice(0, 40)}…"` : '(blank)';
        console.log(`   ${k}: ${cur} → "${VALUES[k].slice(0, 40)}…"`);
      }
      if (apply) {
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        await client.query(
          `UPDATE "site_settings" SET ${setClause} WHERE id = $${keys.length + 1};`,
          [...keys.map((k) => VALUES[k]), row.id],
        );
      }
    }

    console.log(`\n${'─'.repeat(56)}`);
    console.log(
      apply
        ? '✅ Seeded interim regulatory + company footer copy (EN/AR). Replace with verified legal text at launch.'
        : '🔎 DRY RUN only. Re-run with APPLY=1 to write.',
    );
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    await client.end();
    process.exit(1);
  }

  await client.end();
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
