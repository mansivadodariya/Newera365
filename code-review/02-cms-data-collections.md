---
status: issues_found
area: CMS Collections & Migrations
reviewed: 2026-06-18
depth: deep
files_reviewed:
  - apps/cms/src/collections/Users.ts
  - apps/cms/src/collections/Media.ts
  - apps/cms/src/collections/ContactSubmissions.ts
  - apps/cms/src/collections/NewsletterSubscribers.ts
  - apps/cms/src/collections/WebinarRegistrations.ts
  - apps/cms/src/collections/ResearchReports.ts
  - apps/cms/src/collections/EducationContent.ts
  - apps/cms/src/collections/LegalPages.ts
  - apps/cms/src/collections/Promotions.ts
  - apps/cms/src/collections/Careers.ts
  - apps/cms/src/collections/Webinars.ts
  - apps/cms/src/collections/AnalystCalls.ts
  - apps/cms/src/collections/IBContent.ts
  - apps/cms/src/collections/BlogPosts.ts
  - apps/cms/src/collections/News.ts
  - apps/cms/src/collections/MarketAnalysis.ts
  - apps/cms/src/collections/AccountTypes.ts
  - apps/cms/src/collections/PaymentMethods.ts
  - apps/cms/src/collections/ProductsInstruments.ts
  - apps/cms/src/collections/FAQs.ts
  - apps/cms/src/collections/TeamMembers.ts
  - apps/cms/src/collections/Awards.ts
  - apps/cms/src/collections/MediaPress.ts
  - apps/cms/src/collections/_fields.ts
  - apps/cms/src/globals/SiteSettings.ts
  - apps/cms/src/hooks/index.ts
  - apps/cms/src/db/runSlugIndexMigration.ts
  - apps/cms/src/scripts/migrate-missing-columns.ts
  - apps/cms/src/scripts/migrate-ib-steps-array-id.ts
  - apps/cms/src/scripts/migrate-slug-indexes.ts
  - apps/cms/src/scripts/ensure-admin.ts
  - apps/cms/scripts/apply-schema.mjs
  - apps/cms/migrations/002_mt5_sync_awards_site_settings.sql
  - apps/cms/migrations/003_site_settings_rels.sql
  - apps/cms/migrations/004_rename_enum_columns_to_camelcase.sql
  - apps/cms/src/scripts/seed.ts
  - apps/cms/src/endpoints/index.ts (gate handler only)
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
---

# Area 2 — CMS Collections & Migrations: Code Review

## Summary

Reviewed all 23 Payload v2 collections, the SiteSettings global, shared field
helpers, the two active hooks, and every DDL/migration/seed script for access
control, PII exposure, SQL injection, and credential handling.

**Good news first (verified, not flagged):**

- **PII collections are correctly locked down.** `ContactSubmissions`,
  `NewsletterSubscribers`, `WebinarRegistrations`, and `Users` all gate
  read/update/delete behind `Boolean(req.user)`. `ContactSubmissions.create`
  is intentionally public (the `POST /api/contact` endpoint). `Users.totpSecret`
  / `totpTempSecret` use a field-level `read: () => false` so secrets never
  serialise. SiteSettings `mt5ApiKey` / `mt5ApiEndpoint` use field-level
  `read: Boolean(req?.user)`.
- **No SQL injection.** Every migration/DDL script (`migrate-missing-columns.ts`,
  `migrate-ib-steps-array-id.ts`, `apply-schema.mjs`, `runSlugIndexMigration.ts`,
  and `migrations/00{1,2,3,4}.sql`) uses static string literals — no user/runtime
  value is interpolated into SQL. DDL connection strings come from
  `process.env.DATABASE_URL`.
- **No hardcoded secrets in code.** A regex sweep for inline
  passwords/keys/tokens/connection-strings across all `.ts/.js/.mjs` returned
  nothing except the documented seed-admin default (flagged below).

**The two material problems are access-control design defects, not PII leaks:**
the public content collections use a bare `read: () => true` that (a) returns
unpublished/draft documents and (b) returns gated PDF URLs, to _anyone hitting
the public REST API directly_. The frontend (`apps/web/src/lib/cms.ts`) does
filter `where[status][equals]=published`, but that is a UI convenience — the
Payload REST API on the CMS host is internet-reachable and CORS does not stop a
direct `curl`, so the access function is the only server-side gate and it is
wide open.

---

## Critical Issues

### CR-01: Public read on content collections returns unpublished / draft documents

**File:** `apps/cms/src/collections/LegalPages.ts:15`, `apps/cms/src/collections/ResearchReports.ts:12`, `apps/cms/src/collections/Promotions.ts:13`, `apps/cms/src/collections/EducationContent.ts:13`, `apps/cms/src/collections/BlogPosts.ts:12`, `apps/cms/src/collections/News.ts:12`, `apps/cms/src/collections/MarketAnalysis.ts:12`, `apps/cms/src/collections/Careers.ts:12`, `apps/cms/src/collections/Webinars.ts:12`, `apps/cms/src/collections/AnalystCalls.ts:11`, `apps/cms/src/collections/IBContent.ts:14`

**Issue:** Every editorial/content collection carries a `status` field
(`draft`/`published`, or `active`/`inactive`, or `open`/`closed`) but its access
rule is the unconditional `access: { read: () => true }`. The rule does **not**
restrict reads to published documents. Because the Payload v2 REST API on the CMS
host is publicly reachable and CORS/CSRF only constrain browsers (not a direct
HTTP client), anyone can issue:

```
GET https://<cms-host>/api/legal-pages
GET https://<cms-host>/api/promotions?limit=100
GET https://<cms-host>/api/research-reports
```

and receive **draft, embargoed, and not-yet-effective** documents. The frontend
loader (`apps/web/src/lib/cms.ts:512+`) does add `where[status][equals]=published`,
which is why the _site_ looks correct — but that filter is client-supplied and
trivially omitted against the raw API. For a regulated forex/CFD broker this
prematurely exposes unpublished **legal/compliance pages** (terms, risk
disclosure, AML policy via `LegalPages`), unreleased **promotions** (bonus terms
before launch), and embargoed **research/market analysis** — a compliance and
business-confidentiality exposure, not merely a cosmetic one.

**Impact:** Anyone on the internet can read every draft/embargoed/inactive
content document directly from the API, bypassing the publish workflow.

**Fix:** Make the access rule enforce the publish gate server-side, and let
authenticated admins still see drafts. Apply to each content collection (adjust
the published value per collection — `published` / `active` / `open`):

```ts
access: {
  read: ({ req }) => {
    if (req.user) return true;            // admins see everything
    return { status: { equals: 'published' } }; // anon: published only
  },
},
```

Returning a `Where` constraint from a Payload access function filters rows for
anonymous callers regardless of any client-supplied `where`. A shared helper
(e.g. `publishedOrAdmin('published')`) in `_fields.ts` would keep the 11 call
sites consistent.

---

### CR-02: Gated-PDF email wall is fully bypassable via the public Media / ResearchReports / EducationContent API

**File:** `apps/cms/src/collections/Media.ts:8`, `apps/cms/src/collections/ResearchReports.ts:12` (field `reportFile` L32), `apps/cms/src/collections/EducationContent.ts:13` (field `pdfFile` L57), `apps/cms/src/endpoints/index.ts:875-879`

**Issue:** "Gated" ebooks/research are meant to require an email submission
(`POST /api/education/gate`) before the PDF is served — and the gate endpoint at
`endpoints/index.ts:875-879` returns `content.pdfFile.url`. But the same file URL
is **already public** through three open reads:

- `Media` → `access: { read: () => true }` (`Media.ts:8`) exposes every
  uploaded file's `url`.
- `ResearchReports` → `access: { read: () => true }` (`ResearchReports.ts:12`)
  returns `reportFile` (with `depth=1` populating the media `url`) regardless of
  the `isGated` flag (default `true`, `ResearchReports.ts:47`).
- `EducationContent` → `access: { read: () => true }` (`EducationContent.ts:13`)
  returns `pdfFile` / `audioFile` regardless of `isGated`.

So an attacker simply calls `GET /api/research-reports?depth=1` (or
`GET /api/media`) and downloads every gated PDF without ever submitting an email.
The endpoint comment even notes the URL is a plain static path today ("In
production this would be a short-lived signed R2 URL" — `endpoints/index.ts:875`),
so there is no signed-URL mitigation yet. The email gate is purely cosmetic.

**Impact:** The lead-capture gate (and any content paywall it implies) is
defeated; all "gated" research/ebook PDFs are downloadable anonymously.

**Fix:** Defense in depth — do not rely on the gate endpoint alone:

1. Restrict `Media` read for non-image assets, or move gated PDFs to a private
   bucket served only via short-lived signed URLs (the planned R2 signed-URL
   work, NE-027) and never return a permanent `url` for gated files.
2. On `ResearchReports` / `EducationContent`, strip the file field for anonymous
   callers via a field-level `access.read` (e.g. return the file URL only when
   `req.user` is present, or only when `isGated !== true`), so the public
   collection read cannot leak the gated asset:

```ts
// on reportFile / pdfFile
access: { read: ({ req, doc }) => Boolean(req.user) || doc?.isGated !== true },
```

3. Have the gate endpoint mint a short-lived signed URL rather than echoing a
   permanent path.

---

## Warnings

### WR-01: Predictable default admin credentials committed as fallback (`admin@newera365.com` / `Admin123!`)

**File:** `apps/cms/src/scripts/ensure-admin.ts:26-27`, `apps/cms/src/scripts/seed.ts:24-25` (used at `seed.ts:271`)

**Issue:** Both the seed and the `ensure-admin` helper default the admin email
and password when the env vars are unset:

```ts
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@newera365.com';
const PASS = process.env.SEED_ADMIN_PASS ?? 'Admin123!';
```

`ensure-admin.ts` is **idempotent and resets the password to this default every
run** (`ensure-admin.ts:42-46`). If either script is ever pointed at the
production Neon DB without the env vars set (easy to do — they share one
`DATABASE_URL`, and the scripts are documented to be "safe to run while the dev
server is up"), the live admin account is (re)set to a public, guessable
password. For a broker admin panel guarding PII and site content this is a real
account-takeover vector, even though it requires running a script.

**Impact:** Running a seed/ensure-admin against prod without env overrides
creates or resets a privileged admin to a publicly-known password.

**Fix:** Remove the hardcoded password fallback; require `SEED_ADMIN_PASS`
explicitly and fail fast if missing (mirroring the `PAYLOAD_SECRET` guard in
`payload.config.ts:41`). At minimum, refuse to run `ensure-admin` /seed when
`NODE_ENV === 'production'` unless an explicit `--force` flag is passed:

```ts
const PASS = process.env.SEED_ADMIN_PASS;
if (!PASS) throw new Error('SEED_ADMIN_PASS must be set — no insecure default.');
if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed admin in production.');
```

---

### WR-02: Migration 004 `RENAME COLUMN` is not idempotent — re-run errors, breaking the "safe to re-run" contract

**File:** `apps/cms/migrations/004_rename_enum_columns_to_camelcase.sql:6-10`

**Issue:** Unlike migrations 001–003 (which the repo standardises on
`IF NOT EXISTS` / `DO $$ … EXCEPTION` guards and explicitly label "safe to
re-run"), migration 004 issues bare renames:

```sql
ALTER TABLE account_types        RENAME COLUMN mt5_sync_status TO "mt5SyncStatus";
ALTER TABLE products_instruments RENAME COLUMN mt5_sync_status TO "mt5SyncStatus";
```

Postgres has no `RENAME COLUMN IF EXISTS` for a single statement, so a second run
fails with `column "mt5_sync_status" does not exist`. Per `CLAUDE.md` the schema
workflow runs migrations manually/on boot and expects idempotency; a half-applied
or replayed 004 aborts the migration batch and can leave the schema inconsistent
with the camelCase columns the drizzle adapter queries (every read of those
collections then 500s with `column "mt5SyncStatus" does not exist`).

**Impact:** Re-running the migration set errors out; an aborted/partial apply can
500 `account_types` / `products_instruments` reads.

**Fix:** Guard the rename so it is a no-op when already applied:

```sql
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='account_types' AND column_name='mt5_sync_status') THEN
    ALTER TABLE account_types RENAME COLUMN mt5_sync_status TO "mt5SyncStatus";
  END IF;
END $$;
-- repeat for products_instruments
```

---

### WR-03: `archivePreviousLegalVersion` scopes by locale but `status` is non-localized — demotion is incoherent / can demote the wrong document

**File:** `apps/cms/src/hooks/index.ts:24-55`, `apps/cms/src/collections/LegalPages.ts:52-57`

**Issue:** The hook enforces "one published legal doc per `pageType` per locale"
by querying and demoting other published docs _scoped to `req.locale`_
(`hooks/index.ts:27,32-41,47`). But in `LegalPages` the `status` field has **no
`localized: true`** (`LegalPages.ts:52-57`) — under Payload native localization a
non-localized field is a single shared column across all locales of a document.
So "published" is a per-document state, not per-locale. Scoping the
archive query/update by locale therefore mixes two models:

- The intent ("one live version per pageType **per locale**") cannot be
  represented, because `status` is shared across locales.
- Publishing the `ar` rendering of a document runs the demotion under
  `locale='ar'` and flips a _different_ document's shared `status` to `draft`,
  which simultaneously unpublishes its `en` content. Conversely, since the guard
  is `id != doc.id` only, the logic can demote a document an editor did not
  intend to retire.

The `try/catch` correctly prevents the hook from throwing, and the
`status !== 'published'` early-return (`hooks/index.ts:25`) stops recursion, so
this is a correctness bug, not a crash.

**Impact:** Publishing a localized legal page can silently unpublish the wrong
legal document (including its other-locale content), undermining the
"single live version" compliance guarantee for terms/risk/AML pages.

**Fix:** Decide on one model. If "one live version per pageType" is the real rule,
drop the `locale` scoping from the query and update (`status` is global anyway).
If per-locale liveness is required, make `status` (and `effectiveDate`)
`localized: true` and key the dedup on `pageType` + locale consistently. Either
way, align the field localization with the hook's scoping.

---

### WR-04: Fragile direct-endpoint derivation in DDL scripts can silently target the wrong (pooler) host

**File:** `apps/cms/src/scripts/migrate-missing-columns.ts:20-25`, `apps/cms/src/scripts/migrate-ib-steps-array-id.ts:32-35`

**Issue:** Both DDL scripts derive the "direct" Neon endpoint by string-replacing
`-pooler.` with `.` in `DATABASE_URL`:

```ts
const direct = poolerUrl.replace(/-pooler\./, '.');
```

If `DATABASE_URL` is empty (env not loaded) the result is `''` and `new Client`
fails fast — acceptable. But if the URL does **not** contain the literal
`-pooler.` substring (e.g. a non-pooler URL, a different region label, or a
direct URL already), the replace is a silent no-op and the script runs **DDL
against whatever host the URL points at**, including potentially the pooler
(which the comment says must be avoided for session-mode DDL) or an unintended
environment. There is no assertion that the transformed host actually differs or
is the direct endpoint.

**Impact:** Schema-altering DDL may execute against the wrong endpoint/database
with no warning; at best the migration fails mid-way (PgBouncer restrictions), at
worst it mutates an unintended DB.

**Fix:** Require an explicit direct URL (`DATABASE_URL_DIRECT`) rather than
transforming, or assert the transform actually changed the host and that the
result lacks `-pooler`:

```ts
const direct = poolerUrl.replace(/-pooler\./, '.');
if (!poolerUrl || direct === poolerUrl || direct.includes('-pooler'))
  throw new Error('Could not derive a distinct direct Neon endpoint; set DATABASE_URL_DIRECT.');
```

---

## Info

### IN-01: `apply-schema.mjs` swallows real DDL failures and exits 0

**File:** `apps/cms/scripts/apply-schema.mjs:149-166`

**Issue:** The catch block treats only `42701` / `42P07` / "already exists" as
benign; any other error is logged with `console.error` but the loop continues and
`run()` still resolves, so the process exits 0 even when statements genuinely
failed. (The sibling `migrate-missing-columns.ts:236-238` correctly
`process.exit(1)` on failures.) A CI/boot step calling this script would treat a
broken schema apply as success.

**Fix:** Track a `failed` counter and `process.exit(1)` when any non-benign error
occurred, matching `migrate-missing-columns.ts`.

### IN-02: Webinars exposes Zoom registration link + webinar ID via public read

**File:** `apps/cms/src/collections/Webinars.ts:36-48`

**Issue:** `zoomRegistrationLink` and `zoomWebinarId` are returned by the public
`read: () => true`. The `admin.condition` (L41) only hides them in the admin UI,
not in the API. Zoom IDs/links are low-sensitivity (registration is public by
design), so this is informational, but if these were ever meant to be host-only
they would leak. No action required unless the Zoom link is privileged.

### IN-03: `slugField` derives slug from raw user text without max-length / collision ceiling

**File:** `apps/cms/src/collections/_fields.ts:24-49`

**Issue:** `slugField('title')` slugifies arbitrarily long localized titles with
no length cap before the unique index. `slugify` is Unicode-safe and strips
quotes/control chars (no injection risk — it is stored as data, not interpolated
into SQL), but an over-long slug can collide at the DB unique index in
non-obvious ways and produces unwieldy URLs. Low impact; consider truncating the
slug (e.g. to 80 chars) inside `slugify`.

---

_Reviewed: 2026-06-18 · Area: CMS Collections & Migrations · Depth: deep_
_Reviewer: Claude (gsd-code-reviewer)_
