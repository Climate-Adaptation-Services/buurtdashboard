<script>
  import ControlPanel from '$lib/components/controlPanel/ControlPanel.svelte';
  import Indicator from '$lib/components/Indicator.svelte';
  import Map from '$lib/components/Map.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { buurtSelection, indicatorenSelectie, gemeenteSelection, modal, URLParams, alleBuurtenJSONData } from '$lib/stores';
  import { setupIndicators } from '$lib/noncomponents/setupIndicators.js'
  import Modal from 'svelte-simple-modal';
  import { t } from '$lib/i18n/translate.js';
  import { browser } from '$app/environment';
  import LoadingIcon from '$lib/components/LoadingIcon.svelte';
  import { setLanguage } from '$lib/noncomponents/setLanguage.js';
  import { fetchJSONdata } from '$lib/noncomponents/fetchJSONdata.js';
  import { readURLParameters } from '$lib/noncomponents/readURLParameters.js';

  export let data
  console.log('data',data)

  let screenWidth = 1000 //default value
  let mapWidth;
  let mapHeight;
  const indicatorHeight = 650

  setLanguage(data)

  let getoondeIndicatoren = []
  let alleIndicatoren = []

  alleIndicatoren = setupIndicators(data, t("Effecten"), t("Gebiedskenmerken"), t("Kwetsbaarheid"))
  getoondeIndicatoren = alleIndicatoren

  const jsonResponse = fetchJSONdata()

  // de URL parameters laden
  $: if(browser){URLParams.set(new URLSearchParams(window.location.search))}

  // zodra alleBuurtenJSONData geladen is, lees de url parameters
  $: if($alleBuurtenJSONData){readURLParameters()}

  $: onChangeIndicatorenSelectie($indicatorenSelectie)

  function onChangeIndicatorenSelectie(_){
    getoondeIndicatoren = []

    const tempGemeenteSelection = $gemeenteSelection
    const tempBuurtSelection = $buurtSelection
    gemeenteSelection.set(null)
    buurtSelection.set(null)

    // dit is een hacky oplossing om te zorgen dat alles even leeg is, 
    // en vervolgens de indicatorenselectie weer toevoegen
    setTimeout(() => {
      getoondeIndicatoren = ($indicatorenSelectie.length === 0) 
        ? alleIndicatoren
        : alleIndicatoren.filter(d => $indicatorenSelectie.includes(d['titel']))
    }, 1)
    setTimeout(() => {
      gemeenteSelection.set(tempGemeenteSelection)
      buurtSelection.set(tempBuurtSelection)
    }, 1)
  }

</script>

<svelte:window bind:innerWidth={screenWidth} />

<svelte:head><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"></svelte:head>

<div class='container' style='justify-content:{screenWidth < 800 ? 'center' : 'left'}'>
  <div class='sidebar' style='position:{screenWidth > 800 ? "fixed" : "relative"}'>
    <div class='control-panel'><ControlPanel {indicatorenSelectie} {alleIndicatoren} /></div>
    <div class='map' bind:clientWidth={mapWidth} bind:clientHeight={mapHeight}>
      {#await jsonResponse}
        <pre style='color:white'>Kaart laden...</pre>
      {:then response}
        <Map JSONdata={response} {mapWidth} {mapHeight} mapType={'main map'}/>
      {/await}
    </div>
  </div>
  
  <div class='indicators' style='margin-left:{screenWidth > 800 ? 400 : 0}px'>
    {#await jsonResponse}
      <LoadingIcon />
    {:then res}
      {#each getoondeIndicatoren as indicator}
        {#if indicator.attribute}
            <div class='indicator' style='height:{indicatorHeight}px'>
              <Indicator h={indicatorHeight} {indicator}/>
          </div>
        {/if}
      {/each}
    {/await}
  </div>

  <Tooltip />

  <Modal show={$modal} style='position:absolute; left:0'></Modal>

</div>

<style>
  .container{
    display: flex;
    flex-wrap: wrap;
  }

  .sidebar{
    flex:1;
    display:flex;
    flex-direction: column;
    min-width:400px;
    height: 100vh;
  }

  .indicators{
    flex:1;
    display:flex;
    flex-wrap:wrap;
    align-items: center;
    justify-content: center;
    min-width:360px;
  }

  .title{
    flex:1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #35575A;
    color:white;
  }

  h1{
    margin-bottom:5px;
  }
  
  .control-panel{
    flex:3;
    margin-top:20px;
  }

  .map{
    flex:6;
  }

  .indicator{
    flex:1;
    margin: 10px;
    min-width:360px;
    max-width:450px;
    background-color: white;
    border-radius: 10px;
  }

</style>