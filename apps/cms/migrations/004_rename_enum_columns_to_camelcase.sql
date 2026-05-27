-- Migration 004: Rename select/enum columns to camelCase
-- Payload v2's Drizzle adapter uses the raw field name (camelCase) as the DB
-- column name for select/enum fields, but toSnakeCase() for all other types.
-- Migration 002 created these with snake_case; this corrects them.

ALTER TABLE account_types
  RENAME COLUMN mt5_sync_status TO "mt5SyncStatus";

ALTER TABLE products_instruments
  RENAME COLUMN mt5_sync_status TO "mt5SyncStatus";
