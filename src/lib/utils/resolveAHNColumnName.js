/**
 * Resolves the actual column name for AHN-versioned data, handling different naming conventions.
 *
 * The default dataset uses names like "BKBAHN3" (no underscore)
 * The Dordrecht dataset uses names like "BKB_AHN3" (with underscore)
 *
 * This function tries the original attribute first, then falls back to alternative naming conventions.
 *
 * @param {string} attribute - The attribute name to resolve
 * @param {object} properties - The feature properties object to check against
 * @returns {{ resolvedAttribute: string, value: any }} - The resolved attribute name and its value
 */
export function resolveAHNColumnName(attribute, properties) {
  if (!attribute || !properties) {
    return { resolvedAttribute: attribute, value: undefined }
  }

  // Try original attribute first
  let value = properties[attribute]

  // Check if value is valid (not null, undefined, or empty string)
  const isInvalid = value === null || value === undefined || value === ''

  // FALLBACK 1: If attribute contains AHN but no underscore before it, try adding underscore
  // e.g., "PET29tm34pAHN4" -> "PET29tm34p_AHN4"
  if (isInvalid && attribute.includes('AHN') && !attribute.includes('_AHN')) {
    const ahnPattern = /(AHN\d+)$/
    const fallbackAttribute = attribute.replace(ahnPattern, '_$1')
    if (fallbackAttribute !== attribute) {
      const fallbackValue = properties[fallbackAttribute]
      if (fallbackValue !== null && fallbackValue !== undefined && fallbackValue !== '') {
        return { resolvedAttribute: fallbackAttribute, value: fallbackValue }
      }
    }
  }

  // FALLBACK 2: If attribute contains _AHN, try removing the underscore
  // e.g., "PET29tm34p_AHN4" -> "PET29tm34pAHN4"
  if (isInvalid && attribute.includes('_AHN')) {
    const fallbackWithoutUnderscore = attribute.replace('_AHN', 'AHN')
    const fallbackValue = properties[fallbackWithoutUnderscore]
    if (fallbackValue !== null && fallbackValue !== undefined && fallbackValue !== '') {
      return { resolvedAttribute: fallbackWithoutUnderscore, value: fallbackValue }
    }
  }

  return { resolvedAttribute: attribute, value }
}

/**
 * Gets a property value with AHN naming fallback support.
 * Convenience function that returns just the value.
 *
 * @param {string} attribute - The attribute name
 * @param {object} properties - The feature properties object
 * @returns {any} - The property value (or undefined if not found)
 */
export function getPropertyWithAHNFallback(attribute, properties) {
  return resolveAHNColumnName(attribute, properties).value
}
