<script>
  import ControlPanel from '$lib/components/ControlPanel.svelte';
  import Indicator from '$lib/components/Indicator.svelte';
  import Map from '$lib/components/Map.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';

  let screenSize = 1000
  let wMap;
  let hMap;
  let wIndicator;
  let hIndicator;
  
  const getData = (async () => {
		const response = await Promise.all([
      fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteDatasetTest20231011%20(1).json'),
      fetch('https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/BuurtenTestDataset_20231016.json')
    ])
    return [await response[0].json(), await response[1].json()]//, await response[2].json(), await response[3].json(), await response[4].json(), await response[5].json(), await response[6].json(), await response[7].json(), await response[8].json()]
	})()

</script>

<svelte:window bind:innerWidth={screenSize} />

<div class='container' style='justify-content:{screenSize < 800 ? 'center' : 'left'}'>
  <div class='sidebar' style='position:{screenSize > 800 ? "fixed" : "relative"}'>
    <div class='title'><h1>Buurtdashboard</h1></div>
    <div class='control-panel'><ControlPanel /></div>
    <div class='map' bind:clientWidth={wMap} bind:clientHeight={hMap}>
      {#await getData}
        <pre>Loading...</pre>
      {:then res}
        <Map datajson={res} w={wMap} h={hMap}/>
      {:catch error}
        <p>An error occurred!</p>
      {/await}
    </div>
  </div>
  
  <div class='indicators' bind:clientWidth={wIndicator} bind:clientHeight={hIndicator} style='margin-left:{screenSize > 800 ? 400 : 0}px'>
    {#each [1,2,3,4,5,6,7] as ind}
      <div class='indicator' w={wIndicator} h={hIndicator}><Indicator /></div>
    {/each}
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
    background-color: white;
  }

  .indicators{
    flex:1;
    display:flex;
    flex-wrap:wrap;
    align-items: center;
    justify-content: center;
    background-color: white;
    min-width:370px;
  }

  .title{
    flex:1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #35575A;
    color:white;
  }
  .control-panel{
    flex:3;
    background-color: white;
  }
  .map{
    flex:6;
  }

  .indicator{
    flex-grow:1;
    margin: 10px;
    height:480px;
    min-width:370px;
    max-width:450px;
    background-color: white;
  }



</style>