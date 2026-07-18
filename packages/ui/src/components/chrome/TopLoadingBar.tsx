// Route-transition loading affordance. Rendered by the [locale] `loading.tsx`
// Suspense boundary, so it only appears when a navigation genuinely suspends
// (an on-demand / cold render) — never on a prefetched static page. This is a
// far quieter signal than a full-page skeleton scaffold, which on a static/ISR
// site only ever flashes gray-then-snaps. Pure CSS, no hooks → server-renderable.
//
// Reduced motion: the crawl + highlight are gated behind `motion-safe`; under
// `prefers-reduced-motion` a static partial accent bar still signals "loading"
// (an indeterminate loading indicator is the one place infinite motion is OK —
// ui-ux-pro-max). Header/footer live above this boundary in the layout, so they
// stay put while only the page body is briefly replaced.
export function TopLoadingBar() {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden"
    >
      <div className="from-accent to-accent-bright motion-safe:animate-loading-bar relative h-full w-1/3 bg-gradient-to-r shadow-[0_0_10px_rgba(0,176,80,0.55)] motion-safe:w-[92%]">
        {/* Travelling highlight — keeps the bar feeling active once the crawl holds. */}
        <span
          aria-hidden="true"
          className="motion-safe:animate-loading-blip absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden"
        />
      </div>
    </div>
  );
}
