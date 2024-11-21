<script>

  import { alleGemeentesJSONData, gemeenteSelection, buurtSelection, buurtCodeAfkorting, gemeenteNaamAfkorting, circleRadius } from "$lib/stores";
  import { extent, scaleLinear, scaleLog } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force";
  import { getClassName } from '$lib/noncomponents/getClassName';
  import { click, mouseOut, mouseOver } from "$lib/noncomponents/buurtMouseEvents";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator;
  export let indicatorValueColorscale;
  export let buurtenInGemeenteFeaturesClone
  export let type

  const dy = (type === 'lower_beeswarm') 
    ? 50
    : (type === 'upper_beeswarm')
      ? 13
      : 34

  // filter out null values
  buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => d.properties[indicator.attribute] !== null)
  if(indicator.titel === 'Groen per inwoner'){
    buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => +d.properties[indicator.attribute] > 0)
  }

  const margin = {bottom:50, top:20, left:30, right:30}
  const xScaleLeftMargin = (type === 'lower_beeswarm' || type === 'upper_beeswarm') ? 30 : 0

  // filter out null values
  buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => d.properties[indicator.attribute] !== null)
  if(indicator.titel === 'Groen per inwoner'){
    buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => +d.properties[indicator.attribute] > 0)
  }

  $: xScaleBeeswarm = (indicator.titel !== 'Groen per inwoner')
    ? scaleLinear()
        .domain(extent(buurtenInGemeenteFeaturesClone, d => +d.properties[indicator.attribute]))
        .range([0, graphWidth-margin.left-margin.right])
        .nice()
    : scaleLog()
        .domain(extent(buurtenInGemeenteFeaturesClone, d => +d.properties[indicator.attribute]))
        .range([0, graphWidth-margin.left-margin.right])
        .nice()

  let simulation = forceSimulation(buurtenInGemeenteFeaturesClone)
  let nodes = []; // Create an empty array to be populated when simulation ticks
  simulation.on("tick", () => {
      nodes = simulation.nodes(); // Repopulate and update
  });

  // Run the simulation whenever any of the variables inside of it change
  $: {
    simulation = forceSimulation(buurtenInGemeenteFeaturesClone)
      .force("x", forceX().x(d => xScaleBeeswarm(d.properties[indicator.attribute]))
        .strength(d => (xScaleBeeswarm(d.properties[indicator.attribute]) > 0) ? 0.1 : 1))
      .force("y", forceY().y(70)
        .strength(d => (xScaleBeeswarm(d.properties[indicator.attribute]) > 0) ? 0.04 : 0.01))
      .force('charge', forceManyBody().strength(-0.5))
      .force("collide", forceCollide().radius($circleRadius*1.2))
      .alpha(0.6) // [0, 1] The rate at which the simulation finishes. You should increase this if you want a faster simulation, or decrease it if you want more "movement" in the simulation.
      .alphaDecay(0.001) // [0, 1] The rate at which the simulation alpha approaches 0. you should decrease this if your bubbles are not completing their transitions between simulation states.
      .restart(); // Restart the simulation
  }

</script>

{#if type !== 'upper_beeswarm'}
  <XAxis {xScaleBeeswarm} height={indicatorHeight*2} {margin} {dy}/>
{/if}
{#if type === 'upper_beeswarm'}
  <line x1={xScaleBeeswarm.range()[0]+margin.left} x2={xScaleBeeswarm.range()[1]+margin.left} y1={80} y2={80} stroke='lightgrey'></line>
{/if}
{#if indicator.titel === 'Groen per inwoner'}
  <text x={graphWidth/2} y={indicatorHeight - margin.bottom - 5} text-anchor='middle' font-size='13'>Let op logaritmische schaal</text>
{/if}

<g class="inner-chart" transform="translate({margin.left}, {margin.top})">
  {#if type === 'lower_beeswarm' || type === 'upper_beeswarm'}
    <text x='-20' y={dy+7}>{(type === 'lower_beeswarm') ? 2023 : 2019}</text>
  {/if}
  {#each nodes as node (node.id + indicator.attribute)}
    <circle class={getClassName(node, 'node', indicator, '') + ' ' + 'svgelements_' + node.properties[$buurtCodeAfkorting]}
    stroke={(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? '#E1575A' : 'none'}
    style='filter: {(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? 'drop-shadow(0 0 5px #36575A)' : 'none'}'
    cx={node.x} cy={node.y} r={(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? $circleRadius+3 : $circleRadius} fill={indicatorValueColorscale(+node.properties[indicator.attribute])} stroke-width='3'
    on:mouseover={(e) => mouseOver(e, node, indicator, 'no map', indicatorValueColorscale, null)}
    on:mouseout={() => mouseOut(node, indicator, 'no map')}
    on:click={() => click(node, indicator, 'no map')}
    />
  {/each}
</g>
<text x={graphWidth/2} y={indicatorHeight-18} fill='#645F5E' text-anchor='middle' font-size='14'>{indicator.plottitel} per buurt in gemeente {$alleGemeentesJSONData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties[$gemeenteNaamAfkorting]}</text>


<style>



</style>