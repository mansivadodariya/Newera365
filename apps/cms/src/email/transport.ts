import nodemailer, { type TransportOptions } from 'nodemailer';

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

// jsonTransport is cast to TransportOptions so it resolves via the generic
// createTransport overload, yielding the same Transporter type as the SMTP branch
// (the dedicated JSON overload rejects a separate `from` default). `from` is still
// applied per-message in sendMail() and by Payload's email config.
const transport = useJsonTransport
  ? nodemailer.createTransport({ jsonTransport: true } as TransportOptions)
  : nodemailer.createTransport(
      {
        host: HOST,
        port: PORT,
        // TLS is always on. Port 465 = implicit TLS (encrypted from connect);
        // port 587 = STARTTLS. requireTLS forces the STARTTLS upgrade so the
        // session can never silently fall back to plaintext on 587.
        secure: PORT === 465,
        requireTLS: true,
        auth: { user: USER, pass: PASS },
        // ZeptoMail's TLS handshake can take >5s on some networks; a too-tight
        // timeout caused intermittent "email failed" errors. Give it headroom.
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
      },
      { from: `${FROM_NAME} <${FROM}>` },
    );

if (useJsonTransport) {
  console.warn('[email] SMTP_PASS not set — using jsonTransport (emails are logged, not sent)');
}

// Payload calls transport.verify() during payload.init() — if SMTP port 465/587
// is blocked (e.g. some PaaS), this makes every cold start log an error and wait
// 5 seconds. Overriding verify() makes Payload's check always pass; actual send
// failures are still reported at send time. Also forced on for jsonTransport/test.
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

// Subset of nodemailer's attachment shape we use — `path` accepts a local file
// path OR an http(s) URL (nodemailer fetches it), so the same call works for
// local /media files in dev and signed R2 URLs in production.
export interface MailAttachment {
  filename: string;
  path: string;
  contentType?: string;
}

// Shared send helper so every email goes through one transport.
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}): Promise<void> {
  await transport.sendMail({
    from: `${FROM_NAME} <${FROM}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
    attachments: opts.attachments,
  });
}

// Opt-in only: dialing SMTP at import time makes every server cold start do eager
// network I/O and log spam (NE code-review WR-10). Set SMTP_VERIFY_ON_START=true to
// re-enable the startup connectivity check; actual send failures are still reported.
if (
  process.env.SMTP_VERIFY_ON_START === 'true' &&
  process.env.NODE_ENV !== 'test' &&
  !useJsonTransport
) {
  transport.verify((err) => {
    if (err) {
      console.error('[email] ZeptoMail SMTP connection failed:', err.message);
    } else {
      console.info('[email] ZeptoMail SMTP connection verified');
    }
  });
}
