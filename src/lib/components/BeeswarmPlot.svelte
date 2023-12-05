<script>

  import { currentData, hoveredValue, currentView, gemeenteSelection, buurtSelection, hoveredRegion, buurtenInGemeente, buurtCode } from "$lib/stores";
  import { extent, scaleLinear, select, selectAll } from "d3";
  import XAxis from '$lib/components/XAxis.svelte';
  import { forceSimulation, forceY, forceX, forceCollide } from "d3-force";

  export let w;
  export let h;
  export let indicator;
  export let color;
  export let nodesData

  const margin = {bottom:30, top:30, left:30, right:30}

  $: xScale = scaleLinear()
    .domain(extent($buurtenInGemeente.features, d => d.properties[indicator.attribute]))
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
      .force("x", forceX().x(d => xScale(d.properties[indicator.attribute])-5.1).strength(0.1))
      .force("y", forceY().y(100).strength(0.05))
      .force("collide", forceCollide().radius(5.7))
      .alpha(0.5) // [0, 1] The rate at which the simulation finishes. You should increase this if you want a faster simulation, or decrease it if you want more "movement" in the simulation.
      .alphaDecay(0.000000000001) // [0, 1] The rate at which the simulation alpha approaches 0. you should decrease this if your bubbles are not completing their transitions between simulation states.
      .restart(); // Restart the simulation
  }

  $: classNameVariable = ($currentView === 'Nederland') ? 'GM_CODE' : 'bu_code'
  $: regionVariable = ($currentView === 'Nederland') ? 'GM_NAAM' : 'bu_naam'

  function mouseOver(feature){
    if(feature.properties[$buurtCode] !== $buurtSelection){

      select('.' + getClassName(feature))
        .attr('stroke', 'white')
        .attr('r', 8)
        .style('filter', 'drop-shadow(0 0 5px #36575A)')
        .raise()
      
      select('.' + getClassName(feature).replace('node', 'path'))
        .attr('stroke-width', 2)
        .style('filter', 'drop-shadow(0 0 5px #36575A)')
    }

    hoveredValue.set({
      indicator: indicator.attribute, 
      value: Math.round(feature.properties[indicator.attribute]*100)/100, 
      color: color(feature.properties[indicator.attribute])
    })

    let elem = document.getElementsByClassName('beeswarm_' + indicator.attribute)[0]
    let rectmap = elem.getBoundingClientRect();
    let tooltipCenter = [feature.x + rectmap.left + margin.left, rectmap.top + margin.top + feature.y + 10]
 
    hoveredRegion.set({
      'region': ($gemeenteSelection === null) ? 'Gemeente' : 'Buurt',
      'center': tooltipCenter,
      'name': feature.properties[regionVariable]
    })
  }

  function mouseOut(feature){
    if(feature.properties[$buurtCode] !== $buurtSelection){

      select('.' + getClassName(feature))
        .attr('stroke', 'none')
        .attr('r', 5)
        .style('filter', 'none')
        .lower()

      select('.' + getClassName(feature).replace('node', 'path'))
        .attr('stroke-width', 0.5)
        .style('filter', 'none')
    }

    hoveredValue.set(null)
    hoveredRegion.set(null)
  }

  function click(feature){
    mouseOut(feature)
    selectAll('.svgelements_' + feature.properties[$buurtCode])
      .raise()

    const newSelection = feature.properties[classNameVariable].replaceAll(' ','').replaceAll('(','').replaceAll(')','')
    if($currentView === 'Nederland'){
      gemeenteSelection.set(newSelection)
    }else{
      buurtSelection.set(newSelection)
    }
  }

  function getClassName(feature){
    let className = feature.properties[classNameVariable] + "_node_" + indicator.attribute
    return className.replaceAll(' ','').replaceAll('(','').replaceAll(')','')
  }

</script>

<svg class={'beeswarm_' + indicator.attribute}>
  <XAxis {xScale} height={h} {margin}/>

  <g class="inner-chart" transform="translate({margin.left}, {margin.top})">
    {#each nodes as node (node.id + indicator.attribute)}
      <circle class={getClassName(node) + ' ' + 'svgelements_' + node.properties[$buurtCode]}
      stroke={(node.properties[$buurtCode] === $buurtSelection) ? '#E1575A' : 'none'}
      style='filter: {(node.properties[$buurtCode] === $buurtSelection) ? 'drop-shadow(0 0 5px #36575A)' : 'none'}'
      cx={node.x} cy={node.y} r={(node.properties[$buurtCode] === $buurtSelection) ? '8' : '5'} fill={color(node.properties[indicator.attribute])} stroke-width='3'
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