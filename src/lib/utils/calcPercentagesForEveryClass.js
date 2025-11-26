import { getClassByIndicatorValue } from "./getClassByIndicatorValue.js";
import { t } from "$lib/i18n/translate.js"
import { getIndicatorAttribute } from "./getIndicatorAttribute.js";
import { getNumericalValue, getRawValue, isValidValue } from "./valueRetrieval.js";
import { getIndicatorStore } from "$lib/stores";

export function calcPercentagesForEveryClassMultiIndicator(indicator, data, regio) {
  // Check if data exists
  if (!data || !data.features || data.features.length === 0) {
    return null
  }

  let totalCount = 0
  let totalSumPerClass = []

  // object om totale som van elke klasse in op te tellen
  for (let i = 0; i < Object.keys(indicator.classes).length; i++) {
    totalSumPerClass.push({
      className: Object.keys(indicator.classes)[i],
      som: 0
    })
  }

  // voor elke neighbourhood gaan we de waardes van elke klasse bij de som van die klasse toevoegen
  data.features.forEach(neighbourhood => {
    // Skip null/invalid features
    if (!neighbourhood?.properties) return

    totalCount += 1

    // voor deze neighbourhood tel de waardes van elke klasse bij de totale som op
    let noData = true
    Object.keys(indicator.classes).forEach(kl => {
      // getIndicatorAttribute will automatically apply BEB suffix if needed
      const attributeName = getIndicatorAttribute(indicator, indicator.classes[kl])
      let propertyValue = neighbourhood.properties?.[attributeName]

      // FALLBACK 1: Handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
      if ((propertyValue === null || propertyValue === undefined || propertyValue === '') && attributeName && typeof attributeName === 'string' && attributeName.includes('AHN')) {
        const ahnPattern = /(AHN\d+)$/
        const fallbackAttribute = attributeName.replace(ahnPattern, '_$1')
        if (fallbackAttribute !== attributeName && neighbourhood.properties) {
          propertyValue = neighbourhood.properties[fallbackAttribute]
        }
      }

      // FALLBACK 2: Handle Gevoelstemperatuur columns without underscore (e.g., "PET29tm34pAHN4" vs "PET29tm34p_AHN4")
      if ((propertyValue === null || propertyValue === undefined || propertyValue === '') && attributeName && typeof attributeName === 'string' && attributeName.includes('_AHN')) {
        // Try removing the underscore before AHN
        const fallbackWithoutUnderscore = attributeName.replace('_AHN', 'AHN')
        if (neighbourhood.properties) {
          propertyValue = neighbourhood.properties[fallbackWithoutUnderscore]
        }
      }

      // Use isValidValue to filter out -9999 and other invalid values
      if (isValidValue(propertyValue)) {
        noData = false
        // pak de klasse erbij in totalSumPerClass
        const tempKlasse = totalSumPerClass.filter(kl2 => kl2.className === kl)[0]
        let value = +propertyValue

        // Simple sum - no surface area weighting
        tempKlasse.som += value
      }
    });
    if (noData) {
      if (indicator.title !== t('Gevoelstemperatuur') && indicator.title !== 'Maximale overstromingsdiepte') {
        // Add 100% to "No data" class for neighborhoods without data
        totalSumPerClass.filter(kl => kl.className === 'No data')[0].som += 100
      }
    }
  });

  // Divide by total number of neighborhoods to get average
  totalSumPerClass.forEach(kl => {
    kl.som = totalCount > 0 ? (kl.som / totalCount) : 0
    if (indicator.title === t('Gevoelstemperatuur') || indicator.title === 'Gevoelstemperatuur') {
      kl.som *= 100
    }
  })

  // Special handling for "10% en 30% regel" indicator
  // Buildings meeting 30% also meet 10%, so subtract 30% from 10% to avoid double-counting
  if (indicator.title === '10% en 30% regel') {
    const class10 = totalSumPerClass.find(kl => kl.className === 'voldoet aan 10%')
    const class30 = totalSumPerClass.find(kl => kl.className === 'voldoet aan30%')

    if (class10 && class30) {
      // Subtract 30% values from 10% values to show only buildings meeting 10% but not 30%
      class10.som = Math.max(0, class10.som - class30.som)
    }
  }

  // we stoppen het resultaat per klasse in een dictionary
  let result = { 'group': regio }
  Object.keys(indicator.classes).forEach(indicatorClass => {
    result[indicatorClass] = totalSumPerClass.filter(kl => kl.className === indicatorClass)[0].som
  });

  return result
}

export function calcPercentagesForEveryClassSingleIndicator(indicator, data, regio) {
  let totalAmount = 0
  let classesTotal = []
  for (let i = 0; i < Object.keys(indicator.classes).length; i++) {
    classesTotal.push({ className: Object.keys(indicator.classes)[i], waarde: 0 })
  }

  data.features.forEach(neighbourhoodOrMunicipality => {
    // Skip null/invalid features
    if (!neighbourhoodOrMunicipality?.properties) return

    // Use getRawValue to handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
    const rawValue = getRawValue(neighbourhoodOrMunicipality, indicator)

    // Skip invalid values like -9999
    if (isValidValue(rawValue)) {
      classesTotal.filter(kl => kl.className === getClassByIndicatorValue(indicator, rawValue))[0].waarde += 1
      totalAmount += 1
    }
  });

  classesTotal.forEach(kl => {
    kl.waarde = (kl.waarde / totalAmount) * 100
  })

  let result = { 'group': regio }
  Object.keys(indicator.classes).forEach(klasse => {
    result[klasse] = classesTotal.filter(kl => kl.className === klasse)[0].waarde
  });

  return result
}