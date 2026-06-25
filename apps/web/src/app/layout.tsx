import type { ReactNode } from 'react';

// Pass-through root layout. next-intl renders <html>/<body> inside
// app/[locale]/layout.tsx (so it can set lang/dir per locale), which means the
// App Router needs a root layout that does NOT add its own html wrapper.
// This also unlocks a root app/not-found.tsx that returns a real HTTP 404 for
// unmatched URLs (a catch-all calling notFound() only produces a soft-404/200).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
