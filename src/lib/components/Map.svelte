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

  // Removed unused exports for JSONdata and CSVdata
  export let mapWidth
  export let mapHeight
  export let mapType
  export let indicatorValueColorscale
  export let indicator

  // Define projection and path variables
  let projection
  let path

  // Data preparation is now handled in +page.js
  // No need to call prepareJSONData here

  $: topYPosition = mapType === "main map" ? 20 : 15

  $: {
    projection = geoMercator().fitExtent(
      [
        [10, topYPosition],
        [mapWidth - 10, mapHeight - 45],
      ],
      $currentJSONData,
    )
  }

  $: {
    path = geoPath(projection)
  }

  function aggregatedMapInfo() {
    select(".tooltip-multi" + indicator.attribute).style("visibility", "visible")
  }

  function aggregatedMapInfoOut() {
    select(".tooltip-multi" + indicator.attribute).style("visibility", "hidden")
  }

  // Check if we're in difference mode
  $: isDifferenceMode =
    indicator && $AHNSelecties[indicator.title] && typeof $AHNSelecties[indicator.title] === "object" && $AHNSelecties[indicator.title].isDifference

  // Calculate difference values for each feature when in difference mode
  $: differenceValues =
    isDifferenceMode && $currentJSONData && $currentJSONData.features
      ? $currentJSONData.features.map((feature) => {
          // Store the difference value in a temporary property
          const baseAttribute = getIndicatorAttribute(indicator, indicator.attribute)
          const compareAttribute = indicator.attribute + $AHNSelecties[indicator.title].compareYear

          const baseValue = +feature.properties[baseAttribute] || 0
          const compareValue = +feature.properties[compareAttribute] || 0

          // Store the calculated difference
          feature.properties.calculatedDifference = compareValue - baseValue
          return feature
        })
      : null

  // Function to get the appropriate attribute for coloring the map
  function getNumericalAttribute(feature) {
    if (isDifferenceMode) {
      return "calculatedDifference"
    } else {
      return getIndicatorAttribute(indicator, indicator.attribute)
    }
  }
</script>

<svg class={mapType === "main map" ? "main-map" : "indicator-map-" + indicator.attribute} style="filter:drop-shadow(0 0 15px rgb(160, 160, 160))">
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#if $currentJSONData.features}
    {#each $currentJSONData.features as feature, i}
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
              ? indicatorValueColorscale(feature.properties[getNumericalAttribute(feature)])
              : "#000000"
            : indicator.aggregatedIndicator
              ? indicatorValueColorscale(getMostCommonClass(indicator, feature))
              : indicatorValueColorscale(
                  getClassByIndicatorValue(indicator, feature.properties[getIndicatorAttribute(indicator, indicator.attribute)]),
                )}
        stroke={mapType === "main map"
          ? "grey"
          : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
            ? "#E1575A"
            : "white"}
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
