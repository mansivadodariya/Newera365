# ZeptoMail SMTP Migration Plan

**Status:** ✅ Executed 2026-06-18 — code complete; CMS type-check, build, and lint all green. The manual ZeptoMail console steps (Phase 0) and production env vars (`SMTP_PASS`, `EMAIL_FROM`) are still required before live sends will succeed.
**Author:** drafted 2026-06-18
**Scope:** `apps/cms` only (the web/mt5 apps send no email).

### Execution notes (deviations from the draft, all intentional)

- **`transport.ts` keeps the opt-in `SMTP_VERIFY_ON_START` guard** (WR-10 code-review fix) instead of the draft's always-on `verify()` — cold starts stay quiet by default; set `SMTP_VERIFY_ON_START=true` to re-enable the startup connectivity check.
- **`mailer.ts` imports only `{ sendMail, FROM }`** (not `FROM_NAME`) — `FROM_NAME` is no longer referenced once the per-message `from` is built inside `sendMail()`, so importing it would be an unused symbol.
- **jsonTransport typing:** `nodemailer.createTransport({ jsonTransport: true } as TransportOptions)` (single arg, no `from` default). The dedicated `JSONTransport.Options` overload requires `jsonTransport: true` on the `defaults` arg too, so a separate `{ from }` default fails to type-check; casting routes it through the generic overload, which returns the same `Transporter` type as the SMTP branch. `from` is still set per-message in `sendMail()` and by Payload.

## Goal

Replace Resend with **ZeptoMail SMTP** as the single email provider for the CMS.
All outbound mail — Payload's built-in flows (forgot-password) **and** every
transactional/newsletter email — goes through **one** nodemailer transport.

### Decisions (locked)

| #   | Decision                                           | Choice                                                                                                              |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Migration scope                                    | **Replace Resend entirely.** Re-route the Resend SDK emails through nodemailer SMTP; drop the `resend` package.     |
| 2   | ZeptoMail data center                              | **Global — `smtp.zeptomail.com`** (host is env-configurable regardless).                                            |
| 3   | Resend Audiences sync (`syncSubscriberToAudience`) | **Drop it.** ZeptoMail is transactional-only; no list/audience equivalent (Zoho Campaigns is the separate product). |
| 4   | ZeptoMail SMTP vs. HTTP API                        | **SMTP** (via existing `nodemailer`). The `zeptomail` npm API client is _not_ used.                                 |

---

## Current state (what exists today)

Two parallel email paths, both pointing at Resend:

1. **`apps/cms/src/email/transport.ts`** — nodemailer SMTP transport to
   `smtp.resend.com:465` (user `"resend"`, pass `RESEND_API_KEY`). Wired into
   Payload via `email.transport` in `payload.config.ts`. Used by Payload's
   built-in forgot-password mail. Has a `verify()` override for
   `SKIP_SMTP_VERIFY` / test.
2. **`apps/cms/src/email/resend.ts`** — the Resend **HTTP SDK** (`new Resend(key)`).
   Six send functions + `syncSubscriberToAudience`. **The SDK cannot talk to
   ZeptoMail** — this is the file that needs the most work.
3. **`apps/cms/src/email/transport.mock.ts`** — browser stub (no-op
   `emailTransport`) swapped into the admin webpack bundle.

Supporting wiring:

- `payload.config.ts` — prod env validation for `RESEND_API_KEY`; a `fromAddress`
  that falls back to `onboarding@resend.dev` in dev; webpack aliases for
  `email/transport`, `email/resend`, `endpoints` → `transport.mock`, and
  `nodemailer: false` / `resend: false`.
- `endpoints/index.ts` — imports `syncSubscriberToAudience` and runs an
  `RESEND_AUDIENCE_ID` sync block after newsletter confirmation.
- `apps/cms/package.json` — deps `resend@^6.12.3`, `nodemailer@^8.0.7`.
- `apps/cms/.env.example` — `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_AUDIENCE_ID`.

The six send functions (call sites in `endpoints/index.ts`):

| Function                              | `to`           | `replyTo`       |
| ------------------------------------- | -------------- | --------------- |
| `sendNewsletterConfirmation`          | subscriber     | —               |
| `sendNewsletterWelcome`               | subscriber     | —               |
| `sendContactNotification`             | internal inbox | submitter email |
| `sendWebinarRegistrationConfirmation` | registrant     | —               |
| `sendWebinarRegistrationNotification` | internal inbox | registrant      |
| `sendPartnersNotification`            | internal inbox | —               |

---

## Target state

- **One** nodemailer transport in `transport.ts`, pointed at ZeptoMail SMTP and
  driven by generic `SMTP_*` env vars. It exports `emailTransport` (for Payload)
  **and** a shared `sendMail()` helper.
- `email/resend.ts` is **renamed to `email/mailer.ts`** (the name `resend` is no
  longer accurate) and its six functions call `sendMail()`. **All HTML templates
  stay byte-for-byte identical.** `syncSubscriberToAudience` is deleted.
- The `resend` package is removed. `nodemailer` stays.

---

## Phase 0 — ZeptoMail account prerequisites (console, before any deploy)

These are manual steps in the ZeptoMail web console, independent of the code:

1. **Verify the sending domain.** Add `newera365.com` under _Domains_ and publish
   the SPF + DKIM DNS records ZeptoMail provides. Mail from an unverified domain
   is rejected. (Until DNS verifies, a verified single-sender address can be used
   for testing.)
2. **Create a Mail Agent** (e.g. "NewEra365 Transactional").
3. **Generate SMTP credentials** under the Mail Agent → _SMTP_. This yields:
   - Host: `smtp.zeptomail.com`
   - Ports: `587` (STARTTLS) or `465` (SSL)
   - Username: `emailapikey` (literal — same for every ZeptoMail account)
   - Password: the **Send Mail Token** shown on that page (this is the SMTP
     password; it is _not_ the same string the `zeptomail` API client uses).
4. Note the token securely — it goes into `SMTP_PASS` (never commit it).

> ZeptoMail has **no shared sandbox sender** equivalent to Resend's
> `onboarding@resend.dev`. See the dev-behavior note below.

---

## Phase 1 — Environment variables

### Remove

- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`

### Add

```bash
# ZeptoMail SMTP (Mail Agent → SMTP credentials)
SMTP_HOST=smtp.zeptomail.com      # EU: smtp.zeptomail.eu · IN: smtp.zeptomail.in
SMTP_PORT=465                     # 465 = SSL, 587 = STARTTLS
SMTP_USER=emailapikey             # literal string for all ZeptoMail SMTP accounts
SMTP_PASS=                        # the ZeptoMail "Send Mail Token" — REQUIRED in production
```

### Keep (unchanged)

- `EMAIL_FROM=no-reply@newera365.com` — must be on the verified ZeptoMail domain.
- `CONTACT_NOTIFY_EMAIL`, `PARTNERS_NOTIFY_EMAIL`, `WEBINAR_NOTIFY_EMAIL` — routing inboxes.

Update these in: `apps/cms/.env.example`, every deployed environment (EC2 /
Railway), and any local `.env`.

---

## Phase 2 — Code changes (file by file)

### 2.1 `apps/cms/src/email/transport.ts` — **rewrite**

Replace the Resend SMTP config with env-driven ZeptoMail SMTP, add a `jsonTransport`
dev fallback, and export a shared `sendMail()` helper plus `FROM` / `FROM_NAME`.

```ts
import nodemailer from 'nodemailer';

// ZeptoMail SMTP transport — backs Payload's built-in email pipeline AND all
// transactional/newsletter emails (see mailer.ts). Single provider, single transport.
//
// Credentials (ZeptoMail console → Mail Agent → SMTP):
//   SMTP_HOST  smtp.zeptomail.com  (EU: smtp.zeptomail.eu · IN: smtp.zeptomail.in)
//   SMTP_PORT  465 (SSL) | 587 (STARTTLS)
//   SMTP_USER  emailapikey         (literal string for every ZeptoMail SMTP account)
//   SMTP_PASS  <Send Mail Token>   (from the SMTP credentials page)
//   EMAIL_FROM no-reply@newera365.com  (domain must be verified in ZeptoMail)
//
// Server-only — payload.config.ts aliases this to transport.mock in the admin bundle.
const HOST = process.env.SMTP_HOST ?? 'smtp.zeptomail.com';
const PORT = Number(process.env.SMTP_PORT ?? 465);
const USER = process.env.SMTP_USER ?? 'emailapikey';
const PASS = process.env.SMTP_PASS ?? '';

export const FROM_NAME = 'NewEra365';
// ZeptoMail has no sandbox sender — the from domain must be verified in all envs.
export const FROM = process.env.EMAIL_FROM ?? 'no-reply@newera365.com';

// No token (typical local dev) → jsonTransport logs each message instead of sending,
// so the app runs without credentials and without throwing. Set SMTP_PASS to send for real.
const useJsonTransport = !PASS && process.env.NODE_ENV !== 'production';

const transport = useJsonTransport
  ? nodemailer.createTransport({ jsonTransport: true }, { from: `${FROM_NAME} <${FROM}>` })
  : nodemailer.createTransport(
      {
        host: HOST,
        port: PORT,
        secure: PORT === 465, // 465 = implicit SSL; 587 = STARTTLS
        auth: { user: USER, pass: PASS },
        connectionTimeout: 5_000,
        greetingTimeout: 5_000,
      },
      { from: `${FROM_NAME} <${FROM}>` },
    );

if (useJsonTransport) {
  console.warn('[email] SMTP_PASS not set — using jsonTransport (emails are logged, not sent)');
}

// Make Payload's init-time verify() pass when we can't/shouldn't open a real connection.
if (
  process.env.SKIP_SMTP_VERIFY === 'true' ||
  process.env.NODE_ENV === 'test' ||
  useJsonTransport
) {
  transport.verify = (cb?: (err: Error | null, success: true) => void) => {
    cb?.(null, true);
    return Promise.resolve(true) as ReturnType<typeof transport.verify>;
  };
}

export const emailTransport = transport;

// Shared send helper so every email goes through one transport.
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  await transport.sendMail({
    from: `${FROM_NAME} <${FROM}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });
}

if (
  process.env.SKIP_SMTP_VERIFY !== 'true' &&
  process.env.NODE_ENV !== 'test' &&
  !useJsonTransport
) {
  transport.verify((err) => {
    if (err) console.error('[email] ZeptoMail SMTP connection failed:', err.message);
    else console.info('[email] ZeptoMail SMTP connection verified');
  });
}
```

### 2.2 `apps/cms/src/email/resend.ts` → rename to `apps/cms/src/email/mailer.ts`

- `git mv apps/cms/src/email/resend.ts apps/cms/src/email/mailer.ts`.
- Delete the `Resend` import, `getClient()`, the local `IS_PROD`/`FROM`/`FROM_NAME`
  block, and the entire `syncSubscriberToAudience` function.
- Import the helper: `import { sendMail, FROM, FROM_NAME } from './transport';`
  (keep `import { escapeHtml } from './escapeHtml';`).
- In each of the six functions, replace the Resend call:

  ```ts
  // before
  const { error } = await getClient().emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to: email,
    subject,
    html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);

  // after
  await sendMail({ to: email, subject, html });
  ```

  For the two internal-notification functions, pass `replyTo`:

  ```ts
  await sendMail({
    to: internalRecipient,
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    html,
  });
  ```

  nodemailer throws on send failure, so the explicit `if (error)` checks are dropped.
  **Keep all HTML template literals exactly as-is.** `FROM` is still referenced by the
  `internalRecipient` fallbacks (`?? process.env.EMAIL_FROM ?? FROM`) — that's why it's imported.

### 2.3 `apps/cms/src/endpoints/index.ts` — drop audience sync + fix import

- Remove `syncSubscriberToAudience` from the import (line ~21) and change the import
  source from `../email/resend` to `../email/mailer`.
- Delete the `RESEND_AUDIENCE_ID` sync block (≈ lines 630–649): the
  `if (process.env.RESEND_AUDIENCE_ID && !doc.externalId) { … }` try/catch. The
  welcome-email call immediately after it stays.

### 2.4 `apps/cms/src/payload.config.ts`

- **Env validation** (≈ line 56): replace the `RESEND_API_KEY` prod check with
  `SMTP_PASS`:
  ```ts
  if (!process.env.SMTP_PASS && process.env.NODE_ENV === 'production') {
    throw new Error('SMTP_PASS (ZeptoMail Send Mail Token) must be set in production');
  }
  ```
- **`fromAddress`** (≈ lines 69–75): drop the `onboarding@resend.dev` dev branch —
  use `EMAIL_FROM` in all envs:
  ```ts
  const fromAddress = process.env.EMAIL_FROM ?? 'no-reply@newera365.com';
  ```
- **Webpack aliases** (≈ lines 92–117): rename the resend alias and remove the
  `resend` package alias:
  ```ts
  const mailerPath = path.resolve(__dirname, 'email/mailer'); // was email/resend
  // …
  [mailerPath]: transportMock,   // was [resendEmailPath]
  // remove the `resend: false,` line; keep nodemailer: false
  ```
- Update the nearby comments that say "Resend SMTP" / "Resend SDK" → ZeptoMail.

### 2.5 `apps/cms/src/email/transport.mock.ts` — **no change**

Still exports the no-op `emailTransport`. The admin bundle never imports the named
send functions (their only caller, `endpoints`, is itself aliased to the mock), so the
mock needs nothing new. ✅

### 2.6 `apps/cms/package.json`

- Remove `"resend": "^6.12.3"` from `dependencies`. Keep `nodemailer`.
- Run `npm install` from the repo root to update `package-lock.json`.

### 2.7 Docs

- **`apps/cms/.env.example`** — apply the Phase 1 var changes with comments.
- **`CLAUDE.md`** — in the Deployment / required-env section, change "Resend" →
  "ZeptoMail SMTP" and `RESEND_API_KEY` → `SMTP_PASS` (plus the new `SMTP_*` vars).

---

## Behavior changes to be aware of

- **Local dev no longer sends real email by default.** With `SMTP_PASS` unset, the
  transport uses `jsonTransport` (logs the message JSON, no send). This replaces the
  old "Resend sandbox" behavior. To send for real locally, set `SMTP_PASS` + `EMAIL_FROM`.
- **`NewsletterSubscribers.externalId`** previously stored the Resend contact id. After
  dropping the sync it's simply unused — **leave the column in place** (removing it needs
  a DB migration and the field is harmless). Optional later cleanup only.
- **From domain** must be verified in ZeptoMail before production sends will succeed.

---

## Verification (after the change is made)

```bash
npm run type-check --workspace=@newera365/cms
npm run build --workspace=@newera365/cms        # confirms admin webpack bundle still resolves
npm run lint --workspace=@newera365/cms
```

Then a runtime smoke test with real credentials:

1. Set `SMTP_HOST/PORT/USER/PASS` + `EMAIL_FROM` in `apps/cms/.env`.
2. Boot the CMS; expect `[email] ZeptoMail SMTP connection verified` in the log.
3. Trigger a newsletter subscribe → confirm the double-opt-in email arrives.
4. Submit the contact form → confirm the internal notification arrives with the
   submitter address as `Reply-To`.
5. (Optional) Admin "forgot password" → confirms Payload's built-in pipeline works.

If port 465/587 is blocked on the host (some PaaS), set `SKIP_SMTP_VERIFY=true` so
cold starts don't hang; sends still surface real errors.

---

## Rollback

The migration is a single commit. To revert:

1. `git revert <commit>` (restores `resend.ts`, the SDK calls, and env validation).
2. Restore `RESEND_API_KEY` (+ optional `RESEND_AUDIENCE_ID`) in the environment.
3. `npm install` to bring `resend` back.

Because `EMAIL_FROM`, the routing inboxes, and all HTML templates are unchanged, no
content or data migration is involved either way.

---

## Open questions / risks

- **Port choice:** plan defaults to `465` (SSL). If the production host blocks 465,
  switch `SMTP_PORT=587` (STARTTLS) — `secure` auto-derives from the port, no code change.
- **Rate / sending limits:** confirm the ZeptoMail plan's daily send limit covers
  newsletter + transactional volume.
- **Bounce / complaint handling:** Resend Audiences gave a managed unsubscribe list;
  the app already manages its own unsubscribe tokens, so no functional gap — but if a
  managed marketing list is wanted later, that's **Zoho Campaigns**, a separate
  integration outside this migration.

```

```
