import center from '@turf/center'
import { select } from 'd3'

export function mouseOver(feature, currentViewValue, gemeenteSelectionValue, color){
  if(mainMapFlag){
    select('.' + getClassName(feature))
    .attr('fill', 'steelblue')
  }else{
    select('.' + getClassName(feature))
    .attr('stroke-width', 4)

    hoveredValue.set([variable, feature.properties[variable], color(feature.properties[variable])])
  }

  let elem = (mainMapFlag) ? document.getElementsByClassName("main-map")[0] : document.getElementsByClassName("indicator-map-" + variable)[0]
  let rectmap = elem.getBoundingClientRect();
  let featureCenter = projection(center(feature).geometry.coordinates)
  let tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]
  

  hoveredRegion.set({
    'region': ($gemeenteSelection === null) ? 'Gemeente' : 'Buurt',
    'center': tooltipCenter,
    'name': feature.properties[regionVariable]
  })
}

export function mouseOut(feature){
  if(mainMapFlag){
    select('.' + getClassName(feature))
    .attr('fill', 'whitesmoke')
  }else{
    select('.' + getClassName(feature))
    .attr('stroke-width', 0.5)
    hoveredValue.set(null)
  }
  
  hoveredRegion.set(null)
}

export function click(feature){
  mouseOut(feature)
  const newSelection = feature.properties[classNameVariable].replaceAll(' ','').replaceAll('(','').replaceAll(')','')
  if($currentView === 'Nederland'){
    gemeenteSelection.set(newSelection)
  }else if($currentView === 'Gemeente'){
    buurtSelection.set(newSelection)
  }
}