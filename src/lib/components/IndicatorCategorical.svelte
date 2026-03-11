<script>
  import BarPlot from "./BarPlot.svelte"
  import BarPlotLegend from "./BarPlotLegend.svelte"
  import { getClassByIndicatorValue } from "$lib/utils/getClassByIndicatorValue"

  export let indicator
  export let indicatorValueColorscale
  export let graphWidth
  export let graphHeight

  let barPlotData = []

  function handleDataUpdate(event) {
    barPlotData = event.detail.barPlotData
  }
</script>

<div class="indicator-graph" style="height:{graphHeight}px" bind:clientWidth={graphWidth}>
  <BarPlot
    {graphWidth}
    indicatorHeight={graphHeight * 0.75}
    aggregated={indicator.aggregatedIndicator ? true : false}
    {indicator}
    {indicatorValueColorscale}
    on:dataUpdate={handleDataUpdate}
  />
  <BarPlotLegend {graphWidth} {indicatorValueColorscale} {indicator} {barPlotData} />
</div>

<style>
  .indicator-graph {
    background-color: rgb(253, 249, 234);
  }
</style>
