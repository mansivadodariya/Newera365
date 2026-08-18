'use client';

import { CtaBannerDemo } from './CtaBannerDemo';

// ponytail: every route-level closer is the homepage banner. Kept as a thin
// re-export so the ~26 pages importing CtaBanner need no edits. Collapse into
// CtaBannerDemo + rename call sites only if this indirection ever confuses.
export function CtaBanner() {
  return <CtaBannerDemo />;
}
