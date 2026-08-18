/**
 * Escapes the five HTML-significant characters so untrusted text can be safely
 * interpolated into HTML email bodies. Pure and dependency-free — safe to import
 * from both server code and the admin webpack bundle (Users.ts).
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
