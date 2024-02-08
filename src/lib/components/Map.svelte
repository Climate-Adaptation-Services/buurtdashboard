<script>
  import center from '@turf/center'
  import { currentData, gemeenteSelection, currentView, buurtSelection, hoveredRegion, hoveredValue, buurtCode, mousePosition, buurtNaam, buurtenInGemeente } from "$lib/stores";
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

  $: classNameVariable = ($currentView === 'Nederland') ? 'GM_CODE' : $buurtCode
  $: regionVariable = ($currentView === 'Nederland') ? 'GM_NAAM' : $buurtNaam
  
  $: projection = geoMercator()
    .fitExtent([[10,10],[w-10,h-20]], $currentData)
  
  $: path = geoPath(projection);


  function mouseOver(e, feature){
    if(mainMapFlag){
      if(feature.properties[classNameVariable] !== $buurtSelection){

        select('.' + getClassName(feature))
          .attr('fill', '#36575A')
        mousePosition.set(window.innerHeight - e.screenY)
      }
    }else{
      select('.' + getClassName(feature))
        .attr('stroke-width', 3)
        .style('filter', 'drop-shadow(0 0 15px black)')
        .raise()
      if(indicator.numerical === true){
        const RADIUS = ($buurtenInGemeente.features.length > 150) ? 3 : 5

        select('.' + getClassName(feature).replace('path', 'node'))
        .attr('stroke', 'white')
        .attr('r', RADIUS + 3)
        .style('filter', 'drop-shadow(0 0 5px black)')
        .raise()
      }

      const hoverColor = (indicator.numerical) 
        ? color(feature.properties[indicator.attribute]) 
        : (indicator.multiline)
          ? color(mostCommonClass(feature))
          : color(getClass(feature.properties[indicator.attribute]))
      
      const hoverValue = (indicator.numerical)
        ? Math.round(feature.properties[indicator.attribute]*100)/100
        : (indicator.multiline)
          ? mostCommonClass(feature)
          : getClass(feature.properties[indicator.attribute])
      
      hoveredValue.set({
        indicator: indicator.titel, 
        value: hoverValue, 
        color: hoverColor
      })
    }

    let elem = (mainMapFlag) ? document.getElementsByClassName("main-map")[0] : document.getElementsByClassName("indicator-map-" + indicator.attribute)[0]
    let rectmap = elem.getBoundingClientRect();
    let featureCenter = projection(center(feature).geometry.coordinates)
    let tooltipCenter = [featureCenter[0] + rectmap.left, featureCenter[1] + rectmap.top]
    
    // @ts-ignore
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
        mousePosition.set(null)
      }else{
        select('.' + getClassName(feature))
          .attr('stroke-width', 0.5)
          .style('filter', 'none')
          .lower()
        if(indicator.numerical){
          const RADIUS = ($buurtenInGemeente.features.length > 150) ? 3 : 5
          select('.' + getClassName(feature).replace('path', 'node'))
            .attr('stroke', 'none')
            .attr('r', RADIUS)
            .style('filter', 'none')
            .lower()
        }   
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

  function mostCommonClass(feature){
    let mostCommon = ''
    let highestValue = 0
    Object.keys(indicator.klassen).forEach(key => {
      if(feature.properties[indicator.klassen[key]] > highestValue){
        highestValue = feature.properties[indicator.klassen[key]]
        mostCommon = key
      }
    });

    return mostCommon
  }

  function multiInfo(){
    select('.tooltip-multi' + indicator.attribute).style('visibility', 'visible')
  }

  function multiInfoOut(){
    select('.tooltip-multi' + indicator.attribute).style('visibility', 'hidden')
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
          : (indicator.multiline)
            ? color(mostCommonClass(feature))
            : color(getClass(feature.properties[indicator.attribute]))
      }
      stroke={(mainMapFlag) 
        ? "grey" 
        : (feature.properties[$buurtCode] === $buurtSelection) ? '#E1575A' : 'white'
      }
      style='filter:{(feature.properties[$buurtCode] === $buurtSelection) ? 'drop-shadow(0 0 15px black)' : 'none'}'
      stroke-width={(mainMapFlag) ? "1" : (feature.properties[$buurtCode] === $buurtSelection) ? '3' : '0.5'}
      cursor='pointer'
      on:mouseover={(e) => mouseOver(e, feature)}
      on:mouseout={() => mouseOut(feature)}
      on:click={() => click(feature)}
      />
  {/each}
  {#if indicator && indicator.multiline === true}
    <image href='info.png' opacity='0.7' width='20' y='5' x={w-25} on:mouseover={() => multiInfo()} on:mouseout={() => multiInfoOut()}/>
  {/if}
</svg>

{#if indicator && indicator.multiline === true}
  <div class={'tooltip-multi tooltip-multi' + indicator.attribute}>
    <p>De kleuren in deze kaart geven aan welke klasse in die buurt het meest voorkomt</p>
  </div>
{/if}


<style>
  svg{
    width:100%;
    height:100%;
  }

  .tooltip-multi{
    visibility:hidden;
    position: absolute;
    width:200px;
    background-color: white;
    right:40px;
    top:0;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 20px;
    padding:0px 10px 0px 10px;
  }
</style>