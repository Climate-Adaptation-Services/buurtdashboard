<script>

  import { alleGemeentesJSONData, gemeenteSelection, buurtSelection, buurtCodeAfkorting, gemeenteNaamAfkorting, circleRadius, indicatorYearChanged } from "$lib/stores";
  import { extent, scaleLinear, scaleLog, selectAll } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force";
  import { getClassName } from '$lib/noncomponents/getClassName';
  import { click, mouseOut, mouseOver } from "$lib/noncomponents/buurtMouseEvents";
    import { onMount } from "svelte";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator;
  export let indicatorValueColorscale;
  export let buurtenInGemeenteFeaturesClone

  // filter out null values
  buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => d.properties[indicator.attribute] !== null)
  if(indicator.titel === 'Groen per inwoner'){
    buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => +d.properties[indicator.attribute] > 0)
  }

  const margin = {bottom:50, top:20, left:30, right:30}

  $: xScaleBeeswarm = (indicator.titel !== 'Groen per inwoner')
    ? scaleLinear()
        .domain(extent(buurtenInGemeenteFeaturesClone, d => +d.properties[indicator.attribute]))
        .range([0, graphWidth-margin.left-margin.right])
        .nice()
    : scaleLog()
        .domain(extent(buurtenInGemeenteFeaturesClone, d => +d.properties[indicator.attribute]))
        .range([0, graphWidth-margin.left-margin.right])
        .nice()

  // filter out null values
  buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => d.properties[indicator.attribute] !== null)
  if(indicator.titel === 'Groen per inwoner'){
    buurtenInGemeenteFeaturesClone = buurtenInGemeenteFeaturesClone.filter(d => +d.properties[indicator.attribute] > 0)
  }

  const simulation = forceSimulation(buurtenInGemeenteFeaturesClone)
  let nodes = []; // Create an empty array to be populated when simulation ticks
  simulation.on("tick", () => {
    nodes = simulation.nodes(); // Repopulate and update
  });  


  // Run the simulation whenever any of the variables inside of it change
  $: {
    simulation
      .force("x", forceX().x(d => xScaleBeeswarm(d.properties[indicator.attribute])-10)
        .strength(d => (xScaleBeeswarm(d.properties[indicator.attribute]) > 0) ? 0.1 : 1))
      .force("y", forceY().y(70)
        .strength(d => (xScaleBeeswarm(d.properties[indicator.attribute]) > 0) ? 0.05 : 0.01))
      .force('charge', forceManyBody().strength(-0.7))
      .force("collide", forceCollide().radius($circleRadius*1.2))
      .alpha(0.5) // [0, 1] The rate at which the simulation finishes. You should increase this if you want a faster simulation, or decrease it if you want more "movement" in the simulation.
      .alphaDecay(0.001) // [0, 1] The rate at which the simulation alpha approaches 0. you should decrease this if your bubbles are not completing their transitions between simulation states.    
      .restart()

      let maxAlpha = 0.8; // Max alpha value to accelerate the simulation
      let currentAlpha = 0

      // Phase 1: Gradually increase alpha (build-up phase)
      let buildUpInterval = setInterval(function() {
        if (currentAlpha < maxAlpha) {
          currentAlpha += 0.1;  // Increase alpha gradually
          simulation.alpha(currentAlpha)
        } else {
          clearInterval(buildUpInterval);  // Stop when maxAlpha is reached
          // After reaching max alpha, start the slowdown phase
        }
      }, 100);  // Increase alpha every 100ms (you can adjust timing here)

      // function slowDown(){
      //   // Phase 2: Gradually slow down
      //   let slowDownInterval = setInterval(function() {
      //     if (currentAlpha < 0) {
      //       currentAlpha -= 0.1;  // Increase alpha gradually
      //       simulation.alpha(currentAlpha)
      //     } else {
      //       clearInterval(slowDownInterval);  // Stop when maxAlpha is reached
      //       // After reaching max alpha, start the slowdown phase
      //       // simulation.stop()
      //     }
      //   }, 100);  // Increase alpha every 100ms (you can adjust timing here)
      // }
  }

</script>

<XAxis xScale={xScaleBeeswarm} height={indicatorHeight} {margin}/>

{#if indicator.titel === 'Groen per inwoner'}
  <text x={graphWidth/2} y={indicatorHeight - margin.bottom - 5} text-anchor='middle' font-size='13'>Let op logaritmische schaal</text>
{/if}

<g class="inner-chart" transform="translate({margin.left}, {margin.top})">
  {#each nodes as node (node.id + indicator.attribute)}
    <circle class={getClassName(node, 'node', indicator, '') + ' ' + 'svgelements_' + node.properties[$buurtCodeAfkorting]}
    stroke={(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? '#E1575A' : 'none'}
    style='filter: {(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? 'drop-shadow(0 0 5px #36575A)' : 'none'}'
    cx={node.x} cy={node.y} 
    r={(node.properties[$buurtCodeAfkorting] === $buurtSelection) ? $circleRadius+3 : $circleRadius}
    fill={indicatorValueColorscale(+node.properties[indicator.attribute])} stroke-width='3'
    on:mouseover={(e) => mouseOver(e, node, indicator, 'no map', indicatorValueColorscale, null, margin)}
    on:mouseout={() => mouseOut(node, indicator, 'no map')}
    on:click={() => click(node, indicator, 'no map')}
    />
  {/each}
</g>
<text x={graphWidth/2} y={indicatorHeight-18} fill='#645F5E' text-anchor='middle' font-size='14'>{indicator.plottitel} per buurt in gemeente {$alleGemeentesJSONData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties[$gemeenteNaamAfkorting]}</text>


<style>



</style>