import { Resend } from 'resend';

// Resend SDK client — used for newsletter double opt-in emails and contact form
// notifications. Payload's built-in forgot-password flow uses the separate
// nodemailer SMTP transport (transport.ts) for consistency with Payload's email pipeline.
let _client: Resend | null = null;

function getClient(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not set');
    _client = new Resend(key);
  }
  return _client;
}

// In production the FROM domain must be verified in Resend (resend.com/domains).
// In dev/test, use Resend's shared sandbox sender which works without verification.
const IS_PROD = process.env.NODE_ENV === 'production';
const FROM = IS_PROD
  ? (process.env.EMAIL_FROM ?? 'no-reply@newera365.com')
  : 'onboarding@resend.dev';
const FROM_NAME = 'NewEra365';

export async function sendNewsletterConfirmation({
  email,
  confirmUrl,
  unsubscribeToken,
  locale,
}: {
  email: string;
  confirmUrl: string;
  unsubscribeToken?: string;
  locale: 'en' | 'ar';
}): Promise<void> {
  const isAr = locale === 'ar';
  const subject = isAr
    ? 'تأكيد اشتراكك في النشرة الإخبارية — NewEra365'
    : 'Confirm your NewEra365 newsletter subscription';

  // confirmUrl is built from controlled sources but must still be escaped —
  // if an env var is misconfigured the raw string could break out of the href.
  const safeConfirmUrl = escapeHtml(confirmUrl);

  const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
  const unsubscribeUrl = unsubscribeToken
    ? escapeHtml(`${serverUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`)
    : null;
  const unsubscribeFooterEn = unsubscribeUrl
    ? `<p style="color:#9ca3af;font-size:11px">Don't want these emails? <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe</a></p>`
    : '';
  const unsubscribeFooterAr = unsubscribeUrl
    ? `<p style="color:#9ca3af;font-size:11px">لا تريد هذه الرسائل؟ <a href="${unsubscribeUrl}" style="color:#9ca3af">إلغاء الاشتراك</a></p>`
    : '';

  const html = isAr
    ? `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>تأكيد الاشتراك في النشرة الإخبارية</h2>
        <p>شكراً لاشتراكك في نشرة NewEra365 الإخبارية.</p>
        <p>يرجى النقر على الرابط أدناه لتأكيد اشتراكك:</p>
        <p><a href="${safeConfirmUrl}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">تأكيد الاشتراك</a></p>
        <p style="color:#6b7280;font-size:13px">إذا لم تطلب الاشتراك، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        <p style="color:#6b7280;font-size:13px">هذا الرابط صالح لمدة 72 ساعة.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">NewEra365 — تداول بثقة</p>
        ${unsubscribeFooterAr}
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>Confirm your newsletter subscription</h2>
        <p>Thank you for subscribing to the NewEra365 newsletter.</p>
        <p>Click the button below to confirm your subscription:</p>
        <p><a href="${safeConfirmUrl}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">Confirm subscription</a></p>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#6b7280;font-size:13px">This link is valid for 72 hours.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">NewEra365 — Trade with confidence</p>
        ${unsubscribeFooterEn}
      </div>
    `;

  const { error } = await getClient().emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to: email,
    subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendContactNotification({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const internalRecipient = process.env.CONTACT_NOTIFY_EMAIL ?? process.env.EMAIL_FROM ?? FROM;

  const { error } = await getClient().emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to: internalRecipient,
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>New contact form submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;width:120px">Name</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Email</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Subject</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(subject)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Message</td><td style="padding:8px;white-space:pre-wrap">${escapeHtml(message)}</td></tr>
        </table>
      </div>
    `,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendPartnersNotification(data: Record<string, string>): Promise<void> {
  const internalRecipient = process.env.PARTNERS_NOTIFY_EMAIL ?? process.env.EMAIL_FROM ?? FROM;
  const rows = Object.entries(data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 8px;font-weight:bold;border-bottom:1px solid #e5e7eb">${escapeHtml(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`,
    )
    .join('');

  const { error } = await getClient().emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to: internalRecipient,
    subject: '[Partners] New IB/partner application',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>New partner application</h2>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
      </div>
    `,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
