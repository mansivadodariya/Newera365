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

export const emailTransport = nodemailer.createTransport(
  {
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY ?? '',
    },
  },
  // Default message options — overridden per-send by Payload.
  { from: fromAddress },
);

// Verify SMTP credentials on startup so misconfiguration is caught early
// rather than silently at the moment an email would be sent.
if (process.env.NODE_ENV !== 'test') {
  emailTransport.verify((err) => {
    if (err) {
      console.error('[email] Resend SMTP connection failed:', err.message);
    } else {
      console.info('[email] Resend SMTP connection verified');
    }
  });
}
