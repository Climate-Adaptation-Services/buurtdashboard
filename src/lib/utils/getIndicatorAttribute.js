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

  // Handle BEB variant suffix (read from variants column, not hardcoded)
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

  // Then handle year/AHN suffix
  // Determine the year to use
  let yearToUse = specificYear;
  if (!yearToUse) {
    const indicatorStore = getIndicatorStore(indicator.title);
    const ahnSelection = get(indicatorStore);
    yearToUse = ahnSelection?.baseYear;
  }

  // If no year/AHN version, return as is
  if (!yearToUse || yearToUse === '') {
    return resultAttribute;
  }

  // Check if this is an AHN version (starts with "AHN") or a regular year (numeric)
  // AHN versions are concatenated directly (no underscore): PET29tm34pAHN4
  // Regular years use underscore: attribute_2020
  if (yearToUse.startsWith('AHN')) {
    return resultAttribute + yearToUse; // Direct concatenation for AHN
  } else {
    return resultAttribute + '_' + yearToUse; // Underscore for regular years
  }
}