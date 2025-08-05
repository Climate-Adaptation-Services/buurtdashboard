import { getRegionName } from "./getRegionName.js";
import { tooltipValues, tooltipRegion, municipalitySelection, getIndicatorStore, allNeighbourhoodsJSONData, neighbourhoodsInMunicipalityJSONData, selectedNeighbourhoodJSONData, districtTypeJSONData } from "$lib/stores";
import { select } from "d3";
import { get } from "svelte/store";
import { getNumericalValue } from "./valueRetrieval.js";

// Helper function to get the proper unit symbol for tooltips
function getTooltipUnitSymbol(indicator, originalValue = null, isInMillions = false) {
  const indicatorStore = getIndicatorStore(indicator.title)
  const ahnSelection = get(indicatorStore)
  
  // Check if this indicator has M2 variants and if M2 unit is selected
  if (indicator.variants && indicator.variants.split(',').includes('M2') && 
      ahnSelection?.unit && ahnSelection.unit.toLowerCase() === 'm2') {
    // If value was converted to millions, add M suffix
    if (isInMillions) {
      return ' M m²'
    } else {
      return ' m²'
    }
  } else {
    return '%'
  }
}

// Function to calculate display value for tooltip
function getTooltipDisplayValue(percentageValue, className, regio, indicator) {
  const indicatorStore = getIndicatorStore(indicator.title)
  const ahnSelection = get(indicatorStore)
  
  // Check if this indicator has M2 variants and if M2 unit is selected
  if (indicator.variants && indicator.variants.split(',').includes('M2') && 
      ahnSelection?.unit && ahnSelection.unit.toLowerCase() === 'm2') {
    
    // For M2 unit, calculate the total M2 value for this class in this region
    let relevantData
    if (regio === 'Nederland') {
      relevantData = get(allNeighbourhoodsJSONData)
    } else if (regio === 'Gemeente') {
      relevantData = get(neighbourhoodsInMunicipalityJSONData)
    } else if (regio === 'Buurt') {
      relevantData = { type: "FeatureCollection", features: [get(selectedNeighbourhoodJSONData)] }
    } else if (regio === 'Wijktype') {
      relevantData = get(districtTypeJSONData)
    }
    
    if (!relevantData) return percentageValue
    
    // Calculate the total M2 value for this specific class
    let classM2Total = 0
    
    relevantData.features.forEach(feature => {
      // Get the class attribute (e.g., for class "0-5%", get the corresponding attribute)
      const featureClass = indicator.classes[className]
      if (featureClass) {
        // Create indicator for this specific class with M2 handling
        const classIndicator = { ...indicator, attribute: featureClass }
        const classValue = getNumericalValue(feature, classIndicator)
        if (classValue !== null && !isNaN(classValue)) {
          classM2Total += classValue
        }
      }
    })
    
    // Return the total M2 value for this class, formatted in millions if large
    if (classM2Total >= 100000) {
      return { value: (classM2Total / 1000000), isInMillions: true }
    } else {
      return { value: classM2Total, isInMillions: false }
    }
  } else {
    // Default: return percentage value as-is
    return { value: percentageValue, isInMillions: false }
  }
}

export function barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked) {
  const percentageValue = st[1] - st[0]
  const displayResult = getTooltipDisplayValue(percentageValue, stacked.key, st.data.group, indicator)
  const displayValue = displayResult.value
  const isInMillions = displayResult.isInMillions
  const unitSymbol = getTooltipUnitSymbol(indicator, displayValue, isInMillions)
  
  tooltipValues.set({
    indicator: stacked.key,
    value: Math.round(displayValue * 100) / 100 + unitSymbol,
    color: indicatorValueColorscale(stacked.key)
  })

  let elem = document.getElementsByClassName('barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>', '') + st.data.group)[0]
  let rectmap = elem.getBoundingClientRect();
  let tooltipCenter = [rectmap.left, rectmap.top]

  tooltipRegion.set({
    'region': (get(municipalitySelection) === null) ? 'Gemeente' : 'Buurt',
    'center': tooltipCenter,
    'name': getRegionName(st.data.group)
  })
}

export function barPlotMouseOut(indicator, st, stacked) {
  select('.' + 'barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>', '') + st.data.group)
    .attr('stroke', 'none')

  tooltipValues.set(null)

  tooltipRegion.set(null)
}