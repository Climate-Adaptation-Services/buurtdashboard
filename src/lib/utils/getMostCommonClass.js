import { getIndicatorAttribute } from "./getIndicatorAttribute";

// Function to determine the color of a neighbourhood in aggregated indicator maps
export function getMostCommonClass(indicator, feature) {



  let mostCommon = ''
  let highestValue = 0
  Object.keys(indicator.classes).forEach(key => {
    const attribute = getIndicatorAttribute(indicator, indicator.classes[key])
    let value = feature.properties[attribute]

    // FALLBACK: Handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
    if ((value === null || value === undefined || value === '') && attribute.includes('AHN')) {
      const ahnPattern = /(AHN\d+)$/
      const fallbackAttribute = attribute.replace(ahnPattern, '_$1')
      if (fallbackAttribute !== attribute) {
        value = feature.properties[fallbackAttribute]
      }
    }

    if (+value > highestValue) {
      highestValue = +value
      mostCommon = key
    }
  });


  if (mostCommon === '') {
    return 'No data'
  }


  return mostCommon
}