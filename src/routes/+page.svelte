<script>
  import ControlPanel from '$lib/components/controlPanel/ControlPanel.svelte';
  import Indicator from '$lib/components/Indicator.svelte';
  import Map from '$lib/components/Map.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { buurtData, buurtSelection, indicatorenSelectie, gemeenteSelection, modal, URLParams, lang } from '$lib/stores';
  import { getIndicatorenLijst } from '$lib/noncomponents/indicatorenLijst.js'
  import { afterUpdate, onMount } from 'svelte';
  import Modal from 'svelte-simple-modal';
  import { t } from '$lib/i18n/translate.js';
  import { browser } from '$app/environment';
    import LoadingIcon from '$lib/components/LoadingIcon.svelte';
  // import { locale, isLoading } from 'svelte-i18n';
  // import { _ } from 'svelte-i18n'


  let screenSize = 1000
  let wMap;
  let hMap;
  // let wIndicator;
  // let hIndicator;

  export let data

  console.log(data)

  if(data.lang === 'en'){
    lang.set('en')
  }else{
    lang.set('nl')
  }

  let getoondeIndicatoren = []
  let indicatorenLijst = []

  if($lang === 'en'){
    indicatorenLijst = getIndicatorenLijst(data.metadata_dordrecht, t("Effecten"), t("Gebiedskenmerken"), t("Kwetsbaarheid"))
    getoondeIndicatoren = indicatorenLijst
  }else{
    indicatorenLijst = getIndicatorenLijst(data.metadata_dordrecht, t("Effecten"), t("Gebiedskenmerken"), t("Kwetsbaarheid"))
    getoondeIndicatoren = indicatorenLijst
  }

  const getData = (async () => {
		const response = await Promise.all([
      // fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023.json'),
      fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json'),
      fetch('https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/Dordrecht_buurten.json')

    ])
    return [await response[0].json(), await response[1].json()]
	})()

  const indicatorHeight = 650

  $: onChange($indicatorenSelectie)

  function onChange(indSel){
    getoondeIndicatoren = []

    const gemTemp = $gemeenteSelection
    const buurtTemp = $buurtSelection
    gemeenteSelection.set(null)
    buurtSelection.set(null)

    setTimeout(() => {
      getoondeIndicatoren = ($indicatorenSelectie.length === 0) 
        ? indicatorenLijst
        : indicatorenLijst.filter(d => $indicatorenSelectie.includes(d['titel']))
    }, 1)
    setTimeout(() => {
      gemeenteSelection.set(gemTemp)
      buurtSelection.set(buurtTemp)
    }, 1)
  }

  $: if(browser){URLParams.set(new URLSearchParams(window.location.search))}

</script>

<svelte:window bind:innerWidth={screenSize} />

<svelte:head><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"></svelte:head>


<div class='container' style='justify-content:{screenSize < 800 ? 'center' : 'left'}'>
  <div class='sidebar' style='position:{screenSize > 800 ? "fixed" : "relative"}'>
    <div class='control-panel'><ControlPanel {indicatorenSelectie} {indicatorenLijst} /></div>
    <div class='map' bind:clientWidth={wMap} bind:clientHeight={hMap}>
      {#await getData}
        <pre style='color:white'>Kaart laden...</pre>
      {:then res}
        <Map datajson={res} w={wMap} h={hMap} mainMapFlag={true}/>
      {/await}
    </div>
  </div>
  
  <div class='indicators' style='margin-left:{screenSize > 800 ? 400 : 0}px'>
    {#await getData}
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