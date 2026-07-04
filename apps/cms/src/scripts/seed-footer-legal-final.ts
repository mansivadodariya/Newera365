/**
 * seed-footer-legal-final.ts
 *
 * Writes the CLIENT-VERIFIED legal footer copy (NewEra Capital Markets (Pty) Ltd,
 * South Africa) into the SiteSettings footer fields.
 *
 * Supersedes the interim seed-footer-regulatory.ts placeholder copy — notably it
 * removes the current live risk_disclaimer's FALSE "authorised and regulated by the
 * FCA, ASIC, CySEC" claim (NewEra is a South African entity, not so regulated).
 *
 * Field mapping (footer renders regulatoryDisclosure → companyRegistration →
 * riskDisclaimer → copyright[static i18n]):
 *   • company_registration_en/ar → registered entity, number, registered office
 *   • risk_disclaimer_en/ar       → the two-paragraph Forex/CFD risk warning
 *   • regulatory_disclosure_en/ar → cleared (no separate licence/regulator line)
 *
 * ⚠️ Arabic copy (…_ar) is an AI draft pending the client compliance team's
 *    verification of the translated legal text. English (…_en) is verbatim client copy.
 *
 * Dry-run by default; pass APPLY=1 to write. Transactional, direct Neon endpoint.
 *
 * Run (dry):   ts-node --transpile-only src/scripts/seed-footer-legal-final.ts
 * Run (apply): APPLY=1 ts-node --transpile-only src/scripts/seed-footer-legal-final.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  return (process.env.DATABASE_URL ?? '').replace(/-pooler\./, '.');
}

const RISK_EN =
  'Trading in Foreign Exchange (Forex, FX) and Contracts for Difference (CFDs) on currencies, commodities, indices, and equities carries a high level of risk and may not be suitable for all investors. These instruments are margin-traded, meaning they involve leverage, which can amplify both gains and losses. As a result, you may lose more than your initial deposit, and market conditions can lead to rapid changes in account balances. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.\n\n' +
  'We strongly recommend seeking independent financial advice if you are uncertain about the suitability of these products for your circumstances. You should not trade unless you fully understand and accept the risks involved.';

// AI draft — client compliance to verify before launch.
const RISK_AR =
  'ينطوي تداول العملات الأجنبية (الفوركس) والعقود مقابل الفروقات (CFDs) على العملات والسلع والمؤشرات والأسهم على مستوى عالٍ من المخاطر وقد لا يكون مناسباً لجميع المستثمرين. تُتداول هذه الأدوات بالهامش، أي أنها تنطوي على الرافعة المالية التي يمكن أن تضاعف الأرباح والخسائر على حد سواء. ونتيجة لذلك، قد تخسر أكثر من إيداعك الأولي، وقد تؤدي ظروف السوق إلى تغيّرات سريعة في أرصدة الحسابات. وقبل اتخاذ قرار التداول، ينبغي أن تدرس بعناية أهدافك الاستثمارية ومستوى خبرتك وقدرتك على تحمّل المخاطر.\n\n' +
  'نوصي بشدة بالحصول على مشورة مالية مستقلة إذا كنت غير متأكد من مدى ملاءمة هذه المنتجات لظروفك. ولا ينبغي لك التداول ما لم تفهم المخاطر المعنية وتقبلها بالكامل.';

const VALUES: Record<string, string> = {
  company_registration_en:
    'NewEra Capital Markets (Pty) Ltd is a company registered in the Republic of South Africa under registration number 2024/447619/07. Registered office: 1 Edgemere Road, Elfindale, Cape Town, Western Cape, 7945, South Africa.',
  // AI draft — client compliance to verify. Entity name + address kept in Latin (registered legal form).
  company_registration_ar:
    'تُعد NewEra Capital Markets (Pty) Ltd شركة مسجلة في جمهورية جنوب أفريقيا بموجب رقم التسجيل 2024/447619/07. العنوان المسجل: 1 Edgemere Road, Elfindale, Cape Town, Western Cape, 7945, South Africa.',
  risk_disclaimer_en: RISK_EN,
  risk_disclaimer_ar: RISK_AR,
  // No separate licence/regulator statement in the client copy — clear the interim block.
  regulatory_disclosure_en: '',
  regulatory_disclosure_ar: '',
  // NOTE: whatsapp_number is already '+18677783511' in the DB (the published support
  // line). It is NOT written here — the floating widget only lacked it because the
  // deployed CMS predates the whatsappNumber field; the Railway redeploy exposes it.
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
        const cur = row[k] ? `"${String(row[k]).slice(0, 48).replace(/\n/g, '⏎')}…"` : '(blank)';
        const next = VALUES[k] ? `"${VALUES[k].slice(0, 48).replace(/\n/g, '⏎')}…"` : '(clear)';
        console.log(`   ${k}:\n      cur:  ${cur}\n      new:  ${next}`);
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
        ? '✅ Wrote client-verified legal footer copy (EN verbatim). AR is an AI draft — compliance to verify.'
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
