import { getIndicatorAttribute } from "./getIndicatorAttribute";
import { getNoDataReason, isValidValue } from "./valueRetrieval.js";
import { getPropertyWithAHNFallback } from "./resolveAHNColumnName.js";

// Function to determine the color of a neighbourhood in aggregated indicator maps
export function getMostCommonClass(indicator, feature) {

  let mostCommon = ''
  let highestValue = 0
  let firstNoDataReason = null

  Object.keys(indicator.classes).forEach(key => {
    const attribute = getIndicatorAttribute(indicator, indicator.classes[key])
    // Use centralized AHN column name resolution (handles Dordrecht naming differences)
    const value = getPropertyWithAHNFallback(attribute, feature.properties)

    // Check for specific no-data codes before processing
    if (!firstNoDataReason && value !== null && value !== undefined && value !== '') {
      const reason = getNoDataReason(value)
      if (reason && reason !== 'no_data' && reason !== null) {
        firstNoDataReason = reason
      }
    }

    // Only count valid values (skip no-data codes)
    if (isValidValue(value) && +value > highestValue) {
      highestValue = +value
      mostCommon = key
    }
  });


  if (mostCommon === '') {
    // Return specific no-data reason if found, otherwise generic 'No data'
    return firstNoDataReason || 'No data'
  }


  return mostCommon
}