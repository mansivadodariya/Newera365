// Shared helpers for case-insensitive, data-driven category filters.
// CMS category fields are free-text/creatable, so the frontend must never compare
// raw strings with === (a "Target" vs "target" mismatch silently breaks filtering)
// and must derive its filter tabs from the data actually present.

/** Canonical comparison form: trimmed + lowercased. Use on BOTH sides of a match. */
export function norm(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/** Two category strings are the same filter regardless of case/whitespace. */
export function sameCategory(a: string | null | undefined, b: string | null | undefined): boolean {
  return norm(a) === norm(b);
}

/**
 * "market-news" → "Market News", "ORDER/EXEC" → "Order Exec".
 * Display fallback for categories that have no explicit i18n label.
 */
export function humanize(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  if (!v) return '';
  return v
    .replace(/[-_/]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Distinct category values present in `items`, collapsing case/whitespace
 * duplicates (keeps the first-seen original casing for display). This is how a
 * filter tab list should be built — from real data, not a hardcoded list.
 */
export function distinctCategories<T>(
  items: readonly T[],
  key: (item: T) => string | null | undefined,
): string[] {
  const seen = new Map<string, string>();
  for (const item of items) {
    const raw = (key(item) ?? '').trim();
    if (!raw) continue;
    const n = raw.toLowerCase();
    if (!seen.has(n)) seen.set(n, raw);
  }
  return Array.from(seen.values());
}
