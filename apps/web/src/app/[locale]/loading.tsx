import { TopLoadingBar } from '@newera365/ui';

// Single loading boundary for the whole locale subtree. Pages are static/ISR
// server components, so this only renders during a genuine on-demand/cold
// render (e.g. a just-published article not yet in the build manifest) — a
// quiet top progress bar, not a full-page skeleton scaffold.
export default function Loading() {
  return <TopLoadingBar />;
}
