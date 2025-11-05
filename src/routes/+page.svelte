<script>
  import ControlPanel from "$lib/components/controlPanel/ControlPanel.svelte"
  import Indicator from "$lib/components/Indicator.svelte"
  import Map from "$lib/components/Map.svelte"
  import Tooltip from "$lib/components/Tooltip.svelte"

  import {
    neighbourhoodSelection,
    indicatorsSelection,
    municipalitySelection,
    modal,
    URLParams,
    allNeighbourhoodsJSONData,
    nederlandAggregates,
    configStore,
    isUpdatingIndicators,
  } from "$lib/stores"
  import { setupIndicators } from "$lib/services/setupIndicators.js"
  import Modal from "svelte-simple-modal"
  import { t } from "$lib/i18n/translate.js"
  import { browser } from "$app/environment"
  import LoadingIcon from "$lib/components/LoadingIcon.svelte"
  import { setLanguage } from "$lib/utils/setLanguage.js"
  import { processURLParameters } from "$lib/services/urlManager.js"
  import { initializeURLManagement } from "$lib/services/urlManager.js"
  import { setupAHNSelecties } from "$lib/services/setupAHNSelecties.js"
  import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute.js"
  import { onMount, tick } from "svelte"
  import { BUURT_GEOJSON_URL, MUNICIPALITY_JSON_URL } from "$lib/datasets"
  import { prepareJSONData } from "$lib/services/prepareJSONData"

  export let data



  let screenWidth = 1000 //default value
  let mapWidth
  let mapHeight
  const indicatorHeight = 650

  // Set Nederland aggregates immediately for fast initial load
  if (data.nederlandAggregates) {
    nederlandAggregates.set(data.nederlandAggregates)
  }

  let displayedIndicators = []
  let allIndicators = []
  let isInitialized = false
  let isUIReady = false

  // GeoJSON data will be loaded client-side for progressive rendering
  let municipalityGeoJson = null
  let neighbourhoodGeoJson = null
  let geoJSONData = [null, null]
  let isLoadingGeoJSON = true

  // Load GeoJSON data client-side after component mounts
  onMount(async () => {
    // Setup language and AHN selections first
    setLanguage(data)
    setupAHNSelecties(data)

    // Setup indicators immediately so UI can be shown
    allIndicators = setupIndicators(data, "Effecten", "Gebiedskenmerken", "Kwetsbaarheid")
    displayedIndicators = allIndicators
    isInitialized = true

    // Show UI immediately with loading states, data will load in background
    isUIReady = true

    // Wait for Svelte to render the UI and browser to paint
    await tick()
    await new Promise(resolve => requestAnimationFrame(resolve))

    // Remove the static HTML loading screen after UI is rendered
    const loader = document.getElementById('app-loading')
    if (loader) loader.remove()

    // Load data in background
    ;(async () => {
      try {
      // Fetch GeoJSON data in parallel
      const [municipalityResponse, neighbourhoodResponse] = await Promise.all([
        fetch(MUNICIPALITY_JSON_URL),
        fetch(BUURT_GEOJSON_URL)
      ])

      municipalityGeoJson = await municipalityResponse.json()
      neighbourhoodGeoJson = await neighbourhoodResponse.json()
      geoJSONData = [municipalityGeoJson, neighbourhoodGeoJson]

      // Process and cache the GeoJSON data
      const dataUrls = {
        municipalityUrl: MUNICIPALITY_JSON_URL,
        neighbourhoodUrl: BUURT_GEOJSON_URL
      }

      await prepareJSONData([municipalityGeoJson, neighbourhoodGeoJson], data.buurtCSVdata, dataUrls)

        isLoadingGeoJSON = false
      } catch (error) {
        console.error('Error loading GeoJSON data:', error)
        isLoadingGeoJSON = false
      }
    })()
  })

  // Check if we're in an iframe
  const isIframe = browser && window.parent !== window

  // Load URL params if standalone page (not in iframe)
  // Only run once on mount to avoid overwriting postMessage params
  let hasLoadedStandaloneParams = false
  $: if (browser && !isIframe && !hasLoadedStandaloneParams) {
    URLParams.set(new URLSearchParams(window.location.search))
    hasLoadedStandaloneParams = true
  }

  // Listen for postMessage from parent if iframe
  $: if (browser && isIframe) {
    initializeURLManagement()
  }

  // zodra allNeighbourhoodsJSONData geladen is, lees de url parameters
  let urlParametersProcessed = false
  $: if ($allNeighbourhoodsJSONData && !urlParametersProcessed) {
    processURLParameters()
    urlParametersProcessed = true
  }


  // Only react to indicator selection changes after initialization
  $: if (isInitialized) {
    onChangeIndicatorenSelectie($indicatorsSelection)
  }

  function onChangeIndicatorenSelectie(_) {
    // Directly update displayed indicators without clearing first
    const newDisplayedIndicators = $indicatorsSelection.length === 0 ? allIndicators : allIndicators.filter((d) => $indicatorsSelection.includes(d["title"]))

    // Only do the complex reset if indicators actually changed
    if (JSON.stringify(displayedIndicators.map(d => d.title)) !== JSON.stringify(newDisplayedIndicators.map(d => d.title))) {
      const tempGemeenteSelection = $municipalitySelection
      const tempBuurtSelection = $neighbourhoodSelection

      // Set flag to prevent zoom during this temporary change
      isUpdatingIndicators.set(true)

      municipalitySelection.set(null)
      neighbourhoodSelection.set(null)

      displayedIndicators = newDisplayedIndicators

      // Restore selections after a brief delay
      setTimeout(() => {
        municipalitySelection.set(tempGemeenteSelection)
        neighbourhoodSelection.set(tempBuurtSelection)
        // Clear flag after restoration completes
        setTimeout(() => isUpdatingIndicators.set(false), 10)
      }, 1)
    }
  }
</script>

<svelte:window bind:innerWidth={screenWidth} />

<svelte:head><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" /></svelte:head>

{#if !isUIReady}
  <!-- Full-page loading screen -->
  <div class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner-large"></div>
      <p class="loading-text">Dashboard wordt geladen...</p>
    </div>
  </div>
{:else}
  <div class="container" style="justify-content:{screenWidth < 800 ? 'center' : 'left'}">
    <div class="sidebar" style="position:{screenWidth > 800 ? 'fixed' : 'relative'}">
      <div class="control-panel"><ControlPanel {indicatorsSelection} {allIndicators} isLoading={isLoadingGeoJSON} /></div>
      <div class="map" class:dordrecht={$configStore.categoryPath === '-dordrecht'} bind:clientWidth={mapWidth} bind:clientHeight={mapHeight}>
        <Map JSONdata={geoJSONData} CSVdata={data.buurtCSVdata} {mapWidth} {mapHeight} mapType={"main map"} isLoading={isLoadingGeoJSON} />
      </div>
    </div>

    <div class="indicators" style="margin-left:{screenWidth > 800 ? 400 : 0}px">
      {#each displayedIndicators as indicator}
        {#if getIndicatorAttribute(indicator, indicator.attribute)}
          <div class="indicator" style="height:{indicatorHeight}px">
            <Indicator {indicatorHeight} {indicator} isLoading={isLoadingGeoJSON} />
          </div>
        {/if}
      {/each}
    </div>

    <Tooltip />

    <Modal show={$modal} style="position:absolute; left:0"></Modal>
  </div>
{/if}

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
  }

  .sidebar {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 400px;
    height: 100vh;
  }

  .indicators {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    min-width: 360px;
  }

  .title {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #35575a;
    color: white;
  }

  h1 {
    margin-bottom: 5px;
  }

  .control-panel {
    flex: 3;
    margin-top: 20px;
  }

  .map {
    flex: 6;
  }

  .map.dordrecht {
    flex: 3;
  }

  .indicator {
    flex: 1;
    margin: 10px;
    min-width: 360px;
    max-width: 450px;
    background-color: white;
    border-radius: 10px;
  }

  /* Full-page loading screen */
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .loading-content {
    text-align: center;
  }

  .loading-spinner-large {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: 18px;
    color: white;
    font-weight: 500;
    margin: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
