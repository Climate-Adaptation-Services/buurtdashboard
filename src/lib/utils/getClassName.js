import { currentCodeAbbreviation } from "$lib/stores"
import { get } from "svelte/store"
import { sanitizeClassName } from "./sanitizeClassName.js"

export function getClassName(feature, type, indicator, mapType) {
  // Defensive check to prevent errors when feature is undefined or missing properties
  if (!feature || !feature.properties) {
    console.warn('getClassName called with invalid feature:', feature)
    return 'invalid-feature_' + type
  }

  let className = feature.properties[get(currentCodeAbbreviation)] + "_" + type
  if (mapType !== 'main map') {
    // Use indicator title instead of attribute to ensure uniqueness for aggregated indicators
    // (multiple indicators can share the same first attribute, e.g., "Gebouwen_PercLand")
    className += '_' + indicator.title
  }

  return sanitizeClassName(className)
}