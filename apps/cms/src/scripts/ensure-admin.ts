/**
 * Ensures the documented seed admin user exists so `npm run seed` can log in.
 *
 * Uses Payload's LOCAL API (no running server required — but safe to run while
 * the dev server is up; it shares the same Neon database). Idempotent:
 *   - if the seed admin email does not exist → creates it
 *   - if it already exists → resets the password to the documented default
 *
 * Credentials come from the same env vars the seed uses:
 *   SEED_ADMIN_EMAIL (default: admin@newera365.com)
 *   SEED_ADMIN_PASS  (required — no default; this script refuses to run in production)
 *
 * Usage:  npm run seed:admin --workspace=@newera365/cms
 */

import 'dotenv/config';
import path from 'path';

// payload reads PAYLOAD_CONFIG_PATH at import time — set it before importing.
process.env.PAYLOAD_CONFIG_PATH =
  process.env.PAYLOAD_CONFIG_PATH ?? path.resolve(__dirname, '../payload.config.ts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import payload from 'payload';

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
// No committed default password — must be provided via env (NE code-review WR-5).
const PASS = process.env.SEED_ADMIN_PASS;

async function run() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET must be set');
  // This helper RESETS the admin password on every run — never in production.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ensure-admin is a dev/seed helper and must not run with NODE_ENV=production.');
  }
  if (!PASS) {
    throw new Error('SEED_ADMIN_PASS must be set — there is no default admin password.');
  }

  await payload.init({ secret, local: true });

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: EMAIL } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { password: PASS },
    });
    console.log(`✅ Seed admin already existed — password reset for ${EMAIL}`);
  } else {
    await payload.create({
      collection: 'users',
      data: { email: EMAIL, password: PASS, name: 'Seed Admin' },
    });
    console.log(`✅ Seed admin created: ${EMAIL}`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ ensure-admin failed:', err);
  process.exit(1);
});
