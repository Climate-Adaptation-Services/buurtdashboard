import { getClassName } from '$lib/utils/getClassName';
import { currentCodeAbbreviation, neighbourhoodSelection, mousePosition, circleRadius, municipalitySelection, currentNameAbbreviation, URLParams, currentOverviewLevel, neighbourhoodCodeAbbreviation, tooltipValues, tooltipRegion, AHNSelecties } from '$lib/stores';
import { addURLParameter } from '$lib/services/urlManager.js';
import { get } from 'svelte/store';
import { select, selectAll } from 'd3';
import { getClassByIndicatorValue } from '$lib/utils/getClassByIndicatorValue.js';
import { getMostCommonClass } from '$lib/utils/getMostCommonClass.js';
import center from '@turf/center'
import { t } from '$lib/i18n/translate.js';
import { getIndicatorAttribute } from '$lib/utils/getIndicatorAttribute.js';

// MIGRATED: Import centralized value retrieval system
import {
  getDisplayValue,
  getDifferenceValue,
  getCategoricalValue,
  getNumericalValue,
  getRawValue,
  getAHNSelection,
  isValidValue,
  getPopupValue,
  formatM2Value
} from '../utils/valueRetrieval.js';

export function mouseOver(e, feature, indicator, mapType, indicatorValueColorscale, projection, beeswarmMargin) {
  const shapeClassName = getClassName(feature, 'path', indicator, mapType)
  const circleClassName = getClassName(feature, 'node', indicator, mapType)
  let tooltipCenter

  let attributeWithoutYear = ''
  let indicatorAttribute = ''

  if (mapType === 'main map') {
    if (feature.properties[get(currentCodeAbbreviation)] !== get(neighbourhoodSelection)) {
      select('.' + shapeClassName).attr('fill', '#36575A')
      mousePosition.set(window.innerHeight - e.screenY)
    }

    // More elegant tooltip positioning for main map
    // Try to use feature center if Leaflet map is available, otherwise fall back to mouse position
    try {
      const mapElement = document.getElementsByClassName("main-map")[0]
      const rectmap = mapElement.getBoundingClientRect();

      // Get the center of the feature
      const featureCenter = center(feature).geometry.coordinates;

      // Check if there's a Leaflet map available to convert coordinates
      const leafletMapContainer = document.querySelector('.leaflet-background');
      if (leafletMapContainer && window.leafletMapInstance) {
        // Use Leaflet map to convert lat/lng to pixel coordinates
        const pixelPoint = window.leafletMapInstance.latLngToContainerPoint([featureCenter[1], featureCenter[0]]);
        tooltipCenter = [pixelPoint.x + rectmap.left, pixelPoint.y + rectmap.top];
      } else {
        // Fallback to mouse position
        tooltipCenter = [e.clientX, e.clientY];
      }
    } catch (error) {
      // Fallback to mouse position if any error occurs
      tooltipCenter = [e.clientX, e.clientY];
    }

  } else {
    attributeWithoutYear = getIndicatorAttribute(indicator, indicator.attribute).slice(0, -4)

    indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)

    // Check if we're in difference mode (might be needed elsewhere)
    const ahnSelection = get(AHNSelecties)[indicator.title]
    const isDifferenceMode = ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference

    select('.' + shapeClassName)
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 0 15px black)')
      .raise()
    if (indicator.numerical === true) {
      if (feature.properties[get(currentCodeAbbreviation)] !== get(neighbourhoodSelection)) {
        select('.' + circleClassName)
          .attr('stroke', 'white')
          .attr('r', get(circleRadius) + 3)
          .style('filter', 'drop-shadow(0 0 5px black)')
          .raise()
      }
    }

    if (mapType === 'indicator map') {
      // MIGRATED: Use centralized value retrieval system
      const ahnSelection = getAHNSelection(indicator)
      const isDifferenceMode = ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference

      let tooltipValueColor, tooltipValue, tooltipIndicator

      if (indicator.numerical) {
        if (isDifferenceMode) {
          // Use popup value for difference mode to get both percentage and M2 differences
          const popupResult = getPopupValue(feature, indicator)
          
          // Get original diff value for color calculation
          const originalDiffValue = getDifferenceValue(feature, indicator)
          
          // Format the difference value with proper sign and units
          if (popupResult.value !== null && !isNaN(popupResult.value)) {
            const roundedValue = Math.round(popupResult.value * 100) / 100
            const sign = popupResult.value > 0 ? "+" : ""
            tooltipValue = `${sign}${roundedValue.toFixed(1)}${popupResult.unit}`
            
            // Add M2 difference if available
            if (popupResult.hasM2 && popupResult.m2Value !== null) {
              const m2Sign = popupResult.m2Value > 0 ? "+" : ""
              const formattedM2 = formatM2Value(popupResult.m2Value)
              tooltipValue += ` (${m2Sign}${formattedM2} m²)`
            }
          } else {
            tooltipValue = 'Geen data'
          }
          
          tooltipValueColor = originalDiffValue !== null && !isNaN(originalDiffValue)
            ? indicatorValueColorscale(originalDiffValue)
            : '#000000'
          
          tooltipIndicator = `${indicator.title}`
        } else {
          // Use popup value to potentially show both percentage and M2 values for M2 variants
          const popupResult = getPopupValue(feature, indicator)

          // Get original value for consistent color calculation (use getRawValue for Dordrecht AHN underscore naming)
          const originalValue = getRawValue(feature, indicator)
          
          // Format the value with proper rounding and unit
          if (popupResult.value !== null && !isNaN(popupResult.value)) {
            const roundedValue = Math.round(popupResult.value * 100) / 100
            tooltipValue = `${roundedValue}${popupResult.unit}`
            
            // Add M2 value if available with nice formatting
            if (popupResult.hasM2 && popupResult.m2Value !== null) {
              const formattedM2 = formatM2Value(popupResult.m2Value)
              tooltipValue += ` (${formattedM2} m²)`
            }
          } else {
            tooltipValue = 'Geen data'
          }
          
          // Use original value for consistent colors
          tooltipValueColor = originalValue !== null && !isNaN(originalValue)
            ? indicatorValueColorscale(originalValue)
            : '#000000'
          tooltipIndicator = indicator.title
        }
      } else {
        // MIGRATED: Use centralized categorical value retrieval
        tooltipValue = getCategoricalValue(feature, indicator)
        
        // Handle special case for flood depth indicator
        if (indicator.title === 'Maximale overstromingsdiepte' && tooltipValue === 'No data') {
          tooltipValue = 'Geen'
        }
        
        // Get color for categorical value (use getRawValue for Dordrecht AHN underscore naming)
        const categoricalValue = indicator.aggregatedIndicator
          ? getMostCommonClass(indicator, feature)
          : getClassByIndicatorValue(indicator, getRawValue(feature, indicator))
        
        tooltipValueColor = indicatorValueColorscale(categoricalValue)
        tooltipIndicator = indicator.title
      }

      // @ts-ignore
      tooltipValues.set({
        indicator: tooltipIndicator,
        value: tooltipValue,
        color: tooltipValueColor
      })

      const mapElement = document.getElementsByClassName("indicator-map-" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', ''))[0]
      const rectmap = mapElement.getBoundingClientRect();
      const featureCenter = projection(center(feature).geometry.coordinates)
      tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]

      // MIGRATED: Beeswarm interaction with centralized value retrieval
    } else {
      const ahnSelection = getAHNSelection(indicator)
      const isDifferenceMode = ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference

      if (isDifferenceMode) {
        // Use popup value for difference mode to get both percentage and M2 differences
        const popupResult = getPopupValue(feature, indicator)
        
        // Get original diff value for color calculation
        const originalDiffValue = getDifferenceValue(feature, indicator)
        
        let formattedDiffValue
        if (popupResult.value !== null && !isNaN(popupResult.value)) {
          const roundedValue = Math.round(popupResult.value * 100) / 100
          const sign = popupResult.value > 0 ? "+" : ""
          formattedDiffValue = `${sign}${roundedValue.toFixed(1)}${popupResult.unit}`
          
          // Add M2 difference if available
          if (popupResult.hasM2 && popupResult.m2Value !== null) {
            const m2Sign = popupResult.m2Value > 0 ? "+" : ""
            const formattedM2 = formatM2Value(popupResult.m2Value)
            formattedDiffValue += ` (${m2Sign}${formattedM2} m²)`
          }
        } else {
          formattedDiffValue = 'Geen data'
        }

        tooltipValues.set({
          indicator: `${indicator.title} (${ahnSelection.compareYear} vs ${ahnSelection.baseYear})`,
          value: formattedDiffValue,
          color: originalDiffValue !== null && !isNaN(originalDiffValue) ? indicatorValueColorscale(originalDiffValue) : '#000000'
        })
      } else {
        // Use popup value to potentially show both percentage and M2 values for M2 variants in beeswarm
        const popupResult = getPopupValue(feature, indicator)
        
        let displayValue
        if (popupResult.value !== null && !isNaN(popupResult.value)) {
          const roundedValue = Math.round(popupResult.value * 100) / 100
          displayValue = `${roundedValue}${popupResult.unit}`
          
          // Add M2 value if available with nice formatting
          if (popupResult.hasM2 && popupResult.m2Value !== null) {
            const formattedM2 = formatM2Value(popupResult.m2Value)
            displayValue += ` (${formattedM2} m²)`
          }
        } else {
          displayValue = 'Geen data'
        }
        
        // For color calculation, use the original % value for consistency
        const originalValue = getNumericalValue(feature, indicator)
        
        tooltipValues.set({
          indicator: indicator.title,
          value: displayValue,
          color: originalValue !== null && !isNaN(originalValue) ? indicatorValueColorscale(originalValue) : '#000000'
        })
      }

      let elem = document.getElementsByClassName('beeswarm_' + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', ''))[0]
      let rectmap = elem.getBoundingClientRect();
      tooltipCenter = [feature.x + rectmap.left + beeswarmMargin.left, rectmap.top + beeswarmMargin.top + feature.y + 10]
    }
  }
  // @ts-ignore
  tooltipRegion.set({
    'region': (get(municipalitySelection) === null) ? t('Gemeente') : t('Buurt'),
    'center': tooltipCenter,
    'name': feature.properties[get(currentNameAbbreviation)]
  })
}

export function mouseOut(feature, indicator, mapType) {
  const shapeClassName = getClassName(feature, 'path', indicator, mapType)
  const circleClassName = getClassName(feature, 'node', indicator, mapType)

  if (feature.properties[get(currentCodeAbbreviation)] !== get(neighbourhoodSelection)) {

    if (mapType === 'main map') {
      select('.' + shapeClassName)
        .attr('fill', 'whitesmoke')
      mousePosition.set(null)
    } else {
      select('.' + shapeClassName)
        .attr('stroke-width', 0.5)
        .style('filter', 'none')
        .lower()
      if (indicator.numerical) {
        select('.' + circleClassName)
          .attr('stroke', 'none')
          .attr('r', get(circleRadius))
          .style('filter', 'none')
          .lower()
      }
      tooltipValues.set(null)
    }
  }
  tooltipRegion.set(null)
}

export function click(feature, indicator, mapType) {

  mouseOut(feature, indicator, mapType)
  selectAll('.svgelements_' + feature.properties[get(neighbourhoodCodeAbbreviation)])
    .raise()

  const newSelection = feature.properties[get(currentCodeAbbreviation)].replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '')
  if (get(currentOverviewLevel) === 'Nederland') {
    get(URLParams).set('gemeente', newSelection);
    addURLParameter();
    municipalitySelection.set(newSelection)
  } else {
    get(URLParams).set('buurt', newSelection);
    addURLParameter();
    neighbourhoodSelection.set(newSelection)
  }
}