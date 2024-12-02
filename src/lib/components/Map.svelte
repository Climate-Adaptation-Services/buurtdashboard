<script>
  import { currentJSONData, neighbourhoodSelection, neighbourhoodCodeAbbreviation } from "$lib/stores";
  import { geoMercator, geoPath, select } from 'd3';
  import { prepareJSONData } from "$lib/noncomponents/prepareJSONData.js";
  import { t } from '$lib/i18n/translate.js';
  import { getClassName } from '$lib/noncomponents/getClassName';
  import { click, mouseOver, mouseOut } from '$lib/noncomponents/neighbourhoodMouseEvents';
  import { mostCommonClass } from "$lib/noncomponents/mostCommonClass";

  export let JSONdata
  export let mapWidth
  export let mapHeight
  export let mapType
  export let indicatorValueColorscale
  export let indicator
  export let getClassByIndicatorValue

  if(mapType === 'main map'){prepareJSONData(JSONdata)}

  $: projection = geoMercator().fitExtent([[10,10],[mapWidth-10,mapHeight-20]], $currentJSONData)
  $: path = geoPath(projection);

  function multilineMapInfo(){select('.tooltip-multi' + indicator.attribute).style('visibility', 'visible')}

  function multilineMapInfoOut(){select('.tooltip-multi' + indicator.attribute).style('visibility', 'hidden')}

</script>

<svg class={(mapType === 'main map') ? 'main-map' : 'indicator-map-' + indicator.attribute} style='filter:drop-shadow(0 0 15px rgb(160, 160, 160))'
>
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#each $currentJSONData.features as feature}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <path
      d={path(feature)}
      class={getClassName(feature, 'path', indicator, mapType) + ' ' + 'svgelements_' + feature.properties[$neighbourhoodCodeAbbreviation]}
      fill={
        (mapType === 'main map') 
        ? (feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection)
          ? '#E1575A'
          : 'whitesmoke' 
        : (indicator.numerical) 
          // check if value not null 
          ? (feature.properties[indicator.attribute] !== null)
            ? indicatorValueColorscale(feature.properties[indicator.attribute])
            : '#000000'
          : (indicator.aggregatedIndicator)
            ? indicatorValueColorscale(mostCommonClass(indicator, feature))
            : indicatorValueColorscale(getClassByIndicatorValue(indicator, feature.properties[indicator.attribute]))
      }
      stroke={(mapType === 'main map') 
        ? "grey" 
        : (feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? '#E1575A' : 'white'
      }
      style='filter:{(feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? 'drop-shadow(0 0 15px black)' : 'none'}'
      stroke-width={(mapType === 'main map') ? "1" : (feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? '3' : '0.5'}
      cursor='pointer'
      on:mouseover={(e) => mouseOver(e, feature, indicator, mapType, indicatorValueColorscale, projection)}
      on:mouseout={() => mouseOut(feature, indicator, mapType)}
      on:click={() => click(feature, indicator, mapType)}
      />
  {/each}
  {#if indicator && indicator.aggregatedIndicator === true}
    <image href='info.png' opacity='0.7' width='20' y='5' x={mapWidth-25} on:mouseover={() => multilineMapInfo()} on:mouseout={() => multilineMapInfoOut()}/>
  {/if}
</svg>

{#if indicator && indicator.aggregatedIndicator === true}
  <div class={'tooltip-multi tooltip-multi' + indicator.attribute}>
    <p>{t("multi-indicator-map-explanation")}</p>
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