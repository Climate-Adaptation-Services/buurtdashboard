<script>
  import { axisBottom, select, selectAll, format } from "d3"
  import { AHNSelecties, getIndicatorStore } from "$lib/stores"

  export let xScale
  export let height
  export let margin
  export let indicator = null

  let pinXAxis // declare pins

  // Get the indicator-specific store
  $: indicatorStore = indicator ? getIndicatorStore(indicator.dutchTitle || indicator.title) : null

  // Determine if we're showing a difference plot
  $: isDifferencePlot = $indicatorStore &&
      typeof $indicatorStore === 'object' &&
      $indicatorStore.isDifference
  
  // Get domain to check if it spans positive and negative values
  $: domain = xScale.domain()
  $: hasNegativeValues = domain[0] < 0
  $: hasPositiveValues = domain[1] > 0
  $: hasZero = hasNegativeValues && hasPositiveValues

  // call axis generators on the scale and pin the SVG pins.
  $: if (pinXAxis) {
    const axis = axisBottom(xScale)
      .ticks(6)
      .tickSize(-height + margin.top + margin.bottom)
    
    // Format tick labels for difference plots
    if (isDifferencePlot) {
      axis.tickFormat(d => d > 0 ? "+" + d.toFixed(1) : d.toFixed(1))
    }
    
    select(pinXAxis).call(axis)
    
    // Style the axis
    selectAll(".domain, .tick line").style("stroke", "lightgrey")
    
    // Highlight the zero line if we have both positive and negative values
    if (hasZero) {
      select(pinXAxis)
        .selectAll(".tick")
        .filter(d => d === 0)
        .select("line")
        .style("stroke", "#666")
        .style("stroke-width", "2px")
    }
  }
</script>

<g class="xAxis" bind:this={pinXAxis} transform="translate({margin.left},{height - margin.bottom})" />

<style>
</style>
