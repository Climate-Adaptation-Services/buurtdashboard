<script>

  import { alleGemeentesJSONData, huidigeCodeAfkorting, huidigeNaamAfkorting, tooltipValues, huidigOverzichtsniveau, gemeenteSelection, buurtSelection, tooltipRegion, buurtenInGemeenteJSONData, buurtCodeAfkorting, buurtNaamAfkorting, URLParams, gemeenteNaamAfkorting, circleRadius } from "$lib/stores";
  import { extent, scaleLinear, scaleLog, select, selectAll } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force";
  import { getClassName } from '$lib/noncomponents/getClassName';
  import { click, mouseOut, mouseOver } from "$lib/noncomponents/mouseEvents";

  export let w;
  export let h;
  export let indicator;
  export let indicatorValueColor;
  export let nodesData

  // filter out null values
  nodesData = nodesData.filter(d => d.properties[indicator.attribute] !== null)
  if(indicator.titel === 'Groen per inwoner'){
    nodesData = nodesData.filter(d => +d.properties[indicator.attribute] > 0)
  }

  const margin = {bottom:50, top:20, left:30, right:30}

  $: xScale = (indicator.titel !== 'Groen per inwoner')
    ? scaleLinear()
        .domain(extent($buurtenInGemeenteJSONData.features, d => +d.properties[indicator.attribute]))
        .range([0, w-margin.left-margin.right])
        .nice()
    : scaleLog()
        .domain(extent(nodesData, d => +d.properties[indicator.attribute]))
        .range([0, w-margin.left-margin.right])
        .nice()

  let simulation = forceSimulation(nodesData)

  let nodes = []; // Create an empty array to be populated when simulation ticks

  simulation.on("tick", () => {
      nodes = simulation.nodes(); // Repopulate and update
  });

  // Run the simulation whenever any of the variables inside of it change
  $: {
    simulation = forceSimulation(nodesData)
      .force("x", forceX().x(d => xScale(d.properties[indicator.attribute]))
        .strength(d => (xScale(d.properties[indicator.attribute]) > 0) ? 0.1 : 1))
      .force("y", forceY().y(70)
        .strength(d => (xScale(d.properties[indicator.attribute]) > 0) ? 0.04 : 0.01))
      .force('charge', forceManyBody().strength(-0.5))
      .force("collide", forceCollide().radius($circleRadius*1.2))
      .alpha(0.6) // [0, 1] The rate at which the simulation finishes. You should increase this if you want a faster simulation, or decrease it if you want more "movement" in the simulation.
      .alphaDecay(0.001) // [0, 1] The rate at which the simulation alpha approaches 0. you should decrease this if your bubbles are not completing their transitions between simulation states.
      .restart(); // Restart the simulation
  }

</script>

<svg class={'beeswarm_' + indicator.attribute}>
  <XAxis {xScale} height={h} {margin}/>
  {#if indicator.titel === 'Groen per inwoner'}
    <text x={w/2} y={h - margin.bottom - 5} text-anchor='middle' font-size='13'>Let op logaritmische schaal</text>
  {/if}

  <g class="inner-chart" transform="translate({margin.left}, {margin.top})">
    {#each nodes as node (node.id + indicator.attribute)}
      <circle class={getClassName(node, 'node', indicator, '') + ' ' + 'svgelements_' + node.properties[$buurtCodeAfkorting]}
      stroke={(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? '#E1575A' : 'none'}
      style='filter: {(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? 'drop-shadow(0 0 5px #36575A)' : 'none'}'
      cx={node.x} cy={node.y} r={(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? $circleRadius+3 : $circleRadius} fill={indicatorValueColor(+node.properties[indicator.attribute])} stroke-width='3'
      on:mouseover={(e) => mouseOver(e, node, indicator, '', indicatorValueColor, null)}
      on:mouseout={() => mouseOut(node, indicator, '')}
      on:click={() => click(node, indicator, '')}
      />
    {/each}
  </g>
  <text x={w/2} y={h-18} fill='#645F5E' text-anchor='middle' font-size='14'>{indicator.plottitel} per buurt in gemeente {$alleGemeentesJSONData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties[$gemeenteNaamAfkorting]}</text>
</svg>


<style>

  svg{
    width: 100%;
    height:100%;
  }

</style>