-- Migration 003: Add missing site_settings_rels table
-- The SiteSettings global now has media upload relations (via socialProofLogos),
-- so Payload's Drizzle adapter generates a top-level rels table for the global.
-- Safe to re-run — uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS site_settings_rels (
  id          serial PRIMARY KEY,
  "order"     integer,
  parent_id   integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
  path        character varying NOT NULL,
  media_id    integer REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS site_settings_rels_parent_idx ON site_settings_rels (parent_id);
CREATE INDEX IF NOT EXISTS site_settings_rels_media_idx  ON site_settings_rels (media_id);
