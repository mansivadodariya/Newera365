import { sendMail, FROM } from './transport';
import { escapeHtml } from './escapeHtml';

// Transactional + newsletter email senders. Every message goes through the single
// ZeptoMail SMTP transport (sendMail in transport.ts). Payload's built-in
// forgot-password flow uses the same transport via email.transport in payload.config.ts.
// FROM is imported only for the internal-recipient fallbacks below.

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
    ? 'تأكيد اشتراكك في النشرة الإخبارية — Newera365'
    : 'Confirm your Newera365 newsletter subscription';

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
        <p>شكراً لاشتراكك في نشرة Newera365 الإخبارية.</p>
        <p>يرجى النقر على الرابط أدناه لتأكيد اشتراكك:</p>
        <p><a href="${safeConfirmUrl}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">تأكيد الاشتراك</a></p>
        <p style="color:#6b7280;font-size:13px">إذا لم تطلب الاشتراك، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        <p style="color:#6b7280;font-size:13px">هذا الرابط صالح لمدة 72 ساعة.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — تداول بثقة</p>
        ${unsubscribeFooterAr}
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>Confirm your newsletter subscription</h2>
        <p>Thank you for subscribing to the Newera365 newsletter.</p>
        <p>Click the button below to confirm your subscription:</p>
        <p><a href="${safeConfirmUrl}" style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">Confirm subscription</a></p>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#6b7280;font-size:13px">This link is valid for 72 hours.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — Trade with confidence</p>
        ${unsubscribeFooterEn}
      </div>
    `;

  await sendMail({
    to: email,
    subject,
    html,
  });
}

// Delivers a gated ebook PDF to the requester after the /ebooks email gate.
// The PDF is attached AND linked (fallback if the client strips attachments).
// fileUrl is the CMS/R2 media URL; nodemailer fetches it for the attachment.
export async function sendEbookDelivery({
  email,
  ebookTitle,
  fileUrl,
  locale,
}: {
  email: string;
  ebookTitle: string;
  fileUrl: string;
  locale: 'en' | 'ar';
}): Promise<void> {
  const isAr = locale === 'ar';
  const safeTitle = escapeHtml(ebookTitle);
  const safeUrl = escapeHtml(fileUrl);
  const subject = isAr ? `كتابك الإلكتروني: ${ebookTitle}` : `Your ebook: ${ebookTitle}`;

  // Best-effort filename from the URL (e.g. the-5-percent-rule.pdf).
  let filename = 'ebook.pdf';
  try {
    const last = new URL(fileUrl).pathname.split('/').pop();
    if (last) filename = decodeURIComponent(last);
  } catch {
    /* keep default */
  }

  const html = isAr
    ? `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px">
        <div style="border-bottom:3px solid #00b050;padding-bottom:16px;margin-bottom:24px">
          <span style="font-size:22px;font-weight:700;color:#111">Newera365</span>
        </div>
        <h2 style="color:#111;font-size:20px;margin-bottom:12px">ها هو كتابك الإلكتروني 📘</h2>
        <p style="color:#374151;line-height:1.6">شكراً لطلبك <strong>${safeTitle}</strong>. الملف مرفق بهذا البريد.</p>
        <p style="color:#374151;line-height:1.6">إذا لم يظهر المرفق، يمكنك تنزيله مباشرة:</p>
        <p><a href="${safeUrl}" style="background:#00b050;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">تنزيل الـ PDF</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — تداول بثقة</p>
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px">
        <div style="border-bottom:3px solid #00b050;padding-bottom:16px;margin-bottom:24px">
          <span style="font-size:22px;font-weight:700;color:#111">Newera365</span>
        </div>
        <h2 style="color:#111;font-size:20px;margin-bottom:12px">Here's your ebook 📘</h2>
        <p style="color:#374151;line-height:1.6">Thanks for requesting <strong>${safeTitle}</strong>. The PDF is attached to this email.</p>
        <p style="color:#374151;line-height:1.6">If the attachment doesn't show, download it directly:</p>
        <p><a href="${safeUrl}" style="background:#00b050;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">Download the PDF</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — Trade with confidence</p>
      </div>
    `;

  await sendMail({
    to: email,
    subject,
    html,
    attachments: [{ filename, path: fileUrl, contentType: 'application/pdf' }],
  });
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

  await sendMail({
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
}

// Confirmation sent to a webinar registrant. Bilingual EN/AR. No Zoom dependency.
export async function sendWebinarRegistrationConfirmation({
  email,
  name,
  webinarTitle,
  scheduledAt,
  locale,
}: {
  email: string;
  name: string;
  webinarTitle: string;
  scheduledAt?: string;
  locale: 'en' | 'ar';
}): Promise<void> {
  const isAr = locale === 'ar';
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(webinarTitle);
  const when = scheduledAt
    ? escapeHtml(new Date(scheduledAt).toUTCString())
    : isAr
      ? 'سيتم الإعلان عنه'
      : 'To be announced';

  const subject = isAr
    ? `تأكيد التسجيل في الندوة — ${webinarTitle}`
    : `Webinar registration confirmed — ${webinarTitle}`;

  const html = isAr
    ? `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>تم تأكيد تسجيلك</h2>
        <p>مرحباً ${safeName}،</p>
        <p>شكراً لتسجيلك في الندوة عبر الإنترنت: <strong>${safeTitle}</strong>.</p>
        <p>الموعد (UTC): ${when}</p>
        <p>سنرسل إليك رابط الحضور قبل بدء الندوة.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — تداول بثقة</p>
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>Your registration is confirmed</h2>
        <p>Hi ${safeName},</p>
        <p>Thanks for registering for the webinar: <strong>${safeTitle}</strong>.</p>
        <p>When (UTC): ${when}</p>
        <p>We'll send you the joining link before the session starts.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — Trade with confidence</p>
      </div>
    `;

  await sendMail({
    to: email,
    subject,
    html,
  });
}

// Internal notification to staff that someone registered for a webinar.
export async function sendWebinarRegistrationNotification({
  name,
  email,
  webinarTitle,
}: {
  name: string;
  email: string;
  webinarTitle: string;
}): Promise<void> {
  const internalRecipient = process.env.WEBINAR_NOTIFY_EMAIL ?? process.env.EMAIL_FROM ?? FROM;

  await sendMail({
    to: internalRecipient,
    replyTo: email,
    subject: `[Webinar] New registration — ${webinarTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>New webinar registration</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;width:120px">Webinar</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(webinarTitle)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Name</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${escapeHtml(email)}</td></tr>
        </table>
      </div>
    `,
  });
}

export async function sendNewsletterWelcome({
  email,
  unsubscribeToken,
  locale,
}: {
  email: string;
  unsubscribeToken?: string;
  locale: 'en' | 'ar';
}): Promise<void> {
  const isAr = locale === 'ar';
  const subject = isAr
    ? 'مرحباً بك في نشرة Newera365 الإخبارية'
    : 'Welcome to The Monday Briefing — Newera365';

  const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
  const unsubscribeUrl = unsubscribeToken
    ? escapeHtml(`${serverUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`)
    : null;
  const unsubFooterEn = unsubscribeUrl
    ? `<p style="color:#9ca3af;font-size:11px">Changed your mind? <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe</a></p>`
    : '';
  const unsubFooterAr = unsubscribeUrl
    ? `<p style="color:#9ca3af;font-size:11px">غيّرت رأيك؟ <a href="${unsubscribeUrl}" style="color:#9ca3af">إلغاء الاشتراك</a></p>`
    : '';

  const html = isAr
    ? `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px">
        <div style="border-bottom:3px solid #00b050;padding-bottom:16px;margin-bottom:24px">
          <span style="font-size:22px;font-weight:700;color:#111">Newera365</span>
        </div>
        <h2 style="color:#111;font-size:20px;margin-bottom:12px">اشتراكك مؤكد ✓</h2>
        <p style="color:#374151;line-height:1.6">مرحباً بك في نشرة <strong>The Monday Briefing</strong> من Newera365.</p>
        <p style="color:#374151;line-height:1.6">إليك ما ستحصل عليه كل أسبوع:</p>
        <ul style="color:#374151;line-height:2;padding-right:20px">
          <li>تحليل السوق الأسبوعي من فريق المحللين</li>
          <li>أفضل إعداد للتداول لهذا الأسبوع</li>
          <li>أحداث كبرى في التقويم الاقتصادي</li>
          <li>نصائح تعليمية قصيرة</li>
        </ul>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">تصل النشرة كل يوم اثنين قبل افتتاح الأسواق.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — تداول بثقة</p>
        ${unsubFooterAr}
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px">
        <div style="border-bottom:3px solid #00b050;padding-bottom:16px;margin-bottom:24px">
          <span style="font-size:22px;font-weight:700;color:#111">Newera365</span>
        </div>
        <h2 style="color:#111;font-size:20px;margin-bottom:12px">You're in ✓</h2>
        <p style="color:#374151;line-height:1.6">Welcome to <strong>The Monday Briefing</strong> by Newera365.</p>
        <p style="color:#374151;line-height:1.6">Here's what lands in your inbox every week:</p>
        <ul style="color:#374151;line-height:2;padding-left:20px">
          <li>Weekly market thesis from our trading desk</li>
          <li>Best trade setup of the week</li>
          <li>Key events on the economic calendar</li>
          <li>A short educational insight</li>
        </ul>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">Delivered every Monday before markets open.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Newera365 — Trade with confidence</p>
        ${unsubFooterEn}
      </div>
    `;

  await sendMail({
    to: email,
    subject,
    html,
  });
}

export async function sendPartnersNotification(data: Record<string, string>): Promise<void> {
  const internalRecipient = process.env.PARTNERS_NOTIFY_EMAIL ?? process.env.EMAIL_FROM ?? FROM;
  const rows = Object.entries(data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 8px;font-weight:bold;border-bottom:1px solid #e5e7eb">${escapeHtml(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`,
    )
    .join('');

  await sendMail({
    to: internalRecipient,
    subject: '[Partners] New IB/partner application',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2>New partner application</h2>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
      </div>
    `,
  });
}
