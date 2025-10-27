<script>
  import { neighbourhoodSelection, neighbourhoodCodeAbbreviation, circleRadius, selectedNeighbourhoodJSONData, getIndicatorStore } from "$lib/stores"
  import { extent, scaleLinear, scaleLog, select } from "d3"
  import XAxis from "$lib/components/XAxis.svelte"
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force"
  import { getClassName } from "$lib/utils/getClassName"
  import { click, mouseOut, mouseOver } from "$lib/events/neighbourhoodMouseEvents"
  import { onMount, tick } from "svelte"
  import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute"
  import { getGlobalExtent } from "$lib/utils/getGlobalExtent"

  // MIGRATED: Import centralized value retrieval system
  import { getNumericalValue, getDifferenceValue, getAHNSelection, isValidValue, getRawValue } from "$lib/utils/valueRetrieval.js"

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let indicatorValueColorscale
  export let neighbourhoodsInMunicipalityFeaturesClone

  // Get the dedicated store for this specific indicator - naturally isolated!
  const indicatorStore = getIndicatorStore(indicator.title)

  // Declare filtered data to be populated reactively
  let baseFilteredData = []

  // Reactive data filtering using value retrieval system
  $: {
    if ($indicatorStore) {
      // MIGRATED: Filter using centralized value retrieval system
      baseFilteredData = neighbourhoodsInMunicipalityFeaturesClone.filter((d) => {
        const rawValue = getRawValue(d, indicator)
        // For beeswarm plots, we need values that exist and are not null/empty
        return rawValue !== null && rawValue !== ""
      })

      // Special case for "Groen per inwoner" - filter out zero and negative values
      if (indicator.title === "Groen per inwoner") {
        baseFilteredData = baseFilteredData.filter((d) => {
          const numericalValue = getNumericalValue(d, indicator)
          return numericalValue !== null && numericalValue > 0
        })
      }
    }
  }

  const margin = { bottom: 50, top: 20, left: 30, right: 30 }

  // Declare indicatorAttribute variable
  let indicatorAttribute = null
  
  // Declare original attribute for consistent colors (always percentage values)
  let originalAttribute = null

  // Set indicatorAttribute for positioning and use value retrieval for colors
  $: {
    const ahnSelection = $indicatorStore || {}
    
    // Create base attribute considering BEB selection
    let baseAttribute = indicator.attribute
    if (indicator.variants && indicator.variants.split(',').map(v => v.trim()).includes('1')) {
      const bebSelection = ahnSelection.beb || 'hele_buurt'
      if (bebSelection === 'bebouwde_kom') {
        baseAttribute = baseAttribute + '_1'
      }
    }
    
    // For positioning: use reactive attribute (may include _BEB and year suffixes)
    indicatorAttribute = getIndicatorAttribute(indicator, baseAttribute)
    
    // For colors: we'll use the value retrieval system directly in the template
    // This ensures consistency with the rest of the application
    originalAttribute = indicatorAttribute // Keep this for backward compatibility but use getRawValue for colors
  }

  // Use dedicated indicator store for difference mode detection (naturally isolated)
  $: isDifferenceMode = $indicatorStore && typeof $indicatorStore === "object" && $indicatorStore.isDifference

  // Calculate difference values reactive only to this indicator's selection
  $: differenceValues =
    isDifferenceMode && $indicatorStore && baseFilteredData.length > 0
      ? baseFilteredData.map((d) => {
          // Create a copy of the feature
          const featureCopy = { ...d }

          // Use centralized difference calculation (will be reactive to the store dependency above)
          const diffValue = getDifferenceValue(d, indicator)
          featureCopy.diffValue = diffValue

          // Ensure the neighborhood code is preserved for stable identity
          featureCopy.properties = featureCopy.properties || {}
          featureCopy.properties[$neighbourhoodCodeAbbreviation] = d.properties[$neighbourhoodCodeAbbreviation]
          return featureCopy
        })
      : null

  // Use either regular values or difference values based on whether we're doing a comparison
  $: plotData = differenceValues || baseFilteredData

  // Calculate global min and max values across all AHN versions for this indicator
  $: globalExtent = getGlobalExtent(indicator, baseFilteredData, !!differenceValues, indicatorAttribute)

  // Make xScaleExtent reactive to indicatorAttribute changes
  $: xScaleExtent = differenceValues
    ? extent(differenceValues, (d) => d.diffValue)
    : extent(baseFilteredData, (d) => {
        const value = getRawValue(d, indicator)
        return +value
      })

  // Ensure the domain includes zero for difference plots and has appropriate padding
  // For base year view, use the global extent to keep axis consistent across AHN selections
  $: xDomain = differenceValues ? [Math.min(xScaleExtent[0], 0), Math.max(xScaleExtent[1], 0)] : globalExtent

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

  // FIXED: Let Svelte handle reactivity naturally - run simulation when AHN selection changes
  $: {
    // This reactive block will trigger whenever this indicator's store changes OR indicatorAttribute changes
    const currentSelection = $indicatorStore
    const currentIndicatorAttribute = indicatorAttribute

    // Only restart simulation if we have a valid indicator attribute
    if (currentIndicatorAttribute) {
      // Restart the simulation with new data
      setTimeout(() => {
        runSimulation()
      }, 50) // Small delay to ensure reactive values have updated
    }
  }

  // Store previous node positions for smooth transitions
  let previousNodePositions = {}

  function runSimulation() {
    // Store current positions before stopping simulation
    if (nodes && nodes.length > 0) {
      nodes.forEach((node) => {
        if (node.properties && node.properties[$neighbourhoodCodeAbbreviation]) {
          previousNodePositions[node.properties[$neighbourhoodCodeAbbreviation]] = {
            x: node.x || 0,
            y: node.y || 0,
          }
        }
      })
    }

    // Stop any existing simulation
    simulation.stop()

    // Apply previous positions to new data if available
    plotData.forEach((d) => {
      const id = d.properties && d.properties[$neighbourhoodCodeAbbreviation]
      if (id && previousNodePositions[id]) {
        d.x = previousNodePositions[id].x
        d.y = previousNodePositions[id].y
      }
    })

    // Create a new simulation with the nodes
    simulation = forceSimulation(plotData)
      .force(
        "x",
        forceX((d) => {
          if (differenceValues) {
            // Use the pre-calculated difference value
            return xScaleBeeswarm(d.diffValue)
          } else {
            const value = getRawValue(d, indicator)
            return xScaleBeeswarm(+value)
          }
        }).strength(0.5),
      )
      .force("y", forceY().y(70).strength(0.05))
      .force("charge", forceManyBody().strength(0.3)) // Moderate increase for initial repulsion
      .force("collide", forceCollide().radius($circleRadius * 1.25))
      .alpha(0.4) // Lower initial energy for smoother transitions
      .alphaDecay(0.015) // Balanced decay rate

    // Set up the tick handler with a moderate boost at initialization only
    let tickCount = 0
    const maxInitialTicks = 15 // Fewer boosted ticks

    simulation.on("tick", () => {
      // Update nodes array to trigger Svelte reactivity
      nodes = simulation.nodes()

      // Apply extra force only during the first few ticks
      if (tickCount < maxInitialTicks) {
        tickCount++
        // Moderate reheat only for the first 5 ticks
        if (tickCount < 5) {
          simulation.alpha(0.4) // Less aggressive reheat
        }
      }
    })

    // Start the simulation
    simulation.restart()

    alpha = 0.2
  }

  onMount(() => {
    // Run simulation with a slight delay to ensure DOM is ready
    setTimeout(() => {
      runSimulation()
    }, 10)
  })

  // Raise selected node whenever selection changes - reactive to ensure visibility on top
  $: if ($selectedNeighbourhoodJSONData && $selectedNeighbourhoodJSONData.properties && nodes && nodes.length > 0) {
    tick().then(() => {
      requestAnimationFrame(() => {
        try {
          const className = getClassName($selectedNeighbourhoodJSONData, "node", indicator, "indicator map")
          const element = select("." + className)
          if (element && element.node()) {
            element.raise()
          }
        } catch (e) {
          // Silently fail if element not found yet
          console.log('Could not raise beeswarm node yet:', e)
        }
      })
    })
  }
</script>

<XAxis xScale={xScaleBeeswarm} height={indicatorHeight} {margin} {indicator} />
{#if indicator.title === "Groen per inwoner"}
  {#if graphWidth > 0}
    <text x={graphWidth / 2} y={indicatorHeight - margin.bottom - 5} text-anchor="middle" font-size="13">Let op logaritmische schaal</text>
  {/if}
{/if}

<g class="inner-chart" transform="translate({margin.left}, {margin.top})">
  {#each nodes as node (node.properties[$neighbourhoodCodeAbbreviation])}
    <circle
      class={getClassName(node, "node", indicator, "") + " " + "svgelements_" + node.properties[$neighbourhoodCodeAbbreviation]}
      stroke={node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? "#E1575A" : "none"}
      class:selected-node={node.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection}
      cx={node.x}
      cy={node.y}
      r={$circleRadius}
      fill={differenceValues
        ? indicatorValueColorscale(node.diffValue)
        : indicatorValueColorscale(getRawValue(node, indicator))
      }
      stroke-width="3"
      on:mouseover={(e) => {
        // If we're showing a difference plot, add the diffValue to the node properties
        // so the mouseOver handler can access it
        if (differenceValues) {
          node.properties.diffValue = node.diffValue
        }
        mouseOver(e, node, indicator, "no map", indicatorValueColorscale, null, margin)
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
  
  /* Use CSS custom properties for highlighting instead of reactive DOM attributes */
  .inner-chart circle[data-neighbourhood] {
    stroke: none;
    stroke-width: 3;
  }
  
  /* This selector won't work as intended - need a different approach */
</style>
