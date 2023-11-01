<script>

  import { currentData, hoveredValue, currentView, gemeenteSelection, buurtSelection, hoveredRegion, buurtenInGemeente } from "$lib/stores";
  import { extent, scaleLinear, select } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide } from "d3-force";

  export let w;
  export let h;
  export let variable;
  export let color;

  const margin = {bottom:30, top:30, left:30, right:30}

  $: xScale = scaleLinear()
    .domain(extent($buurtenInGemeente.features, d => d.properties[variable]))
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
      .force("x", forceX().x(d => xScale(d.properties[variable])).strength(0.1))
      .force("y", forceY().y(100).strength(0.05))
      .force("collide", forceCollide().radius(5.1))
      .alpha(0.3) // [0, 1] The rate at which the simulation finishes. You should increase this if you want a faster simulation, or decrease it if you want more "movement" in the simulation.
      .alphaDecay(0.0003) // [0, 1] The rate at which the simulation alpha approaches 0. you should decrease this if your bubbles are not completing their transitions between simulation states.
      .restart(); // Restart the simulation
  }

  $: classNameVariable = ($currentView === 'Nederland') ? 'GM_CODE' : 'BU_CODE'
  $: regionVariable = ($currentView === 'Nederland') ? 'GM_Naam' : 'BU_NAAM'

  function mouseOver(feature){
    select('.' + getClassName(feature))
      .attr('stroke', 'white')
      .attr('r', 8)
      .raise()
    
    select('.' + getClassName(feature).replace('node', 'path'))
      .attr('stroke-width', 4)

    hoveredValue.set([variable, feature.properties[variable], color(feature.properties[variable])])

    let elem = document.getElementsByClassName('svgchart_' + variable)[0]
    let rectmap = elem.getBoundingClientRect();
    let tooltipCenter = [xScale(feature.properties[variable]) + rectmap.left + margin.left, rectmap.top + margin.top]
    
    hoveredRegion.set({
      'region': ($gemeenteSelection === null) ? 'Gemeente' : 'Buurt',
      'center': tooltipCenter,
      'name': feature.properties[regionVariable]
    })
  }

  function mouseOut(feature){
    select('.' + getClassName(feature))
      .attr('stroke', 'none')
      .attr('r', 5)

    select('.' + getClassName(feature).replace('node', 'path'))
      .attr('stroke-width', 0.5)

    hoveredValue.set(null)
    
    hoveredRegion.set(null)
  }

  function click(feature){
    mouseOut(feature)
    const newSelection = feature.properties[classNameVariable].replaceAll(' ','').replaceAll('(','').replaceAll(')','')
    if($currentView === 'Nederland'){
      gemeenteSelection.set(newSelection)
    }else if($currentView === 'Gemeente'){
      buurtSelection.set(newSelection)
    }
  }

  function getClassName(feature){
    let className = feature.properties[classNameVariable] + "_node_" + variable
    return className.replaceAll(' ','').replaceAll('(','').replaceAll(')','')
  }

</script>

<svg class={'svgchart_' + variable}>
  <XAxis {xScale} height={h} {margin}/>

  <g class="inner-chart" transform="translate({margin.left}, {margin.top})">
    {#each nodes as node, i}
      <circle class={getClassName(node)}
      cx={node.x} cy={node.y} r={5} fill={color(node.properties[variable])} stroke-width='4'
      on:mouseover={() => mouseOver(node)}
      on:mouseout={() => mouseOut(node)}
      on:click={() => click(node)}
      />
    {/each}
  </g>
</svg>


<style>

  svg{
    width: 100%;
    height:100%;
  }

</style>