import { extent } from "d3";
import { getIndicatorAttribute } from "./getIndicatorAttribute";
import { getRawValue } from "./valueRetrieval";

/**
 * Calculate the extent values for the current indicator and AHN version
 *
 * @param {Object} indicator - The indicator object
 * @param {Array} neighbourhoodFeatures - Array of neighborhood features with properties
 * @param {Boolean} isDifferenceMode - Whether we're in difference mode
 * @param {String} indicatorAttribute - The indicator attribute to use (unit-aware)
 * @returns {Array|null} - [min, max] extent array or null if in difference mode
 */
export function getGlobalExtent(indicator, neighbourhoodFeatures, isDifferenceMode, indicatorAttribute) {
  // Only calculate if we're not in difference mode
  if (isDifferenceMode) {
    return null;
  }

  // Check if indicator exists
  if (!indicator || !indicatorAttribute) {
    return [0, 1]; // Default fallback
  }

  // Filter out null and empty values using getRawValue (which has BEB fallback)
  const validData = neighbourhoodFeatures.filter(d => {
    const rawValue = getRawValue(d, indicator);
    return rawValue !== null && rawValue !== "";
  });

  // Handle special case for logarithmic scale
  if (indicator.title === "Groen per inwoner") {
    const validPositiveData = validData.filter(d => {
      const rawValue = getRawValue(d, indicator);
      return +rawValue > 0;
    });
    if (validPositiveData.length > 0) {
      try {
        return extent(validPositiveData, d => +getRawValue(d, indicator));
      } catch (e) {
        console.error("Error calculating extent for", indicatorAttribute, e);
        return [0, 1];
      }
    }
  } else if (validData.length > 0) {
    try {
      return extent(validData, d => +getRawValue(d, indicator));
    } catch (e) {
      console.error("Error calculating extent for", indicatorAttribute, e);
      return [0, 1];
    }
  }

  // Default fallback if no valid data
  return [0, 1];
}
