/**
 * seed-milestones-only.ts
 *
 * Seeds the `company-milestones` collection (About page journey timeline) with
 * the five milestones — EN + AR — that previously lived hard-coded in the web
 * app's i18n files. Writes directly to Neon (main row + one locale row per
 * locale) so it does not require the CMS server to be running.
 *
 * Deterministic reseed: existing milestones are deleted first (the FK cascade
 * removes their locale rows), then re-inserted in display order.
 *
 * Run: ts-node --transpile-only src/scripts/seed-milestones-only.ts
 */

import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

function getDirectConnectionString(): string {
  const explicit = process.env.DATABASE_URL_DIRECT;
  if (explicit) return explicit;
  const poolerUrl = process.env.DATABASE_URL ?? '';
  return poolerUrl.replace(/-pooler\./, '.');
}

type Milestone = {
  year: string;
  en: { label: string; description: string };
  ar: { label: string; description: string };
};

// Source of truth carried over from apps/web/messages/{en,ar}.json (about.milestone*).
const MILESTONES: Milestone[] = [
  {
    year: '2014',
    en: {
      label: 'Founded',
      description:
        'Started with a single broker license and a focus on institutional-grade retail trading.',
    },
    ar: {
      label: 'التأسيس',
      description: 'بدأنا بترخيص وساطة واحد مع التركيز على تداول التجزئة بمستوى مؤسسي.',
    },
  },
  {
    year: '2016',
    en: {
      label: 'First license',
      description:
        'Granted FCA authorisation — regulated where it matters to clients in Singapore, EU and the UK.',
    },
    ar: {
      label: 'أول ترخيص',
      description:
        'حصلنا على ترخيص FCA — تنظيم حيث يهم العملاء في سنغافورة والاتحاد الأوروبي والمملكة المتحدة.',
    },
  },
  {
    year: '2019',
    en: {
      label: '100k traders',
      description:
        'Crossed six figures of active accounts during a period of rapid expansion across 6 countries.',
    },
    ar: {
      label: '100 ألف متداول',
      description: 'تجاوزنا ستة أرقام من الحسابات النشطة خلال فترة توسع سريع في 6 دول.',
    },
  },
  {
    year: '2022',
    en: {
      label: 'Global expansion',
      description:
        'Expanded to ASIC and CySEC jurisdictions. Offices opened in Dubai and Singapore.',
    },
    ar: {
      label: 'التوسع العالمي',
      description: 'توسعنا إلى ولايتي ASIC وCySEC. افتُتحت مكاتب في دبي وسنغافورة.',
    },
  },
  {
    year: '2024',
    en: {
      label: 'NewEra',
      description:
        'Released the Newera365 platform — built from the ground up with every tool a trader needs.',
    },
    ar: {
      label: 'عهد جديد',
      description: 'أطلقنا منصة Newera365 — مبنية من الصفر بكل أداة يحتاجها المتداول.',
    },
  },
];

async function run() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  const client = new Client({
    connectionString: getDirectConnectionString(),
    connectionTimeoutMillis: 60_000,
    query_timeout: 60_000,
  });
  await client.connect();
  console.log('✅ Connected\n');

  try {
    await client.query('BEGIN');

    // Deterministic reseed — cascade clears the locale rows.
    const del = await client.query('DELETE FROM company_milestones;');
    console.log(`   🗑️  Cleared ${del.rowCount ?? 0} existing milestone(s)`);

    let sort = 0;
    for (const m of MILESTONES) {
      const { rows } = await client.query(
        `INSERT INTO company_milestones (year, sort_order, status)
         VALUES ($1, $2, 'published') RETURNING id;`,
        [m.year, sort],
      );
      const id = rows[0].id as number;
      await client.query(
        `INSERT INTO company_milestones_locales (_locale, _parent_id, label, description)
         VALUES ('en', $1, $2, $3), ('ar', $1, $4, $5);`,
        [id, m.en.label, m.en.description, m.ar.label, m.ar.description],
      );
      console.log(`   ✅ ${m.year} — "${m.en.label}" / "${m.ar.label}" (id ${id})`);
      sort += 1;
    }

    await client.query('COMMIT');

    const count = await client.query('SELECT count(*)::int AS n FROM company_milestones;');
    const locales = await client.query(
      'SELECT count(*)::int AS n FROM company_milestones_locales;',
    );
    console.log(
      `\n✅ Seeded ${count.rows[0].n} milestones with ${locales.rows[0].n} locale rows (EN + AR).`,
    );
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
