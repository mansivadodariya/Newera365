import type { Access, Field, FieldAccess, Where } from 'payload/types';

/**
 * URL-safe slug from arbitrary text — Unicode-aware.
 *
 * Uses `\p{L}` / `\p{N}` (Unicode property escapes, Node 12+) so Arabic,
 * Chinese, and other non-Latin scripts are preserved rather than stripped.
 */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/\s+/gu, '-')
      .replace(/[^\p{L}\p{N}-]+/gu, '-')
      .replace(/-{2,}/gu, '-')
      .replace(/^-+|-+$/gu, '')
      // Cap length before the unique index so pathologically long titles can't
      // produce unwieldy slugs (NE code-review I-9).
      .slice(0, 80)
      .replace(/-+$/gu, '')
  );
}

/**
 * Read-access factory. Unauthenticated (public) REST reads are constrained to
 * `publicWhere`; authenticated admins (`req.user`) bypass it and see every
 * document — drafts, inactive, cancelled, etc. Server-side Local API reads
 * (`payload.find` from custom endpoints and seed scripts) default to
 * `overrideAccess: true` and are unaffected, so the gate endpoints and seeders
 * keep working unchanged.
 *
 * Fixes the public REST API leaking unpublished/embargoed content — the
 * frontend status filter is cosmetic because the Payload REST API is
 * internet-reachable (NE code-review CR-1).
 */
export const publicReadWhere =
  (publicWhere: Where): Access =>
  ({ req }) =>
    req.user ? true : publicWhere;

/**
 * Field-level read access for gated upload (file) fields. Public REST reads see
 * the file only when the document is NOT gated; for gated documents the file URL
 * is withheld from the collection API so it can only be obtained through the
 * server-side email-gate endpoint (which reads via the Local API / overrideAccess).
 * Admins always see the file.
 *
 * Interim mitigation for the bypassable lead-capture wall — the full fix serves
 * gated assets as short-lived signed R2 URLs (NE-027). (NE code-review CR-2.)
 */
export const gatedUploadRead: FieldAccess = ({ req, doc }) =>
  req.user ? true : (doc as { isGated?: boolean } | undefined)?.isGated !== true;

/**
 * Validate for "creatable" category fields. Category fields keep `type: 'select'`
 * (so the DB column name is unchanged) but are rendered with a creatable combobox
 * (CategorySelect) and may hold a brand-new value typed by an editor. The default
 * select validation rejects any value not in `options`, which would block new
 * categories — this permissive replacement accepts any non-empty string.
 */
export const allowAnyCategory =
  (required = false) =>
  (value: unknown): true | string => {
    if (value === undefined || value === null || value === '') {
      return required ? 'This field is required.' : true;
    }
    return typeof value === 'string' ? true : 'Category must be text.';
  };

/**
 * Slug field — auto-derived from `sourceField` when left empty.
 * Globally unique (one document per slug; each document stores all locales).
 */
export function slugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    // Intentionally NOT `required`: the beforeValidate hook below always derives the
    // slug from `sourceField` (which is itself required) when left blank. Marking it
    // required made the admin UI fire a client-side "This field is required" error on
    // blank and block the save BEFORE the server hook could populate it — directly
    // contradicting the "auto-generated if left blank" description. The column stays
    // NOT NULL in the DB; the hook guarantees a value, so it can never be null.
    index: true,
    unique: true,
    admin: { description: `Auto-generated from ${sourceField} if left blank. URL-safe.` },
    hooks: {
      beforeValidate: [
        ({ value, data, originalDoc }) => {
          // An explicit slug was supplied → normalise it.
          if (value) return slugify(String(value));
          // The document already has a slug → keep it. The slug is NON-localized
          // and must stay stable: updating a non-default locale (e.g. ar) must
          // not regenerate it from the now-localized `title`, which would
          // overwrite the shared English slug with an Arabic one.
          if (originalDoc?.slug) return originalDoc.slug;
          // Fresh document with no slug → derive once from the source field.
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
