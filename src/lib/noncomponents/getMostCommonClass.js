import { getIndicatorAttribute } from "./getIndicatorAttribute";

// deze functie is nodig om de kleur te bepalen van een neighbourhood in de aggregatedIndicator kaart
export function getMostCommonClass(indicator, feature) {

  let mostCommon = ''
  let highestValue = 0
  Object.keys(indicator.classes).forEach(key => {
    if (+feature.properties[getIndicatorAttribute(indicator, indicator.classes[key])] > highestValue) {
      highestValue = +feature.properties[getIndicatorAttribute(indicator, indicator.classes[key])]
      mostCommon = key
    }
  });

  if (mostCommon === '') {
    return 'No data'
  }

  return mostCommon
}