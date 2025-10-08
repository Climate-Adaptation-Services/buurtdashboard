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
  let resultAttribute = attribute

  // Handle BEB variant suffix (_1) first
  if (indicator.variants && indicator.variants.split(',').map(v => v.trim()).includes('1')) {
    const indicatorStore = getIndicatorStore(indicator.title);
    const ahnSelection = get(indicatorStore);
    const bebSelection = ahnSelection?.beb || 'hele_buurt'

    if (bebSelection === 'bebouwde_kom') {
      resultAttribute = resultAttribute + '_1'
    }
  }

  // Then handle year suffix
  // If a specific year is provided, use that directly
  if (specificYear) {
    return resultAttribute + '_' + specificYear;
  }

  // Get the indicator-specific store
  const indicatorStore = getIndicatorStore(indicator.title);
  const ahnSelection = get(indicatorStore);

  if (!ahnSelection || !ahnSelection.baseYear || ahnSelection.baseYear === '') {
    return resultAttribute;
  }

  // Use the baseYear from the indicator store
  return resultAttribute + '_' + ahnSelection.baseYear;
}