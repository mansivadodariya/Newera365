-- Migration: compound unique indexes on (slug, locale) for all collections
-- that use the `uniqueSlugPerLocale` application hook.
--
-- Background: Payload v2 has no native compound-unique-index config, so
-- duplicate (slug, locale) pairs are only rejected at the application layer.
-- A concurrent double-publish can race past that check.  These Postgres
-- partial unique indexes provide the DB-level enforcement that closes the gap.
--
-- Run once against the target Neon database AFTER the initial Payload schema
-- migration has been applied (i.e. after first `npm run dev` creates the
-- tables).  Safe to re-run — all statements use CREATE ... IF NOT EXISTS.
--
-- Execute:
--   psql "$DATABASE_URL" -f migrations/001_slug_locale_unique_indexes.sql
-- or via the npm script:
--   npm run db:migrate:slug-indexes -w apps/cms

CREATE UNIQUE INDEX IF NOT EXISTS uidx_blog_posts_slug_locale
  ON blog_posts (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_market_analysis_slug_locale
  ON market_analysis (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_research_reports_slug_locale
  ON research_reports (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_education_content_slug_locale
  ON education_content (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_legal_pages_slug_locale
  ON legal_pages (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_company_content_slug_locale
  ON company_content (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_team_members_slug_locale
  ON team_members (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_careers_slug_locale
  ON careers (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_news_slug_locale
  ON news (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_webinars_slug_locale
  ON webinars (slug, locale);
