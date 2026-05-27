-- Migration 002: MT5 sync fields, Awards collection, SiteSettings expansion
-- Safe to re-run — all DDL uses IF NOT EXISTS / DO $$ guards.
-- Apply AFTER 001_slug_locale_unique_indexes.sql.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Products Instruments — MT5 sync fields
-- ────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE enum_products_instruments_mt5_sync_status AS ENUM ('never', 'synced', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE products_instruments
  ADD COLUMN IF NOT EXISTS mt5_sync_status  enum_products_instruments_mt5_sync_status DEFAULT 'never',
  ADD COLUMN IF NOT EXISTS mt5_last_synced_at  timestamp with time zone,
  ADD COLUMN IF NOT EXISTS mt5_sync_failure_reason  character varying;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Account Types — MT5 sync fields
-- ────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE enum_account_types_mt5_sync_status AS ENUM ('never', 'synced', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE account_types
  ADD COLUMN IF NOT EXISTS mt5_sync_status  enum_account_types_mt5_sync_status DEFAULT 'never',
  ADD COLUMN IF NOT EXISTS mt5_last_synced_at  timestamp with time zone,
  ADD COLUMN IF NOT EXISTS mt5_sync_failure_reason  character varying;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Site Settings — new scalar columns
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE site_settings
  -- MT5 config
  ADD COLUMN IF NOT EXISTS mt5_api_endpoint            character varying,
  ADD COLUMN IF NOT EXISTS mt5_api_key                 character varying,
  ADD COLUMN IF NOT EXISTS mt5_refresh_interval_secs   numeric DEFAULT 60,
  -- Contact details
  ADD COLUMN IF NOT EXISTS contact_email               character varying,
  ADD COLUMN IF NOT EXISTS contact_email_compliance    character varying,
  ADD COLUMN IF NOT EXISTS contact_phone               character varying,
  ADD COLUMN IF NOT EXISTS contact_address_en          character varying,
  ADD COLUMN IF NOT EXISTS contact_address_ar          character varying,
  ADD COLUMN IF NOT EXISTS support_hours_en            character varying,
  ADD COLUMN IF NOT EXISTS support_hours_ar            character varying,
  -- Social media
  ADD COLUMN IF NOT EXISTS social_facebook             character varying,
  ADD COLUMN IF NOT EXISTS social_x                    character varying,
  ADD COLUMN IF NOT EXISTS social_linked_in            character varying,
  ADD COLUMN IF NOT EXISTS social_instagram            character varying,
  ADD COLUMN IF NOT EXISTS social_youtube              character varying,
  ADD COLUMN IF NOT EXISTS social_telegram             character varying,
  ADD COLUMN IF NOT EXISTS social_tiktok               character varying,
  -- Platform downloads
  ADD COLUMN IF NOT EXISTS download_mt5_windows        character varying,
  ADD COLUMN IF NOT EXISTS download_mt5_mac            character varying,
  ADD COLUMN IF NOT EXISTS download_mt5_ios            character varying,
  ADD COLUMN IF NOT EXISTS download_mt5_android        character varying,
  ADD COLUMN IF NOT EXISTS download_web_trader         character varying,
  -- Risk warning banner
  ADD COLUMN IF NOT EXISTS risk_banner_enabled         boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS risk_banner_en              character varying,
  ADD COLUMN IF NOT EXISTS risk_banner_ar              character varying;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Site Settings — kpiStats array table
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings_kpi_stats (
  _order      integer NOT NULL,
  _parent_id  integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
  id          character varying PRIMARY KEY,
  value_en    character varying NOT NULL,
  value_ar    character varying NOT NULL,
  label_en    character varying NOT NULL,
  label_ar    character varying NOT NULL
);
CREATE INDEX IF NOT EXISTS site_settings_kpi_stats_order_idx  ON site_settings_kpi_stats (_order);
CREATE INDEX IF NOT EXISTS site_settings_kpi_stats_parent_idx ON site_settings_kpi_stats (_parent_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Site Settings — socialProofLogos array table + rels (logo upload)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings_social_proof_logos (
  _order      integer NOT NULL,
  _parent_id  integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
  id          character varying PRIMARY KEY,
  alt_en      character varying,
  alt_ar      character varying,
  href        character varying
);
CREATE INDEX IF NOT EXISTS site_settings_social_proof_logos_order_idx  ON site_settings_social_proof_logos (_order);
CREATE INDEX IF NOT EXISTS site_settings_social_proof_logos_parent_idx ON site_settings_social_proof_logos (_parent_id);

-- Rels table carries the logo upload field (path = 'logo')
CREATE TABLE IF NOT EXISTS site_settings_social_proof_logos_rels (
  id          serial PRIMARY KEY,
  "order"     integer,
  parent_id   character varying NOT NULL REFERENCES site_settings_social_proof_logos(id) ON DELETE CASCADE,
  path        character varying NOT NULL,
  media_id    integer REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS site_settings_spl_rels_parent_idx ON site_settings_social_proof_logos_rels (parent_id);
CREATE INDEX IF NOT EXISTS site_settings_spl_rels_media_idx  ON site_settings_social_proof_logos_rels (media_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Awards collection — main table
-- ────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE enum_awards_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enum_awards_locale AS ENUM ('en', 'ar');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS awards (
  id               serial PRIMARY KEY,
  title            character varying NOT NULL,
  slug             character varying NOT NULL,
  date             timestamp with time zone NOT NULL,
  description      character varying,
  external_url     character varying,
  sort_order       numeric DEFAULT 0,
  status           enum_awards_status NOT NULL DEFAULT 'draft',
  translation_key  character varying,
  locale           enum_awards_locale NOT NULL,
  updated_at       timestamp with time zone DEFAULT now() NOT NULL,
  created_at       timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS awards_slug_idx            ON awards (slug);
CREATE INDEX IF NOT EXISTS awards_translation_key_idx ON awards (translation_key);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Awards — rels table (logo upload field)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS awards_rels (
  id          serial PRIMARY KEY,
  "order"     integer,
  parent_id   integer NOT NULL REFERENCES awards(id) ON DELETE CASCADE,
  path        character varying NOT NULL,
  media_id    integer REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS awards_rels_parent_idx ON awards_rels (parent_id);
CREATE INDEX IF NOT EXISTS awards_rels_media_idx  ON awards_rels (media_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Awards — compound (slug, locale) unique index  [from migration 001 pattern]
-- ────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS uidx_awards_slug_locale ON awards (slug, locale);
