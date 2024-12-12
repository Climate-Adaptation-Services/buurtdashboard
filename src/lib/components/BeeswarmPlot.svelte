<script>

  import { allMunicipalitiesJSONData, municipalitySelection, neighbourhoodSelection, neighbourhoodCodeAbbreviation, municipalityNameAbbreviation, circleRadius } from "$lib/stores";
  import { extent, scaleLinear, scaleLog } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force";
  import { getClassName } from '$lib/noncomponents/getClassName';
  import { click, mouseOut, mouseOver } from "$lib/noncomponents/neighbourhoodMouseEvents";
  import { t } from "$lib/i18n/translate";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator;
  export let indicatorValueColorscale;
  export let NeighbourhoodsInMunicipalityFeaturesClone

  const margin = {bottom:50, top:20, left:30, right:30}

  // filter out null values
  NeighbourhoodsInMunicipalityFeaturesClone = NeighbourhoodsInMunicipalityFeaturesClone.filter(d => d.properties[indicator.attribute] !== null)
  if(indicator.title === 'Groen per inwoner'){
    NeighbourhoodsInMunicipalityFeaturesClone = NeighbourhoodsInMunicipalityFeaturesClone.filter(d => +d.properties[indicator.attribute] > 0)
  }

  $: xScaleBeeswarm = (indicator.title !== 'Groen per inwoner')
    ? scaleLinear()
        .domain(extent(NeighbourhoodsInMunicipalityFeaturesClone, d => +d.properties[indicator.attribute]))
        .range([0, graphWidth-margin.left-margin.right])
        .nice()
    : scaleLog()
        .domain(extent(NeighbourhoodsInMunicipalityFeaturesClone, d => +d.properties[indicator.attribute]))
        .range([0, graphWidth-margin.left-margin.right])
        .nice()

  let simulation = forceSimulation(NeighbourhoodsInMunicipalityFeaturesClone)
  let nodes = []; // Create an empty array to be populated when simulation ticks
  simulation.on("tick", () => {
      nodes = simulation.nodes(); // Repopulate and update
  });

  // Run the simulation whenever any of the variables inside of it change
  $: {
    simulation = forceSimulation(NeighbourhoodsInMunicipalityFeaturesClone)
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

<svg class={'beeswarm_' + indicator.attribute}>
  <XAxis xScale={xScaleBeeswarm} height={indicatorHeight} {margin}/>
  {#if indicator.title === 'Groen per inwoner'}
    <text x={graphWidth/2} y={indicatorHeight - margin.bottom - 5} text-anchor='middle' font-size='13'>Let op logaritmische schaal</text>
  {/if}

  <g class="inner-chart" transform="translate({margin.left}, {margin.top})">
    {#each nodes as node (node.id + indicator.attribute)}
      <circle class={getClassName(node, 'node', indicator, '') + ' ' + 'svgelements_' + node.properties[$neighbourhoodCodeAbbreviation]}
      stroke={(node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? '#E1575A' : 'none'}
      style='filter: {(node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? 'drop-shadow(0 0 5px #36575A)' : 'none'}'
      cx={node.x} cy={node.y} r={(node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? $circleRadius+3 : $circleRadius} fill={indicatorValueColorscale(+node.properties[indicator.attribute])} stroke-width='3'
      on:mouseover={(e) => mouseOver(e, node, indicator, 'no map', indicatorValueColorscale, null, margin)}
      on:mouseout={() => mouseOut(node, indicator, 'no map')}
      on:click={() => click(node, indicator, 'no map')}
      />
    {/each}
  </g>
  <text x={graphWidth/2} y={indicatorHeight-18} fill='#645F5E' text-anchor='middle' font-size='14'>{indicator.plottitle} per {t('Buurt').toLowerCase()} in {t('Gemeente').toLowerCase() + ' '} {$allMunicipalitiesJSONData.features.filter(municipality => municipality.properties['GM_CODE'] === $municipalitySelection)[0].properties[$municipalityNameAbbreviation]}</text>
</svg>


<style>

  svg{
    width: 100%;
    height:100%;
  }

</style>