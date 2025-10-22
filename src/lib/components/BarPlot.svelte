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

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let indicatorValueColorscale
  export let getClassByIndicatorValue
  export let aggregated

  const margin = { bottom: 100, top: 30, left: 30, right: 30 }

  const calcPercentagesForEveryClass = aggregated ? calcPercentagesForEveryClassMultiIndicator : calcPercentagesForEveryClassSingleIndicator

  // Get the indicator-specific store for reactivity
  const indicatorStore = getIndicatorStore(indicator.title)

  // Simplified function - always show percentages in bar plot
  function getDisplayValue(percentageValue) {
    return Math.round(percentageValue * 10) / 10
  }

  let nederlandValues
  $: {
    // ALWAYS use cached values for Nederland - never recalculate client-side
    if ($nederlandAggregates && $nederlandAggregates.aggregates) {
      const cached = $nederlandAggregates.aggregates[indicator.title];

      if (cached !== undefined && typeof cached === 'object') {
        // Check if this is a year-based value or class-based aggregated value
        const ahnSelection = $indicatorStore;
        const selectedYear = ahnSelection?.baseYear;

        // If it has a year property, it's year-based, get that year's data
        if (selectedYear && cached[selectedYear] !== undefined) {
          nederlandValues = cached[selectedYear];
        } else if (!selectedYear || !Object.keys(cached).some(key => /^\d{4}$/.test(key))) {
          // No years in keys, so it's class-based aggregated data (Landbedekking, etc)
          nederlandValues = cached;
        }
      }
    }
  }
  let barPlotData = []
  let regios = []

  $: {
    if ($neighbourhoodSelection !== null && $indicatorStore && $allNeighbourhoodsJSONData) {
      if ($selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]) {
        barPlotData = [
          nederlandValues,
          calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, "Gemeente"),
          calcPercentagesForEveryClass(indicator, { type: "FeatureCollection", features: [$selectedNeighbourhoodJSONData] }, "Buurt"),
          calcPercentagesForEveryClass(indicator, $districtTypeJSONData, "Wijktype"),
        ]
        regios = ["Nederland", "Gemeente", "Buurt", "Wijktype"]
      } else {
        barPlotData = [
          nederlandValues,
          calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, "Gemeente"),
          calcPercentagesForEveryClass(indicator, { type: "FeatureCollection", features: [$selectedNeighbourhoodJSONData] }, "Buurt"),
        ]
        regios = ["Nederland", "Gemeente", "Buurt"]
      }
    } else if ($municipalitySelection !== null && $indicatorStore && $allNeighbourhoodsJSONData) {
      barPlotData = [nederlandValues, calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, "Gemeente")]
      regios = ["Nederland", "Gemeente"]
    } else if (nederlandValues) {
      // Show Nederland immediately - don't wait for indicatorStore
      barPlotData = [nederlandValues]
      regios = ["Nederland"]
    }
  }
  $: stackedData = stack().keys(Object.keys(indicator.classes))(barPlotData)

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([margin.left, graphWidth - margin.right])

  $: yScale = scaleBand()
    .domain(regios)
    .range([0, (indicatorHeight - margin.top - margin.bottom) * (barPlotData.length / 2)])
</script>

<svg class={"barplot_" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', '')} style="height:74%">
  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class="stack" fill={indicatorValueColorscale(stacked.key)}>
        {#each stacked as st}
          <rect
            on:mouseover={() => barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked)}
            on:mouseout={barPlotMouseOut(indicator, st, stacked)}
            class={"barplot_rect" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', '') + stacked.key.replaceAll(" ", "").replaceAll(">", "") + st.data.group}
            x={xScale(st[0])}
            y={yScale(st.data.group)}
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
              y={yScale(st.data.group) + 1.5}
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
        {#if graphWidth > 0}
          <text style="fill:#645F5E" x={graphWidth / 2} text-anchor="middle" font-size="15px" y={i * yScale.bandwidth() - 5}
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
