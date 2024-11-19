import { getClassName } from '$lib/noncomponents/getClassName';
import { huidigeCodeAfkorting, buurtSelection, mousePosition, circleRadius, gemeenteSelection, huidigeNaamAfkorting, URLParams, huidigOverzichtsniveau, buurtCodeAfkorting, tooltipValues, tooltipRegion } from '$lib/stores';
import { get } from 'svelte/store';
import { select, selectAll } from 'd3';
import { getClassByIndicatorValue } from './getClassByIndicatorValue';
import { mostCommonClass } from './mostCommonClass';
import center from '@turf/center'

export function mouseOver(e, feature, indicator, mapType, indicatorValueColor, projection){
  const shapeClassName = getClassName(feature, 'path', indicator, mapType)
  const circleClassName = getClassName(feature, 'node', indicator, mapType)

  if(mapType === 'main map'){
    if(feature.properties[get(huidigeCodeAfkorting)] !== get(buurtSelection)){
      select('.' + shapeClassName).attr('fill', '#36575A')
      mousePosition.set(window.innerHeight - e.screenY)
    }
  }else{
    select('.' + shapeClassName)
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 0 15px black)')
      .raise()
    if(indicator.numerical === true){
      select('.' + circleClassName)
        .attr('stroke', 'white')
        .attr('r', get(circleRadius) + 3)
        .style('filter', 'drop-shadow(0 0 5px black)')
        .raise()
    }

    const hoverColor = (indicator.numerical) 
      ? (feature.properties[indicator.attribute])
        ? indicatorValueColor(feature.properties[indicator.attribute]) 
        : '#000000'
      : (indicator.multiline)
        ? indicatorValueColor(mostCommonClass(feature))
        : indicatorValueColor(getClassByIndicatorValue(indicator, feature.properties[indicator.attribute]))
    
    const hoverValue = (indicator.numerical)
      // check of dit iets is
      ? (/\d/.test(feature.properties[indicator.attribute]))
        ? Math.round(+feature.properties[indicator.attribute]*100)/100
        : 'Geen data'
      : (indicator.multiline)
        ? mostCommonClass(feature)
        : getClassByIndicatorValue(+feature.properties[indicator.attribute])
    
    tooltipValues.set({
      indicator: indicator.titel, 
      value: hoverValue, 
      color: hoverColor
    })
  }

  const mapElement = (mapType === 'main map') ? document.getElementsByClassName("main-map")[0] : document.getElementsByClassName("indicator-map-" + indicator.attribute)[0]
  const rectmap = mapElement.getBoundingClientRect();
  const featureCenter = projection(center(feature).geometry.coordinates)
  const tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]
  
  // @ts-ignore
  tooltipRegion.set({
    'region': (get(gemeenteSelection) === null) ? t('Gemeente') : t('Buurt'),
    'center': tooltipCenter,
    'name': feature.properties[get(huidigeNaamAfkorting)]
  })
  
}

export function mouseOut(feature, indicator, mapType){
  const shapeClassName = getClassName(feature, 'path', indicator, mapType)
  const circleClassName = getClassName(feature, 'node', indicator, mapType)

  if(feature.properties[get(huidigeCodeAfkorting)] !== get(buurtSelection)){

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



export function click(feature){

  mouseOut(feature)
  selectAll('.svgelements_' + feature.properties[get(buurtCodeAfkorting)])
    .raise()

  const newSelection = feature.properties[get(huidigeCodeAfkorting)].replaceAll(' ','').replaceAll('(','').replaceAll(')','')
  if(get(huidigOverzichtsniveau) === 'Nederland'){
    get(URLParams).set('gemeente', newSelection);
    window.history.pushState(null, '', '?' + get(URLParams).toString());

    gemeenteSelection.set(newSelection)
  }else{
    get(URLParams).set('buurt', newSelection);
    window.history.pushState(null, '', '?' + get(URLParams).toString());

    buurtSelection.set(newSelection)
  }
}