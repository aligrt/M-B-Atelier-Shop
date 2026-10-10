/**
 * HTML Entity Sanitization & XSS Mitigation Utility
 * Complies with OWASP Top 10 A03:2021 Injection guidelines.
 */

/**
 * Escapes HTML control characters to prevent Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips dangerous HTML tags and scripts entirely.
 */
export function stripHtmlTags(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>?/gm, '');
}

/**
 * Sanitizes phone numbers to Pakistani standard digits.
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '').trim();
}
