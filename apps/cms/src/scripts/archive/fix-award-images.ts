/**
 * fix-award-images.ts
 *
 * Client feedback round 3 (awards cards): the award media docs pointed at
 * placeholder "Newera365" text-banner PNGs. Real photographs (Unsplash,
 * processed to 900x600 JPEG + 400x300 card variant in src/media) replace
 * them — this script repoints each media doc's filename/mime/dimensions at
 * the new .jpg files. The awards' `logo` relationships are untouched (they
 * reference these media ids).
 *
 * Idempotent: skips docs already on .jpg. Dry-run by default; APPLY=1 writes.
 * Run from apps/cms: APPLY=1 npx ts-node --transpile-only src/scripts/fix-award-images.ts
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs';

process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

import payload from 'payload';

const RENAMES = [
  'award-best-forex-broker-mena-2025',
  'award-most-trusted-broker-global-forex-2025',
  'award-best-low-spread-broker-2024',
];

async function run() {
  const apply = process.env.APPLY === '1';
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  await payload.init({ secret, local: true });

  const mediaDir = path.resolve(__dirname, '../media');

  for (const base of RENAMES) {
    const jpg = path.join(mediaDir, `${base}.jpg`);
    if (!fs.existsSync(jpg)) {
      console.log(`  ✗ ${base}.jpg missing on disk — skipping`);
      continue;
    }
    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { in: [`${base}.png`, `${base}.jpg`] } },
      overrideAccess: true,
      depth: 0,
      limit: 1,
    });
    const doc = docs[0] as { id: number; filename: string } | undefined;
    if (!doc) {
      console.log(`  ✗ no media doc for ${base} — skipping`);
      continue;
    }
    if (doc.filename === `${base}.jpg`) {
      console.log(`  • ${base}.jpg already wired — skipping`);
      continue;
    }
    const stat = fs.statSync(jpg);
    console.log(
      `  → media #${doc.id}: ${doc.filename} → ${base}.jpg (${(stat.size / 1024).toFixed(0)}KB)`,
    );
    if (apply) {
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          filename: `${base}.jpg`,
          mimeType: 'image/jpeg',
          filesize: stat.size,
          width: 900,
          height: 600,
        },
        overrideAccess: true,
      });
    }
  }

  console.log(`\n${apply ? '✅ Applied.' : '🔎 DRY RUN only. Re-run with APPLY=1 to write.'}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ fix-award-images failed:', err);
  process.exit(1);
});
