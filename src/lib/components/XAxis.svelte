<script>
  import { axisBottom, select, selectAll, format } from "d3";

  export let xScale
  export let height
  export let margin

  let pinXAxis; // declare pins

  // call axis generators on the scale and pin the SVG pins.
  $: if (pinXAxis) {
    select(pinXAxis).call(axisBottom(xScale));
    // selectAll(".domain, .tick line")
    //   .style('stroke', '#808080')
  }

</script>

<g
  class="xAxis"
  bind:this={pinXAxis}
  transform="translate({margin.left},{height-margin.bottom})"
/>

<style>

</style>
