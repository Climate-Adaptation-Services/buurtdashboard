<script>
  import {
    allMunicipalitiesJSONData,
    allNeighbourhoodsJSONData,
    neighbourhoodSelection,
    municipalityCodeAbbreviation,
    districtTypeAbbreviation,
    municipalitySelection,
    selectedNeighbourhoodJSONData,
    neighbourhoodCodeAbbreviation,
    neighbourhoodNameAbbreviation,
    municipalityNameAbbreviation,
    modal,
    neighbourhoodsInMunicipalityJSONData,
    configStore,
  } from "$lib/stores"
  import lodash from "lodash"
  const { orderBy } = lodash
  import OverDitDashboard from "$lib/components/OverDitDashboard.svelte"
  import { bind } from "svelte-simple-modal"
  import IndicatorFilter from "./indicatorFilter.svelte"
  import GemeenteSelect from "./GemeenteSelect.svelte"
  import BuurtSelect from "./BuurtSelect.svelte"
  import { t } from "$lib/i18n/translate.js"

  export let allIndicators
  export let isLoading = false

  let lijstAlleGemeentesVoorDropdown
  let lijstAlleBuurtenInMunicipalityVoorDropdown
  $: if ($allMunicipalitiesJSONData?.features) {
    lijstAlleGemeentesVoorDropdown = $allMunicipalitiesJSONData.features
      .filter(municipality => municipality?.properties) // Filter out null/invalid features
      .map((municipality) => {
        return {
          value: municipality.properties[$municipalityCodeAbbreviation],
          label: limitDropdownLabelLength(municipality.properties[$municipalityNameAbbreviation]),
        }
      })
    lijstAlleGemeentesVoorDropdown = orderBy(lijstAlleGemeentesVoorDropdown, [(municipality) => municipality.label], ["asc"])
  }
  $: if ($municipalitySelection !== null && $neighbourhoodsInMunicipalityJSONData?.features) {
    lijstAlleBuurtenInMunicipalityVoorDropdown = $neighbourhoodsInMunicipalityJSONData.features
      .filter(neighbourhood => neighbourhood?.properties) // Filter out null/invalid features
      .map((neighbourhood) => {
        return {
          value: neighbourhood.properties[$neighbourhoodCodeAbbreviation],
          label: limitDropdownLabelLength(neighbourhood.properties[$neighbourhoodNameAbbreviation]),
        }
      })
    lijstAlleBuurtenInMunicipalityVoorDropdown = orderBy(
      lijstAlleBuurtenInMunicipalityVoorDropdown,
      [(neighbourhood) => neighbourhood.label],
      ["asc"],
    )
  }

  $: districtType =
    $allNeighbourhoodsJSONData && $neighbourhoodSelection !== null && $selectedNeighbourhoodJSONData && $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]
      ? $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]
      : t("geen_wijktype")

  function limitDropdownLabelLength(label) {
    return label.length > 31 ? label.slice(0, 29) + "..." : label
  }

  const laatMeerInfoPanelZien = (type) => {
    modal.set(bind(OverDitDashboard, { type: type }))
  }
</script>

<!-- <div class='selection'></div> -->

<div class="search">
  <div>
    {#if $configStore.sidebarImage}
      <img src={$configStore.sidebarImage} class="dord-icon" alt="Sidebar background" />
    {/if}
    <div class="download-and-about">
      <div class="about" on:click={() => laatMeerInfoPanelZien("intro")}>
        <img src="./about.png" width="30px" />
        <p class="download-and-about-text">Intro dashboard</p>
      </div>
      <div class="about" on:click={() => laatMeerInfoPanelZien("graphs")}>
        <img src="./uitleg-grafieken.png" width="40px" />
        <p class="download-and-about-text">{t("Uitleg_grafieken")}</p>
      </div>
      <div class="download">
        <a
          href={$configStore.dataDownloadLocation}
          download="BuurtdashboardDataDownload.xlsx"><img src="./download.png" width="30px" /></a
        >
        <p class="download-and-about-text">Download data</p>
      </div>
    </div>
    <br />
    {#if isLoading}
      <div class="loading-indicator">
        <div class="loading-spinner-small"></div>
        <span>Gegevens laden...</span>
      </div>
    {/if}

    <GemeenteSelect {lijstAlleGemeentesVoorDropdown} />
    <BuurtSelect {lijstAlleBuurtenInMunicipalityVoorDropdown} />
    {#if $neighbourhoodSelection !== null}
      <p style="color:white">{t("Wijktype")}: <strong>{districtType}</strong></p>
    {/if}
    <IndicatorFilter {allIndicators} />
  </div>
</div>

<style>
  .search {
    padding: 10px 40px 10px 40px;
  }

  .download-and-about {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-top: 0px;
    margin-bottom: 0px;
    color: white;
  }

  .download,
  .about {
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    cursor: pointer;
  }

  .download-and-about-text {
    visibility: hidden;
    margin-top: 5px;
    margin-bottom: 0px;
  }

  .download:hover .download-and-about-text {
    visibility: visible;
  }
  .about:hover .download-and-about-text {
    visibility: visible;
  }

  .dord-icon {
    position: absolute;
    top: -20px;
    left: 0;
    width: 100%;
    height: 65%;
    z-index: -1000;
  }

  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-bottom: 16px;
    color: white;
    font-size: 14px;
  }

  .loading-spinner-small {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
