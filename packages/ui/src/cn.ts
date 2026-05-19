/** Minimal className joiner — swap for clsx/tailwind-merge if variants grow. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
