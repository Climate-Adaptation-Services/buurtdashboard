<script>

  import { neighbourhoodSelection, neighbourhoodCodeAbbreviation, circleRadius, alleIndicatoren2019, selectedNeighbourhoodJSONData, jaarSelecties, indicatorYearChanged } from "$lib/stores";
  import { extent, scaleLinear, scaleLog, select } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force";
  import { getClassName } from '$lib/noncomponents/getClassName';
  import { click, mouseOut, mouseOver } from "$lib/noncomponents/neighbourhoodMouseEvents";
    import { onMount } from "svelte";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator;
  export let indicatorValueColorscale;
  export let neighbourhoodsInMunicipalityFeaturesClone;

  // filter out null values
  neighbourhoodsInMunicipalityFeaturesClone = neighbourhoodsInMunicipalityFeaturesClone.filter(d => d.properties[indicator.attribute] !== null)
  if(indicator.title === 'Groen per inwoner'){
    neighbourhoodsInMunicipalityFeaturesClone = neighbourhoodsInMunicipalityFeaturesClone.filter(d => +d.properties[indicator.attribute] > 0)
  }

  const margin = {bottom:50, top:20, left:30, right:30}

  let indicatorAttribute = indicator.attribute
  let attributeWithoutYear = ''

  let xScaleExtent;
  $: {
    // if the indicator also exists in the 2019 metadata
    if($alleIndicatoren2019.map(d => d.title).includes(indicator.title)){
      attributeWithoutYear = indicator.attribute.slice(0,-4)
      
      if($jaarSelecties[indicator.title] === 'Difference'){
        indicatorAttribute = attributeWithoutYear + 'Difference'
        xScaleExtent = extent(neighbourhoodsInMunicipalityFeaturesClone.map(d => +d.properties[attributeWithoutYear + 'Difference']))
        xScaleExtent[0] -= 2
      }else{
        indicatorAttribute = indicator.attribute
        const featuresCombined = [...neighbourhoodsInMunicipalityFeaturesClone.map(d => +d.properties[attributeWithoutYear + '2019']), ...neighbourhoodsInMunicipalityFeaturesClone.map(d => +d.properties[attributeWithoutYear + '2023'])]
        xScaleExtent = extent(featuresCombined)
      }
    }else{
      xScaleExtent = extent(neighbourhoodsInMunicipalityFeaturesClone, d => +d.properties[indicator.attribute])
    }
  } 

  $: xScaleBeeswarm = (indicator.title !== 'Groen per inwoner')
    ? scaleLinear()
        .domain(xScaleExtent)
        .range([0, graphWidth-margin.left-margin.right])
        .nice()
    : scaleLog()
        .domain(xScaleExtent)
        .range([0, graphWidth-margin.left-margin.right])
        .nice()

  const simulation = forceSimulation(neighbourhoodsInMunicipalityFeaturesClone)
  let nodes = []; // Create an empty array to be populated when simulation ticks
  simulation.on("tick", () => {
    nodes = simulation.nodes(); // Repopulate and update
  });  

  let alpha = 0.5
  // Run the simulation whenever any of the variables inside of it change

  let skipSimulationRestart = false
  $: if(jaarSelecties && indicator.title === $indicatorYearChanged[0]){
    skipSimulationRestart = true
  }

  function runSimulation(){
    simulation
        .force("x", forceX().x(d => xScaleBeeswarm(d.properties[indicatorAttribute])).strength(0.7))
          // .strength(d => (xScaleBeeswarm(d.properties[indicatorAttribute]) > 0) ? 0.8 : 1))
        .force("y", forceY().y(70).strength(0.05))
          // .strength(d => (xScaleBeeswarm(d.properties[indicatorAttribute]) > 0) ? 0.03 : 0.01))
        .force('charge', forceManyBody().strength(0.5))
        .force("collide", forceCollide().radius($circleRadius*1.25))
        .alpha(alpha) // [0, 1] The rate at which the simulation finishes. You should increase this if you want a faster simulation, or decrease it if you want more "movement" in the simulation.
        .alphaDecay(0.005) // [0, 1] The rate at which the simulation alpha approaches 0. you should decrease this if your bubbles are not completing their transitions between simulation states.    
        .restart()

        alpha = 0.2
  }
  $: {
    if(skipSimulationRestart){
      runSimulation()
    }else{
      skipSimulationRestart = false
    }
  }

  onMount(() => {
    runSimulation()
  })

  // raise node on mount, hacky solution could be better
  $: if($selectedNeighbourhoodJSONData){setTimeout(() => {select('.' + getClassName($selectedNeighbourhoodJSONData, 'node', indicator, 'indicator map')).raise()}, 1000)}


</script>

<XAxis xScale={xScaleBeeswarm} height={indicatorHeight} {margin}/>
{#if indicator.title === 'Groen per inwoner'}
  <text x={graphWidth/2} y={indicatorHeight - margin.bottom - 5} text-anchor='middle' font-size='13'>Let op logaritmische schaal</text>
{/if}

<g class="inner-chart" transform="translate({margin.left}, {margin.top})">
  {#each nodes as node (node.id + indicatorAttribute)}
    <circle class={getClassName(node, 'node', indicator, '') + ' ' + 'svgelements_' + node.properties[$neighbourhoodCodeAbbreviation]}
    stroke={(node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? '#E1575A' : 'none'}
    style='filter: {(node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? 'drop-shadow(0 0 5px #36575A)' : 'none'}'
    cx={node.x} cy={node.y} r={(node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) ? $circleRadius+3 : $circleRadius} fill={indicatorValueColorscale(+node.properties[indicatorAttribute])} stroke-width='3'
    on:mouseover={(e) => mouseOver(e, node, indicator, 'no map', indicatorValueColorscale, null, margin)}
    on:mouseout={() => mouseOut(node, indicator, 'no map')}
    on:click={() => click(node, indicator, 'no map')}
    />
  {/each}
</g>


<style>



</style>