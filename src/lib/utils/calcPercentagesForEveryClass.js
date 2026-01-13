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
      // Skip the dummy "No data" class for aggregated indicators (it has attribute "-10")
      if (kl === 'No data' && indicator.classes[kl] === '-10') {
        return // Skip this class
      }

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
        let value = +propertyValue
        const originalValue = value

        // Handle 0-1 decimal format: convert to 0-100 percentage
        // Most percentage columns are stored as decimals (e.g., 0.037 = 3.7%)
        if (value >= 0 && value <= 1) {
          value = value * 100
        }

        // Sanity check: For percentage data, values should be 0-100
        // Values > 100 are likely data errors (e.g., 10099 instead of 100)
        if (value > 100 && value < 10000) {
          // Common error pattern: extra digit(s) added (10099 -> 100, 999 -> 99)
          // Try to fix by removing extra leading digit
          const strValue = value.toString()
          if (strValue.startsWith('100') && strValue.length > 3) {
            value = 100 // 10099 -> 100
          } else if (strValue.length === 3 && value > 100) {
            value = parseFloat(strValue.substring(1)) // 999 -> 99
          }
        }

        // Only use valid percentage values (0-100)
        if (value >= 0 && value <= 100) {
          noData = false
          // pak de klasse erbij in totalSumPerClass
          const tempKlasse = totalSumPerClass.filter(kl2 => kl2.className === kl)[0]

          // Simple sum - no surface area weighting
          tempKlasse.som += value
        }
        // If value is still out of range, simply skip it (don't add to sum)
      }
    });
    if (noData) {
      if (indicator.title !== t('Gevoelstemperatuur') && indicator.title !== 'Maximale overstromingsdiepte') {
        // Add 100% to "No data" class for neighborhoods without data (only if that class exists)
        const noDataClass = totalSumPerClass.find(kl => kl.className === 'No data')
        if (noDataClass) {
          noDataClass.som += 100
        }
      }
    }
  });

  // Divide by total number of neighborhoods to get average
  totalSumPerClass.forEach(kl => {
    kl.som = totalCount > 0 ? (kl.som / totalCount) : 0
  })

  // we stoppen het resultaat per klasse in een dictionary
  let result = { 'group': regio }
  Object.keys(indicator.classes).forEach(indicatorClass => {
    // Skip the dummy "No data" class for aggregated indicators in the output
    if (indicatorClass === 'No data' && indicator.classes[indicatorClass] === '-10') {
      result[indicatorClass] = 0 // Set to 0 instead of trying to calculate
    } else {
      result[indicatorClass] = totalSumPerClass.filter(kl => kl.className === indicatorClass)[0].som
    }
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
      const className = getClassByIndicatorValue(indicator, rawValue)
      const classEntry = classesTotal.find(kl => kl.className === className)
      if (classEntry) {
        classEntry.waarde += 1
        totalAmount += 1
      }
    }
  });

  classesTotal.forEach(kl => {
    kl.waarde = totalAmount > 0 ? (kl.waarde / totalAmount) * 100 : 0
  })

  let result = { 'group': regio }
  Object.keys(indicator.classes).forEach(klasse => {
    const classEntry = classesTotal.find(kl => kl.className === klasse)
    result[klasse] = classEntry ? classEntry.waarde : 0
  });

  return result
}