import type { CollectionConfig } from 'payload/types';

const adminOnly = ({ req }: { req: { user?: unknown } }): boolean => Boolean(req.user);

// CMS admin-panel staff accounts. Not content-locale-specific.
// All users have the admin role — there is no editor tier.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    forgotPassword: {
      generateEmailSubject: () => 'Reset your NewEra365 admin password',
      generateEmailHTML: ({ token, user } = {}) => {
        const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001';
        const resetUrl = `${serverUrl}/admin/reset/${token ?? ''}`;
        const name = (user as { name?: string } | undefined)?.name ?? 'there';
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
    defaultColumns: ['email', 'name', 'enable2fa'],
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'enable2fa',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      label: 'Enable two-factor authentication',
      admin: {
        description:
          'TOTP enforcement (NE-041 / NE-050) is handled by a separate security ticket — this flag records the requirement.',
      },
    },
  ],
};
