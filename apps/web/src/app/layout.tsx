import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://newera365.com'),
  applicationName: 'Newera',
  title: {
    default: 'Newera | Forex & CFD Trading',
    template: '%s | Newera',
  },
  description:
    'Trade forex, indices, commodities, stocks and crypto CFDs with Newera: tight spreads, fast execution, and MT5.',
  openGraph: {
    siteName: 'Newera',
    type: 'website',
  },
};

// Pass-through root layout. next-intl renders <html>/<body> inside
// app/[locale]/layout.tsx (so it can set lang/dir per locale), which means the
// App Router needs a root layout that does NOT add its own html wrapper.
// This also unlocks a root app/not-found.tsx that returns a real HTTP 404 for
// unmatched URLs (a catch-all calling notFound() only produces a soft-404/200).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
