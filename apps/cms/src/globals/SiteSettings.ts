import type { GlobalConfig } from 'payload/types';

// Global site chrome — all CMS-editable values that the frontend should never hardcode.
// Locale pattern: separate EN / AR fields mirror the per-document locale approach used
// by all collections (Payload native localization is intentionally NOT used).
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
        {
          name: 'mt5ApiEndpoint',
          type: 'text',
          label: 'MT5 Bridge URL',
          admin: {
            description:
              'Base URL of the MT5 Manager API bridge service, e.g. https://mt5-bridge.example.com. ' +
              'When set, overrides the MT5_SERVICE_URL environment variable. Leave blank to use the env var.',
          },
          // Never serialised to public API responses — only admin users may read this.
          access: { read: ({ req }) => Boolean(req?.user) },
        },
        {
          name: 'mt5ApiKey',
          type: 'text',
          label: 'MT5 Bridge API Key',
          admin: {
            description:
              'Bearer token sent in the Authorization header to the MT5 bridge. ' +
              'When set, overrides the MT5_INTERNAL_API_TOKEN environment variable. Leave blank to use the env var.',
          },
          access: { read: ({ req }) => Boolean(req?.user) },
        },
        {
          name: 'mt5RefreshIntervalSecs',
          type: 'number',
          label: 'Sync Interval (seconds)',
          defaultValue: 60,
          min: 10,
          max: 3600,
          admin: {
            description:
              'How often the background sync job pulls data from the MT5 bridge and updates instrument sync status. ' +
              'Min 10 s, max 3600 s (1 hour). Default 60 s. Change takes effect on the next sync cycle.',
          },
        },
      ],
    },

    // ── Homepage KPI Stats ───────────────────────────────────────────────────
    // Displayed on the homepage hero / stats strip.
    // Each stat has separate EN and AR value+label pairs so editors control
    // both the numeral format and the phrasing per locale.
    {
      type: 'collapsible',
      label: 'Homepage KPI Stats',
      admin: {
        initCollapsed: true,
        description:
          'Statistics shown on the homepage (e.g. "10+ Years in Business", "100,000+ Active Clients"). ' +
          'Add up to 6 stats; drag to reorder.',
      },
      fields: [
        {
          name: 'kpiStats',
          type: 'array',
          maxRows: 6,
          labels: { singular: 'KPI Stat', plural: 'KPI Stats' },
          fields: [
            {
              name: 'valueEn',
              type: 'text',
              required: true,
              maxLength: 20,
              admin: { description: 'Numeric or text value — EN, e.g. "10+".' },
            },
            {
              name: 'valueAr',
              type: 'text',
              required: true,
              maxLength: 20,
              admin: { description: 'Numeric or text value — AR, e.g. "+١٠".' },
            },
            {
              name: 'labelEn',
              type: 'text',
              required: true,
              maxLength: 60,
              admin: { description: 'Descriptor — EN, e.g. "Years in Business".' },
            },
            {
              name: 'labelAr',
              type: 'text',
              required: true,
              maxLength: 60,
              admin: { description: 'Descriptor — AR.' },
            },
          ],
        },
      ],
    },

    // ── Social Proof Logos ───────────────────────────────────────────────────
    // Partner, award, and regulatory body logos shown on the homepage trust strip.
    {
      type: 'collapsible',
      label: 'Social Proof / Partner Logos',
      admin: {
        initCollapsed: true,
        description:
          'Logos displayed on the homepage trust/partner strip (awards, regulators, media mentions). ' +
          'Upload via the Media library first; select here. Drag to reorder.',
      },
      fields: [
        {
          name: 'socialProofLogos',
          type: 'array',
          maxRows: 16,
          labels: { singular: 'Logo', plural: 'Logos' },
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Logo image — use SVG or transparent PNG for best results.' },
            },
            {
              name: 'altEn',
              type: 'text',
              maxLength: 100,
              admin: { description: 'Alt text for accessibility — EN.' },
            },
            {
              name: 'altAr',
              type: 'text',
              maxLength: 100,
              admin: { description: 'Alt text for accessibility — AR.' },
            },
            {
              name: 'href',
              type: 'text',
              maxLength: 500,
              admin: {
                description:
                  'Optional: wrap logo in a link (e.g. regulator website). Leave blank for no link.',
              },
            },
          ],
        },
      ],
    },

    // ── Homepage Testimonials & Social Proof ─────────────────────────────────
    // Client testimonials + headline social-proof stats shown on the homepage
    // (client feedback #5). EN/AR suffix per house style — native localization
    // is intentionally not used (see file header).
    {
      type: 'collapsible',
      label: 'Homepage Testimonials & Social Proof',
      admin: {
        initCollapsed: true,
        description:
          'Trader testimonials and headline trust stats for the homepage social-proof section. ' +
          'Leave the testimonials empty to hide the section entirely.',
      },
      fields: [
        {
          name: 'socialProofHeadlineEn',
          type: 'text',
          label: 'Social Proof Headline — EN',
          maxLength: 80,
          admin: {
            description: 'e.g. "Trusted by 25,000+ traders worldwide". Leave blank to hide.',
          },
        },
        {
          name: 'socialProofHeadlineAr',
          type: 'text',
          label: 'Social Proof Headline — AR',
          maxLength: 80,
          admin: { description: 'Arabic version of the social-proof headline.' },
        },
        {
          name: 'ratingValue',
          type: 'text',
          label: 'Rating Value',
          maxLength: 10,
          admin: {
            description: 'e.g. "4.8" — shown as "4.8 / 5". Leave blank to hide the rating band.',
          },
        },
        {
          name: 'ratingCountEn',
          type: 'text',
          label: 'Rating Caption — EN',
          maxLength: 60,
          admin: { description: 'e.g. "based on 2,400+ verified reviews".' },
        },
        {
          name: 'ratingCountAr',
          type: 'text',
          label: 'Rating Caption — AR',
          maxLength: 60,
          admin: { description: 'Arabic version of the rating caption.' },
        },
        {
          name: 'testimonials',
          type: 'array',
          maxRows: 9,
          labels: { singular: 'Testimonial', plural: 'Testimonials' },
          admin: { description: 'Trader quotes. Drag to reorder; first ones show first.' },
          fields: [
            {
              name: 'quoteEn',
              type: 'textarea',
              required: true,
              admin: { description: 'Testimonial quote — EN.' },
            },
            {
              name: 'quoteAr',
              type: 'textarea',
              required: true,
              admin: { description: 'Testimonial quote — AR.' },
            },
            {
              name: 'authorName',
              type: 'text',
              required: true,
              maxLength: 80,
              admin: { description: 'Author name, e.g. "Omar A.".' },
            },
            {
              name: 'authorRoleEn',
              type: 'text',
              maxLength: 80,
              admin: { description: 'Role / location — EN, e.g. "Day trader · Dubai".' },
            },
            {
              name: 'authorRoleAr',
              type: 'text',
              maxLength: 80,
              admin: { description: 'Role / location — AR.' },
            },
            {
              name: 'rating',
              type: 'number',
              min: 1,
              max: 5,
              defaultValue: 5,
              admin: { description: 'Star rating 1–5 (defaults to 5).' },
            },
            {
              name: 'avatarUrl',
              type: 'text',
              maxLength: 500,
              admin: {
                description: 'Optional author photo URL (square). Leave blank to show initials.',
              },
            },
          ],
        },
      ],
    },

    // ── Platform Download Links ──────────────────────────────────────────────
    // URLs for all MT5 platform variants and the web trader.
    // The frontend reads these so there are zero hardcoded download links.
    {
      type: 'collapsible',
      label: 'Platform Download Links',
      admin: {
        initCollapsed: true,
        description:
          'Download URLs for all supported trading platforms. Paste the full URL including https://.',
      },
      fields: [
        {
          name: 'downloadMt5Windows',
          type: 'text',
          label: 'MT5 for Windows',
          maxLength: 500,
          admin: { description: 'Direct installer URL or MetaQuotes download page.' },
        },
        {
          name: 'downloadMt5Mac',
          type: 'text',
          label: 'MT5 for macOS',
          maxLength: 500,
          admin: { description: 'Direct installer URL or Mac App Store link.' },
        },
        {
          name: 'downloadMt5Ios',
          type: 'text',
          label: 'MT5 for iOS',
          maxLength: 500,
          admin: { description: 'Apple App Store product URL.' },
        },
        {
          name: 'downloadMt5Android',
          type: 'text',
          label: 'MT5 for Android',
          maxLength: 500,
          admin: { description: 'Google Play Store product URL.' },
        },
        {
          name: 'downloadWebTrader',
          type: 'text',
          label: 'Web Trader',
          maxLength: 500,
          admin: { description: 'Browser-based trading platform URL.' },
        },
      ],
    },

    // ── Contact Details ──────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Contact Details',
      admin: {
        initCollapsed: true,
        description:
          'Used on the Contact page, footer, and any component that displays company contact info.',
      },
      fields: [
        {
          name: 'contactEmail',
          type: 'email',
          label: 'Support Email',
          admin: { description: 'Primary customer-facing support email address.' },
        },
        {
          name: 'contactEmailCompliance',
          type: 'email',
          label: 'Compliance / Legal Email',
          admin: { description: 'Shown on Legal pages and the Contact page compliance section.' },
        },
        {
          name: 'contactPhone',
          type: 'text',
          label: 'Phone Number',
          maxLength: 30,
          admin: { description: 'International format, e.g. +971 4 123 4567.' },
        },
        {
          name: 'contactAddressEn',
          type: 'textarea',
          label: 'Office Address — EN',
          admin: { description: 'Full postal address in English.' },
        },
        {
          name: 'contactAddressAr',
          type: 'textarea',
          label: 'Office Address — AR',
          admin: { description: 'Full postal address in Arabic.' },
        },
        {
          name: 'supportHoursEn',
          type: 'text',
          label: 'Support Hours — EN',
          maxLength: 100,
          admin: { description: 'e.g. "Monday – Friday, 08:00 – 22:00 UTC".' },
        },
        {
          name: 'supportHoursAr',
          type: 'text',
          label: 'Support Hours — AR',
          maxLength: 100,
          admin: { description: 'Arabic version of support hours.' },
        },
      ],
    },

    // ── Social Media Links ───────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Social Media Links',
      admin: {
        initCollapsed: true,
        description: 'Leave blank to hide the icon in the footer and social share components.',
      },
      fields: [
        {
          name: 'socialFacebook',
          type: 'text',
          label: 'Facebook',
          maxLength: 300,
          admin: { description: 'Full profile URL, e.g. https://facebook.com/newera365.' },
        },
        {
          name: 'socialX',
          type: 'text',
          label: 'X (Twitter)',
          maxLength: 300,
          admin: { description: 'Full profile URL, e.g. https://x.com/newera365.' },
        },
        {
          name: 'socialLinkedIn',
          type: 'text',
          label: 'LinkedIn',
          maxLength: 300,
          admin: { description: 'Company page URL, e.g. https://linkedin.com/company/newera365.' },
        },
        {
          name: 'socialInstagram',
          type: 'text',
          label: 'Instagram',
          maxLength: 300,
          admin: { description: 'Full profile URL, e.g. https://instagram.com/newera365.' },
        },
        {
          name: 'socialYoutube',
          type: 'text',
          label: 'YouTube',
          maxLength: 300,
          admin: { description: 'Channel URL, e.g. https://youtube.com/@newera365.' },
        },
        {
          name: 'socialTelegram',
          type: 'text',
          label: 'Telegram',
          maxLength: 300,
          admin: { description: 'Channel or group link, e.g. https://t.me/newera365.' },
        },
        {
          name: 'socialTiktok',
          type: 'text',
          label: 'TikTok',
          maxLength: 300,
          admin: { description: 'Profile URL, e.g. https://tiktok.com/@newera365.' },
        },
      ],
    },

    // ── Risk Warning Banner ──────────────────────────────────────────────────
    // Dismissible top-of-page banner — separate from the detailed footer disclaimer below.
    {
      type: 'collapsible',
      label: 'Risk Warning Banner',
      admin: {
        initCollapsed: true,
        description:
          'Toggleable site-wide banner displayed at the top of every page. ' +
          'Typically used for time-sensitive risk notices or regulatory requirements. ' +
          'Separate from the persistent footer disclaimer below.',
      },
      fields: [
        {
          name: 'riskBannerEnabled',
          type: 'checkbox',
          label: 'Show Risk Warning Banner',
          defaultValue: false,
          admin: { description: 'ON → banner is visible across all pages. OFF → hidden.' },
        },
        {
          name: 'riskBannerEn',
          type: 'textarea',
          label: 'Banner Text — EN',
          admin: {
            condition: (data) => Boolean(data?.riskBannerEnabled),
            description: 'Short risk notice displayed in the banner — English.',
          },
        },
        {
          name: 'riskBannerAr',
          type: 'textarea',
          label: 'Banner Text — AR',
          admin: {
            condition: (data) => Boolean(data?.riskBannerEnabled),
            description: 'Short risk notice displayed in the banner — Arabic.',
          },
        },
      ],
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Footer Columns',
      admin: { initCollapsed: true },
      fields: [
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
      ],
    },

    // ── Footer — Company & Regulation ────────────────────────────────────────
    // Regulatory disclosure, company registration / licence details, and the
    // live-chat shortcut shown in the footer (client feedback #6). Risk
    // disclaimer + contact details live in their own sections above.
    {
      type: 'collapsible',
      label: 'Footer — Company & Regulation',
      admin: {
        initCollapsed: true,
        description:
          'Regulatory + company registration copy and the live-chat link for the footer. ' +
          'Each block hides itself when left blank.',
      },
      fields: [
        {
          name: 'regulatoryDisclosureEn',
          type: 'textarea',
          label: 'Regulatory Disclosure — EN',
          admin: {
            description: 'Regulator names, licence numbers, and oversight statement — English.',
          },
        },
        {
          name: 'regulatoryDisclosureAr',
          type: 'textarea',
          label: 'Regulatory Disclosure — AR',
          admin: { description: 'Regulatory disclosure — Arabic.' },
        },
        {
          name: 'companyRegistrationEn',
          type: 'textarea',
          label: 'Company Registration — EN',
          admin: {
            description:
              'Registered entity name, company number, and registered address — English.',
          },
        },
        {
          name: 'companyRegistrationAr',
          type: 'textarea',
          label: 'Company Registration — AR',
          admin: { description: 'Company registration details — Arabic.' },
        },
        {
          name: 'liveChatUrl',
          type: 'text',
          label: 'Live Chat URL',
          maxLength: 500,
          admin: {
            description: 'Link target for the footer "Live chat" shortcut. Leave blank to hide.',
          },
        },
      ],
    },

    // ── Analyst Chart — Featured Analyst ─────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Analyst Chart — Featured Analyst',
      admin: {
        initCollapsed: true,
        description:
          'Analyst profile and commentary shown on the /research/analyst-chart page. ' +
          'Commentary is bilingual — fill both EN and AR fields.',
      },
      fields: [
        {
          name: 'analystInitials',
          type: 'text',
          label: 'Initials',
          maxLength: 5,
          admin: { description: 'Two-letter initials displayed in the avatar circle, e.g. DR.' },
        },
        {
          name: 'analystName',
          type: 'text',
          label: 'Full Name',
          maxLength: 80,
          admin: { description: 'Full name shown below the avatar.' },
        },
        {
          name: 'analystTitle',
          type: 'text',
          label: 'Job Title',
          maxLength: 100,
          admin: { description: 'e.g. Senior FX Analyst.' },
        },
        {
          name: 'analystUpdated',
          type: 'text',
          label: 'Last Updated',
          maxLength: 50,
          admin: { description: 'Timestamp string, e.g. 20 May, 09:14 UTC.' },
        },
        {
          name: 'analystCommentaryEn',
          type: 'textarea',
          label: 'Commentary — EN',
          admin: { description: 'Analyst market commentary — English.' },
        },
        {
          name: 'analystCommentaryAr',
          type: 'textarea',
          label: 'Commentary — AR',
          admin: { description: 'Analyst market commentary — Arabic.' },
        },
      ],
    },

    // ── Risk Disclaimer (footer) ─────────────────────────────────────────────
    // Persistent small-print shown at the bottom of every page.
    // For the dismissible top banner see "Risk Warning Banner" above.
    {
      type: 'collapsible',
      label: 'Risk Disclaimer (Footer)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'riskDisclaimerEn',
          type: 'textarea',
          label: 'Risk Disclaimer — EN',
          admin: {
            description: 'Regulatory risk warning shown in the footer site-wide — English version.',
          },
        },
        {
          name: 'riskDisclaimerAr',
          type: 'textarea',
          label: 'Risk Disclaimer — AR',
          admin: {
            description: 'Regulatory risk warning shown in the footer site-wide — Arabic version.',
          },
        },
      ],
    },
  ],
};
