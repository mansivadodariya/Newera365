import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload/types';

/**
 * EducationContent: derives the A-Z grouping key from the glossary term's
 * first character. Powers fast alphabetical queries on /glossary.
 * Works for both Latin (F → F) and Arabic (فوركس → ف) terms.
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
 * LegalPages: only one published document per `pageType` + locale may be
 * live. Publishing a new version demotes the previous published one to draft.
 * Uses req.locale (set by Payload's native localization) to scope the query.
 */
export const archivePreviousLegalVersion: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc.status !== 'published') return doc;

  const locale = (req.locale as string | undefined) ?? 'en';

  try {
    const previous = await req.payload.find({
      collection: 'legal-pages',
      locale: locale as 'en' | 'ar',
      where: {
        and: [
          { pageType: { equals: doc.pageType } },
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
        locale: locale as 'en' | 'ar',
        data: { status: 'draft' },
        depth: 0,
      });
    }
  } catch (err) {
    req.payload.logger.error({ err, docId: doc.id }, 'Failed to archive previous legal version');
  }
  return doc;
};
