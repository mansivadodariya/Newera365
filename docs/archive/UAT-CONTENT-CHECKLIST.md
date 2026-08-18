# NewEra365 — Pre-UAT Content Checklist

Generated from a full CMS audit on 2026-06-24. The CMS code is sound (zero functional
bugs — build/type-check/lint green, all endpoints and collections verified). The items
below are **content and config** that must be filled before client UAT. Most require the
client to supply real values; a few are devops config.

Edit content in the Payload admin: **http://cms…/admin** → the path is given per item.

---

## A. Legal / regulatory — HIGH PRIORITY (renders in the site footer, every page)

These currently read `"TEST — … [Regulator] … 000000"` and are **legally sensitive** for a
regulated broker. Must be replaced with verified copy before anything is shown to the client.

- [ ] **Regulatory disclosure (EN + AR)** — Global: _Site Settings → regulatoryDisclosure_
  - Current: `TEST — NewEra365 is authorised and regulated by [Regulator] under licence no. 000000. Replace…`
  - Need: real regulator name(s), licence number(s), exact authorised wording.
- [ ] **Company registration (EN + AR)** — Global: _Site Settings → companyRegistration_
  - Current: `TEST — NewEra365 Ltd, registered in [Jurisdiction], company no. 000000. Placeholder.`
  - Need: legal entity name, jurisdiction, company registration number.

## B. Social proof — homepage

- [ ] **Social-proof headline (EN + AR)** — _Site Settings → socialProofHeadline_
  - Current: `TEST — Trusted by 25,000+ traders worldwide` → confirm real figure or revise.
- [ ] **Rating count (EN + AR)** — _Site Settings → ratingCount_
  - Current: `TEST — based on 2,400+ verified reviews` → confirm.
- [ ] **Rating value** — _Site Settings → ratingValue_ — Current: `4.8` → confirm real.
- [ ] **Social-proof logos** — _Site Settings → socialProofLogos_ — **currently EMPTY**.
  - Need: partner / regulator / press logo image uploads.
- [ ] **Testimonials (3 present)** — _Site Settings → testimonials_ — confirm these are REAL client
      testimonials, not sample copy.
- [ ] **KPI stats (4 present)** — _Site Settings → kpiStats_ — confirm the figures are real.

## C. Contact & social — confirm

- [ ] **Contact phone** — Current `+1 867-778-3511` → confirm real.
- [ ] **Facebook / TikTok URLs** — currently empty → provide or confirm not used.
- [ ] **Featured analyst** — `Diego Romero / Senior FX Analyst` (Site Settings + analyst-calls) →
      confirm real analyst or replace.

## D. Webinars (4 documents) — _Collection: Webinars_

- [ ] Placeholder replay/registration links were **blanked during the audit**. Provide the real
      **replayUrl** (YouTube) per past webinar and, if used, **zoomRegistrationLink** (registration
      also works via the on-site form, so this may be optional).

## E. Education / gated ebooks — `/ebooks` lead-capture gate is currently INERT

- [ ] **No education-content is gated** (`isGated` is unset on all 25 docs), so the email gate
      captures nothing. Decide which ebooks should be gated → set _isGated = true_ and upload the
      **pdfFile** per item.
- [ ] **Wire R2 storage (NE-027)** — gated PDFs (and all media) need persistent storage. Without
      it, uploads are lost on every CMS redeploy. This blocks gated delivery end-to-end.

## F. Config / devops (not client) — before go-live

- [ ] **PAYLOAD_SECRET** — local `.env` still holds the placeholder `change-me-in-production`.
      Ensure Railway has a real secret (`openssl rand -hex 32`), or admin JWTs are forgeable.
- [ ] **MEDIA_DIR + Railway volume** (or R2) so uploaded media survives redeploys.

## G. Optional — schema cleanup

- [ ] `news` (and likely other tables) carry **duplicate camelCase + snake_case columns**
      (`seoTitle`/`seo_title`, `sourceUrl`/`source_url`) left by the in-progress `004_rename…`
      migration. Harmless (Payload uses the snake_case ones) but worth dropping the dead columns.

---

## Already fixed during the audit (no action needed)

- Deleted junk news article #124 titled "example" (was live on `/daily-news`).
- Deleted 3 leftover test rows (contact-submissions #3/#4, webinar-registration #2).
- Blanked placeholder `replayUrl` / `zoomRegistrationLink` on 4 webinars.
