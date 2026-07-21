import { revalidatePath } from 'next/cache';

// Called by Payload's afterChange hook when SiteSettings (and any other
// content wired to `notifyRevalidateSiteChrome`) is saved. Purges the ISR
// cache for the given paths so the next visitor sees the CMS edit
// immediately instead of waiting the normal revalidate window.
export async function POST(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let paths: string[] = ['/en', '/ar'];
  try {
    const body = (await req.json()) as { paths?: unknown };
    if (Array.isArray(body.paths) && body.paths.every((p) => typeof p === 'string')) {
      paths = body.paths as string[];
    }
  } catch {
    // ignore malformed body — fall back to default paths
  }

  for (const p of paths) revalidatePath(p, 'layout');

  return Response.json({ ok: true, revalidated: paths });
}
