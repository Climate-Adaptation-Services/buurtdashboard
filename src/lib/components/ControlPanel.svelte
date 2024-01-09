<script>
  import { gemeenteData, buurtData, buurtSelection, gemeenteCode, gemeenteSelection, buurtSelectionData, buurtCode, buurtNaam } from '$lib/stores';
  import Select from 'svelte-select'
  import * as _ from 'lodash'
  import { selectAll } from 'd3';

  let gemeenteList;
  let buurtList;
  $: if($gemeenteData !== null){
    gemeenteList = $gemeenteData.features.map(gemeente => {return {'value':gemeente.properties['GM_CODE'], 'label':capSelectLabelLen(gemeente.properties['GM_NAAM'])}})
    gemeenteList = _.orderBy(gemeenteList, [gemeente => gemeente.label], ['asc']);
  }
  $: if($gemeenteSelection !== null){
    const buurtenFeatures = $buurtData.features.filter(buurt => buurt.properties[$gemeenteCode] === $gemeenteSelection)
    buurtList = buurtenFeatures.map(buurt => {return {'value':buurt.properties[$buurtCode], 'label':capSelectLabelLen(buurt.properties[$buurtNaam])}})
    buurtList = _.orderBy(buurtList, [buurt => buurt.label], ['asc']);
  }

  function handleGemeenteChange(e){
    gemeenteSelection.set(null)
    buurtSelection.set(null)
    setTimeout(() => { gemeenteSelection.set(e.detail.value) }, 1);

    
  }

  function handleBuurtChange(e){
    buurtSelection.set(e.detail.value)
    selectAll('.svgelements_' + e.detail.value)
      .raise()
  }

  function handleGemeenteClear(e){
    gemeenteSelection.set(null)
    buurtSelection.set(null)
  }
  function handleBuurtClear(e){
    buurtSelection.set(null)
  }

  $: wijktype = ($buurtSelection !== null && $buurtSelectionData.properties['def_wijkty']) 
    ? $buurtSelectionData.properties['def_wijkty']
    : 'Geen wijktype'

  function capSelectLabelLen(label){
    if(label.length > 31){
      return label.slice(0,29) + '...'
    }else{
      return label
    }
  }
 
</script>


<div class='selection'></div>

<div class='search'>
  <div>
    <p class='select-title'>Gemeente:</p>
    <Select items={gemeenteList} placeholder="Zoek gemeente..." value={$gemeenteSelection} on:change={handleGemeenteChange} on:clear={handleGemeenteClear}/>
    {#if $gemeenteSelection !== null}
      <p class='select-title'>Buurt:</p>
      <Select items={buurtList} placeholder="Zoek buurt..." value={$buurtSelection} on:change={handleBuurtChange} on:clear={handleBuurtClear}/>
    {/if}
    {#if $buurtSelection !== null}
        <p style='color:white'>Wijktype: <strong>{wijktype}</strong></p>
    {/if}
    </div>
</div>

<style>
  .search{
    padding:10px 40px 40px 40px;
  }

  .select-title{
    color:white;
    margin-bottom:5px;
  }
</style>