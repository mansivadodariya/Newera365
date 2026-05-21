import type { Field } from 'payload/types';

/**
 * URL-safe slug from arbitrary text — Unicode-aware.
 *
 * Uses `\p{L}` / `\p{N}` (Unicode property escapes, Node 12+) so Arabic,
 * Chinese, and other non-Latin scripts are preserved rather than stripped.
 * Previously `[^a-z0-9]+` silently deleted all Arabic characters, producing
 * an empty slug that broke creation of every AR document.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/\s+/gu, '-') // spaces → hyphens first
    .replace(/[^\p{L}\p{N}-]+/gu, '-') // strip non-letter/number/hyphen
    .replace(/-{2,}/gu, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/gu, ''); // trim leading/trailing hyphens
}

/**
 * Slug field — auto-derived from `sourceField` when left empty.
 *
 * Uniqueness is per-(slug, locale) and enforced by the `uniqueSlugPerLocale`
 * collection hook. We deliberately do NOT set `unique: true` here because
 * Payload v2's single-field unique constraint would reject legitimate EN/AR
 * pairs that intentionally share a slug.
 *
 * For full belt-and-braces protection against the application-level race,
 * add a Postgres partial unique index `(slug, locale)` per collection table
 * via a raw-SQL migration. Tracked as a hardening follow-up.
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
