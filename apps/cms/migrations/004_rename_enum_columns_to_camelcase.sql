-- Migration 004: Rename select/enum columns to camelCase
-- Payload v2's Drizzle adapter uses the raw field name (camelCase) as the DB
-- column name for select/enum fields, but toSnakeCase() for all other types.
-- Migration 002 created these with snake_case; this corrects them.

-- Idempotent: only rename when the snake_case column still exists, so re-running
-- the migration batch does not error and abort (NE code-review WR-14).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'account_types' AND column_name = 'mt5_sync_status'
  ) THEN
    ALTER TABLE account_types RENAME COLUMN mt5_sync_status TO "mt5SyncStatus";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products_instruments' AND column_name = 'mt5_sync_status'
  ) THEN
    ALTER TABLE products_instruments RENAME COLUMN mt5_sync_status TO "mt5SyncStatus";
  END IF;
END $$;
