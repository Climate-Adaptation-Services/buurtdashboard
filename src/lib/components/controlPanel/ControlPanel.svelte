<script>
  import { gemeenteData, buurtData, buurtSelection, gemeenteCode, gemeenteSelection, buurtSelectionData, buurtCode, buurtNaam, modal, URLParams, indicatorenSelectie } from '$lib/stores';
  import * as lo from 'lodash'
  import { onMount } from 'svelte';
  import OverDitDashboard from '$lib/components/OverDitDashboard.svelte';
  import { bind } from 'svelte-simple-modal';
  import IndicatorFilter from './indicatorFilter.svelte';
  import GemeenteSelect from './GemeenteSelect.svelte';
  import BuurtSelect from './BuurtSelect.svelte';
  import { _, locale } from 'svelte-i18n'

  export let indicatorenLijst

  let gemeenteList;
  let buurtList;
  $: if($gemeenteData !== null){
    gemeenteList = $gemeenteData.features.map(gemeente => {return {'value':gemeente.properties[$gemeenteCode], 'label':capSelectLabelLen(gemeente.properties['GM_NAAM'])}})
    gemeenteList = lo.orderBy(gemeenteList, [gemeente => gemeente.label], ['asc']);
  }
  $: if($gemeenteSelection !== null){
    const buurtenFeatures = $buurtData.features.filter(buurt => buurt.properties[$gemeenteCode] === $gemeenteSelection)
    console.log('bf', buurtenFeatures)
    buurtList = buurtenFeatures.map(buurt => {return {'value':buurt.properties[$buurtCode], 'label':capSelectLabelLen(buurt.properties[$buurtNaam])}})
    buurtList = lo.orderBy(buurtList, [buurt => buurt.label], ['asc']);
  }

  $: wijktype = ($buurtData && $buurtSelection !== null && $buurtSelectionData.properties['def_wijkty']) 
    ? $buurtSelectionData.properties['def_wijkty']
    : 'Geen wijktype'

  function capSelectLabelLen(label){
    if(label.length > 31){
      return label.slice(0,29) + '...'
    }else{
      return label
    }
  }

  const showModal = (type) => {
    modal.set(bind(OverDitDashboard, { type : type}))
  };

  $: if($buurtData){readParams()}

  onMount(() => {
    URLParams.set(new URLSearchParams(window.location.search))
  })

  function readParams(){    
    setTimeout(() => {gemeenteSelection.set($URLParams.get("gemeente"))}, 10)
    setTimeout(() => {buurtSelection.set($URLParams.get("buurt"))}, 10)
    setTimeout(() => {indicatorenSelectie.set($URLParams.getAll("indicator"))}, 10)

  }
 
</script>


<div class='selection'></div>

<div class='search'>
  <div>
    <div class='download-and-about'>
      <div class='about' on:click={() => showModal('intro')}>
        <img src='./about.png' width='30px'/>
        <p class='download-and-about-text'>Intro dashboard</p>
      </div>
      <div class='about' on:click={() => showModal('graphs')}>
        <img src='./chart.png' width='30px'/>
        <p class='download-and-about-text'>{$_('Uitleg_grafieken')}</p>
      </div>
      <div class='download'>
        <a href='https://github.com/Climate-Adaptation-Services/buurtdashboard-data/raw/main/BuurtdashboardDownload20240805.xlsx' download='BuurtdashboardDownload20240805'><img src='./download.png' width='30px'/></a>
        <p class='download-and-about-text'>Download data</p>
      </div>
    </div>
    <GemeenteSelect {gemeenteList} />
    <BuurtSelect {buurtList} />
    {#if $buurtSelection !== null}
        <p style='color:white'>{$_("Wijktype")}: <strong>{wijktype}</strong></p>
    {/if}
    <IndicatorFilter {indicatorenLijst} />
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