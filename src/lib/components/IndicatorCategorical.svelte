<script>
  import BarPlot from "./BarPlot.svelte"
  import BarPlotLegend from "./BarPlotLegend.svelte"
  import { getClassByIndicatorValue } from "$lib/noncomponents/getClassByIndicatorValue"

  export let indicator
  export let indicatorValueColorscale
  export let graphWidth
  export let graphHeight
</script>

<div class="indicator-graph" style="height:{graphHeight}px" bind:clientWidth={graphWidth}>
  <BarPlot
    {graphWidth}
    indicatorHeight={graphHeight * 0.75}
    aggregated={indicator.aggregatedIndicator ? true : false}
    {indicator}
    {indicatorValueColorscale}
  />
  <BarPlotLegend {graphWidth} {indicatorValueColorscale} {indicator} />
</div>

<style>
  .indicator-graph {
    background-color: rgb(253, 249, 234);
  }
</style>
