import { getIndicatorAttribute } from "./getIndicatorAttribute";
import { getNoDataReason, isValidValue } from "./valueRetrieval.js";

// Function to determine the color of a neighbourhood in aggregated indicator maps
export function getMostCommonClass(indicator, feature) {

  let mostCommon = ''
  let highestValue = 0
  let firstNoDataReason = null

  Object.keys(indicator.classes).forEach(key => {
    const attribute = getIndicatorAttribute(indicator, indicator.classes[key])
    let value = feature.properties?.[attribute]

    // FALLBACK 1: Handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
    if ((value === null || value === undefined || value === '') && attribute && typeof attribute === 'string' && attribute.includes('AHN')) {
      const ahnPattern = /(AHN\d+)$/
      const fallbackAttribute = attribute.replace(ahnPattern, '_$1')
      if (fallbackAttribute !== attribute && feature.properties) {
        value = feature.properties[fallbackAttribute]
      }
    }

    // FALLBACK 2: Handle Gevoelstemperatuur columns without underscore (e.g., "PET29tm34pAHN4" vs "PET29tm34p_AHN4")
    if ((value === null || value === undefined || value === '') && attribute && typeof attribute === 'string' && attribute.includes('_AHN')) {
      const fallbackWithoutUnderscore = attribute.replace('_AHN', 'AHN')
      if (feature.properties) {
        value = feature.properties[fallbackWithoutUnderscore]
      }
    }

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