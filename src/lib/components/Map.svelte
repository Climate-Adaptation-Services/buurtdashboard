<script>
  import * as topojsonsimplify from "topojson-simplify";
  import * as topojson from "topojson-client";
  import center from '@turf/center'
  import { currentData, gemeenteSelection, currentView, gemeenteData, buurtData, buurtSelection, hoveredRegion } from "$lib/stores";
  import { geoMercator, geoPath, select } from 'd3';

  export let datajson
  export let w
  export let h

  let gemeenteTopojson = topojsonsimplify.presimplify(datajson[0])
  gemeenteTopojson = topojson.feature(gemeenteTopojson, gemeenteTopojson.objects.GemeenteDatasetTest20231011)
  gemeenteData.set(gemeenteTopojson)

  let buurtTopojson = topojsonsimplify.presimplify(datajson[1])
  buurtTopojson = topojson.feature(buurtTopojson, buurtTopojson.objects.BuurtenTestDataset_20231016)
  buurtData.set(buurtTopojson)
  
  $: console.log($gemeenteData, $buurtData)
  $: console.log($currentData)

  $: classNameVariable = ($currentView === 'Nederland') ? 'GM_CODE' : 'BU_CODE'
  $: regionVariable = ($currentView === 'Nederland') ? 'GM_Naam' : 'BU_NAAM'
  
  $: projection = geoMercator()
    .fitExtent([[20,10],[w-10,h-30]], $currentData) 

  $: path = geoPath(projection);

  function mouseOver(feature){
    select('.' + toValidClassName(feature.properties[classNameVariable]))
      .attr('fill', 'steelblue')

    let elem = document.getElementsByClassName("map")[0];
    let rectmap = elem.getBoundingClientRect();
    let featureCenter = projection(center(feature).geometry.coordinates)
    let tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]
    
    hoveredRegion.set({
      'region': ($gemeenteSelection === null) ? 'Gemeente' : 'Buurt',
      'center': tooltipCenter,
      'name': feature.properties[regionVariable]
    })
  }

  function mouseOut(feature){
    select('.' + toValidClassName(feature.properties[classNameVariable]))
      .attr('fill', 'whitesmoke')
    
    hoveredRegion.set(null)
  }

  function click(feature){
    mouseOut(feature)
    const newSelection = toValidClassName(feature.properties[classNameVariable])
    if($currentView === 'Nederland'){
      gemeenteSelection.set(newSelection)
    }else if($currentView === 'Gemeente'){
      buurtSelection.set(newSelection)
    }
  }

  function toValidClassName(name){
    return name.replaceAll(' ','').replaceAll('(','').replaceAll(')','')
  }

</script>

<svg class='svgmap'>
  <rect width={w} height={h} fill='white' on:click={() => {gemeenteSelection.set(null);buurtSelection.set(null)}}></rect>
  {#each $currentData.features as feature}
    <path
      d={path(feature)}
      class={toValidClassName(feature.properties[classNameVariable])}
      fill={'whitesmoke'}
      stroke="grey"
      stroke-width={1}
      cursor='pointer'
      on:mouseover={() => mouseOver(feature)}
      on:mouseout={() => mouseOut(feature)}
      on:click={() => click(feature)}
      />
  {/each}
</svg>

<style>
  svg{
    width:100%;
    height:100%;
  }
</style>