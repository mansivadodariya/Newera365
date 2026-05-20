import type { GlobalConfig } from 'payload/types';

// Global site chrome — navigation, footer, regulatory risk disclaimer, and
// the MT5 integration master switch. All copy fields are localized (EN + AR).
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true },
  fields: [
    // ── MT5 Integration ──────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'MT5 Integration',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'mt5SyncEnabled',
          type: 'checkbox',
          label: 'Enable MT5 Live Data Site-Wide',
          defaultValue: true,
          admin: {
            description:
              'MASTER SWITCH. ' +
              'ON  → the /api/mt5/instruments endpoint fetches live data from the MT5 bridge; ' +
              'per-instrument toggles on each Products & Instruments record then control which rows use live vs manual data. ' +
              'OFF → ALL instruments fall back to the manual CMS values regardless of their individual toggle settings. ' +
              'Turn this OFF during MT5 server maintenance windows or when credentials are not yet configured.',
          },
        },
      ],
    },

    // ── Navigation ───────────────────────────────────────────────────────────
    // Payload's native localization is NOT used (see payload.config.ts).
    // Separate EN / AR arrays mirror the per-document locale pattern used by all collections.
    {
      name: 'navEn',
      type: 'array',
      label: 'Header Navigation — EN',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'navAr',
      type: 'array',
      label: 'Header Navigation — AR',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    {
      name: 'footerEn',
      type: 'array',
      label: 'Footer Columns — EN',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'href', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'footerAr',
      type: 'array',
      label: 'Footer Columns — AR',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'href', type: 'text' },
          ],
        },
      ],
    },

    // ── Risk Disclaimer ──────────────────────────────────────────────────────
    {
      name: 'riskDisclaimerEn',
      type: 'textarea',
      admin: { description: 'Regulatory risk warning shown site-wide — English version.' },
    },
    {
      name: 'riskDisclaimerAr',
      type: 'textarea',
      admin: { description: 'Regulatory risk warning shown site-wide — Arabic version.' },
    },
  ],
};
