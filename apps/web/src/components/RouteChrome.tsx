import { HeaderDemo } from '@newera365/ui';

/**
 * Global site header. The redesign `HeaderDemo` (with `MobileMenuDemo`) was
 * promoted to production, so it now renders on every route. Kept as a thin
 * wrapper in the layout (outside PageFade) so the sticky header behaves
 * consistently across navigations.
 */
export function RouteChrome() {
  return <HeaderDemo />;
}
