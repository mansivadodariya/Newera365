import nodemailer from 'nodemailer';

// Resend SMTP gateway — works with Payload's built-in nodemailer email pipeline.
// Username is the literal string "resend"; password is the Resend API key.
// This module is server-only — `payload.config.ts` aliases it to a mock in
// the admin webpack bundle to avoid bundling nodemailer for the browser.
//
// FROM address rules (mirrors resend.ts):
//   - Production:  EMAIL_FROM env var (must be a Resend-verified domain).
//   - Dev/staging: Resend's shared sandbox sender — no domain verification needed.
//
// IMPORTANT: Before going live, verify newera365.com at resend.com/domains and
// set EMAIL_FROM=no-reply@newera365.com in the production environment.
const IS_PROD = process.env.NODE_ENV === 'production';
const fromAddress = IS_PROD
  ? (process.env.EMAIL_FROM ?? 'no-reply@newera365.com')
  : 'onboarding@resend.dev';

const transport = nodemailer.createTransport(
  {
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY ?? '',
    },
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
  },
  { from: fromAddress },
);

// Payload calls transport.verify() during payload.init() — if SMTP port 465
// is blocked (e.g. Railway), this makes every cold start log an error and
// wait 5 seconds. Overriding verify() makes Payload's check always pass;
// actual send failures are still reported at send time.
if (process.env.SKIP_SMTP_VERIFY === 'true' || process.env.NODE_ENV === 'test') {
  transport.verify = (cb?: (err: Error | null, success: true) => void) => {
    cb?.(null, true);
    return Promise.resolve(true) as ReturnType<typeof transport.verify>;
  };
}

export const emailTransport = transport;

if (process.env.SKIP_SMTP_VERIFY !== 'true' && process.env.NODE_ENV !== 'test') {
  transport.verify((err) => {
    if (err) {
      console.error('[email] Resend SMTP connection failed:', err.message);
    } else {
      console.info('[email] Resend SMTP connection verified');
    }
  });
}
