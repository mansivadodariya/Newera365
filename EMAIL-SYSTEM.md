# Email System — NewEra365

How every email on the site is sent, where it's wired in, and what to change for production.

_Last updated: 2026-07-10._

---

## 1. Architecture in one line

Every email — transactional, newsletter, and Payload's admin forgot-password — goes through **one helper** (`sendMail`) and **one transport**, which posts to the **ZeptoMail HTTP Email API** (port 443).

```
Frontend form  ──POST──▶  CMS REST endpoint  ──▶  sender fn (mailer.ts)  ──▶  sendMail()  ──▶  ZeptoMail HTTP API  ──▶  inbox
   (packages/ui)         (apps/cms/endpoints)      builds subject/html         one transport      api.zeptomail.com
```

- **Transport:** [`apps/cms/src/email/transport.ts`](apps/cms/src/email/transport.ts) — `sendMail()` + the nodemailer wrapper that calls ZeptoMail's HTTP API.
- **Senders:** [`apps/cms/src/email/mailer.ts`](apps/cms/src/email/mailer.ts) — one function per email type; each builds the subject + bilingual HTML and calls `sendMail`.
- **Endpoints:** [`apps/cms/src/endpoints/index.ts`](apps/cms/src/endpoints/index.ts) — validates input, persists to the DB, then calls the sender.

**Why HTTP API, not SMTP:** Railway (our CMS host) blocks outbound SMTP ports (465/587), so SMTP sends timed out. The transport now posts JSON to `https://api.zeptomail.com/v1.1/email` using the same Send Mail Token, presented as the `Zoho-enczapikey` header.

**Dev mode:** with `SMTP_PASS` unset (and not production), the transport falls back to nodemailer `jsonTransport` — emails are **logged to the CMS console, not sent**. The app still runs and DB rows are still written.

---

## 2. Where email is used on the site

| #   | User action                        | Page (route)         | Frontend component                                                    | CMS endpoint                     | Sender(s)                                                                     | Goes to                                                   |
| --- | ---------------------------------- | -------------------- | --------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | "Write us a note" contact form     | `/support`           | [`SupportPage.tsx`](packages/ui/src/components/SupportPage.tsx)       | `POST /api/contact`              | `sendContactNotification`                                                     | **Internal** (`CONTACT_NOTIFY_EMAIL`), Reply-To = visitor |
| 2   | Newsletter subscribe               | `/newsletter`        | [`NewsletterPage.tsx`](packages/ui/src/components/NewsletterPage.tsx) | `POST /api/newsletter/subscribe` | `sendNewsletterConfirmation`                                                  | Subscriber (double opt-in link)                           |
| 3   | "Monday Briefing" inline subscribe | `/research`, `/blog` | [`ResearchPage.tsx`](packages/ui/src/components/ResearchPage.tsx)     | `POST /api/newsletter/subscribe` | `sendNewsletterConfirmation`                                                  | Subscriber (double opt-in link)                           |
| 4   | Confirm subscription (email link)  | —                    | —                                                                     | `GET /api/newsletter/confirm`    | `sendNewsletterWelcome`                                                       | Subscriber                                                |
| 5   | Gated ebook download               | `/ebooks`            | [`EbooksPage.tsx`](packages/ui/src/components/EbooksPage.tsx)         | `POST /api/education/gate`       | `sendEbookDelivery` (PDF attached)                                            | Requester                                                 |
| 6   | Webinar registration               | `/education/media`   | [`WebinarsPage.tsx`](packages/ui/src/components/WebinarsPage.tsx)     | `POST /api/webinars/register`    | `sendWebinarRegistrationConfirmation` + `sendWebinarRegistrationNotification` | Registrant **and** internal (`WEBINAR_NOTIFY_EMAIL`)      |
| 7   | IB / partner application           | `/trade/ib`          | [`IBPage.tsx`](packages/ui/src/components/IBPage.tsx)                 | `POST /api/partners/apply`       | `sendPartnersNotification`                                                    | **Internal** (`PARTNERS_NOTIFY_EMAIL`)                    |
| 8   | Admin forgot-password              | CMS `/admin`         | Payload built-in                                                      | Payload auth                     | `emailTransport` (same transport)                                             | Admin user                                                |

All eight paths share the single `sendMail` → ZeptoMail transport. **If one delivers, they all deliver** — the only per-path variables are the recipient env var and the trigger.

---

## 3. How a send actually works (contact form, representative)

1. **Frontend** ([`SupportPage.tsx`](packages/ui/src/components/SupportPage.tsx)) POSTs `{ name, email, subject, message }` to `${NEXT_PUBLIC_CMS_URL}/api/contact`.
2. **Endpoint** validates (name ≤200, valid email, subject ≤300, message 10–5000 chars). Bad input → `400 { errors: [{ field, message }] }`.
3. **Persist first:** writes a row to the `contact-submissions` collection (with a salted SHA-256 IP hash). **The DB row is the source of truth.**
4. **Email is best-effort:** calls `sendContactNotification`. If it throws, the error is logged and **swallowed** — the request still returns `200`. So a green form ≠ proof the email was delivered; the CMS row is the guarantee.
5. **`sendContactNotification`** builds the HTML and calls `sendMail({ to: CONTACT_NOTIFY_EMAIL, replyTo: <visitor>, subject: "[Contact Form] …", html })`.
6. **`sendMail`** → transport → POST to ZeptoMail HTTP API. Non-2xx throws (caught by step 4's best-effort wrapper).

The **From** address is always `NewEra365 <EMAIL_FROM>` (`no-reply@newera365.com`). It never sends _as_ the visitor — that would fail SPF/DKIM. The visitor is set as **Reply-To** so staff can reply directly.

Newsletter (double opt-in), ebook (PDF attachment), and webinar (two emails) follow the same shape with their own validation and senders.

---

## 4. The frontend error-shape contract (important for any new form)

Endpoints return **two different error shapes**:

- **Validation (400):** `{ errors: [{ field, message }] }` ← contact, partners, webinar
- **Server fault / not-found / bad-request (4xx/5xx):** `{ error: "message" }` ← newsletter, ebook gate, and all 500s
- **Rate limit (429):** plain text (not JSON) — `res.json()` fails → generic fallback.

Every form's error handler must read **both**, or it silently shows a useless "Something went wrong." Use this exact pattern (already applied to all 6 forms as of 2026-07-10):

```ts
const data = (await res.json().catch(() => ({}))) as {
  error?: string;
  errors?: { message?: string }[];
};
setError(data.errors?.[0]?.message ?? data.error ?? '<fallback>');
```

> **Bug fixed 2026-07-10:** all six forms previously read only `data.error`, so validation errors (the `errors[]` shape) were swallowed. Symptom: a too-short contact message showed "Something went wrong." instead of "Message must be at least 10 characters." The contact form also gained a native `minLength={10}` on the textarea.

---

## 5. Environment variables

| Var                             | Purpose                                                                     | Prod value / note                                                                                |
| ------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `SMTP_PASS`                     | **The ZeptoMail Send Mail Token.** The one var that decides send-vs-silent. | Set (verified present). Without it in prod, sends 401 and (for best-effort paths) fail silently. |
| `EMAIL_FROM`                    | The From address. **Must be on a ZeptoMail-verified domain.**               | `no-reply@newera365.com` (domain verified).                                                      |
| `SMTP_HOST`                     | Derives the API host (`smtp.zeptomail.com` → `api.zeptomail.com`).          | `smtp.zeptomail.com`                                                                             |
| `SMTP_USER` / `SMTP_PORT`       | Legacy SMTP fields — **unused** by the HTTP-API path.                       | Harmless if left set.                                                                            |
| `CONTACT_NOTIFY_EMAIL`          | Recipient of contact-form notifications. Falls back to `EMAIL_FROM`.        | ⚠️ Currently a personal Gmail for testing — **change to `support@newera365.com` for launch.**    |
| `PARTNERS_NOTIFY_EMAIL`         | Recipient of IB/partner applications. Falls back to `EMAIL_FROM`.           | ⚠️ Currently a personal Gmail — **change for launch.**                                           |
| `WEBINAR_NOTIFY_EMAIL`          | Internal recipient of webinar registrations. Falls back to `EMAIL_FROM`.    | Verify it's set to a monitored inbox (else lands at `no-reply@`).                                |
| `PAYLOAD_PUBLIC_SERVER_URL`     | Builds the confirm/unsubscribe links inside emails.                         | `https://cms-production-580a.up.railway.app`                                                     |
| `NEXT_PUBLIC_CMS_URL`           | **Frontend (Vercel)** — where forms POST.                                   | Must equal the Railway CMS URL, **no trailing newline.**                                         |
| `CORS_ORIGINS` / `FRONTEND_URL` | CMS CORS allow-list — the browser origin serving the site.                  | Must include the live site origin (verified working for the Vercel origin).                      |

---

## 6. Going to production — checklist

- [ ] **`SMTP_PASS`** set on Railway to the ZeptoMail Send Mail Token. _(Currently set.)_
- [ ] **`EMAIL_FROM`** on the verified domain. _(Currently `no-reply@newera365.com`.)_
- [ ] **Repoint the internal recipients to real inboxes:** `CONTACT_NOTIFY_EMAIL`, `PARTNERS_NOTIFY_EMAIL`, `WEBINAR_NOTIFY_EMAIL` → `support@newera365.com` (or the desks that own each). **These are personal Gmail right now for testing.**
- [ ] **`PAYLOAD_PUBLIC_SERVER_URL`** = the public CMS URL, so newsletter confirm/unsubscribe links resolve.
- [ ] **`NEXT_PUBLIC_CMS_URL`** on Vercel = the Railway CMS URL, no trailing whitespace.
- [ ] **CORS** (`CORS_ORIGINS`/`FRONTEND_URL`) includes the real site origin.
- [ ] **Deployed transport is the ZeptoMail-HTTP-API version** of `transport.ts` (an older SMTP-only build would silently time out on Railway).
- [ ] **Redeploy rules:**
  - Changing a **Railway env var** → the CMS service redeploys automatically.
  - Shipping **new frontend code** (e.g. today's error-handling fix) → requires a **Vercel redeploy** of `apps/web`; a CMS-only or env-only change does not update the frontend bundle.
- [ ] _(Unrelated but noticed)_ **`HEALTH_CHECK_TOKEN`** is missing in prod, which makes `GET /api/health` always return 401. Set it if you want health checks to work.

### How to verify prod after changes

Send a real submission to the live endpoint and confirm the inbox:

```bash
curl -sS -w "\nHTTP %{http_code}\n" -X POST \
  https://cms-production-580a.up.railway.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@example.com","subject":"General","message":"end to end wiring test"}'
# Expect HTTP 200, then confirm the email lands in CONTACT_NOTIFY_EMAIL.
```

Remember: a `200` only proves the app path; because notifications are best-effort, **inbox arrival is the real confirmation.** DB rows always land regardless (Contact Submissions / Webinar Registrations / Newsletter Subscribers in the CMS admin).

---

## 7. Gotchas

- **Best-effort email:** contact / partners / webinar-notify sends are wrapped so a mail failure never 500s the form. Good for UX, but it also means a broken mailer is invisible from the frontend. Watch the CMS logs, or check whether the notification arrived.
- **Double opt-in:** newsletter subscribe only sends a _confirmation_ email; the _welcome_ email fires on `GET /api/newsletter/confirm` when the user clicks the link.
- **Attachments:** the ebook sender passes the PDF via `path` (local `/media` file in dev, R2/URL in prod); the transport fetches URL attachments and base64-encodes them for ZeptoMail.
- **`transport.verify()` is a no-op** — the HTTP API has no connection handshake, so Payload's init-time verify never blocks cold starts. Real failures still surface at send time.
