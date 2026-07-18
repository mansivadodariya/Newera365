import type { CollectionConfig } from 'payload/types';
import { escapeHtml } from '../email/escapeHtml';

const adminOnly = ({ req }: { req: { user?: unknown } }): boolean => Boolean(req.user);

// CMS admin-panel staff accounts. Not content-locale-specific.
// All users have the admin role — there is no editor tier.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Brute-force protection. Payload's built-in POST /api/users/login is not
    // covered by the custom Postgres rate limiter, so account lockout is the
    // primary defence for the admin panel (NE code-review CR-3).
    maxLoginAttempts: 5,
    lockTime: 600_000, // 10 minutes, in ms
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Newera365 admin password',
      generateEmailHTML: ({ token, user } = {}) => {
        const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
        // token is a Payload-generated hex string, but escape it too for defence in depth.
        const resetUrl = escapeHtml(`${serverUrl}/admin/reset/${token ?? ''}`);
        // name is editor-controlled — escape to prevent HTML/script injection in the email.
        const name = escapeHtml((user as { name?: string } | undefined)?.name ?? 'there');
        return `
          <p>Hi ${name},</p>
          <p>We received a request to reset the password for your Newera365 admin account.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a>.</p>
          <p>This link is valid for one hour. If you did not request a reset, you can safely ignore this email.</p>
          <p>— The Newera365 team</p>
        `;
      },
    },
  },
  admin: {
    group: 'Administration',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name'],
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [{ name: 'name', type: 'text', required: true }],
};
