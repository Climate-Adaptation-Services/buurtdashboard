import { getClassName } from '$lib/noncomponents/getClassName';
import { currentCodeAbbreviation, neighbourhoodSelection, mousePosition, circleRadius, municipalitySelection, currentNameAbbreviation, URLParams, currentOverviewLevel, neighbourhoodCodeAbbreviation, tooltipValues, tooltipRegion } from '$lib/stores';
import { get } from 'svelte/store';
import { select, selectAll } from 'd3';
import { getClassByIndicatorValue } from './getClassByIndicatorValue';
import { mostCommonClass } from './mostCommonClass';
import center from '@turf/center'
import { t } from '$lib/i18n/translate.js';
import { addURLParameter } from './updateURLParams';

export function mouseOver(e, feature, indicator, mapType, indicatorValueColorscale, projection, beeswarmMargin){
  const shapeClassName = getClassName(feature, 'path', indicator, mapType)
  const circleClassName = getClassName(feature, 'node', indicator, mapType)
  let tooltipCenter

  if(mapType === 'main map'){
    if(feature.properties[get(currentCodeAbbreviation)] !== get(neighbourhoodSelection)){
      select('.' + shapeClassName).attr('fill', '#36575A')
      mousePosition.set(window.innerHeight - e.screenY)
    }
    const mapElement = document.getElementsByClassName("main-map")[0]
    const rectmap = mapElement.getBoundingClientRect();
    const featureCenter = projection(center(feature).geometry.coordinates)
    tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]
    
  }else{
    select('.' + shapeClassName)
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 0 15px black)')
      .raise()
    if(indicator.numerical === true){
      if(feature.properties[get(currentCodeAbbreviation)] !== get(neighbourhoodSelection)){
        select('.' + circleClassName)
          .attr('stroke', 'white')
          .attr('r', get(circleRadius) + 3)
          .style('filter', 'drop-shadow(0 0 5px black)')
          .raise()
      }
    }

    if(mapType === 'indicator map'){
      const tooltipValueColor = (indicator.numerical) 
        ? (feature.properties[indicator.attribute])
          ? indicatorValueColorscale(feature.properties[indicator.attribute]) 
          : '#000000'
        : (indicator.aggregatedIndicator)
          ? indicatorValueColorscale(mostCommonClass(indicator, feature))
          : indicatorValueColorscale(getClassByIndicatorValue(indicator, feature.properties[indicator.attribute]))
      
      const tooltipValue = (indicator.numerical)
        // check of dit iets is
        ? (/\d/.test(feature.properties[indicator.attribute]))
          ? Math.round(+feature.properties[indicator.attribute]*100)/100
          : 'Geen data'
        : (indicator.aggregatedIndicator)
          ? mostCommonClass(indicator, feature)
          : getClassByIndicatorValue(indicator, feature.properties[indicator.attribute])
      
      // @ts-ignore
      tooltipValues.set({
        indicator: indicator.title, 
        value: tooltipValue, 
        color: tooltipValueColor
      })

      const mapElement = document.getElementsByClassName("indicator-map-" + indicator.attribute)[0]
      const rectmap = mapElement.getBoundingClientRect();
      const featureCenter = projection(center(feature).geometry.coordinates)
      tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]
      
    // if beeswarm interaction 
    }else{
      // @ts-ignore
      tooltipValues.set({
        indicator: indicator.title, 
        value: Math.round(feature.properties[indicator.attribute]*100)/100, 
        color: indicatorValueColorscale(feature.properties[indicator.attribute])
      })

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

export function mouseOut(feature, indicator, mapType){
  const shapeClassName = getClassName(feature, 'path', indicator, mapType)
  const circleClassName = getClassName(feature, 'node', indicator, mapType)

  if(feature.properties[get(currentCodeAbbreviation)] !== get(neighbourhoodSelection)){

    if(mapType === 'main map'){
      select('.' + shapeClassName)
        .attr('fill', 'whitesmoke')
      mousePosition.set(null)
    }else{
      select('.' + shapeClassName)
        .attr('stroke-width', 0.5)
        .style('filter', 'none')
        .lower()
      if(indicator.numerical){
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

export function click(feature, indicator, mapType){

  mouseOut(feature, indicator, mapType)
  selectAll('.svgelements_' + feature.properties[get(neighbourhoodCodeAbbreviation)])
    .raise()

  const newSelection = feature.properties[get(currentCodeAbbreviation)].replaceAll(' ','').replaceAll('(','').replaceAll(')','')
  if(get(currentOverviewLevel) === 'Nederland'){
    get(URLParams).set('gemeente', newSelection);
    addURLParameter()

    municipalitySelection.set(newSelection)
  }else{
    get(URLParams).set('buurt', newSelection);
    addURLParameter()

    neighbourhoodSelection.set(newSelection)
  }
}