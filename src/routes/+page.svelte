<script>
  import ControlPanel from '$lib/components/ControlPanel.svelte';
  import Indicator from '$lib/components/Indicator.svelte';
  import Map from '$lib/components/Map.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { buurtData } from '$lib/stores';
  import { indicatorenSelectie } from '$lib/noncomponents/indicatorenSelectie.js'

  let screenSize = 1000
  let wMap;
  let hMap;
  // let wIndicator;
  // let hIndicator;

  $: console.log($buurtData)
  
  const getData = (async () => {
		const response = await Promise.all([
      // fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023.json'),
      fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json'),
      fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/BuurtenDataset20231212_xaaaa.json'),
      fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/BuurtenDataset20231212_xaaab.json'),
      fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/BuurtenDataset20231212_xaaac.json')
    ])
    return [await response[0].json(), await response[1].json(), await response[2].json(), await response[3].json()]//, await response[5].json(), await response[6].json(), await response[7].json(), await response[8].json()]
	})()

  const indicatorHeight = 650

</script>

<svelte:window bind:innerWidth={screenSize} />

<svelte:head><link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"></svelte:head>

<div class='container' style='justify-content:{screenSize < 800 ? 'center' : 'left'}'>
  <div class='sidebar' style='position:{screenSize > 800 ? "fixed" : "relative"}'>
    <div class='title'><h1>Buurtdashboard</h1></div>
    <div class='control-panel'><ControlPanel /></div>
    <div class='map' bind:clientWidth={wMap} bind:clientHeight={hMap}>
      {#await getData}
        <pre style='color:white'>Loading...</pre>
      {:then res}
        <Map datajson={res} w={wMap} h={hMap} mainMapFlag={true}/>
      {:catch error}
        <p>An error occurred!</p>
      {/await}
    </div>
  </div>
  
  <div class='indicators' style='margin-left:{screenSize > 800 ? 400 : 0}px'>
    {#if $buurtData !== null}
      {#each indicatorenSelectie as indicator}
        <div class='indicator' style='height:{indicatorHeight}px'>
          <Indicator h={indicatorHeight} {indicator}/>
        </div>
      {/each}
    {/if}
  </div>

  <Tooltip />
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
  }



</style>