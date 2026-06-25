import type { CollectionConfig } from 'payload/types';

// Persists every contact form submission so data is never lost on email failures.
// Public write (via POST /api/contact). Admin-only read/update/delete.
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    group: 'Support',
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'subject', 'status', 'submittedAt'],
    description: 'Contact form submissions. Read-only — manage status per row.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'submittedAt',
      type: 'date',
      admin: { readOnly: true, date: { displayFormat: 'dd/MM/yyyy HH:mm' } },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Responded', value: 'responded' },
      ],
    },
    {
      name: 'ipHash',
      type: 'text',
      admin: { hidden: true, readOnly: true },
    },
  ],
};
