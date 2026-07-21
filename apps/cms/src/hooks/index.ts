import type {
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload/types';

const LOCALES = ['en', 'ar'] as const;
type Locale = (typeof LOCALES)[number];

/**
 * Prefixes each path with each locale. `/trade/accounts` → `/en/trade/accounts`, `/ar/trade/accounts`.
 * Pass pre-locale-prefixed strings ('/en/foo') to skip the expansion for that entry.
 */
export function localePaths(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    if (p.startsWith('/en/') || p.startsWith('/ar/') || p === '/en' || p === '/ar') {
      out.push(p);
    } else {
      const norm = p.startsWith('/') ? p : `/${p}`;
      for (const l of LOCALES) out.push(`/${l}${norm}`);
    }
  }
  return out;
}

/** Low-level: fire-and-forget POST to the frontend's /api/revalidate. Silent on failure. */
async function notifyRevalidatePaths(paths: string[], req?: PayloadRequest): Promise<void> {
  const base = process.env.FRONTEND_URL?.replace(/\/+$/, '');
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret || paths.length === 0) return;
  try {
    await fetch(`${base}/api/revalidate?secret=${encodeURIComponent(secret)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (err) {
    req?.payload.logger.warn({ err, paths }, '[revalidate] failed to notify frontend');
  }
}

/**
 * Collection factory: returns an afterChange hook that revalidates the paths
 * derived from the saved document. Path builder gets the saved doc so it can
 * key off slug, assetClass, contentType, etc.
 * Always revalidates on save — even draft saves — because the *previous*
 * published version may need to disappear from the cached page.
 */
export function createRevalidationHook<T = Record<string, unknown>>(
  pathBuilder: (doc: T) => string[],
): CollectionAfterChangeHook {
  return async ({ doc, req }) => {
    try {
      const paths = pathBuilder(doc as T);
      if (paths.length) await notifyRevalidatePaths(paths, req);
    } catch (err) {
      req.payload.logger.warn({ err }, '[revalidate] path builder threw');
    }
    return doc;
  };
}

/** Same, for afterDelete. Same path builder shape. */
export function createRevalidationDeleteHook<T = Record<string, unknown>>(
  pathBuilder: (doc: T) => string[],
): CollectionAfterDeleteHook {
  return async ({ doc, req }) => {
    try {
      const paths = pathBuilder(doc as T);
      if (paths.length) await notifyRevalidatePaths(paths, req);
    } catch (err) {
      req.payload.logger.warn({ err }, '[revalidate] path builder threw (afterDelete)');
    }
    return doc;
  };
}

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

/**
 * SiteSettings save → purge every locale's root layout (footer, chrome).
 * Requires FRONTEND_URL + REVALIDATE_SECRET env vars on the CMS.
 */
export const notifyRevalidateSiteChrome: GlobalAfterChangeHook = async ({ req }) => {
  await notifyRevalidatePaths(['/en', '/ar'], req);
};
