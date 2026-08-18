/**
 * One-shot migration: creates compound unique indexes on (slug, locale) for
 * all collections that use the `uniqueSlugPerLocale` hook.
 *
 * Run via:
 *   npm run db:migrate:slug-indexes -w apps/cms
 *
 * The same migration also runs automatically on server startup (server.ts,
 * guarded by RUN_MIGRATIONS_ON_START). This script is for manual/ad-hoc runs.
 */
import 'dotenv/config';
import { runSlugIndexMigration } from '../db/runSlugIndexMigration';

const main = async (): Promise<void> => {
  try {
    console.log('Running slug-locale unique index migration…');
    await runSlugIndexMigration();
    console.log('Migration complete. All indexes created (or already existed).');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed.', err);
    process.exit(1);
  }
};

void main();
