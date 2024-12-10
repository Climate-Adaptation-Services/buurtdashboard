// deze functie is nodig om de kleur te bepalen van een neighbourhood in de aggregatedIndicator kaart
export function getMostCommonClass(indicator, feature){
  let mostCommon = ''
  let highestValue = 0
  Object.keys(indicator.classes).forEach(key => {
    if(feature.properties[indicator.classes[key]] > highestValue){
      highestValue = feature.properties[indicator.classes[key]]
      mostCommon = key
    }
  });

  return mostCommon
}