import type { GlobalConfig } from 'payload/types';

// Global site chrome — navigation, footer, and the regulatory risk
// disclaimer shown site-wide. All copy is localized (EN + AR).
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true },
  fields: [
    {
      name: 'nav',
      type: 'array',
      label: 'Header navigation',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'footer',
      type: 'array',
      label: 'Footer columns',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true },
            { name: 'href', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'riskDisclaimer',
      type: 'textarea',
      localized: true,
      admin: { description: 'Regulatory risk warning shown site-wide.' },
    },
  ],
};
