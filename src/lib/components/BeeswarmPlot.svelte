<script>
  import { neighbourhoodSelection, neighbourhoodCodeAbbreviation, circleRadius, selectedNeighbourhoodJSONData, AHNSelecties } from "$lib/stores"
  import { extent, scaleLinear, scaleLog, select } from "d3"
  import XAxis from "$lib/components/XAxis.svelte"
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force"
  import { getClassName } from "$lib/noncomponents/getClassName"
  import { click, mouseOut, mouseOver } from "$lib/noncomponents/neighbourhoodMouseEvents"
  import { onMount } from "svelte"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let indicatorValueColorscale
  export let neighbourhoodsInMunicipalityFeaturesClone

  // filter out null values
  neighbourhoodsInMunicipalityFeaturesClone = neighbourhoodsInMunicipalityFeaturesClone.filter(
    (d) =>
      d.properties[getIndicatorAttribute(indicator, indicator.attribute)] !== null &&
      d.properties[getIndicatorAttribute(indicator, indicator.attribute)] !== "",
  )
  if (indicator.title === "Groen per inwoner") {
    neighbourhoodsInMunicipalityFeaturesClone = neighbourhoodsInMunicipalityFeaturesClone.filter(
      (d) => +d.properties[getIndicatorAttribute(indicator, indicator.attribute)] > 0,
    )
  }

  const margin = { bottom: 50, top: 20, left: 30, right: 30 }

  // Make indicatorAttribute reactive to AHNSelecties changes
  $: indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)
  
  // Get the compare year attribute if we're doing a difference calculation
  $: compareAttribute = $AHNSelecties[indicator.title] && 
    typeof $AHNSelecties[indicator.title] === 'object' && 
    $AHNSelecties[indicator.title].isDifference ? 
    indicator.attribute + $AHNSelecties[indicator.title].compareYear : null
  
  // Calculate difference values if we're doing a difference comparison
  $: differenceValues = compareAttribute ? 
    neighbourhoodsInMunicipalityFeaturesClone.map(d => {
      // Create a copy of the feature
      const featureCopy = {...d};
      // Calculate the difference between compare year and base year
      const baseValue = +d.properties[indicatorAttribute] || 0;
      const compareValue = +d.properties[compareAttribute] || 0;
      // Store the difference in a temporary property
      featureCopy.diffValue = compareValue - baseValue;
      return featureCopy;
    }) : null
  
  // Use either regular values or difference values based on whether we're doing a comparison
  $: plotData = differenceValues || neighbourhoodsInMunicipalityFeaturesClone
  
  // Make xScaleExtent reactive to indicatorAttribute changes
  $: xScaleExtent = differenceValues ? 
    extent(differenceValues, d => d.diffValue) : 
    extent(neighbourhoodsInMunicipalityFeaturesClone, d => +d.properties[indicatorAttribute])
    
  // Ensure the domain includes zero for difference plots and has appropriate padding
  $: xDomain = differenceValues ? 
    [Math.min(xScaleExtent[0], 0), Math.max(xScaleExtent[1], 0)] : 
    xScaleExtent

  $: xScaleBeeswarm =
    indicator.title !== "Groen per inwoner"
      ? scaleLinear()
          .domain(xDomain)
          .range([0, graphWidth - margin.left - margin.right])
          .nice()
      : scaleLog()
          .domain(xDomain)
          .range([0, graphWidth - margin.left - margin.right])
          .nice()

  // Create simulation but don't initialize with nodes yet
  let simulation = forceSimulation()
  let nodes = [] // Create an empty array to be populated when simulation ticks

  // Set up the tick handler
  simulation.on("tick", () => {
    nodes = simulation.nodes() // Repopulate and update
  })

  let alpha = 0.5

  // Create a reactive variable to track AHN selection changes
  $: currentAHNSelection = $AHNSelecties[indicator.title]

  // Store previous AHN selection to detect changes
  let prevAHNSelection = null

  // Run the simulation whenever the AHN selection changes
  $: {
    // Only trigger when currentAHNSelection actually changes
    if (currentAHNSelection !== prevAHNSelection) {
      prevAHNSelection = currentAHNSelection

      // Get the updated indicator attribute
      indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)

      // Restart the simulation with new data
      setTimeout(() => {
        runSimulation()
      }, 50) // Small delay to ensure reactive values have updated
    }
  }

  function runSimulation() {
    // Stop any existing simulation
    simulation.stop()

    // Create a new simulation with the nodes
    simulation = forceSimulation(plotData)
      .force("x", forceX((d) => {
        if (differenceValues) {
          return xScaleBeeswarm(d.diffValue);
        } else {
          return xScaleBeeswarm(+d.properties[indicatorAttribute]);
        }
      }).strength(0.7))
      .force("y", forceY().y(70).strength(0.05))
      .force("charge", forceManyBody().strength(0.2)) // Reduced from 0.5
      .force("collide", forceCollide().radius($circleRadius * 1.25))
      .alpha(0.3) // Reduced from 1 to lower initial energy
      .alphaDecay(0.02) // Increased from 0.005 to cool down faster

    // Set up the tick handler
    simulation.on("tick", () => {
      // Update nodes array to trigger Svelte reactivity
      nodes = simulation.nodes()
    })

    // Start the simulation
    simulation.restart()

    alpha = 0.2
  }

  onMount(() => {
    runSimulation()
  })

  // raise node on mount, hacky solution could be better
  $: if ($selectedNeighbourhoodJSONData) {
    setTimeout(() => {
      select("." + getClassName($selectedNeighbourhoodJSONData, "node", indicator, "indicator map")).raise()
    }, 1000)
  }
</script>

<XAxis xScale={xScaleBeeswarm} height={indicatorHeight} {margin} {indicator} />
{#if indicator.title === "Groen per inwoner"}
  <text x={graphWidth / 2} y={indicatorHeight - margin.bottom - 5} text-anchor="middle" font-size="13">Let op logaritmische schaal</text>
{/if}

<g class="inner-chart" transform="translate({margin.left}, {margin.top})">
  {#each nodes as node (node.index + indicatorAttribute)}
    <circle
      class={getClassName(node, "node", indicator, "") + " " + "svgelements_" + node.properties[$neighbourhoodCodeAbbreviation]}
      stroke={node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? "#E1575A" : "none"}
      class:selected-node={node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection}
      cx={node.x}
      cy={node.y}
      r={node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? $circleRadius + 3 : $circleRadius}
      fill={differenceValues ? 
        (node.diffValue > 0 ? "#4682b4" : node.diffValue < 0 ? "#b44646" : "#cccccc") : 
        indicatorValueColorscale(+node.properties[indicatorAttribute])}
      stroke-width="3"
      on:mouseover={(e) => {
        // If we're showing a difference plot, add the diffValue to the node properties
        // so the mouseOver handler can access it
        if (differenceValues) {
          node.properties.diffValue = node.diffValue;
        }
        mouseOver(e, node, indicator, "no map", indicatorValueColorscale, null, margin);
      }}
      on:mouseout={() => mouseOut(node, indicator, "no map")}
      on:click={() => click(node, indicator, "no map")}
    />
  {/each}
</g>

<style>
  .selected-node {
    filter: drop-shadow(0 0 5px #36575a);
  }
</style>
