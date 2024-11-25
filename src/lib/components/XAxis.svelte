<script>
  import { axisBottom, select, selectAll, format } from "d3";

  export let xScale
  export let height
  export let margin

  let pinXAxis; // declare pins

  // call axis generators on the scale and pin the SVG pins.
  $: if (pinXAxis) {
    select(pinXAxis).call(axisBottom(xScale).ticks(6).tickSize(-height+margin.top+margin.bottom));
    selectAll(".domain, .tick line")
      .style('stroke', 'lightgrey')
  }

</script>

<g
  class="xAxis"
  bind:this={pinXAxis}
  transform="translate({margin.left},{height-margin.bottom})"
/>

<style>

</style>