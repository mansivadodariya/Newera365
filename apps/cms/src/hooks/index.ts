import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionAfterChangeHook,
  Where,
} from 'payload/types';
import { ValidationError } from 'payload/errors';
import { randomUUID } from 'crypto';

/**
 * Assigns a `translationKey` UUID on create when one is not supplied.
 * Never overwrites an existing value — the editor copies the key onto the
 * translated counterpart so EN/AR documents stay linked.
 */
export const ensureTranslationKey: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && !data.translationKey) {
    return { ...data, translationKey: randomUUID() };
  }
  return data;
};

/**
 * Enforces `(slug, locale)` uniqueness. Payload v2 has no compound-unique
 * index, so duplicates are rejected here. Factory — bind to a collection slug.
 */
export function uniqueSlugPerLocale(collection: string): CollectionBeforeValidateHook {
  return async ({ data, originalDoc, req }) => {
    const slug = data?.slug;
    const locale = data?.locale;
    if (!slug || !locale) return data;

    const andClauses: Where[] = [{ slug: { equals: slug } }, { locale: { equals: locale } }];
    const existingId = originalDoc?.id;
    if (existingId) {
      andClauses.push({ id: { not_equals: existingId } });
    }
    const where: Where = { and: andClauses };

    const duplicates = await req.payload.find({
      collection: collection as never,
      where,
      limit: 1,
      depth: 0,
    });

    if (duplicates.totalDocs > 0) {
      throw new ValidationError([
        { field: 'slug', message: `A ${locale} document with this slug already exists.` },
      ]);
    }
    return data;
  };
}

/**
 * EducationContent: derives the A-Z grouping key from the glossary term's
 * first character. Powers fast alphabetical queries on /glossary.
 */
export const deriveAlphabeticalIndex: CollectionBeforeChangeHook = ({ data }) => {
  if (
    data.contentType === 'glossary' &&
    typeof data.glossaryTerm === 'string' &&
    data.glossaryTerm
  ) {
    return { ...data, alphabeticalIndex: data.glossaryTerm.trim().charAt(0).toUpperCase() };
  }
  return data;
};

/**
 * LegalPages: only one published document per `pageType` + `locale` may be
 * live. Publishing a new version demotes the previous published one to draft.
 */
export const archivePreviousLegalVersion: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc.status !== 'published') return doc;

  const previous = await req.payload.find({
    collection: 'legal-pages',
    where: {
      and: [
        { pageType: { equals: doc.pageType } },
        { locale: { equals: doc.locale } },
        { status: { equals: 'published' } },
        { id: { not_equals: doc.id } },
      ],
    },
    depth: 0,
  });

  for (const stale of previous.docs) {
    await req.payload.update({
      collection: 'legal-pages',
      id: stale.id,
      data: { status: 'draft' },
      depth: 0,
    });
  }
  return doc;
};
