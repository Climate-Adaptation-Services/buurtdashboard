<script>
  import {
    districtTypeJSONData,
    districtTypeAbbreviation,
    allNeighbourhoodsJSONData,
    municipalitySelection,
    neighbourhoodsInMunicipalityJSONData,
    neighbourhoodSelection,
    selectedNeighbourhoodJSONData,
    AHNSelecties,
    configStore,
    getIndicatorStore,
    nederlandAggregates,
  } from "$lib/stores"
  import { scaleLinear, scaleBand, stack } from "d3"
  import { checkContrast } from "$lib/utils/checkContrast"
  import { getRegionName } from "$lib/utils/getRegionName"
  import { barPlotMouseOut, barPlotMouseOver } from "$lib/events/barPlotMouseEvents"
  import {
    calcPercentagesForEveryClassMultiIndicator,
    calcPercentagesForEveryClassSingleIndicator,
  } from "$lib/utils/calcPercentagesForEveryClass"
  import { getNumericalValue } from "$lib/utils/valueRetrieval.js"
  import { sanitizeClassName } from "$lib/utils/sanitizeClassName.js"

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let indicatorValueColorscale
  export let getClassByIndicatorValue
  export let aggregated

  const margin = { bottom: 100, top: 30, left: 30, right: 30 }

  const calcPercentagesForEveryClass = aggregated ? calcPercentagesForEveryClassMultiIndicator : calcPercentagesForEveryClassSingleIndicator

  // Get the indicator-specific store for reactivity
  // Use dutchTitle for store key to ensure consistency across languages
  const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)

  // Check if AHN5 is selected - Nederland statistics not available for AHN5
  // Check for AHNversie being a non-empty string (indicator has AHN versions configured)
  $: isAHN5Selected = $indicatorStore && $indicatorStore.baseYear === 'AHN5' && indicator.AHNversie && indicator.AHNversie.length > 0

  // Simplified function - always show percentages in bar plot
  function getDisplayValue(percentageValue) {
    return Math.round(percentageValue * 10) / 10
  }

  let nederlandValues = null
  $: {
    // Force reactivity by reading the indicator store
    const ahnSelection = $indicatorStore;

    // Try cached values first, fall back to client-side calculation if needed
    nederlandValues = null // Reset first

    if ($nederlandAggregates && $nederlandAggregates.aggregates) {
      let cached = $nederlandAggregates.aggregates[indicator.title];

      if (cached !== undefined) {
        // Check for BEB variants first
        if (cached && cached.hele_buurt !== undefined && cached.bebouwde_kom !== undefined) {
          // BEB indicator - get the correct variant
          const bebSelection = ahnSelection?.beb || 'hele_buurt';
          cached = cached[bebSelection];
        }

        if (cached && typeof cached === 'object' && !Array.isArray(cached)) {
          // Check if this is a year-based value, AHN-based value, or class-based aggregated value
          const selectedYear = ahnSelection?.baseYear;

          // If selectedYear is specified and exists in cache, use it (handles both years like "2020" and AHN versions like "AHN2")
          if (selectedYear && cached[selectedYear] !== undefined) {
            nederlandValues = cached[selectedYear];
          } else if (!selectedYear || !Object.keys(cached).some(key => /^\d{4}$/.test(key) || /^AHN\d+$/.test(key))) {
            // No years or AHN versions in keys, so it's class-based aggregated data (Landbedekking, etc)
            nederlandValues = cached;
          }
        }
      }
    }

    // FALLBACK: If no cached value and we have all neighborhoods data, calculate client-side
    // This handles AHN version switches and other cases where cache doesn't have the exact variant
    if (!nederlandValues && $allNeighbourhoodsJSONData && $indicatorStore) {
      const calculated = calcPercentagesForEveryClass(indicator, $allNeighbourhoodsJSONData, "Nederland");
      if (calculated && typeof calculated === 'object' && Object.keys(calculated).length > 1) {
        nederlandValues = calculated;
      }
    }
  }
  let barPlotData = []
  let regios = []

  $: {
    // Build barPlotData based on current selection state
    const data = []
    const regions = []

    // Helper to add a level if data exists
    const addLevel = (regio, jsonData) => {
      if (!jsonData) {
        console.warn(`BarPlot: No jsonData for ${regio}`)
        return
      }

      const calculated = calcPercentagesForEveryClass(indicator, jsonData, regio)
      if (calculated && typeof calculated === 'object' && Object.keys(calculated).length > 1) {
        data.push(calculated)
        regions.push(regio)
      } else {
        console.warn(`BarPlot: Failed to calculate data for ${indicator.title} at ${regio} level`, calculated)
      }
    }

    // Add Nederland if available (not available for municipality-specific dashboards like Dordrecht)
    // Check if AHN5 is selected - we'll still add "Nederland" to regions for the notice, but without data
    const currentIsAHN5 = $indicatorStore && $indicatorStore.baseYear === 'AHN5' && indicator.AHNversie && indicator.AHNversie.length > 0
    if (nederlandValues) {
      if (!currentIsAHN5) {
        // Normal case: add Nederland with data
        data.push(nederlandValues)
        regions.push("Nederland")
      }
      // Note: For AHN5, we don't add Nederland to data or regions here
      // The notice is shown in the template when isAHN5Selected is true
    }

    // Add municipality level if selected
    if ($municipalitySelection !== null && $indicatorStore && $allNeighbourhoodsJSONData) {
      addLevel("Gemeente", $neighbourhoodsInMunicipalityJSONData)
    }

    // Add neighbourhood level if selected
    if ($neighbourhoodSelection !== null && $indicatorStore && $allNeighbourhoodsJSONData && $selectedNeighbourhoodJSONData) {
      addLevel("Buurt", { type: "FeatureCollection", features: [$selectedNeighbourhoodJSONData] })

      // Add district type if available
      if ($selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]) {
        addLevel("Wijktype", $districtTypeJSONData)
      }
    }

    barPlotData = data
    regios = regions
  }
  // Create stacked data for D3 visualization
  $: stackedData = (() => {
    if (!indicator.classes || barPlotData.length === 0) return []

    const classKeys = Object.keys(indicator.classes)

    // Validate data structure - each item should have at least one class key
    const isValid = barPlotData.every(item =>
      item && typeof item === 'object' && classKeys.some(key => key in item)
    )

    if (!isValid) return []

    try {
      return stack().keys(classKeys)(barPlotData)
    } catch (error) {
      console.warn(`Failed to create stack for "${indicator.title}":`, error)
      return []
    }
  })()

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([margin.left, graphWidth - margin.right])

  $: yScale = scaleBand()
    .domain(regios)
    .range([0, (indicatorHeight - margin.top - margin.bottom) * (barPlotData.length / 2)])

  // Safe bandwidth calculation - provides fallback for NaN cases
  $: safeBandwidth = yScale && regios.length > 0 ? (yScale.bandwidth() || 0) : 0
</script>

<svg class={"barplot_" + sanitizeClassName(indicator.title)} style="height:74%">
  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    <!-- Show AHN5 notice for Nederland when AHN5 is selected (before other bars) -->
    {#if isAHN5Selected && graphWidth > 0}
      <text style="fill:#645F5E" x={graphWidth / 2} text-anchor="middle" font-size="15px" y={-5}
        >Nederland</text
      >
      <text style="fill:#888; font-style:italic" x={graphWidth / 2} text-anchor="middle" font-size="11px" y={12}
        >Niet voor heel Nederland beschikbaar</text
      >
    {/if}
    {#each stackedData as stacked, i}
      <g class="stack" fill={indicatorValueColorscale(stacked.key)}>
        {#each stacked as st}
          <rect
            on:mouseover={() => barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked)}
            on:mouseout={barPlotMouseOut(indicator, st, stacked)}
            class={"barplot_rect" + sanitizeClassName(indicator.title) + sanitizeClassName(stacked.key) + st.data.group}
            x={xScale(st[0])}
            y={yScale(st.data.group) + (isAHN5Selected ? 30 : 0)}
            width={xScale(st[1]) - xScale(st[0])}
            height={yScale.bandwidth() / 2.0}
            stroke-width="4"
            style={st.data.group === "Nederland" && $configStore && $configStore.dashboardTitle === "Buurtdashboard Dordrecht"
              ? "visibility: hidden;"
              : ""}
          >
          </rect>
          {#if xScale(st[1]) - xScale(st[0]) > 40}
            <text
              text-anchor="middle"
              x={xScale(st[0]) + (xScale(st[1]) - xScale(st[0])) / 2}
              y={yScale(st.data.group) + 1.5 + (isAHN5Selected ? 30 : 0)}
              fill={checkContrast(indicatorValueColorscale(stacked.key)) ? "white" : "black"}
              dy="1.1em"
              font-size="14px"
              pointer-events="none">{getDisplayValue(st.data[stacked.key])}%</text
            >
          {/if}
        {/each}
      </g>
    {/each}
    {#each regios as regio, i}
      {#if regio !== "Nederland" || !($configStore && $configStore.dashboardTitle === "Buurtdashboard Dordrecht")}
        {#if graphWidth > 0 && safeBandwidth > 0}
          <text style="fill:#645F5E" x={graphWidth / 2} text-anchor="middle" font-size="15px" y={i * safeBandwidth - 5 + (isAHN5Selected ? 30 : 0)}
            >{getRegionName(regio)}</text
          >
        {/if}
      {/if}
    {/each}
  </g>
</svg>

<style>
  svg {
    width: 100%;
  }

  rect {
    transition: all 2s;
  }
</style>
