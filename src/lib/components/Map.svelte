<script>
  import { currentJSONData, neighbourhoodSelection, neighbourhoodCodeAbbreviation, AHNSelecties } from "$lib/stores"
  import { geoMercator, geoPath, select } from "d3"
  import { prepareJSONData } from "$lib/noncomponents/prepareJSONData.js"
  import { t } from "$lib/i18n/translate.js"
  import { getClassName } from "$lib/noncomponents/getClassName"
  import { click, mouseOver, mouseOut } from "$lib/noncomponents/neighbourhoodMouseEvents"
  import { getMostCommonClass } from "$lib/noncomponents/getMostCommonClass"
  import { getClassByIndicatorValue } from "$lib/noncomponents/getClassByIndicatorValue"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let JSONdata
  export let CSVdata
  export let mapWidth
  export let mapHeight
  export let mapType
  export let indicatorValueColorscale
  export let indicator

  // Define projection and path variables
  let projection;
  let path;

  if (mapType === "main map") {
    console.time('Map initialization and data preparation');
    prepareJSONData(JSONdata, CSVdata)
    console.timeEnd('Map initialization and data preparation');
  }

  $: topYPosition = mapType === "main map" ? 20 : 15

  $: {
    console.time('D3 projection calculation');
    projection = geoMercator().fitExtent(
      [
        [10, topYPosition],
        [mapWidth - 10, mapHeight - 45],
      ],
      $currentJSONData,
    );
    console.timeEnd('D3 projection calculation');
  }
  
  $: {
    console.time('D3 path generator creation');
    path = geoPath(projection);
    console.timeEnd('D3 path generator creation');
  }

  function aggregatedMapInfo() {
    select(".tooltip-multi" + indicator.attribute).style("visibility", "visible")
  }

  function aggregatedMapInfoOut() {
    select(".tooltip-multi" + indicator.attribute).style("visibility", "hidden")
  }

  function getNumericalAttribute() {
    if ($AHNSelecties[indicator.title] === "Difference") {
      return getIndicatorAttribute(indicator, indicator.attribute).slice(0, -4) + "Difference"
    } else {
      return getIndicatorAttribute(indicator, indicator.attribute)
    }
  }
</script>

<svg class={mapType === "main map" ? "main-map" : "indicator-map-" + indicator.attribute} style="filter:drop-shadow(0 0 15px rgb(160, 160, 160))">
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#if $currentJSONData.features}
    {#if mapType === "main map"}
      {@const featureCount = $currentJSONData.features.length}
      <text x="10" y="15" font-size="12" fill="white">Rendering {featureCount} features</text>
    {/if}
    
    {#each $currentJSONData.features as feature, i}
      <!-- Performance monitoring for the first feature to measure SVG path generation time -->
      {#if i === 0}
        {@const startTime = performance.now()}
        {@const pathData = path(feature)}
        {@const endTime = performance.now()}
        {#if mapType === "main map"}
          <text x="10" y="30" font-size="12" fill="white">Path generation: {(endTime - startTime).toFixed(2)}ms per feature</text>
        {/if}
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <path
      d={path(feature)}
      class={getClassName(feature, "path", indicator, mapType) + " " + "svgelements_" + feature.properties[$neighbourhoodCodeAbbreviation]}
      fill={mapType === "main map"
        ? feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
          ? "#E1575A"
          : "whitesmoke"
        : indicator.numerical
          ? // check if value not null
            feature.properties[getIndicatorAttribute(indicator, indicator.attribute)] !== null &&
            feature.properties[getIndicatorAttribute(indicator, indicator.attribute)] !== ""
            ? indicatorValueColorscale(feature.properties[getNumericalAttribute()])
            : "#000000"
          : indicator.aggregatedIndicator
            ? indicatorValueColorscale(getMostCommonClass(indicator, feature))
            : indicatorValueColorscale(
                getClassByIndicatorValue(indicator, feature.properties[getIndicatorAttribute(indicator, indicator.attribute)]),
              )}
      stroke={mapType === "main map" ? "grey" : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? "#E1575A" : "white"}
      style="filter:{feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? 'drop-shadow(0 0 15px black)' : 'none'}"
      stroke-width={mapType === "main map" ? "1" : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? "3" : "0.5"}
      cursor="pointer"
      on:mouseover={(e) => mouseOver(e, feature, indicator, mapType, indicatorValueColorscale, projection)}
      on:mouseout={() => mouseOut(feature, indicator, mapType)}
      on:click={() => click(feature, indicator, mapType)}
    />
  {/each}
  {/if}
  {#if indicator && indicator.aggregatedIndicator === true}
    <image
      href="info.png"
      opacity="0.7"
      width="20"
      y="5"
      x={mapWidth - 25}
      on:mouseover={() => aggregatedMapInfo()}
      on:mouseout={() => aggregatedMapInfoOut()}
    />
  {/if}
</svg>

{#if indicator && indicator.aggregatedIndicator === true}
  <div class={"tooltip-multi tooltip-multi" + indicator.attribute}>
    <p>{t("multi-indicator-map-explanation")}</p>
  </div>
{/if}

<style>
  svg {
    width: 100%;
    height: 100%;
  }

  .tooltip-multi {
    visibility: hidden;
    position: absolute;
    width: 200px;
    background-color: white;
    right: 40px;
    top: 0;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 20px;
    padding: 0px 10px 0px 10px;
  }

  path {
    transition: all 0.5s;
  }
</style>
