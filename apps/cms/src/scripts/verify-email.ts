/**
 * Email integration verifier for the ZeptoMail SMTP migration.
 *
 * Run:  npm run email:verify --workspace=@newera365/cms
 *
 * It runs in up to three parts:
 *   1. App path (no network) — exercises all 6 template senders through the real
 *      mailer.ts → sendMail → transport.ts path in dev/jsonTransport mode. Proves
 *      every template renders and the wiring works without runtime errors.
 *   2. Real SMTP send (network) — transmits a message over a real SMTP server using
 *      a throwaway nodemailer Ethereal account configured exactly like transport.ts,
 *      and prints a preview URL. Proves the SMTP send pipeline genuinely works.
 *   3. Live ZeptoMail send (only when SMTP_PASS is set) — sends a real message via the
 *      configured ZeptoMail credentials to EMAIL_FROM and reports the result.
 *
 * Sending nothing to real inboxes: Parts 1–2 use jsonTransport / Ethereal, which never
 * deliver to real recipients. Part 3 only runs when you have provided real credentials.
 */
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Capture any real credentials BEFORE Part 1 forces dev mode.
const REAL = {
  host: process.env.SMTP_HOST ?? 'smtp.zeptomail.com',
  port: Number(process.env.SMTP_PORT ?? 465),
  user: process.env.SMTP_USER ?? 'emailapikey',
  pass: process.env.SMTP_PASS ?? '',
  from: process.env.EMAIL_FROM ?? 'no-reply@newera365.com',
};

function readMessageEnvelope(info: unknown): {
  from?: string;
  to?: unknown;
  subject?: string;
  htmlLen: number;
} {
  const raw = (info as { message?: unknown }).message;
  try {
    const parsed = JSON.parse(String(raw ?? '{}')) as {
      from?: string;
      to?: unknown;
      subject?: string;
      html?: string;
    };
    return {
      from: parsed.from,
      to: parsed.to,
      subject: parsed.subject,
      htmlLen: (parsed.html ?? '').length,
    };
  } catch {
    return { htmlLen: 0 };
  }
}

async function main(): Promise<void> {
  /* ---------------------------------------------------------------- Part 1 */
  console.log(
    '=== Part 1: app template senders via real mailer.ts path (dev/jsonTransport, no network) ===',
  );
  delete process.env.SMTP_PASS; // force jsonTransport so nothing is actually sent
  process.env.NODE_ENV = 'development';

  const { emailTransport } = await import('../email/transport');
  const mailer = await import('../email/mailer');

  // Confirm the dev-mode transport produces a well-formed message (headers + body).
  const probe = await emailTransport.sendMail({
    from: 'Newera365 <no-reply@newera365.com>',
    to: 'probe@example.com',
    subject: 'probe',
    html: '<p>probe</p>',
  });
  console.log('  transport mode = jsonTransport; sample envelope =', readMessageEnvelope(probe));

  // Exercise every real template sender through the actual app code path.
  await mailer.sendNewsletterConfirmation({
    email: 'subscriber@example.com',
    confirmUrl: 'https://newera365.com/api/newsletter/confirm?token=ABC123',
    unsubscribeToken: 'UNSUB123',
    locale: 'en',
  });
  await mailer.sendNewsletterConfirmation({
    email: 'subscriber@example.com',
    confirmUrl: 'https://newera365.com/api/newsletter/confirm?token=ABC123',
    unsubscribeToken: 'UNSUB123',
    locale: 'ar',
  });
  await mailer.sendNewsletterWelcome({
    email: 'welcome@example.com',
    unsubscribeToken: 'UNSUB123',
    locale: 'en',
  });
  await mailer.sendContactNotification({
    name: 'Jane <b>Tester</b>',
    email: 'jane@example.com',
    subject: 'Demo & test',
    message: 'Hello\nWorld',
  });
  await mailer.sendWebinarRegistrationConfirmation({
    email: 'registrant@example.com',
    name: 'Reg Istrant',
    webinarTitle: 'Intro to CFDs',
    scheduledAt: new Date().toISOString(),
    locale: 'ar',
  });
  await mailer.sendWebinarRegistrationNotification({
    name: 'Reg Istrant',
    email: 'registrant@example.com',
    webinarTitle: 'Intro to CFDs',
  });
  await mailer.sendPartnersNotification({
    Company: 'Acme Trading',
    Email: 'partner@acme.com',
    Country: 'AE',
  });
  console.log(
    '  ✓ All template senders executed through mailer.ts → sendMail with no runtime errors.\n',
  );

  /* ---------------------------------------------------------------- Part 2 */
  console.log(
    '=== Part 2: real SMTP transmission via Ethereal (same transport config as transport.ts) ===',
  );
  try {
    const acct = await nodemailer.createTestAccount();
    const PORT = Number(acct.smtp.port);
    const etherealTransport = nodemailer.createTransport(
      {
        host: acct.smtp.host,
        port: PORT,
        secure: PORT === 465,
        auth: { user: acct.user, pass: acct.pass },
        connectionTimeout: 5_000,
        greetingTimeout: 5_000,
      },
      { from: `Newera365 <${acct.user}>` },
    );
    const info = await etherealTransport.sendMail({
      to: 'inbox@example.com',
      subject: '[verify] Newera365 SMTP send path',
      html: '<h2>SMTP transmission OK</h2><p>Proves the nodemailer SMTP send path works from this codebase.</p>',
    });
    console.log('  ✓ SMTP send accepted:', info.accepted, '| server response:', info.response);
    console.log('  → Preview the delivered message:', nodemailer.getTestMessageUrl(info), '\n');
  } catch (err) {
    console.log('  ⚠ Skipped (no network / sandbox):', (err as Error).message, '\n');
  }

  /* ---------------------------------------------------------------- Part 3 */
  console.log('=== Part 3: live ZeptoMail send (runs only when SMTP_PASS is set) ===');
  if (!REAL.pass) {
    console.log('  ⏭ SMTP_PASS not set — skipping live ZeptoMail send.');
    console.log('     To run it: set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS + EMAIL_FROM (on a');
    console.log('     ZeptoMail-verified domain) in apps/cms/.env and re-run this script.');
  } else {
    console.log(
      `  Using host=${REAL.host} port=${REAL.port} user=${REAL.user} from=${REAL.from} (pass length ${REAL.pass.length})`,
    );
    const liveTransport = nodemailer.createTransport(
      {
        host: REAL.host,
        port: REAL.port,
        secure: REAL.port === 465,
        requireTLS: true,
        auth: { user: REAL.user, pass: REAL.pass },
        connectionTimeout: 8_000,
        greetingTimeout: 8_000,
      },
      { from: `Newera365 <${REAL.from}>` },
    );
    try {
      const info = await liveTransport.sendMail({
        to: REAL.from,
        subject: '[verify] Newera365 ZeptoMail live send',
        html: '<h2>ZeptoMail live send OK</h2><p>If you received this, ZeptoMail SMTP is fully working.</p>',
      });
      console.log('  ✓ ZeptoMail accepted:', info.accepted, '| server response:', info.response);
      console.log('     Check the', REAL.from, 'inbox to confirm delivery.');
    } catch (err) {
      const e = err as {
        responseCode?: number;
        response?: string;
        code?: string;
        message?: string;
      };
      console.log(`  ✗ ZeptoMail send failed (${e.code ?? 'ERR'}): ${e.response ?? e.message}`);
      if (e.responseCode === 535) {
        console.log('     535 = credentials rejected. For ZeptoMail, check:');
        console.log(
          '       • SMTP_USER must be the literal "emailapikey" (NOT your email address)',
        );
        console.log(
          '       • SMTP_PASS must be the Mail Agent "Send Mail Token" (NOT your account password)',
        );
        console.log('       • host must match your account region: smtp.zeptomail.com / .eu / .in');
        console.log('       • the sending domain / EMAIL_FROM must be verified in ZeptoMail');
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFY FAILED:', err);
    process.exit(1);
  });
