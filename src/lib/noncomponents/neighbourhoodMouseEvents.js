import { getClassName } from '$lib/noncomponents/getClassName';
import { currentCodeAbbreviation, neighbourhoodSelection, mousePosition, circleRadius, municipalitySelection, currentNameAbbreviation, URLParams, currentOverviewLevel, neighbourhoodCodeAbbreviation, tooltipValues, tooltipRegion, AHNSelecties } from '$lib/stores';
import { get } from 'svelte/store';
import { select, selectAll } from 'd3';
import { getClassByIndicatorValue } from './getClassByIndicatorValue.js';
import { getMostCommonClass } from './getMostCommonClass.js';
import center from '@turf/center'
import { t } from '$lib/i18n/translate.js';
import { getIndicatorAttribute } from './getIndicatorAttribute.js';

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
    const mapElement = document.getElementsByClassName("main-map")[0]
    const rectmap = mapElement.getBoundingClientRect();
    const featureCenter = projection(center(feature).geometry.coordinates)
    tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]

  } else {
    attributeWithoutYear = getIndicatorAttribute(indicator, indicator.attribute).slice(0, -4)
    
    // Check if we're in difference mode
    const ahnSelection = get(AHNSelecties)[indicator.title]
    const isDifferenceMode = ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference
    
    if (isDifferenceMode) {
      // For difference mode, we'll use the base attribute but will calculate the difference value later
      indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)
    } else {
      indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)
    }

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
      // Check if we're in difference mode
      const ahnSelection = get(AHNSelecties)[indicator.title]
      const isDifferenceMode = ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference
      
      let tooltipValueColor, tooltipValue, tooltipIndicator
      
      if (indicator.numerical) {
        if (isDifferenceMode) {
          // For difference mode, use the calculated difference value
          const diffValue = feature.properties.calculatedDifference
          
          // Format the difference value with a + sign for positive values
          tooltipValue = diffValue > 0 
            ? "+" + (Math.round(diffValue * 100) / 100).toFixed(1)
            : (Math.round(diffValue * 100) / 100).toFixed(1)
          
          // Use the same color scale as defined in Indicator.svelte
          tooltipValueColor = indicatorValueColorscale(diffValue)
          
          // Include both years in the tooltip title
          tooltipIndicator = `${indicator.title} (${ahnSelection.compareYear} vs ${ahnSelection.baseYear})`
        } else {
          // Regular numerical indicator
          tooltipValue = /\d/.test(feature.properties[indicatorAttribute])
            ? Math.round(+feature.properties[indicatorAttribute] * 100) / 100
            : 'Geen data'
          tooltipValueColor = feature.properties[indicatorAttribute]
            ? indicatorValueColorscale(feature.properties[indicatorAttribute])
            : '#000000'
          tooltipIndicator = indicator.title
        }
      } else {
        // Non-numerical indicator
        tooltipValue = indicator.aggregatedIndicator
          ? getMostCommonClass(indicator, feature)
          : getClassByIndicatorValue(indicator, feature.properties[getIndicatorAttribute(indicator, indicator.attribute)])
        
        tooltipValueColor = indicator.aggregatedIndicator
          ? indicatorValueColorscale(getMostCommonClass(indicator, feature))
          : indicatorValueColorscale(getClassByIndicatorValue(indicator, feature.properties[getIndicatorAttribute(indicator, indicator.attribute)]))
        
        tooltipIndicator = indicator.title
      }

      // @ts-ignore
      tooltipValues.set({
        indicator: tooltipIndicator,
        value: tooltipValue,
        color: tooltipValueColor
      })

      const mapElement = document.getElementsByClassName("indicator-map-" + indicator.attribute)[0]
      const rectmap = mapElement.getBoundingClientRect();
      const featureCenter = projection(center(feature).geometry.coordinates)
      tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]

      // if beeswarm interaction 
    } else {
      // Check if we're in difference mode
      const ahnSelection = get(AHNSelecties)[indicator.title]
      const isDifferenceMode = ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference
      
      if (isDifferenceMode) {
        // For difference mode, calculate and display the difference value
        const baseAttribute = indicatorAttribute
        const compareAttribute = indicator.attribute + ahnSelection.compareYear
        
        const baseValue = +feature.properties[baseAttribute] || 0
        const compareValue = +feature.properties[compareAttribute] || 0
        const diffValue = compareValue - baseValue
        
        // Format the difference value with a + sign for positive values
        const formattedDiffValue = diffValue > 0 
          ? "+" + (Math.round(diffValue * 100) / 100).toFixed(1)
          : (Math.round(diffValue * 100) / 100).toFixed(1)
        
        // Set tooltip with difference value and years
        tooltipValues.set({
          indicator: `${indicator.title} (${ahnSelection.compareYear} vs ${ahnSelection.baseYear})`,
          value: formattedDiffValue,
          color: indicatorValueColorscale(diffValue)
        })
      } else {
        // Regular tooltip for non-difference mode
        tooltipValues.set({
          indicator: indicator.title,
          value: Math.round(feature.properties[indicatorAttribute] * 100) / 100,
          color: indicatorValueColorscale(feature.properties[indicatorAttribute])
        })
      }

      let elem = document.getElementsByClassName('beeswarm_' + indicator.attribute)[0]
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
    window.history.pushState(null, '', '?' + get(URLParams).toString());

    municipalitySelection.set(newSelection)
  } else {
    get(URLParams).set('buurt', newSelection);
    window.history.pushState(null, '', '?' + get(URLParams).toString());

    neighbourhoodSelection.set(newSelection)
  }
}