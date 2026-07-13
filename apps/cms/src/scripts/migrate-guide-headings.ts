/**
 * migrate-guide-headings.ts
 *
 * The seeded guide bodies are flat Slate paragraphs whose sections open with a
 * "HEADING: text" lead-in (ALL-CAPS in EN, mirrored 1:1 in AR). The guide
 * detail page's table of contents, scroll-spy and section counter all key off
 * real h2 nodes, so none of that UI is visible with the flat structure.
 *
 * This script splits each "HEADING: rest" paragraph into an h2 node (sentence
 * case in EN, verbatim in AR) followed by the remaining paragraph, driving the
 * AR split from the EN structure (same node index). It also scrubs em/en
 * dashes from body text per the site copy rule.
 *
 * Idempotent: guides whose body already contains an h2/h3 are skipped.
 *
 * Run (CMS must be up on :3001): from apps/cms
 *   npx ts-node --transpile-only src/scripts/migrate-guide-headings.ts
 */

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';

let token = '';

interface SlateNode {
  type?: string;
  text?: string;
  children?: SlateNode[];
  [k: string]: unknown;
}

async function api(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>,
): Promise<any> {
  const url = new URL(`${CMS}/api${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${method} ${path} → ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

function nodeText(n: SlateNode): string {
  if (n.text !== undefined) return n.text ?? '';
  return (n.children ?? []).map(nodeText).join('');
}

function hasHeadings(body: SlateNode[]): boolean {
  return body.some((n) => /^h[1-6]$/.test(n.type ?? ''));
}

/** Copy rule: no em/en dashes anywhere. */
function scrubDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ', ');
}

// Acronyms and symbols that must survive the sentence-case pass.
const PRESERVE = [
  'CFD',
  'CFDS',
  'EA',
  'EAS',
  'MT5',
  'GDP',
  'CPI',
  'NFP',
  'COT',
  'FOMC',
  'RSI',
  'MACD',
  'ATR',
  'FX',
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'XAU/USD',
  'PIP',
  'GSLO',
  'GSLOS',
];

function sentenceCase(caps: string): string {
  let out = caps.toLowerCase();
  out = out.charAt(0).toUpperCase() + out.slice(1);
  for (const tok of PRESERVE) {
    const display =
      tok === 'CFDS' ? 'CFDs' : tok === 'EAS' ? 'EAs' : tok === 'GSLOS' ? 'GSLOs' : tok;
    out = out.replace(
      new RegExp(`(^|[\\s(])${tok.replace('/', '\\/').toLowerCase()}(?=$|[\\s):,.'])`, 'g'),
      (_m, p1: string) => `${p1}${display}`,
    );
  }
  return out;
}

const para = (text: string): SlateNode => ({ children: [{ text }] });
const h2 = (text: string): SlateNode => ({ type: 'h2', children: [{ text }] });

/** EN section lead-in: an ALL-CAPS run (letters, digits, %, spaces…) before a colon. */
const EN_LEAD = /^([A-Z][A-Z0-9 ,&%$'’/-]{2,70}):\s+(.+)$/s;

async function main() {
  console.log('🔐 Logging in…');
  const auth = await api('POST', '/users/login', { email: ADMIN_EMAIL, password: ADMIN_PASS });
  token = auth.token;
  console.log('   ✅ Authenticated as', ADMIN_EMAIL);

  const list = await api('GET', '/education-content', undefined, {
    'where[contentType][equals]': 'guide',
    limit: '100',
    depth: '0',
    locale: 'en',
  });

  let migrated = 0;
  for (const doc of list.docs ?? []) {
    const enBody: SlateNode[] = doc.body ?? [];
    if (enBody.length === 0) {
      console.log(`   ⏭️  ${doc.slug}: empty body, skipped`);
      continue;
    }
    if (hasHeadings(enBody)) {
      console.log(`   ⏭️  ${doc.slug}: already has headings, skipped`);
      continue;
    }

    // Plan the split from the EN structure.
    const splitAt = new Set<number>();
    const newEn: SlateNode[] = [];
    enBody.forEach((n, i) => {
      const text = scrubDashes(nodeText(n).trim());
      const m = EN_LEAD.exec(text);
      if (m && m[1] && m[2]) {
        splitAt.add(i);
        newEn.push(h2(sentenceCase(m[1].trim())), para(m[2].trim()));
      } else {
        newEn.push(para(text));
      }
    });

    if (splitAt.size === 0) {
      console.log(`   ⏭️  ${doc.slug}: no ALL-CAPS lead-ins found, skipped`);
      continue;
    }

    // Mirror the same splits onto the AR body (seeded 1:1 with EN).
    const arDoc = await api('GET', `/education-content/${doc.id}`, undefined, {
      depth: '0',
      locale: 'ar',
    });
    const arBody: SlateNode[] = arDoc.body ?? [];
    const newAr: SlateNode[] = [];
    arBody.forEach((n, i) => {
      const text = scrubDashes(nodeText(n).trim());
      const colon = text.indexOf(':');
      if (splitAt.has(i) && colon > 2 && colon < 80) {
        newAr.push(h2(text.slice(0, colon).trim()), para(text.slice(colon + 1).trim()));
      } else {
        newAr.push(para(text));
      }
    });

    await api('PATCH', `/education-content/${doc.id}`, { body: newEn }, { locale: 'en' });
    if (newAr.length > 0) {
      await api('PATCH', `/education-content/${doc.id}`, { body: newAr }, { locale: 'ar' });
    }
    migrated++;
    console.log(
      `   ✅ ${doc.slug}: ${splitAt.size} sections (EN${newAr.length > 0 ? '+AR' : ' only'})`,
    );
  }

  console.log(`\nDone: ${migrated} guide(s) migrated of ${list.docs?.length ?? 0}.`);
}

main().catch((e) => {
  console.error('❌', e.message ?? e);
  process.exit(1);
});

export {};
