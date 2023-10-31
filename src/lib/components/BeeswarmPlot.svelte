<script>

  import { currentData } from "$lib/stores";
  import { extent, scaleLinear } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide } from "d3-force";


  export let w;
  export let h;
  export let variable;
  export let color;

  const margin = {bottom:30, top:30, left:30, right:30}

  $: xScale = scaleLinear()
    .domain(extent($currentData.features, d => d.properties[variable]))
    .range([0, w-margin.left-margin.right])
    .nice()


  let simulation = forceSimulation($currentData.features)

  let nodes = []; // Create an empty array to be populated when simulation ticks
  
  simulation.on("tick", () => {
      nodes = simulation.nodes(); // Repopulate and update
  });

  // Run the simulation whenever any of the variables inside of it change
  $: {
    simulation = forceSimulation($currentData.features)
      .force("x", forceX().x(d => xScale(d.properties[variable])).strength(0.2))
      .force("y", forceY().y(100).strength(0.1))
      .force("collide", forceCollide().radius(5.1))
      .alpha(0.3) // [0, 1] The rate at which the simulation finishes. You should increase this if you want a faster simulation, or decrease it if you want more "movement" in the simulation.
      .alphaDecay(0.0005) // [0, 1] The rate at which the simulation alpha approaches 0. you should decrease this if your bubbles are not completing their transitions between simulation states.
      .restart(); // Restart the simulation
  }
  


</script>

<svg>
  <XAxis {xScale} height={h} {margin}/>

  <g class="inner-chart" transform="translate({margin.left}, {margin.top})">
    {#each nodes as node}
      <circle cx={node.x} cy={node.y} r={5} fill={color(node.properties[variable])} />
    {/each}
  </g>
</svg>


<style>

  svg{
    width: 100%;
    height:100%;
  }

</style>