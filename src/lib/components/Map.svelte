<script>
  import {
    currentJSONData,
    neighbourhoodSelection,
    neighbourhoodCodeAbbreviation,
    AHNSelecties,
    getIndicatorStore,
    municipalitySelection,
    isUpdatingIndicators,
  } from "$lib/stores"
  import { geoMercator, geoPath, select, selectAll } from "d3"
  import { t } from "$lib/i18n/translate.js"
  import MapPath from "./MapPath.svelte"
  import { onMount, tick } from "svelte"
  import { LeafletMapManager } from "$lib/map/LeafletMapManager.js"
  import { sanitizeClassName } from "$lib/utils/sanitizeClassName.js"

  // Leaflet map manager
  let mapManager = new LeafletMapManager()
  let mapContainer

  // Transparency and zoom controls
  let shapeOpacity = 0.7 // Default opacity for D3 shapes

  // Force reactivity when Leaflet map view changes
  let projectionUpdateCounter = 0

  // Track current operation for different transition speeds
  let isZooming = false
  let isPanning = false

  // Reactive variable for Leaflet map
  let leafletMap = null
  let leafletReady = false
  let mapInitializedWithData = false  // Track if map has center/zoom set
  $: {
    leafletMap = mapManager.getMap()
  }

  import {
    calculateDifferenceValues,
    calculateIndicatorAttributes,
    getMapFillColor as getMapFillColorUtil
  } from "$lib/map/mapColorUtils.js"

  // Removed unused exports for JSONdata and CSVdata
  export let mapWidth
  export let mapHeight
  export let mapType
  export let indicatorValueColorscale
  export let indicator
  export let isLoading = false

  // Define projection and path variables
  let projection
  let path

  // Data preparation is now handled in +page.js

  $: topYPosition = mapType === "main map" ? 20 : 15

  // Create different projections for main map vs indicator maps
  $: {
    // Include projectionUpdateCounter to force reactivity
    projectionUpdateCounter

    if (mapType === "main map") {
      // For main map: only create projection when Leaflet is fully initialized with data
      if (mapManager.getMap() && mapInitializedWithData) {
        projection = mapManager.createLeafletSyncedProjection()
      } else {
        projection = null // Don't create projection until map is ready
      }
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
    path = projection ? geoPath(projection) : null
  }

  function aggregatedMapInfo() {
    const className = ".tooltip-multi" + sanitizeClassName(indicator.title)
    select(className).style("visibility", "visible")
  }

  function aggregatedMapInfoOut() {
    const className = ".tooltip-multi" + sanitizeClassName(indicator.title)
    select(className).style("visibility", "hidden")
  }

  // Use dedicated indicator store for difference mode detection (naturally isolated)
  // Use dutchTitle for store key to ensure consistency across languages
  $: indicatorStore = indicator ? getIndicatorStore(indicator.dutchTitle || indicator.title) : null
  $: isDifferenceMode = $indicatorStore && typeof $indicatorStore === "object" && $indicatorStore.isDifference

  // Pre-calculate difference values for map features to match BeeswarmPlot approach
  // Watch for changes to indicatorStore to recalculate when BEB selection changes
  $: differenceValues = calculateDifferenceValues(
    $currentJSONData,
    indicator,
    $indicatorStore,
    $neighbourhoodCodeAbbreviation
  )

  // Calculate indicator attributes for both display and coloring
  $: ({ indicatorAttribute, originalAttribute } = calculateIndicatorAttributes(indicator, $indicatorStore))

  // ALIGNED: Match BeeswarmPlot's color logic precisely for consistency
  function getMapFillColor(feature) {
    return getMapFillColorUtil(
      feature,
      indicator,
      isDifferenceMode,
      differenceValues,
      $neighbourhoodSelection,
      $neighbourhoodCodeAbbreviation,
      indicatorValueColorscale
    )
  }

  // Leaflet background map setup for main map only
  onMount(async () => {
    if (mapType === "main map") {
      await mapManager.initializeLeaflet()

      // Set up callbacks
      mapManager.setProjectionUpdateCallback((counter) => {
        projectionUpdateCounter = counter
      })

      mapManager.setStateChangeCallback((state) => {
        isZooming = state.isZooming
        isPanning = state.isPanning
      })
      leafletReady = true
    }
  })

  // Initialize map when container and dimensions are available
  $: {
    if (leafletReady && mapContainer && mapWidth && mapHeight && mapType === "main map" && !mapManager.getMap()) {
      const success = mapManager.initializeMap(mapContainer, mapWidth, mapHeight)
      if (success && $currentJSONData && $currentJSONData.features) {
        mapManager.initializeWithData($currentJSONData)
        mapInitializedWithData = true
      }
    }
  }

  // Initialize map with data when data arrives after map creation
  $: {
    if (mapManager.getMap() && mapType === "main map" && $currentJSONData && $currentJSONData.features && !mapInitializedWithData) {
      mapManager.initializeWithData($currentJSONData)
      mapInitializedWithData = true
    }
  }

  // Handle selection changes for zooming
  $: if (mapManager.getMap() && mapType === "main map" && $currentJSONData && mapInitializedWithData) {
    mapManager.handleSelectionChange($municipalitySelection, $neighbourhoodSelection, $currentJSONData, $isUpdatingIndicators)
  }

  // Raise selected neighborhood elements to ensure they appear on top
  $: if ($neighbourhoodSelection) {
    tick().then(() => {
      requestAnimationFrame(() => {
        // Raise all SVG elements with the selected neighborhood code
        selectAll(`.svgelements_${$neighbourhoodSelection}`).raise()
      })
    })
  }
</script>

{#if mapType === "main map"}
  <div class="map-container">
    <!-- Background Leaflet map -->
    <div class="leaflet-background" bind:this={mapContainer}></div>
    {#if isLoading || !leafletReady || !mapManager.getMap() || !mapInitializedWithData || !projection || !path}
      <!-- Loading overlay -->
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Gegevens laden...</p>
      </div>
    {:else}
      <!-- SVG overlay -->
      <svg class="main-map {isZooming ? 'zooming' : ''} {isPanning ? 'panning' : ''}" style="filter:drop-shadow(0 0 15px rgb(160, 160, 160))">
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#if $currentJSONData.features}
          {#each $currentJSONData.features as feature, i}
            <MapPath
              {feature}
              {indicator}
              {mapType}
              {path}
              {getMapFillColor}
              {shapeOpacity}
              {indicatorValueColorscale}
              {projection}
              {leafletMap}
              {isDifferenceMode}
              AHNSelecties={$AHNSelecties}
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
    {/if}
  </div>
{:else}
  <svg class={"indicator-map-" + sanitizeClassName(indicator.title)} style="filter:drop-shadow(0 0 15px rgb(160, 160, 160))">
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if $currentJSONData.features && path && projection}
      {#each $currentJSONData.features as feature, i}
        <MapPath
          {feature}
          {indicator}
          {mapType}
          {path}
          {getMapFillColor}
          {shapeOpacity}
          {indicatorValueColorscale}
          {projection}
          leafletMap={null}
          {isDifferenceMode}
          AHNSelecties={$AHNSelecties}
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
  <div class={"tooltip-multi tooltip-multi" + sanitizeClassName(indicator.title)}>
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

  /* Enable pointer events for paths and info icons */
  svg path {
    pointer-events: auto;
  }

  svg image[href="info.png"] {
    pointer-events: auto;
  }

  /* Ensure wheel events can pass through shapes to Leaflet map */
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
    /* Firefox standard syntax */
    mask-image: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.01) 0%,
        rgba(255, 255, 255, 1) 15%,
        rgba(255, 255, 255, 1) 85%,
        rgba(255, 255, 255, 0.01) 100%
      ),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 1) 85%, rgba(255, 255, 255, 0.01) 100%);
    mask-composite: intersect;
    /* Chrome/Safari webkit syntax */
    -webkit-mask-image: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.01) 0%,
        rgba(255, 255, 255, 1) 15%,
        rgba(255, 255, 255, 1) 85%,
        rgba(255, 255, 255, 0.01) 100%
      ),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 1) 85%, rgba(255, 255, 255, 0.01) 100%);
    -webkit-mask-composite: source-in;
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
  /* Different transition speeds for zoom vs pan operations */
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

  /* Fast transitions during panning */
  svg.panning circle {
    transition:
      cx 0.05s ease-out,
      cy 0.05s ease-out;
  }

  svg.panning image {
    transition:
      x 0.05s ease-out,
      y 0.05s ease-out;
  }

  /* Import Leaflet CSS when needed */
  :global(.leaflet-container) {
    background: transparent;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(2px);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #35575a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-overlay p {
    margin-top: 16px;
    color: #35575a;
    font-weight: 500;
    font-size: 14px;
  }
</style>
