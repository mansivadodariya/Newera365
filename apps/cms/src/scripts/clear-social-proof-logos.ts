/**
 * clear-social-proof-logos.ts  (one-off)
 *
 * Empties SiteSettings.socialProofLogos so the homepage "As seen in" strip
 * (TrustStripDemo) self-hides. The press-logo-*.png media are placeholders
 * (they render the NewEra365 logo, not the real outlet marks), so the strip is
 * unsubstantiated until real, authorised press/partner logos are uploaded.
 *
 * Run: ts-node --transpile-only src/scripts/clear-social-proof-logos.ts
 */

import 'dotenv/config';
import path from 'path';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import payload from 'payload';

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  const before = (await payload.findGlobal({ slug: 'site-settings' })) as {
    socialProofLogos?: unknown[] | null;
  };
  const count = before.socialProofLogos?.length ?? 0;
  console.log(`Current socialProofLogos: ${count}`);

  await payload.updateGlobal({
    slug: 'site-settings',
    data: { socialProofLogos: [] },
    overrideAccess: true,
  });

  console.log(`✅ Cleared ${count} logo(s) — "As seen in" strip will self-hide.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ clear-social-proof-logos failed:', err);
  process.exit(1);
});
