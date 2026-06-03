import type { Field } from 'payload/types';

/**
 * URL-safe slug from arbitrary text — Unicode-aware.
 *
 * Uses `\p{L}` / `\p{N}` (Unicode property escapes, Node 12+) so Arabic,
 * Chinese, and other non-Latin scripts are preserved rather than stripped.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/\s+/gu, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-{2,}/gu, '-')
    .replace(/^-+|-+$/gu, '');
}

/**
 * Slug field — auto-derived from `sourceField` when left empty.
 * Globally unique (one document per slug; each document stores all locales).
 */
export function slugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    index: true,
    unique: true,
    admin: { description: `Auto-generated from ${sourceField} if left blank. URL-safe.` },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (value) return slugify(String(value));
          const source = data?.[sourceField];
          return source ? slugify(String(source)) : value;
        },
      ],
    },
  };
}

/**
 * SEO fields — localized so each locale has its own title/description.
 */
export const seoFields: Field[] = [
  {
    name: 'seoTitle',
    type: 'text',
    maxLength: 60,
    localized: true,
    admin: { description: 'Overrides the <title> tag. Falls back to title if empty.' },
  },
  {
    name: 'seoDescription',
    type: 'textarea',
    maxLength: 160,
    localized: true,
    admin: { description: 'Meta description. Falls back to excerpt/summary if empty.' },
  },
];

/**
 * @deprecated — native Payload localization is used instead.
 * Kept as empty array so existing imports compile without changes.
 * Remove `...localizationFields` spreads from collections as you update them.
 */
export const localizationFields: Field[] = [];
