import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import type { PayloadRequest } from 'payload/types';
import type { Response } from 'express';

/**
 * TOTP two-factor authentication for admin users.
 *
 * SERVER-ONLY. This module imports otplib + qrcode (Node crypto). payload.config.ts
 * aliases it to ./totp.mock for the admin webpack bundle so these never reach the
 * browser. The enrolment handlers below are registered as collection-level endpoints
 * on Users (so req.user is populated by Payload's auth), and enforceTotpOnLogin runs
 * from the Users beforeLogin hook.
 *
 * Secrets are read with overrideAccess + showHiddenFields because totpSecret has
 * field-level read:()=>false (never serialised to API responses).
 */

const ISSUER = 'NewEra365';

type AuthedUser = { id: string | number; email?: string };

async function readSecrets(
  req: PayloadRequest,
  id: string | number,
): Promise<{ totpEnabled?: boolean; totpSecret?: string; totpTempSecret?: string }> {
  const doc = (await req.payload.findByID({
    collection: 'users',
    id,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  })) as unknown as Record<string, unknown>;
  return {
    totpEnabled: doc.totpEnabled as boolean | undefined,
    totpSecret: doc.totpSecret as string | undefined,
    totpTempSecret: doc.totpTempSecret as string | undefined,
  };
}

/** POST /api/users/2fa/setup — generate a secret + QR for an authenticated user. */
export const totpSetupHandler = async (req: PayloadRequest, res: Response): Promise<void> => {
  const user = req.user as AuthedUser | undefined;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const secret = authenticator.generateSecret();
  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { totpTempSecret: secret },
    overrideAccess: true,
    depth: 0,
  });

  const otpauthUrl = authenticator.keyuri(user.email ?? String(user.id), ISSUER, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

  res.json({ otpauthUrl, qrDataUrl });
};

/** POST /api/users/2fa/verify — confirm enrolment by verifying a code against the temp secret. */
export const totpVerifyHandler = async (req: PayloadRequest, res: Response): Promise<void> => {
  const user = req.user as AuthedUser | undefined;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (!/^\d{6}$/.test(token)) {
    res.status(400).json({ error: 'A 6-digit code is required.' });
    return;
  }

  const { totpTempSecret } = await readSecrets(req, user.id);
  if (!totpTempSecret) {
    res.status(400).json({ error: 'No enrolment in progress. Start setup first.' });
    return;
  }
  if (!authenticator.verify({ token, secret: totpTempSecret })) {
    res.status(400).json({ error: 'Invalid code. Please try again.' });
    return;
  }

  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { totpSecret: totpTempSecret, totpEnabled: true, totpTempSecret: null },
    overrideAccess: true,
    depth: 0,
  });
  res.json({ message: 'Two-factor authentication enabled.' });
};

/** POST /api/users/2fa/disable — requires a valid current code to turn 2FA off. */
export const totpDisableHandler = async (req: PayloadRequest, res: Response): Promise<void> => {
  const user = req.user as AuthedUser | undefined;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (!/^\d{6}$/.test(token)) {
    res.status(400).json({ error: 'A 6-digit code is required.' });
    return;
  }

  const { totpEnabled, totpSecret } = await readSecrets(req, user.id);
  if (!totpEnabled) {
    res.json({ message: 'Two-factor authentication is already disabled.' });
    return;
  }
  // Orphan state: flag set but no secret (e.g. from a renamed legacy field).
  // Clear the flag without requiring a code so the account is recoverable.
  if (!totpSecret) {
    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: { totpEnabled: false, totpSecret: null, totpTempSecret: null },
      overrideAccess: true,
      depth: 0,
    });
    res.json({ message: 'Two-factor authentication disabled.' });
    return;
  }
  if (!authenticator.verify({ token, secret: totpSecret })) {
    res.status(400).json({ error: 'Invalid code.' });
    return;
  }

  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { totpEnabled: false, totpSecret: null, totpTempSecret: null },
    overrideAccess: true,
    depth: 0,
  });
  res.json({ message: 'Two-factor authentication disabled.' });
};

/**
 * beforeLogin enforcement. When the user has 2FA enabled, require a valid `otp`
 * field in the login request body. Throws to abort the login otherwise.
 * The admin login form supplies `otp` via the TwoFactorLoginField component.
 */
export async function enforceTotpOnLogin(
  req: PayloadRequest,
  user: { id: string | number; totpEnabled?: boolean },
): Promise<void> {
  if (!user?.totpEnabled) return;

  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('Two-factor authentication code required.');
  }
  const { totpSecret } = await readSecrets(req, user.id);
  if (!totpSecret || !authenticator.verify({ token: otp, secret: totpSecret })) {
    throw new Error('Invalid two-factor authentication code.');
  }
}
