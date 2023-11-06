<script>
  import { wijkTypeData } from "$lib/stores";
  import { scaleLinear, select, scaleBand } from "d3";

  export let w;
  export let h;
  export let variable;
  export let color;

  const margin = {bottom:30, top:30, left:30, right:30}

  // let barData = 

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([ 0, w ])
  
  // $: yScale = scaleBand()
  //   .domain(groups)
  //   .range([0, width])
  //   .padding([0.2])

</script>


<svg class={'barplot_' + variable}>
  <g class="inner-chart-bar" transform="translate({margin.left}, {margin.top})">
    <!-- {#each } -->
  </g>
</svg>



<style>


</style>