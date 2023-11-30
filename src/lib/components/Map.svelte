<script>
  import center from '@turf/center'
  import { currentData, gemeenteSelection, currentView, buurtSelection, hoveredRegion, hoveredValue, buurtCode } from "$lib/stores";
  import { geoMercator, geoPath, select, selectAll } from 'd3';
  import { loadMapData } from "$lib/noncomponents/loadMapData.js";

  export let datajson
  export let w
  export let h
  export let mainMapFlag
  export let color
  export let indicator
  export let getClass

  if(mainMapFlag){loadMapData(datajson)}

  $: classNameVariable = ($currentView === 'Nederland') ? 'GM_CODE' : 'bu_code'
  $: regionVariable = ($currentView === 'Nederland') ? 'GM_NAAM' : 'bu_naam'
  
  $: projection = geoMercator()
    .fitExtent([[10,10],[w-10,h-20]], $currentData)
  
  $: path = geoPath(projection);

  function mouseOver(feature){
    if(feature.properties[classNameVariable] !== $buurtSelection){

      if(mainMapFlag){
        select('.' + getClassName(feature))
        .attr('fill', '#36575A')
      }else{
        select('.' + getClassName(feature))
          .attr('stroke-width', 3)
          .style('filter', 'drop-shadow(0 0 15px black)')
          .raise()
        select('.' + getClassName(feature).replace('path', 'node'))
          .attr('stroke', 'white')
          .attr('r', 8)
          .style('filter', 'drop-shadow(0 0 5px black)')
          .raise()

        hoveredValue.set([indicator.titel, Math.round(feature.properties[indicator.attribute]*100)/100, color(feature.properties[indicator.attribute])])
      }
    }

    let elem = (mainMapFlag) ? document.getElementsByClassName("main-map")[0] : document.getElementsByClassName("indicator-map-" + indicator.attribute)[0]
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
    if(feature.properties[classNameVariable] !== $buurtSelection){

      if(mainMapFlag){
        select('.' + getClassName(feature))
        .attr('fill', 'whitesmoke')
      }else{
        select('.' + getClassName(feature))
          .attr('stroke-width', 0.5)
          .style('filter', 'none')
          .lower()
        select('.' + getClassName(feature).replace('path', 'node'))
          .attr('stroke', 'none')
          .attr('r', 5)
          .style('filter', 'none')
          .lower()
          
        hoveredValue.set(null)
      }
    }
    
    hoveredRegion.set(null)
  }

  function click(feature){

    mouseOut(feature)
    selectAll('.svgelements_' + feature.properties[$buurtCode])
      .raise()

    const newSelection = feature.properties[classNameVariable].replaceAll(' ','').replaceAll('(','').replaceAll(')','')
    if($currentView === 'Nederland'){
      gemeenteSelection.set(newSelection)
    }else{
      buurtSelection.set(newSelection)
    }
  }

  function getClassName(feature){
    let className = feature.properties[classNameVariable] + "_path"
    if(!mainMapFlag){
      className += '_' + indicator.attribute
    }
    return className.replaceAll(' ','').replaceAll('(','').replaceAll(')','')
  }

</script>

<svg class={(mainMapFlag) ? 'main-map' : 'indicator-map-' + indicator.attribute} style='filter:drop-shadow(0 0 15px rgb(160, 160, 160))'
>
  <!-- {#if mainMapFlag}
    <rect width={w} height={h} fill='#fefffa' on:click={() => {gemeenteSelection.set(null);buurtSelection.set(null)}}></rect>
  {/if} -->
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#each $currentData.features as feature}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <path
      d={path(feature)}
      class={getClassName(feature) + ' ' + 'svgelements_' + feature.properties[$buurtCode]}
      fill={
        (mainMapFlag) 
        ? (feature.properties[$buurtCode] === $buurtSelection)
          ? '#E1575A'
          : 'whitesmoke' 
        : (indicator.numerical) 
          ? color(feature.properties[indicator.attribute]) 
          : color(getClass(feature.properties[indicator.attribute]))
      }
      stroke={(mainMapFlag) 
        ? "grey" 
        : (feature.properties[$buurtCode] === $buurtSelection) ? '#E1575A' : 'white'
      }
      style='filter:{(feature.properties[$buurtCode] === $buurtSelection) ? 'drop-shadow(0 0 15px black)' : 'none'}'
      stroke-width={(mainMapFlag) ? "1" : (feature.properties[$buurtCode] === $buurtSelection) ? '3' : '0.5'}
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