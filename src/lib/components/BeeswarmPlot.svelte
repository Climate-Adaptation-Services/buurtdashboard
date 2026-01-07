<script>
  import { neighbourhoodSelection, neighbourhoodCodeAbbreviation, circleRadius, selectedNeighbourhoodJSONData, getIndicatorStore } from "$lib/stores"
  import { extent, scaleLinear, scaleLog, select } from "d3"
  import XAxis from "$lib/components/XAxis.svelte"
  import { forceSimulation, forceY, forceX, forceCollide, forceManyBody } from "d3-force"
  import { getClassName } from "$lib/utils/getClassName"
  import { click, mouseOut, mouseOver } from "$lib/events/neighbourhoodMouseEvents"
  import { onMount, onDestroy, tick } from "svelte"
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
  // Use dutchTitle for store key to ensure consistency across languages
  const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)

  // Declare filtered data to be populated reactively
  let baseFilteredData = []

  // Reactive data filtering using value retrieval system
  $: {
    if ($indicatorStore) {
      // MIGRATED: Filter using centralized value retrieval system
      baseFilteredData = neighbourhoodsInMunicipalityFeaturesClone.filter((d) => {
        const rawValue = getRawValue(d, indicator)
        // For beeswarm plots, we need valid values (filters out null, empty, -9999, etc.)
        return isValidValue(rawValue)
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
    const variants = indicator.variants ? indicator.variants.split(',').map(v => v.trim()) : []
    const bebVariant = variants.find(v => v !== 'M2' && v !== '') // Find the BEB variant (not M2)
    if (bebVariant) {
      const bebSelection = ahnSelection.beb || 'hele_buurt'
      if (bebSelection === 'bebouwde_kom') {
        baseAttribute = baseAttribute + '_' + bebVariant
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

  // Debounce timer for simulation restarts
  let simulationDebounceTimer = null
  let previousBEB = null

  // FIXED: Let Svelte handle reactivity naturally - run simulation when AHN selection changes
  $: {
    // This reactive block will trigger whenever this indicator's store changes OR indicatorAttribute changes
    const currentSelection = $indicatorStore
    const currentIndicatorAttribute = indicatorAttribute
    const currentBEB = currentSelection?.beb || 'hele_buurt'

    // Only restart simulation if we have a valid indicator attribute
    if (currentIndicatorAttribute) {
      // Debounce simulation restarts to prevent multiple rapid restarts
      if (simulationDebounceTimer) {
        clearTimeout(simulationDebounceTimer)
      }

      // Detect BEB change - if BEB changed, clear previous positions
      // This allows nodes to reposition from their new data values
      const bebChanged = previousBEB !== null && previousBEB !== currentBEB
      if (bebChanged) {
        previousNodePositions = {}  // Clear positions so nodes use new starting positions
      }
      previousBEB = currentBEB

      // Minimal debounce to prevent rapid-fire updates
      const debounceDelay = 50

      simulationDebounceTimer = setTimeout(() => {
        runSimulation()
        simulationDebounceTimer = null
      }, debounceDelay)
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

    // Adaptive simulation parameters based on dataset size - DECLARE FIRST
    const nodeCount = plotData.length
    const isMediumDataset = nodeCount > 40   // Medium: 40-70 neighborhoods
    const isLargeDataset = nodeCount > 70    // Large: 70-100 neighborhoods
    const isVeryLargeDataset = nodeCount > 100  // Very large: 100+ neighborhoods

    // Apply previous positions to new data if available
    // For large and very large datasets, initialize directly at target position
    plotData.forEach((d) => {
      const id = d.properties && d.properties[$neighbourhoodCodeAbbreviation]
      if (id && previousNodePositions[id]) {
        d.x = previousNodePositions[id].x
        d.y = previousNodePositions[id].y
      } else if (isLargeDataset || isVeryLargeDataset) {
        // Pre-position nodes at their target X location to avoid sliding in
        if (differenceValues) {
          d.x = xScaleBeeswarm(d.diffValue)
        } else {
          const value = getRawValue(d, indicator)
          d.x = xScaleBeeswarm(+value)
        }
        d.y = 70  // Start at center Y
      }
    })

    // Adjust parameters for large datasets to improve performance
    // Very large (>100): Higher energy for better spreading, fast decay, hard stop at 5 ticks
    // Large (70-100): Quick freeze to prevent jiggling
    // Medium (40-70): Moderate optimization - balance speed and smoothness
    const xStrength = isVeryLargeDataset ? 1.0 : isLargeDataset ? 0.9 : isMediumDataset ? 0.7 : 0.5
    const yStrength = isVeryLargeDataset ? 0.08 : isLargeDataset ? 0.02 : 0.05  // Increased Y force for better vertical spreading
    const alphaValue = isVeryLargeDataset ? 0.4 : isLargeDataset ? 0.15 : isMediumDataset ? 0.3 : 0.4
    const alphaDecayRate = isVeryLargeDataset ? 0.7 : isLargeDataset ? 0.3 : isMediumDataset ? 0.03 : 0.015
    const maxTicks = isVeryLargeDataset ? 5 : isLargeDataset ? 5 : isMediumDataset ? 10 : 15

    // Create a new simulation with the nodes
    // For very large datasets, use higher collision strength for quick separation
    // For large datasets, use weaker collision to prevent jiggling
    const collisionStrength = isVeryLargeDataset ? 0.8 : isLargeDataset ? 0.15 : 1.0
    const collisionGap = isVeryLargeDataset ? 1.0 : isLargeDataset ? 2.0 : 1.5  // Tighter gap for very large datasets
    const collisionRadius = $circleRadius + collisionGap

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
        }).strength(xStrength), // Increased strength for large datasets for faster convergence
      )
      .force("y", forceY().y(70).strength(yStrength))  // Adaptive Y force
      .force("charge", forceManyBody().strength(0.3))  // Keep original charge force
      .force("collide", forceCollide().radius(collisionRadius).strength(collisionStrength))
      .alpha(alphaValue)
      .alphaDecay(alphaDecayRate)
      .alphaMin(0.001)

    // Set up the tick handler with adaptive tick limit
    let tickCount = 0

    simulation.on("tick", () => {
      tickCount++

      // For large and very large datasets, force stop after max ticks to prevent jiggling
      if ((isLargeDataset || isVeryLargeDataset) && tickCount >= maxTicks) {
        // Freeze positions by copying to a new array to prevent further updates
        const frozenNodes = simulation.nodes().map(node => ({
          ...node,
          x: node.x,
          y: node.y,
          vx: 0,  // Zero out velocity
          vy: 0   // Zero out velocity
        }))

        // Completely kill the simulation
        simulation.alpha(0)
        simulation.stop()

        // Update with frozen positions
        nodes = frozenNodes
        return
      }

      // Update nodes array to trigger Svelte reactivity (only if simulation continues)
      nodes = simulation.nodes()

      // Apply extra force only during the first few ticks
      if (tickCount < maxTicks) {
        // NO reheat for large/very large datasets - let them cool quickly
        const reheatTicks = isVeryLargeDataset ? 0 : isLargeDataset ? 2 : 5
        if (tickCount < reheatTicks) {
          simulation.alpha(alphaValue)
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

  // CRITICAL: Stop simulation when component unmounts
  onDestroy(() => {
    // Clear any pending debounce timer
    if (simulationDebounceTimer) {
      clearTimeout(simulationDebounceTimer)
      simulationDebounceTimer = null
    }

    // Stop the simulation completely
    if (simulation) {
      simulation.stop()
      // Remove all nodes to free memory
      simulation.nodes([])
    }
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
