import nodemailer, { type TransportOptions } from 'nodemailer';
import { readFile } from 'fs/promises';

// ZeptoMail email transport — backs Payload's built-in email pipeline AND all
// transactional/newsletter emails (see mailer.ts). Single provider, single path.
//
// Sends via ZeptoMail's HTTP Email API (port 443), NOT SMTP: Railway (and many
// PaaS) block outbound SMTP ports 465/587, so every SMTP send timed out with
// ETIMEDOUT and no mail ever left the box. The API uses the SAME "Send Mail
// Token" as SMTP — just presented as the `Zoho-enczapikey` Authorization header.
//
// Credentials (ZeptoMail console → Mail Agent):
//   SMTP_HOST  smtp.zeptomail.com  (→ API host api.zeptomail.com; .eu/.in mirror)
//   SMTP_PASS  <Send Mail Token>   (used verbatim as the API auth key)
//   EMAIL_FROM no-reply@newera365.com  (address MUST be on a ZeptoMail-verified domain)
//
// Server-only — payload.config.ts aliases this to transport.mock in the admin bundle.
const HOST = process.env.SMTP_HOST ?? 'smtp.zeptomail.com';
const PASS = process.env.SMTP_PASS ?? '';

export const FROM_NAME = 'Newera';
// ZeptoMail has no sandbox sender — the from domain must be verified in all envs.
export const FROM = process.env.EMAIL_FROM ?? 'no-reply@newera365.com';

// smtp.zeptomail.com → https://api.zeptomail.com/v1.1/email (region suffix preserved).
const ZEPTO_API_URL = `https://${HOST.replace(/^smtp\./i, 'api.')}/v1.1/email`;

// No token (typical local dev) → jsonTransport logs each message instead of sending,
// so the app runs without credentials and without throwing. Set SMTP_PASS to send.
const useJsonTransport = !PASS && process.env.NODE_ENV !== 'production';

// "Name <addr@host>" or "addr@host" → { name?, address }
function parseAddress(input: string): { address: string; name?: string } {
  const s = String(input ?? '').trim();
  const m = /^(?:"?([^"<]*?)"?\s*)?<([^<>]+)>$/.exec(s);
  if (m) return { name: m[1]?.trim() || undefined, address: m[2].trim() };
  return { address: s };
}
function toAddressList(v: unknown): string[] {
  return (Array.isArray(v) ? v : String(v ?? '').split(','))
    .map((x) => String(x).trim())
    .filter(Boolean);
}

interface MailData {
  from?: string;
  to?: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename?: string; path?: string; contentType?: string }[];
}

// nodemailer attachment ({ path } = local file OR http(s) URL) → ZeptoMail's
// base64 attachment shape. The URL branch fetches the file (e.g. gated R2 PDFs).
async function encodeAttachment(att: {
  filename?: string;
  path?: string;
  contentType?: string;
}): Promise<{ content: string; name: string; mime_type: string } | null> {
  if (!att.path) return null;
  let buf: Buffer;
  if (/^https?:/i.test(att.path)) {
    const res = await fetch(att.path);
    if (!res.ok) throw new Error(`attachment fetch ${res.status} for ${att.path}`);
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    buf = await readFile(att.path);
  }
  return {
    content: buf.toString('base64'),
    name: att.filename ?? 'attachment',
    mime_type: att.contentType ?? 'application/octet-stream',
  };
}

// Sends one message through the ZeptoMail HTTP API. Throws on non-2xx so callers
// (and Payload) observe send failures exactly as they did with SMTP.
async function sendViaZeptoApi(data: MailData): Promise<string> {
  const from = parseAddress(data.from ?? `${FROM_NAME} <${FROM}>`);
  const body: Record<string, unknown> = {
    from: { address: from.address, name: from.name ?? FROM_NAME },
    to: toAddressList(data.to).map((a) => ({ email_address: parseAddress(a) })),
    subject: data.subject ?? '',
    htmlbody: data.html ?? data.text ?? '',
  };
  if (data.text) body.textbody = data.text;
  if (data.replyTo) body.reply_to = toAddressList(data.replyTo).map((a) => parseAddress(a));
  const atts = data.attachments?.length
    ? (await Promise.all(data.attachments.map(encodeAttachment))).filter(Boolean)
    : [];
  if (atts.length) body.attachments = atts;

  const res = await fetch(ZEPTO_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-enczapikey ${PASS}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`ZeptoMail API ${res.status}: ${text.slice(0, 500)}`);
  return text;
}

// nodemailer wrapper keeps the existing emailTransport/sendMail contract (used by
// Payload's forgot-password pipeline AND every sender in mailer.ts) while routing
// real sends through the ZeptoMail HTTP API. jsonTransport still logs in dev.
const transport = useJsonTransport
  ? nodemailer.createTransport({ jsonTransport: true } as TransportOptions)
  : nodemailer.createTransport({
      name: 'zeptomail-api',
      version: '1.0.0',
      send(mail: { data: MailData }, done: (err: Error | null, info?: unknown) => void) {
        sendViaZeptoApi(mail.data)
          .then((response) => done(null, { messageId: `zepto-${Date.now()}`, response }))
          .catch((err: unknown) => done(err instanceof Error ? err : new Error(String(err))));
      },
    } as unknown as TransportOptions);

if (useJsonTransport) {
  console.warn('[email] SMTP_PASS not set — using jsonTransport (emails are logged, not sent)');
}

// The ZeptoMail API has no connection "verify" step; make Payload's init-time
// transport.verify() a no-op so cold starts never error or hang. (Also covers
// jsonTransport.) Real send failures still surface at send time.
transport.verify = (cb?: (err: Error | null, success: true) => void) => {
  cb?.(null, true);
  return Promise.resolve(true) as ReturnType<typeof transport.verify>;
};

export const emailTransport = transport;

// Subset of nodemailer's attachment shape we use — `path` accepts a local file
// path OR an http(s) URL, so the same call works for local /media files in dev
// and signed R2 URLs in production.
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
  const info = await transport.sendMail({
    from: `${FROM_NAME} <${FROM}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
    attachments: opts.attachments,
  });
  // jsonTransport resolves with the message as JSON instead of sending it;
  // surface it so dev form-testing can actually see the would-be email.
  if (useJsonTransport) {
    console.log(`[email:json] to=${opts.to} subject="${opts.subject}"`);
    console.log((info as { message?: string }).message ?? '');
  }
}
