<script>
  import { allMunicipalitiesJSONData, allNeighbourhoodsJSONData, neighbourhoodSelection, municipalityCodeAbbreviation, districtTypeAbbreviation, municipalitySelection, selectedNeighbourhoodJSONData, neighbourhoodCodeAbbreviation, neighbourhoodNameAbbreviation, municipalityNameAbbreviation, modal, URLParams, indicatorsSelection, neighbourhoodsInMunicipalityJSONData } from '$lib/stores';
  import * as lo from 'lodash'
  import OverDitDashboard from '$lib/components/OverDitDashboard.svelte';
  import { bind } from 'svelte-simple-modal';
  import IndicatorFilter from './indicatorFilter.svelte';
  import GemeenteSelect from './GemeenteSelect.svelte';
  import BuurtSelect from './BuurtSelect.svelte';
  import { t } from '$lib/i18n/translate.js';

  export let allIndicators

  let lijstAlleGemeentesVoorDropdown;
  let lijstAlleBuurtenInMunicipalityVoorDropdown;
  $: if($allMunicipalitiesJSONData !== null){
    lijstAlleGemeentesVoorDropdown = $allMunicipalitiesJSONData.features.map(municipality => {return {'value':municipality.properties[$municipalityCodeAbbreviation], 'label':limitDropdownLabelLength(municipality.properties[$municipalityNameAbbreviation])}})
    lijstAlleGemeentesVoorDropdown = lo.orderBy(lijstAlleGemeentesVoorDropdown, [municipality => municipality.label], ['asc']);
  }
  $: if($municipalitySelection !== null){
    lijstAlleBuurtenInMunicipalityVoorDropdown = $neighbourhoodsInMunicipalityJSONData.features.map(neighbourhood => {return {'value':neighbourhood.properties[$neighbourhoodCodeAbbreviation], 'label':limitDropdownLabelLength(neighbourhood.properties[$neighbourhoodNameAbbreviation])}})
    lijstAlleBuurtenInMunicipalityVoorDropdown = lo.orderBy(lijstAlleBuurtenInMunicipalityVoorDropdown, [neighbourhood => neighbourhood.label], ['asc']);
  }

  $: districtType = ($allNeighbourhoodsJSONData && $neighbourhoodSelection !== null && $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]) 
    ? $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]
    : t('geen_wijktype')

  function limitDropdownLabelLength(label){
    return (label.length > 31) ? label.slice(0,29) + '...' : label
  }

  const laatMeerInfoPanelZien = (type) => {
    modal.set(bind(OverDitDashboard, { type : type}))
  };
 
</script>


<!-- <div class='selection'></div> -->

<div class='search'>
  <div>
    <div class='download-and-about'>
      <div class='about' on:click={() => laatMeerInfoPanelZien('intro')}>
        <img src='./about.png' width='30px'/>
        <p class='download-and-about-text'>Intro dashboard</p>
      </div>
      <div class='about' on:click={() => laatMeerInfoPanelZien('graphs')}>
        <img src='./chart.png' width='30px'/>
        <p class='download-and-about-text'>{t('Uitleg_grafieken')}</p>
      </div>
      <div class='download'>
        <a href='https://github.com/Climate-Adaptation-Services/buurtdashboard-data/raw/main/BuurtdashboardDataDownload20240913.xlsx' download='BuurtdashboardDownload20240805'><img src='./download.png' width='30px'/></a>
        <p class='download-and-about-text'>Download data</p>
      </div>
    </div>
    <GemeenteSelect {lijstAlleGemeentesVoorDropdown} />
    <BuurtSelect {lijstAlleBuurtenInMunicipalityVoorDropdown} />
    {#if $neighbourhoodSelection !== null}
        <p style='color:white'>{t("Wijktype")}: <strong>{districtType}</strong></p>
    {/if}
    <IndicatorFilter {allIndicators} />
  </div>
</div>

<style>
  .search{
    padding:10px 40px 10px 40px;
  }

  .download-and-about{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-top:0px;
    margin-bottom:0px;
    color:white;
  }

  .download, .about{
    float:left;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    cursor:pointer;
  }

  .download-and-about-text{
    visibility: hidden;
    margin-top: 5px;
    margin-bottom: 0px;
  }

  .download:hover .download-and-about-text{
    visibility: visible; 
  }
  .about:hover .download-and-about-text{
    visibility: visible; 
  }
</style>