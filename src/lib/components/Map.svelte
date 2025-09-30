<script>
  import {
    currentJSONData,
    neighbourhoodSelection,
    neighbourhoodCodeAbbreviation,
    AHNSelecties,
    getIndicatorStore,
    municipalitySelection,
  } from "$lib/stores"
  import { geoMercator, geoPath, select } from "d3"
  import { prepareJSONData } from "$lib/noncomponents/prepareJSONData.js"
  import { t } from "$lib/i18n/translate.js"
  import { getClassName } from "$lib/noncomponents/getClassName"
  import { click, mouseOver, mouseOut } from "$lib/noncomponents/neighbourhoodMouseEvents"
  import { getMostCommonClass } from "$lib/noncomponents/getMostCommonClass"
  import { getClassByIndicatorValue } from "$lib/noncomponents/getClassByIndicatorValue"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"
  import { onMount } from "svelte"

  // Leaflet imports for background map (only when main map)
  let L
  let leafletMap
  let mapContainer

  // Transparency and zoom controls
  let shapeOpacity = 0.7 // Default opacity for D3 shapes

  // Force reactivity when Leaflet map view changes
  let projectionUpdateCounter = 0

  // MIGRATED: Import centralized value retrieval system
  import {
    getNumericalValue,
    getCategoricalValue,
    getDifferenceValue,
    getAHNSelection,
    isValidValue,
    getRawValue,
  } from "$lib/noncomponents/valueRetrieval.js"

  // Removed unused exports for JSONdata and CSVdata
  export let mapWidth
  export let mapHeight
  export let mapType
  export let indicatorValueColorscale
  export let indicator

  // Define projection and path variables
  let projection
  let path

  // Data preparation is now handled in +page.js
  // No need to call prepareJSONData here

  $: topYPosition = mapType === "main map" ? 20 : 15

  // Create different projections for main map vs indicator maps
  $: {
    // Include projectionUpdateCounter to force reactivity
    projectionUpdateCounter

    if (mapType === "main map" && leafletMap) {
      // For main map: create a transform that syncs with Leaflet
      projection = createLeafletSyncedProjection()
    } else {
      // For indicator maps: use the original static projection
      projection = geoMercator().fitExtent(
        [
          [10, topYPosition],
          [mapWidth - 10, mapHeight - 45],
        ],
        $currentJSONData,
      )
    }
  }

  $: {
    path = geoPath(projection)
  }

  function createLeafletSyncedProjection() {
    return {
      stream: function (stream) {
        return {
          point: function (x, y) {
            const point = leafletMap.latLngToContainerPoint([y, x])
            stream.point(point.x, point.y)
          },
          lineStart: function () {
            stream.lineStart()
          },
          lineEnd: function () {
            stream.lineEnd()
          },
          polygonStart: function () {
            stream.polygonStart()
          },
          polygonEnd: function () {
            stream.polygonEnd()
          },
        }
      },
    }
  }

  function aggregatedMapInfo() {
    select(".tooltip-multi" + indicator.attribute).style("visibility", "visible")
  }

  function aggregatedMapInfoOut() {
    select(".tooltip-multi" + indicator.attribute).style("visibility", "hidden")
  }

  // Use dedicated indicator store for difference mode detection (naturally isolated)
  $: indicatorStore = indicator ? getIndicatorStore(indicator.title) : null
  $: isDifferenceMode = $indicatorStore && typeof $indicatorStore === "object" && $indicatorStore.isDifference

  // Pre-calculate difference values for map features to match BeeswarmPlot approach
  // Watch for changes to indicatorStore to recalculate when BEB selection changes
  $: differenceValues =
    isDifferenceMode && indicator && $indicatorStore
      ? $currentJSONData.features.map((d) => {
          const diffValue = getDifferenceValue(d, indicator)
          // Return the feature id and its difference value for lookup
          return {
            id: d.properties[$neighbourhoodCodeAbbreviation],
            diffValue: diffValue,
          }
        })
      : null

  // Declare both display attribute and original attribute variables
  let indicatorAttribute = null
  let originalAttribute = null

  // Set attributes for both display and coloring, matching BeeswarmPlot's approach
  $: {
    if (indicator && $indicatorStore) {
      // For display: use reactive attribute (may include _M2 suffix based on unit selection)
      indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)

      // For colors: always use original percentage attribute (consistent with BeeswarmPlot)
      if ($indicatorStore && $indicatorStore.baseYear) {
        originalAttribute = indicator.attribute + "_" + $indicatorStore.baseYear
      } else {
        originalAttribute = indicator.attribute
      }
    } else {
      indicatorAttribute = null
      originalAttribute = null
    }
  }

  // ALIGNED: Match BeeswarmPlot's color logic precisely for consistency
  function getMapFillColor(feature) {
    // Check if this is the main map (no indicator) - use whitesmoke
    if (!indicator) {
      return $neighbourhoodSelection === feature.properties[$neighbourhoodCodeAbbreviation] ? "#E1575A" : "whitesmoke"
    }

    if (indicator.numerical) {
      // Get feature ID for difference value lookup
      const featureId = feature.properties[$neighbourhoodCodeAbbreviation]

      if (isDifferenceMode && differenceValues) {
        // Find pre-calculated difference value from our lookup array
        const diffRecord = differenceValues.find((d) => d.id === featureId)
        const diffValue = diffRecord ? diffRecord.diffValue : null

        // Color based on difference value, matching BeeswarmPlot behavior
        return diffValue !== null && diffValue !== "" && !isNaN(diffValue) ? indicatorValueColorscale(diffValue) : "#000000"
      } else {
        // For non-difference mode, use the value retrieval system for BEB-aware coloring
        // This matches BeeswarmPlot which now uses: getRawValue(node, indicator)
        const value = getRawValue(feature, indicator)

        return value !== null && value !== "" && !isNaN(value) ? indicatorValueColorscale(value) : "#000000"
      }
    } else {
      // MIGRATED: Use centralized categorical value retrieval
      const categoricalValue = getCategoricalValue(feature, indicator)
      return categoricalValue !== null ? indicatorValueColorscale(categoricalValue) : "#000000"
    }
  }

  // Leaflet background map setup for main map only
  onMount(async () => {
    if (mapType === "main map") {
      // Dynamically import Leaflet to avoid SSR issues
      L = (await import("leaflet")).default
    }
  })

  // Initialize map when container and dimensions are available
  $: if (L && mapContainer && mapWidth && mapHeight && mapType === "main map" && !leafletMap) {
    initializeLeafletMap()
  }

  function initializeLeafletMap() {
    if (!L || !mapContainer || leafletMap) return

    leafletMap = L.map(mapContainer, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      tap: true,
      touchZoom: true,
      // Enhanced mobile support
      bounceAtZoomLimits: false,
    })

    // Add a subtle tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      opacity: 0.5,
      attribution: "",
    }).addTo(leafletMap)

    // Ensure Leaflet map can receive wheel events
    leafletMap.getContainer().style.pointerEvents = "auto"

    // Make Leaflet map instance available globally for tooltip positioning
    window.leafletMapInstance = leafletMap

    // Add event listeners to update D3 projection when Leaflet view changes
    leafletMap.on("zoomstart", updateProjectionImmediate) // Immediate response when zoom begins
    leafletMap.on("zoom", updateProjection)
    leafletMap.on("zoomanim", updateProjection) // Fires continuously during zoom animation
    leafletMap.on("zoomend", updateProjection) // Fires when zoom animation ends
    leafletMap.on("move", updateProjection)
    leafletMap.on("moveend", updateProjection) // Fires when move animation ends
    leafletMap.on("viewreset", updateProjection)

    // Fit map to current data when available
    if ($currentJSONData && $currentJSONData.features) {
      fitMapToBounds()
      // Trigger initial projection update after fitting bounds
      setTimeout(() => {
        updateProjection()
      }, 100)
    }
  }

  function fitMapToBounds() {
    if (!leafletMap || !$currentJSONData) return

    const bounds = L.geoJSON($currentJSONData).getBounds()
    if (bounds.isValid()) {
      leafletMap.fitBounds(bounds, { padding: [10, 10] })
    }
  }

  let updateProjectionTimeout

  // Immediate update for zoom start - no delay
  function updateProjectionImmediate() {
    if (mapType === "main map") {
      projectionUpdateCounter++
    }
  }

  // Throttled update for continuous events
  function updateProjection() {
    if (mapType === "main map") {
      // Use requestAnimationFrame for smooth updates during animation
      if (updateProjectionTimeout) {
        cancelAnimationFrame(updateProjectionTimeout)
      }
      updateProjectionTimeout = requestAnimationFrame(() => {
        // Trigger reactive update by incrementing counter
        projectionUpdateCounter++
        updateProjectionTimeout = null
      })
    }
  }

  // Zoom on municipality changes, but not on neighborhood changes
  // Track previous selections to detect what actually changed
  let previousMunicipalitySelection = null
  let previousNeighbourhoodSelection = null

  $: if (leafletMap && mapType === "main map" && $currentJSONData) {
    const municipalityChanged = $municipalitySelection !== previousMunicipalitySelection
    const neighbourhoodChanged = $neighbourhoodSelection !== previousNeighbourhoodSelection

    // Only zoom if municipality changed, or if we're selecting a municipality for the first time
    if (municipalityChanged && ($municipalitySelection || previousMunicipalitySelection !== null)) {
      fitMapToBounds()
    }
    // Don't zoom if only neighborhood changed

    previousMunicipalitySelection = $municipalitySelection
    previousNeighbourhoodSelection = $neighbourhoodSelection
  }
</script>

{#if mapType === "main map"}
  <div class="map-container">
    <!-- Background Leaflet map -->
    <div class="leaflet-background" bind:this={mapContainer}></div>
    <!-- SVG overlay -->
    <svg class="main-map" style="filter:drop-shadow(0 0 15px rgb(160, 160, 160))">
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      {#if $currentJSONData.features}
        {#each $currentJSONData.features as feature, i}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <path
            d={path(feature)}
            class={getClassName(feature, "path", indicator, mapType) + " " + "svgelements_" + feature.properties[$neighbourhoodCodeAbbreviation]}
            fill={(isDifferenceMode, indicatorValueColorscale, $AHNSelecties, getMapFillColor(feature))}
            stroke={mapType === "main map"
              ? "grey"
              : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
                ? "#E1575A"
                : "white"}
            style="filter:{feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? 'drop-shadow(0 0 15px black)' : 'none'}"
            fill-opacity={mapType === "main map" ? shapeOpacity : 1}
            stroke-width={mapType === "main map" ? "1" : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? "3" : "0.5"}
            cursor="pointer"
            on:mouseover={(e) => mouseOver(e, feature, indicator, mapType, indicatorValueColorscale, projection)}
            on:mouseout={() => mouseOut(feature, indicator, mapType)}
            on:click={() => click(feature, indicator, mapType)}
            on:touchstart={(e) => {
              // Show tooltip on touch for mobile devices
              mouseOver(e.touches[0], feature, indicator, mapType, indicatorValueColorscale, projection)
            }}
            on:touchend={() => {
              // Hide tooltip when touch ends
              setTimeout(() => mouseOut(feature, indicator, mapType), 1000)
            }}
            on:wheel={(e) => {
              if (mapType === "main map" && leafletMap) {
                // Forward wheel events to Leaflet map for zooming
                e.preventDefault()
                const mapEvent = new WheelEvent("wheel", {
                  deltaY: e.deltaY,
                  clientX: e.clientX,
                  clientY: e.clientY,
                  bubbles: true,
                })
                leafletMap.getContainer().dispatchEvent(mapEvent)
              }
            }}
            on:mousedown={(e) => {
              if (mapType === "main map" && leafletMap) {
                // Forward mouse events to Leaflet for dragging
                const mapEvent = new MouseEvent("mousedown", {
                  clientX: e.clientX,
                  clientY: e.clientY,
                  bubbles: true,
                  button: e.button,
                })
                leafletMap.getContainer().dispatchEvent(mapEvent)
              }
            }}
            on:mousemove={(e) => {
              if (mapType === "main map" && leafletMap && e.buttons > 0) {
                // Forward mousemove when dragging
                const mapEvent = new MouseEvent("mousemove", {
                  clientX: e.clientX,
                  clientY: e.clientY,
                  bubbles: true,
                  buttons: e.buttons,
                })
                leafletMap.getContainer().dispatchEvent(mapEvent)
              }
            }}
            on:mouseup={(e) => {
              if (mapType === "main map" && leafletMap) {
                // Forward mouse up events
                const mapEvent = new MouseEvent("mouseup", {
                  clientX: e.clientX,
                  clientY: e.clientY,
                  bubbles: true,
                  button: e.button,
                })
                leafletMap.getContainer().dispatchEvent(mapEvent)
              }
            }}
          />
        {/each}
      {/if}
      {#if indicator && indicator.aggregatedIndicator === true}
        <image
          href="info.png"
          opacity="0.7"
          width="20"
          y="5"
          x={mapWidth - 25}
          on:mouseover={() => aggregatedMapInfo()}
          on:mouseout={() => aggregatedMapInfoOut()}
        />
      {/if}
    </svg>
    <!-- Transparency control -->
    <div class="transparency-control">
      <label for="opacity-slider">Transparantie</label>
      <input id="opacity-slider" type="range" min="0.1" max="1" step="0.1" bind:value={shapeOpacity} class="opacity-slider" />
    </div>
  </div>
{:else}
  <svg class={"indicator-map-" + indicator.attribute} style="filter:drop-shadow(0 0 15px rgb(160, 160, 160))">
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if $currentJSONData.features}
      {#each $currentJSONData.features as feature, i}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <path
          d={path(feature)}
          class={getClassName(feature, "path", indicator, mapType) + " " + "svgelements_" + feature.properties[$neighbourhoodCodeAbbreviation]}
          fill={(isDifferenceMode, indicatorValueColorscale, $AHNSelecties, getMapFillColor(feature))}
          stroke={mapType === "main map"
            ? "grey"
            : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
              ? "#E1575A"
              : "white"}
          style="filter:{feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? 'drop-shadow(0 0 15px black)' : 'none'}"
          fill-opacity={mapType === "main map" ? shapeOpacity : 1}
          stroke-width={mapType === "main map" ? "1" : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? "3" : "0.5"}
          cursor="pointer"
          on:mouseover={(e) => mouseOver(e, feature, indicator, mapType, indicatorValueColorscale, projection)}
          on:mouseout={() => mouseOut(feature, indicator, mapType)}
          on:click={() => click(feature, indicator, mapType)}
          on:touchstart={(e) => {
            // Show tooltip on touch for mobile devices
            mouseOver(e.touches[0], feature, indicator, mapType, indicatorValueColorscale, projection)
          }}
          on:touchend={() => {
            // Hide tooltip when touch ends
            setTimeout(() => mouseOut(feature, indicator, mapType), 1000)
          }}
          on:wheel={(e) => {
            if (mapType === "main map" && leafletMap) {
              // Forward wheel events to Leaflet map for zooming
              e.preventDefault()
              const mapEvent = new WheelEvent("wheel", {
                deltaY: e.deltaY,
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
              })
              leafletMap.getContainer().dispatchEvent(mapEvent)
            }
          }}
          on:mousedown={(e) => {
            if (mapType === "main map" && leafletMap) {
              // Forward mouse events to Leaflet for dragging
              const mapEvent = new MouseEvent("mousedown", {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
                button: e.button,
              })
              leafletMap.getContainer().dispatchEvent(mapEvent)
            }
          }}
          on:mousemove={(e) => {
            if (mapType === "main map" && leafletMap && e.buttons > 0) {
              // Forward mousemove when dragging
              const mapEvent = new MouseEvent("mousemove", {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
                buttons: e.buttons,
              })
              leafletMap.getContainer().dispatchEvent(mapEvent)
            }
          }}
          on:mouseup={(e) => {
            if (mapType === "main map" && leafletMap) {
              // Forward mouse up events
              const mapEvent = new MouseEvent("mouseup", {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
                button: e.button,
              })
              leafletMap.getContainer().dispatchEvent(mapEvent)
            }
          }}
        />
      {/each}
    {/if}
    {#if indicator && indicator.aggregatedIndicator === true}
      <image
        href="info.png"
        opacity="0.7"
        width="20"
        y="5"
        x={mapWidth - 25}
        on:mouseover={() => aggregatedMapInfo()}
        on:mouseout={() => aggregatedMapInfoOut()}
      />
    {/if}
  </svg>
{/if}

{#if indicator && indicator.aggregatedIndicator === true}
  <div class={"tooltip-multi tooltip-multi" + indicator.attribute}>
    <p>{t("multi-indicator-map-explanation")}</p>
  </div>
{/if}

<style>
  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  svg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    pointer-events: none;
  }

  svg path {
    pointer-events: auto;
  }

  /* Enable pointer events for info icons */
  svg image[href="info.png"] {
    pointer-events: auto;
  }

  /* Ensure mouse wheel events pass through shapes to Leaflet map */
  svg path:hover {
    fill-opacity: 1 !important;
  }

  .leaflet-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: auto;
  }

  .transparency-control {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 3;
    font-size: 12px;
    text-align: center;
  }

  .transparency-control label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #333;
  }

  .opacity-slider {
    width: 100px;
    height: 4px;
    background: #ddd;
    outline: none;
    border-radius: 2px;
    cursor: pointer;
  }

  .opacity-slider::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    background: #e1575a;
    border-radius: 50%;
    cursor: pointer;
  }

  .opacity-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #e1575a;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .main-map {
    background: transparent;
  }

  .tooltip-multi {
    visibility: hidden;
    position: absolute;
    width: 200px;
    background-color: white;
    right: 40px;
    top: 0;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 20px;
    padding: 0px 10px 0px 10px;
    z-index: 10;
  }

  /* CSS transitions for smooth shape animation during reprojection */
  /* Match Leaflet's default zoom animation duration of 0.25s */
  svg path {
    transition: d 0.21s ease-out;
  }

  svg circle {
    transition:
      cx 0.21s ease-out,
      cy 0.21s ease-out;
  }

  svg image {
    transition:
      x 0.21s ease-out,
      y 0.21s ease-out;
  }

  /* Import Leaflet CSS when needed */
  :global(.leaflet-container) {
    background: transparent;
  }
</style>
