<script>
  import { gemeenteData, buurtData, buurtSelection, gemeenteSelection } from '$lib/stores';
  import Select from 'svelte-select'
  import { orderBy } from 'lodash'

  let gemeenteList;
  let buurtList;
  $: if($gemeenteData !== null){
    gemeenteList = $gemeenteData.features.map(gemeente => {return {'value':gemeente.properties['GM_CODE'], 'label':gemeente.properties['GM_Naam']}})
    gemeenteList = orderBy(gemeenteList, [gemeente => gemeente.label], ['asc']);
  }
  $: if($gemeenteSelection !== null){
    const buurtenFeatures = $buurtData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
    buurtList = buurtenFeatures.map(buurt => {return {'value':buurt.properties['BU_CODE'], 'label':buurt.properties['BU_NAAM']}})
    buurtList = orderBy(buurtList, [buurt => buurt.label], ['asc']);
  }

  function handleGemeenteChange(e){
    console.log(e)
    gemeenteSelection.set(e.detail.value)
  }

  function handleBuurtChange(e){
    buurtSelection.set(e.detail.value)
  }

  function handleGemeenteClear(e){
    buurtSelection.set(null)
    gemeenteSelection.set(null)
  }
  function handleBuurtClear(e){
    buurtSelection.set(null)
  }


</script>


<div class='selection'></div>

<div class='search'>
  <div>
    <Select items={gemeenteList} placeholder="Zoek gemeente..." value={$gemeenteSelection} on:change={handleGemeenteChange} on:clear={handleGemeenteClear}/>
    {#if $gemeenteSelection !== null}
      <Select items={buurtList} placeholder="Zoek buurt..." value={$buurtSelection} on:change={handleBuurtChange} on:clear={handleBuurtClear}/>
    {/if}
    </div>
</div>

<style>
  .search{
    padding:40px;
  }
</style>