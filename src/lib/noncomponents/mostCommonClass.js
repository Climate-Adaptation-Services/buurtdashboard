// deze functie is nodig om de kleur te bepalen van een buurt in de multiline kaart
export function mostCommonClass(indicator, feature){
  let mostCommon = ''
  let highestValue = 0
  Object.keys(indicator.klassen).forEach(key => {
    if(feature.properties[indicator.klassen[key]] > highestValue){
      highestValue = feature.properties[indicator.klassen[key]]
      mostCommon = key
    }
  });

  return mostCommon
}