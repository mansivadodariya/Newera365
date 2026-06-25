-- Migration 005: mt5_sync_enabled toggle column + Promotions slug uniqueness.
-- Safe to re-run — every statement is idempotent. Apply AFTER 002.
--
-- Execute:
--   psql "$DATABASE_URL" -f migrations/005_mt5_sync_toggle_and_webinar_unique.sql

-- ────────────────────────────────────────────────────────────────────────────
-- 1. SiteSettings — mt5_sync_enabled master toggle (SiteSettings.ts:17,
--    default true; absent from 002, so under push:false the column is missing
--    and /api/mt5/instruments 500s).
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS mt5_sync_enabled boolean DEFAULT true;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Promotions — UNIQUE(slug). Slugs are non-localized / globally unique
--    ("one document per slug, all locales on that document"), so the promotions
--    table has no `locale` column — a UNIQUE(slug) is the correct DB-level guard
--    (the adapter's `promotions_slug_idx` is non-unique). Promotions was added
--    after migration 001 was written.
--
--    NOTE on webinar TOCTOU (brief 6.3): a DB-level unique (email, webinar) is
--    NOT feasible — Payload v2 stores the webinar relationship in the separate
--    `webinar_registrations_rels` table (webinars_id), not as a column on
--    `webinar_registrations`. The duplicate guard stays at the application layer
--    (find()-then-create() in the endpoint).
-- ────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS uidx_promotions_slug ON promotions (slug);
