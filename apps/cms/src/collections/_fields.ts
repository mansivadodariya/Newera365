import type { Field } from 'payload/types';

/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Slug field — auto-derived from `sourceField` when left empty.
 * Uniqueness is per-locale and enforced by the `uniqueSlugPerLocale`
 * collection hook (Payload v2 has no compound-unique index).
 */
export function slugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    index: true,
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

/** Flat SEO override fields (NE-044). */
export const seoFields: Field[] = [
  {
    name: 'seoTitle',
    type: 'text',
    maxLength: 60,
    admin: { description: 'Overrides the <title> tag. Falls back to title if empty.' },
  },
  {
    name: 'seoDescription',
    type: 'textarea',
    maxLength: 160,
    admin: { description: 'Meta description. Falls back to excerpt/summary if empty.' },
  },
];

/**
 * Per-locale document model: every locale-aware collection stores one
 * document per locale. `translationKey` links the EN/AR counterparts and
 * is auto-filled by the `ensureTranslationKey` hook.
 */
export const localizationFields: Field[] = [
  {
    name: 'translationKey',
    type: 'text',
    index: true,
    admin: {
      readOnly: true,
      description:
        'Shared UUID linking the EN and AR versions. Copy onto the translated counterpart.',
    },
  },
  {
    name: 'locale',
    type: 'select',
    required: true,
    options: [
      { label: 'English', value: 'en' },
      { label: 'Arabic', value: 'ar' },
    ],
  },
];
