import { getClassByIndicatorValue } from "./getClassByIndicatorValue.js";
import { t } from "$lib/i18n/translate.js"
import { getIndicatorAttribute } from "./getIndicatorAttribute.js";
import { getNumericalValue } from "./valueRetrieval.js";
import { getIndicatorStore } from "$lib/stores";

export function calcPercentagesForEveryClassMultiIndicator(indicator, data, regio) {
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
  let surfaceAreaColumn = indicator.surfaceArea

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
    // Get surface area for this neighborhood from the specified column
    let neighbourhoodShapeArea = 0
    if (surfaceAreaColumn && neighbourhood.properties[surfaceAreaColumn]) {
      neighbourhoodShapeArea = +neighbourhood.properties[surfaceAreaColumn]
    }

    totalSurfaceArea += neighbourhoodShapeArea

    // voor deze neighbourhood tel de waardes van elke klasse bij de totale som op
    let noData = true
    Object.keys(indicator.classes).forEach(kl => {
      // getIndicatorAttribute will automatically apply BEB suffix if needed
      const attributeName = getIndicatorAttribute(indicator, indicator.classes[kl])
      if (neighbourhood.properties[attributeName] && !isNaN(parseFloat(neighbourhood.properties[attributeName]))) {
        noData = false
        // pak de klasse erbij in totalSumPerClass
        const tempKlasse = totalSumPerClass.filter(kl2 => kl2.className === kl)[0]
        // Weight by surface area
        let value = +neighbourhood.properties[attributeName]

        // Use raw percentage values directly - no conversion needed
        // The weighted average formula naturally accounts for surface area differences
        tempKlasse.som += value * neighbourhoodShapeArea
      }
    });
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
    if (indicator.title === t('Gevoelstemperatuur')) { kl.som *= 100 }
  })

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

    classesTotal.filter(kl => kl.className === getClassByIndicatorValue(indicator, neighbourhoodOrMunicipality.properties[getIndicatorAttribute(indicator, indicator.attribute)]))[0].waarde += 1
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