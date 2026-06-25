import { redirect } from 'next/navigation';

// The landing redesign was promoted to the live home page, so this preview
// route now renders identically. Permanently redirect it to `/` so any old
// bookmarks/links resolve to the canonical home (localePrefix is 'always').
export default function LandingDemoPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}`);
}
