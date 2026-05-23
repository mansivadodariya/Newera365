import type { CollectionConfig } from 'payload/types';
import { escapeHtml } from '../email/escapeHtml';
import {
  totpSetupHandler,
  totpVerifyHandler,
  totpDisableHandler,
  enforceTotpOnLogin,
} from '../auth/totp';

const adminOnly = ({ req }: { req: { user?: unknown } }): boolean => Boolean(req.user);
// totpSecret / totpTempSecret must never be serialised to any API response.
const denyRead = (): boolean => false;

// CMS admin-panel staff accounts. Not content-locale-specific.
// All users have the admin role — there is no editor tier.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    forgotPassword: {
      generateEmailSubject: () => 'Reset your NewEra365 admin password',
      generateEmailHTML: ({ token, user } = {}) => {
        const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
        // token is a Payload-generated hex string, but escape it too for defence in depth.
        const resetUrl = escapeHtml(`${serverUrl}/admin/reset/${token ?? ''}`);
        // name is editor-controlled — escape to prevent HTML/script injection in the email.
        const name = escapeHtml((user as { name?: string } | undefined)?.name ?? 'there');
        return `
          <p>Hi ${name},</p>
          <p>We received a request to reset the password for your NewEra365 admin account.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a>.</p>
          <p>This link is valid for one hour. If you did not request a reset, you can safely ignore this email.</p>
          <p>— The NewEra365 team</p>
        `;
      },
    },
  },
  admin: {
    group: 'Administration',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'totpEnabled'],
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  // Require a valid TOTP code at login when the user has 2FA enabled.
  // The admin login form supplies `otp` via the TwoFactorLoginField component.
  hooks: {
    beforeLogin: [
      async ({ req, user }) => {
        await enforceTotpOnLogin(req, user as { id: string | number; totpEnabled?: boolean });
        return user;
      },
    ],
  },
  // TOTP enrolment endpoints — full paths /api/users/2fa/{setup,verify,disable}.
  // req.user is populated by Payload's auth middleware on collection endpoints.
  endpoints: [
    { path: '/2fa/setup', method: 'post', handler: totpSetupHandler },
    { path: '/2fa/verify', method: 'post', handler: totpVerifyHandler },
    { path: '/2fa/disable', method: 'post', handler: totpDisableHandler },
  ],
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'totpEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Two-factor authentication enabled',
      admin: {
        readOnly: true,
        description:
          'Set automatically when the user enrols a TOTP authenticator via /api/users/2fa/verify. Disable via /api/users/2fa/disable.',
      },
    },
    // Confirmed TOTP secret. Hidden + read-denied so it is never returned by the API.
    {
      name: 'totpSecret',
      type: 'text',
      hidden: true,
      access: { read: denyRead },
    },
    // Pending secret during enrolment, before the first successful verify.
    {
      name: 'totpTempSecret',
      type: 'text',
      hidden: true,
      access: { read: denyRead },
    },
  ],
};
