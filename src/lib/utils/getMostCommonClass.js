import { getIndicatorAttribute } from "./getIndicatorAttribute";
import { getNoDataReason, isValidValue } from "./valueRetrieval.js";
import { getPropertyWithAHNFallback } from "./resolveAHNColumnName.js";

// Function to determine the color of a neighbourhood in aggregated indicator maps
export function getMostCommonClass(indicator, feature) {

  let mostCommon = ''
  let highestValue = 0
  let firstNoDataReason = null
  let sumOfRealClasses = 0
  let hasAnyValidData = false

  // Find the remainder class name (the class with '_REST_' marker)
  const remainderClassName = Object.keys(indicator.classes).find(
    key => indicator.classes[key] === '_REST_'
  )

  Object.keys(indicator.classes).forEach(key => {
    // Skip the remainder class marker - it's not a real CSV column, we'll calculate it
    if (indicator.classes[key] === '_REST_') {
      return
    }
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
    if (isValidValue(value)) {
      hasAnyValidData = true
      const numValue = +value
      sumOfRealClasses += numValue
      if (numValue > highestValue) {
        highestValue = numValue
        mostCommon = key
      }
    }
  });

  // If there's a remainder class, calculate its value (100 - sum of real classes)
  // and check if it's the highest
  if (remainderClassName && hasAnyValidData) {
    const remainderValue = 100 - sumOfRealClasses
    if (remainderValue > highestValue) {
      highestValue = remainderValue
      mostCommon = remainderClassName
    }
  }

  if (mostCommon === '') {
    // Return specific no-data reason if found, otherwise generic 'No data'
    return firstNoDataReason || 'No data'
  }


  return mostCommon
}