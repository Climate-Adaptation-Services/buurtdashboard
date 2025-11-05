import { getClassByIndicatorValue } from "./getClassByIndicatorValue.js";
import { t } from "$lib/i18n/translate.js"
import { getIndicatorAttribute } from "./getIndicatorAttribute.js";
import { getNumericalValue, getRawValue } from "./valueRetrieval.js";
import { getIndicatorStore } from "$lib/stores";

export function calcPercentagesForEveryClassMultiIndicator(indicator, data, regio) {
  // Check if data exists
  if (!data || !data.features || data.features.length === 0) {
    console.warn(`calcPercentagesForEveryClassMultiIndicator: No data for ${indicator.title} at ${regio} level`)
    return null
  }

  let totalSurfaceArea = 0
  let totalSumPerClass = []

  // object om totale som van elke klasse in op te tellen
  for (let i = 0; i < Object.keys(indicator.classes).length; i++) {
    totalSumPerClass.push({
      className: Object.keys(indicator.classes)[i],
      som: 0
    })
  }

  // Get the surface area column name from the indicator's surfaceArea field
  // Special case: "Totale buurt" means use the standard surface area column
  let surfaceAreaColumn = indicator.surfaceArea
  if (surfaceAreaColumn === 'Totale buurt') {
    surfaceAreaColumn = 'Oppervlakte_Land_m2' // Standard surface area column

    // Check if this column exists in the data, if not, try alternatives
    // Find first non-null feature for checking column names
    const firstValidFeature = data.features.find(f => f?.properties)
    if (firstValidFeature && !firstValidFeature.properties[surfaceAreaColumn]) {
      // Try common alternatives
      const alternatives = ['Oppervlakte_m2', 'oppervlakte', 'area', 'surface_area']
      for (const alt of alternatives) {
        if (firstValidFeature.properties[alt]) {
          surfaceAreaColumn = alt
          console.log(`Surface area column not found, using alternative: ${alt}`)
          break
        }
      }
    }
  }

  // Debug: log first feature's available properties for this indicator
  const firstValidFeature = data.features.find(f => f?.properties)
  if (firstValidFeature) {
    const lookingForAttributes = Object.values(indicator.classes).map(v => getIndicatorAttribute(indicator, v))
    const availableAttributes = Object.keys(firstValidFeature.properties).filter(key =>
      lookingForAttributes.some(attr => key.includes(attr.substring(0, 10)))
    )
    console.log(`${indicator.title} for ${regio}: Looking for [${lookingForAttributes.join(', ')}], found similar: [${availableAttributes.join(', ')}]`)
  }

  // Check if we need to apply BEB suffix to surface area column
  if (surfaceAreaColumn && indicator.variants && indicator.variants.split(',').map(v => v.trim()).includes('1')) {
    const indicatorStore = getIndicatorStore(indicator.title)
    let ahnSelection

    const unsubscribe = indicatorStore.subscribe(value => {
      ahnSelection = value
    })
    unsubscribe()

    const bebSelection = ahnSelection?.beb || 'hele_buurt'
    if (bebSelection === 'bebouwde_kom') {
      surfaceAreaColumn = surfaceAreaColumn + '_1'
    }
  }

  // voor elke neighbourhood gaan we de waardes van elke klasse bij de som van die klasse toevoegen
  data.features.forEach(neighbourhood => {
    // Skip null/invalid features
    if (!neighbourhood?.properties) return

    // Get surface area for this neighborhood from the specified column
    let neighbourhoodShapeArea = 1 // Default to 1 (equal weight for all neighbourhoods)

    if (surfaceAreaColumn && neighbourhood.properties[surfaceAreaColumn]) {
      const areaValue = +neighbourhood.properties[surfaceAreaColumn]
      if (!isNaN(areaValue) && areaValue > 0) {
        neighbourhoodShapeArea = areaValue
      }
    }

    totalSurfaceArea += neighbourhoodShapeArea

    // voor deze neighbourhood tel de waardes van elke klasse bij de totale som op
    let noData = true
    let foundAttributes = []
    let debugValues = []
    Object.keys(indicator.classes).forEach(kl => {
      // getIndicatorAttribute will automatically apply BEB suffix if needed
      const attributeName = getIndicatorAttribute(indicator, indicator.classes[kl])
      let propertyValue = neighbourhood.properties?.[attributeName]

      // FALLBACK: Handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
      if ((propertyValue === null || propertyValue === undefined || propertyValue === '') && attributeName && typeof attributeName === 'string' && attributeName.includes('AHN')) {
        const ahnPattern = /(AHN\d+)$/
        const fallbackAttribute = attributeName.replace(ahnPattern, '_$1')
        if (fallbackAttribute !== attributeName && neighbourhood.properties) {
          propertyValue = neighbourhood.properties[fallbackAttribute]
        }
      }

      if (propertyValue !== undefined && propertyValue !== null && propertyValue !== '' && !isNaN(parseFloat(propertyValue))) {
        noData = false
        foundAttributes.push(attributeName)
        // pak de klasse erbij in totalSumPerClass
        const tempKlasse = totalSumPerClass.filter(kl2 => kl2.className === kl)[0]
        // Weight by surface area
        let value = +propertyValue

        debugValues.push({attr: attributeName, value, area: neighbourhoodShapeArea, weighted: value * neighbourhoodShapeArea})

        // Use raw percentage values directly - no conversion needed
        // The weighted average formula naturally accounts for surface area differences
        tempKlasse.som += value * neighbourhoodShapeArea
      }
    });

    // Debug first neighbourhood
    if (debugValues.length > 0 && data.features.indexOf(neighbourhood) === 0) {
      console.log(`First neighbourhood values for ${indicator.title}:`, debugValues, `Total surface area: ${totalSurfaceArea}`)
    }

    if (noData && Object.keys(indicator.classes).length > 0) {
      console.warn(`No data found for ${indicator.title} in neighbourhood. Looking for attributes:`, Object.values(indicator.classes).map(v => getIndicatorAttribute(indicator, v)))
    }
    if (noData) {
      if (indicator.title !== t('Gevoelstemperatuur') && indicator.title !== 'Maximale overstromingsdiepte') {
        // Weight "No data" by surface area as well
        totalSumPerClass.filter(kl => kl.className === 'No data')[0].som += 100 * neighbourhoodShapeArea
      }
    }
  });

  // Divide by total surface area instead of number of features
  totalSumPerClass.forEach(kl => {
    kl.som = totalSurfaceArea > 0 ? (kl.som / totalSurfaceArea) : 0
    if (indicator.title === t('Gevoelstemperatuur') || indicator.title === 'Gevoelstemperatuur') {
      kl.som *= 100
    }
  })

  // we stoppen het resultaat per klasse in een dictionary
  let result = { 'group': regio }
  Object.keys(indicator.classes).forEach(indicatorClass => {
    result[indicatorClass] = totalSumPerClass.filter(kl => kl.className === indicatorClass)[0].som
  });

  console.log(`${indicator.title} for ${regio} result:`, result)
  return result
}

export function calcPercentagesForEveryClassSingleIndicator(indicator, data, regio) {
  let totalAmount = 0
  let classesTotal = []
  for (let i = 0; i < Object.keys(indicator.classes).length; i++) {
    classesTotal.push({ className: Object.keys(indicator.classes)[i], waarde: 0 })
  }

  data.features.forEach(neighbourhoodOrMunicipality => {
    // Use getRawValue to handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
    classesTotal.filter(kl => kl.className === getClassByIndicatorValue(indicator, getRawValue(neighbourhoodOrMunicipality, indicator)))[0].waarde += 1
    totalAmount += 1
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