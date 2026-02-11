/**
 * Sanitizes a string for use in CSS class names.
 * Removes or replaces characters that are invalid in CSS selectors.
 *
 * @param {string} str - The string to sanitize
 * @returns {string} - A sanitized string safe for CSS class names
 */
export function sanitizeClassName(str) {
  if (!str) return ''

  return str
    .replaceAll(' ', '')
    .replaceAll(',', '_')
    .replaceAll('/', '_')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('|', '_')
    .replaceAll(':', '')
    .replaceAll('>', '')
    .replaceAll('%', 'pct')
    .replaceAll('.', '_')
}
