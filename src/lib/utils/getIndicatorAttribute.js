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

  // Determine the year to use first
  let yearToUse = specificYear;
  if (!yearToUse) {
    const indicatorStore = getIndicatorStore(indicator.title);
    const ahnSelection = get(indicatorStore);
    yearToUse = ahnSelection?.baseYear;
  }

  // Add year/AHN suffix first (if it exists)
  if (yearToUse && yearToUse !== '') {
    // Check if this is an AHN version (starts with "AHN") or a regular year (numeric)
    if (yearToUse.startsWith('AHN')) {
      resultAttribute = resultAttribute + '_' + yearToUse; // Underscore for AHN versions
    } else {
      resultAttribute = resultAttribute + '_' + yearToUse; // Underscore for regular years
    }
  }

  // Then handle BEB variant suffix (read from variants column, not hardcoded)
  // This comes AFTER the year/AHN suffix: attribute_AHN3_BK
  const variants = indicator.variants ? indicator.variants.split(',').map(v => v.trim()) : []
  const bebVariant = variants.find(v => v !== 'M2' && v !== '') // Find the BEB variant (not M2)

  if (bebVariant) {
    const indicatorStore = getIndicatorStore(indicator.title);
    const ahnSelection = get(indicatorStore);
    const bebSelection = ahnSelection?.beb || 'hele_buurt'

    if (bebSelection === 'bebouwde_kom') {
      resultAttribute = resultAttribute + '_' + bebVariant
    }
  }

  return resultAttribute;
}