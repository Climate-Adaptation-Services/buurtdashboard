<script>
  import { gemeenteData, buurtData, buurtSelection, gemeenteSelection, buurtSelectionData } from '$lib/stores';
  import Select from 'svelte-select'
  import * as _ from 'lodash'

  let gemeenteList;
  let buurtList;
  $: if($gemeenteData !== null){
    gemeenteList = $gemeenteData.features.map(gemeente => {return {'value':gemeente.properties['GM_CODE'], 'label':gemeente.properties['GM_NAAM']}})
    gemeenteList = _.orderBy(gemeenteList, [gemeente => gemeente.label], ['asc']);
  }
  $: if($gemeenteSelection !== null){
    const buurtenFeatures = $buurtData.features.filter(buurt => buurt.properties['gm_code'] === $gemeenteSelection)
    buurtList = buurtenFeatures.map(buurt => {return {'value':buurt.properties['bu_code'], 'label':buurt.properties['bu_naam']}})
    buurtList = _.orderBy(buurtList, [buurt => buurt.label], ['asc']);
  }

  function handleGemeenteChange(e){
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

  $: wijktype = ($buurtSelection !== null && $buurtSelectionData.properties['def_wijkty']) 
    ? $buurtSelectionData.properties['def_wijkty']
    : 'Geen wijktype'
 
</script>


<div class='selection'></div>

<div class='search'>
  <div>
    <Select items={gemeenteList} placeholder="Zoek gemeente..." value={$gemeenteSelection} on:change={handleGemeenteChange} on:clear={handleGemeenteClear}/>
    {#if $gemeenteSelection !== null}
      <Select items={buurtList} placeholder="Zoek buurt..." value={$buurtSelection} on:change={handleBuurtChange} on:clear={handleBuurtClear}/>
    {/if}
    {#if $buurtSelection !== null}
        <p>Wijktype: <strong>{wijktype}</strong></p>
    {/if}
    </div>
</div>

<style>
  .search{
    padding:40px;
  }
</style>