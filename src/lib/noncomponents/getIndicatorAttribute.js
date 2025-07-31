import { getIndicatorStore } from "$lib/stores"
import { get } from "svelte/store"

/**
 * Get the attribute name for an indicator, optionally for a specific year
 * @param {Object} indicator - The indicator object
 * @param {string} attribute - The base attribute name
 * @param {string} [specificYear] - Optional specific year to use instead of the store selection
 * @returns {string} - The complete attribute name
 */
export function getIndicatorAttribute(indicator, attribute, specificYear) {
  // If a specific year is provided, use that directly
  if (specificYear) {
    return attribute + '_' + specificYear;
  }

  // Get the indicator-specific store
  const indicatorStore = getIndicatorStore(indicator.title);
  const ahnSelection = get(indicatorStore);

  if (!ahnSelection || !ahnSelection.baseYear || ahnSelection.baseYear === '') {
    return attribute;
  }

  // Use the baseYear from the indicator store
  return attribute + '_' + ahnSelection.baseYear;
}