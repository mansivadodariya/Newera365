/**
 * Allow-list URL sanitiser for CMS-supplied href/src values.
 *
 * CMS rich-text and link fields can contain arbitrary URLs. Rendering them
 * directly into an <a href> / <img src> lets a stored `javascript:` / `data:` /
 * `vbscript:` URL execute on click or render (stored XSS). This collapses any
 * such value to '#' so the element still renders, but inertly. (NE code-review WR-6.)
 *
 * Allowed: http(s), mailto, tel, and scheme-less values (relative paths, anchors,
 * bare domains). Everything else is rejected.
 */
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

export function safeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  // Drop control chars and spaces (code point <= 0x20) that can smuggle a scheme
  // past the check, e.g. a tab inside "java<TAB>script:alert(1)" or a leading space.
  const cleaned = Array.from(url)
    .filter((ch) => ch.charCodeAt(0) > 0x20)
    .join('');
  if (!cleaned) return '#';

  // A leading scheme is any text before the first ':' (ahead of /, ? or #).
  const schemeMatch = cleaned.match(/^([a-z][a-z0-9+.-]*):/i);
  if (schemeMatch) {
    const scheme = (schemeMatch[1] ?? '').toLowerCase();
    return SAFE_SCHEMES.has(scheme) ? cleaned : '#';
  }

  // No scheme → relative path, anchor, or bare domain. Safe to render.
  return cleaned;
}
