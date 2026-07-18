/**
 * add-ai-crm-footer-link.ts
 *
 * The footer's Platform column (SiteSettings.footerEn / footerAr) lists
 * MetaTrader 5, Web Trader, Tools — but not AI CRM, even though /ai-crm exists
 * and is in the header's Platform dropdown. This appends the missing link to
 * the Platform section of both locales. Idempotent (skips if /ai-crm present).
 * Reads the current global and writes it back unchanged except for the addition.
 *
 * Run (prod): PAYLOAD_PUBLIC_SERVER_URL=https://cms-production-580a.up.railway.app \
 *             ts-node --transpile-only src/scripts/add-ai-crm-footer-link.ts
 */

import 'dotenv/config';

const CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';

const AI_CRM = { en: 'AI CRM', ar: 'الذكاء الاصطناعي CRM', href: '/ai-crm' };

type Link = { id?: string; label: string; href: string };
type Section = { id?: string; heading: string; links: Link[] };

let token = '';
async function login() {
  const r = await fetch(`${CMS}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  if (!r.ok) throw new Error(`login → ${r.status}`);
  token = (await r.json()).token;
}

// Append the AI-CRM link to whichever section holds the /platform links.
function patchFooter(sections: Section[], label: string): 'added' | 'present' | 'no-section' {
  const plat = sections.find((s) =>
    (s.links || []).some((l) => (l.href || '').startsWith('/platform')),
  );
  if (!plat) return 'no-section';
  if (plat.links.some((l) => l.href === AI_CRM.href)) return 'present';
  plat.links.push({ label, href: AI_CRM.href });
  return 'added';
}

async function run() {
  console.log(`→ CMS: ${CMS}`);
  await login();
  const cur = await (
    await fetch(`${CMS}/api/globals/site-settings?depth=0`, {
      headers: { Authorization: `JWT ${token}` },
    })
  ).json();

  const footerEn: Section[] = cur.footerEn || [];
  const footerAr: Section[] = cur.footerAr || [];
  const rEn = patchFooter(footerEn, AI_CRM.en);
  const rAr = patchFooter(footerAr, AI_CRM.ar);
  console.log(`   footerEn Platform: ${rEn} | footerAr Platform: ${rAr}`);

  if (rEn !== 'added' && rAr !== 'added') {
    console.log('✅ Nothing to do — AI CRM already present.');
    process.exit(0);
  }

  const res = await fetch(`${CMS}/api/globals/site-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ footerEn, footerAr }),
  });
  if (!res.ok)
    throw new Error(`update global → ${res.status}: ${(await res.text()).slice(0, 200)}`);
  console.log('✅ Footer updated — AI CRM added to Platform (EN + AR).');
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ failed:', e);
  process.exit(1);
});
