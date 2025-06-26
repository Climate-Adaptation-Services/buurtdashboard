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
  } from "$lib/stores"
  import { scaleLinear, scaleBand, stack } from "d3"
  import { checkContrast } from "$lib/noncomponents/checkContrast"
  import { getRegionName } from "$lib/noncomponents/getRegionName"
  import { barPlotMouseOut, barPlotMouseOver } from "$lib/noncomponents/barPlotMouseEvents"
  import {
    calcPercentagesForEveryClassMultiIndicator,
    calcPercentagesForEveryClassSingleIndicator,
  } from "$lib/noncomponents/calcPercentagesForEveryClass"

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let indicatorValueColorscale
  export let getClassByIndicatorValue
  export let aggregated

  const margin = { bottom: 100, top: 30, left: 30, right: 30 }

  const calcPercentagesForEveryClass = aggregated ? calcPercentagesForEveryClassMultiIndicator : calcPercentagesForEveryClassSingleIndicator

  let nederlandValues
  $: if ($AHNSelecties) {
    nederlandValues = calcPercentagesForEveryClass(indicator, $allNeighbourhoodsJSONData, "Nederland")
  }
  let barPlotData = []
  let regios = []

  $: {
    if ($neighbourhoodSelection !== null && $AHNSelecties) {
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
    } else if ($municipalitySelection !== null) {
      barPlotData = [nederlandValues, calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, "Gemeente")]
      regios = ["Nederland", "Gemeente"]
    } else {
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

<svg class={"barplot_" + indicator.attribute} style="height:74%">
  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class="stack" fill={indicatorValueColorscale(stacked.key)}>
        {#each stacked as st}
          <rect
            on:mouseover={() => barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked)}
            on:mouseout={barPlotMouseOut(indicator, st, stacked)}
            class={"barplot_rect" + indicator.attribute + stacked.key.replaceAll(" ", "").replaceAll(">", "") + st.data.group}
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
              pointer-events="none">{Math.round(st.data[stacked.key] * 10) / 10}%</text
            >
          {/if}
        {/each}
      </g>
    {/each}
    {#each regios as regio, i}
      {#if regio !== "Nederland" || !($configStore && $configStore.dashboardTitle === "Buurtdashboard Dordrecht")}
        <text style="fill:#645F5E" x={graphWidth / 2} text-anchor="middle" font-size="15px" y={i * yScale.bandwidth() - 5}
          >{getRegionName(regio)}</text
        >
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
