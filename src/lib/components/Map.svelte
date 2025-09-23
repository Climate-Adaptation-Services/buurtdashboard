<script>
  import { currentJSONData, neighbourhoodSelection, neighbourhoodCodeAbbreviation, AHNSelecties, getIndicatorStore } from "$lib/stores"
  import { geoMercator, geoPath, select } from "d3"
  import { prepareJSONData } from "$lib/noncomponents/prepareJSONData.js"
  import { t } from "$lib/i18n/translate.js"
  import { getClassName } from "$lib/noncomponents/getClassName"
  import { click, mouseOver, mouseOut } from "$lib/noncomponents/neighbourhoodMouseEvents"
  import { getMostCommonClass } from "$lib/noncomponents/getMostCommonClass"
  import { getClassByIndicatorValue } from "$lib/noncomponents/getClassByIndicatorValue"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"
  
  // MIGRATED: Import centralized value retrieval system
  import {
    getNumericalValue,
    getCategoricalValue,
    getDifferenceValue,
    getAHNSelection,
    isValidValue,
    getRawValue
  } from "$lib/noncomponents/valueRetrieval.js"

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

  // Use dedicated indicator store for difference mode detection (naturally isolated)
  $: indicatorStore = indicator ? getIndicatorStore(indicator.title) : null
  $: isDifferenceMode = $indicatorStore && typeof $indicatorStore === "object" && $indicatorStore.isDifference
  
  // Pre-calculate difference values for map features to match BeeswarmPlot approach
  // Watch for changes to indicatorStore to recalculate when BEB selection changes
  $: differenceValues = isDifferenceMode && indicator && $indicatorStore
    ? $currentJSONData.features.map((d) => {
        const diffValue = getDifferenceValue(d, indicator)
        // Return the feature id and its difference value for lookup
        return {
          id: d.properties[$neighbourhoodCodeAbbreviation],
          diffValue: diffValue
        }
      })
    : null

  // Declare both display attribute and original attribute variables
  let indicatorAttribute = null
  let originalAttribute = null
  
  // Set attributes for both display and coloring, matching BeeswarmPlot's approach
  $: {
    if (indicator && $indicatorStore) {
      // For display: use reactive attribute (may include _M2 suffix based on unit selection)
      indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)
      
      // For colors: always use original percentage attribute (consistent with BeeswarmPlot)
      if ($indicatorStore && $indicatorStore.baseYear) {
        originalAttribute = indicator.attribute + '_' + $indicatorStore.baseYear
      } else {
        originalAttribute = indicator.attribute
      }
    } else {
      indicatorAttribute = null
      originalAttribute = null
    }
  }
  
  // ALIGNED: Match BeeswarmPlot's color logic precisely for consistency
  function getMapFillColor(feature) {
    // Check if this is the main map (no indicator) - use whitesmoke
    if (!indicator) {
      return $neighbourhoodSelection === feature.properties[$neighbourhoodCodeAbbreviation]
        ? "#E1575A"
        : "whitesmoke"
    }
    
    if (indicator.numerical) {
      // Get feature ID for difference value lookup
      const featureId = feature.properties[$neighbourhoodCodeAbbreviation]
      
      if (isDifferenceMode && differenceValues) {
        // Find pre-calculated difference value from our lookup array
        const diffRecord = differenceValues.find(d => d.id === featureId)
        const diffValue = diffRecord ? diffRecord.diffValue : null
        
        // Color based on difference value, matching BeeswarmPlot behavior
        return diffValue !== null && diffValue !== "" && !isNaN(diffValue)
          ? indicatorValueColorscale(diffValue)
          : "#000000"
      } else {
        // For non-difference mode, use the value retrieval system for BEB-aware coloring
        // This matches BeeswarmPlot which now uses: getRawValue(node, indicator)
        const value = getRawValue(feature, indicator)
        
        return value !== null && value !== "" && !isNaN(value)
          ? indicatorValueColorscale(value)
          : "#000000"
      }
    } else {
      // MIGRATED: Use centralized categorical value retrieval
      const categoricalValue = getCategoricalValue(feature, indicator)
      return categoricalValue !== null
        ? indicatorValueColorscale(categoricalValue)
        : "#000000"
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
        fill={isDifferenceMode, indicatorValueColorscale, $AHNSelecties, getMapFillColor(feature)}
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
