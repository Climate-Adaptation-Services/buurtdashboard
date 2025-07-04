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
    configStore,
  } from "$lib/stores"
  import { setupIndicators } from "$lib/noncomponents/setupIndicators.js"
  import Modal from "svelte-simple-modal"
  import { t } from "$lib/i18n/translate.js"
  import { browser } from "$app/environment"
  import LoadingIcon from "$lib/components/LoadingIcon.svelte"
  import { setLanguage } from "$lib/noncomponents/setLanguage.js"
  // GeoJSON data now comes from page data, no need for separate fetch
  import { processURLParameters } from "$lib/noncomponents/processURLParameters.js"
  import { setupAHNSelecties } from "$lib/noncomponents/setupAHNSelecties.js"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute.js"

  export let data
  // Removed large object console log

  // $: console.log("config", $configStore)

  let screenWidth = 1000 //default value
  let mapWidth
  let mapHeight
  const indicatorHeight = 650

  setLanguage(data)
  setupAHNSelecties(data)

  let displayedIndicators = []
  let allIndicators = []

  allIndicators = setupIndicators(data, t("Effecten"), t("Gebiedskenmerken"), t("Kwetsbaarheid"))
  displayedIndicators = allIndicators

  // $: console.log("allIndicators", allIndicators)

  // GeoJSON data is now available directly from page data
  const geoJSONData = [data.municipalityGeoJson, data.neighbourhoodGeoJson]

  // de URL parameters laden
  $: if (browser) {
    URLParams.set(new URLSearchParams(window.location.search))
  }

  // zodra allNeighbourhoodsJSONData geladen is, lees de url parameters
  $: if ($allNeighbourhoodsJSONData) {
    processURLParameters()
  }

  $: onChangeIndicatorenSelectie($indicatorsSelection)

  function onChangeIndicatorenSelectie(_) {
    displayedIndicators = []

    const tempGemeenteSelection = $municipalitySelection
    const tempBuurtSelection = $neighbourhoodSelection
    municipalitySelection.set(null)
    neighbourhoodSelection.set(null)

    // dit is een hacky oplossing om te zorgen dat alles even leeg is,
    // en vervolgens de indicatorsselectie weer toevoegen
    setTimeout(() => {
      displayedIndicators = $indicatorsSelection.length === 0 ? allIndicators : allIndicators.filter((d) => $indicatorsSelection.includes(d["title"]))
    }, 1)
    setTimeout(() => {
      municipalitySelection.set(tempGemeenteSelection)
      neighbourhoodSelection.set(tempBuurtSelection)
    }, 1)
  }
</script>

<svelte:window bind:innerWidth={screenWidth} />

<svelte:head><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" /></svelte:head>

<div class="container" style="justify-content:{screenWidth < 800 ? 'center' : 'left'}">
  <div class="sidebar" style="position:{screenWidth > 800 ? 'fixed' : 'relative'}">
    <div class="control-panel"><ControlPanel {indicatorsSelection} {allIndicators} /></div>
    <div class="map" bind:clientWidth={mapWidth} bind:clientHeight={mapHeight}>
      {#if data.municipalityGeoJson && data.neighbourhoodGeoJson}
        <Map JSONdata={geoJSONData} CSVdata={data.buurtCSVdata} {mapWidth} {mapHeight} mapType={"main map"} />
      {:else}
        <pre style="color:white">Kaart laden...</pre>
      {/if}
    </div>
  </div>

  <div class="indicators" style="margin-left:{screenWidth > 800 ? 400 : 0}px">
    {#if data.municipalityGeoJson && data.neighbourhoodGeoJson}
      {#each displayedIndicators as indicator}
        {#if getIndicatorAttribute(indicator, indicator.attribute)}
          <div class="indicator" style="height:{indicatorHeight}px">
            <Indicator {indicatorHeight} {indicator} />
          </div>
        {/if}
      {/each}
    {:else}
      <LoadingIcon />
    {/if}
  </div>

  <Tooltip />

  <Modal show={$modal} style="position:absolute; left:0"></Modal>
</div>

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

  .indicator {
    flex: 1;
    margin: 10px;
    min-width: 360px;
    max-width: 450px;
    background-color: white;
    border-radius: 10px;
  }
</style>
