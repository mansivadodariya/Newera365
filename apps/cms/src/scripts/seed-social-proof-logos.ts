/**
 * seed-social-proof-logos.ts
 *
 * Wires the homepage "As seen in" trust strip (SiteSettings.socialProofLogos) to
 * the press logos that ALREADY exist in the Media library and already back the
 * /company/media-press page (Bloomberg, Reuters, Forbes Middle East, The National).
 *
 * No internet lookup and no new uploads — it references existing media by
 * filename, so it sidesteps the Railway ephemeral-FS media issue entirely.
 * Uses Payload's LOCAL API with overrideAccess (no admin login). Idempotent:
 * re-running just re-sets the same four entries.
 *
 * Run: ts-node --transpile-only src/scripts/seed-social-proof-logos.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import payload from 'payload';

// Press outlets already present in media-press; logos already uploaded to Media.
const LOGOS = [
  {
    file: 'press-logo-bloomberg.png',
    altEn: 'Bloomberg',
    altAr: 'بلومبرغ',
    href: 'https://www.bloomberg.com/',
  },
  {
    file: 'press-logo-reuters.png',
    altEn: 'Reuters',
    altAr: 'رويترز',
    href: 'https://www.reuters.com/',
  },
  {
    file: 'press-logo-forbes-middle-east.png',
    altEn: 'Forbes Middle East',
    altAr: 'فوربس الشرق الأوسط',
    href: 'https://www.forbesmiddleeast.com/',
  },
  {
    file: 'press-logo-the-national.png',
    altEn: 'The National',
    altAr: 'ذا ناشيونال',
    href: 'https://www.thenationalnews.com/',
  },
];

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  // Resolve each logo's media id by filename (robust to id differences).
  const entries: { logo: number; altEn: string; altAr: string; href: string }[] = [];
  for (const l of LOGOS) {
    const res = await payload.find({
      collection: 'media',
      where: { filename: { equals: l.file } },
      limit: 1,
      depth: 0,
    });
    const doc = res.docs[0] as { id: number } | undefined;
    if (!doc) {
      console.warn(`⚠ media not found, skipping: ${l.file}`);
      continue;
    }
    entries.push({ logo: doc.id, altEn: l.altEn, altAr: l.altAr, href: l.href });
    console.log(`  • ${l.altEn} → media id ${doc.id}`);
  }
  if (entries.length === 0) throw new Error('No press logos resolved in Media — aborting.');

  // Partial update — only touches socialProofLogos, leaves every other field intact.
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { socialProofLogos: entries },
    overrideAccess: true,
  });

  console.log(
    `\n✅ Wired ${entries.length} press logos into the "As seen in" strip (socialProofLogos).`,
  );
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ seed-social-proof-logos failed:', err);
  process.exit(1);
});
