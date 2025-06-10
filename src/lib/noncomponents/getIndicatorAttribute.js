import { AHNSelecties } from "$lib/stores"
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
    return attribute + specificYear
  }
  
  const ahnSelection = get(AHNSelecties)[indicator.title]
  
  if (!ahnSelection) {
    return attribute
  }
  
  // Check if this is a difference calculation (object with isDifference property)
  if (ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference) {
    // For difference calculation, return the base year attribute
    // The actual difference calculation will be done in the component
    return attribute + ahnSelection.baseYear
  } else {
    // Regular single year selection
    return attribute + ahnSelection
  }
}