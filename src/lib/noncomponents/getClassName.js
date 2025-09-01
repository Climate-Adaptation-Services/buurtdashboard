import { currentCodeAbbreviation } from "$lib/stores"
import { get } from "svelte/store"

export function getClassName(feature, type, indicator, mapType) {
  // Defensive check to prevent errors when feature is undefined or missing properties
  if (!feature || !feature.properties) {
    console.warn('getClassName called with invalid feature:', feature)
    return 'invalid-feature_' + type
  }

  let className = feature.properties[get(currentCodeAbbreviation)] + "_" + type
  if (mapType !== 'main map') { className += '_' + indicator.attribute }

  return className.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '')
}