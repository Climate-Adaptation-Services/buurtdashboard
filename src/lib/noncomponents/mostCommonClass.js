import { t } from "$lib/i18n/translate";
// deze functie is nodig om de kleur te bepalen van een neighbourhood in de aggregatedIndicator kaart
export function mostCommonClass(indicator, feature){
  let mostCommon = ''
  let highestValue = 0
  Object.keys(indicator.classes).forEach(key => {
    if(feature.properties[indicator.classes[key]] > highestValue){
      highestValue = feature.properties[indicator.classes[key]]
      mostCommon = key
    }
  });

  if(mostCommon === ''){
    return t('Geen_data')
  }

  return mostCommon
}