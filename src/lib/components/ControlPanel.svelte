<script>
  import { gemeenteData, buurtData, buurtSelection, gemeenteCode, gemeenteSelection, buurtSelectionData, buurtCode, buurtNaam, modal } from '$lib/stores';
  import Select from 'svelte-select'
  import * as _ from 'lodash'
  import { select, selectAll, easeLinear } from 'd3';
  import MultiSelect from 'svelte-multiselect?client'
  import { browser } from '$app/environment';
  import { indicatorenSelectie } from '$lib/stores';
  import { afterUpdate, onMount } from 'svelte';
  import OverDitDashboard from '$lib/components/OverDitDashboard.svelte';
  import { bind } from 'svelte-simple-modal';

  export let indicatorenLijst


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

  const indicators = indicatorenLijst.map(d => d.titel)

  afterUpdate(() => {
    selectAll('li')
      .style('color', 'black')
      .style('cursor', 'pointer')
      .attr('background-color', 'white')
      .style('text-align', 'left')

    selectAll('.disabled')
      .style('color', 'steelblue')
      .style('cursor', 'default')
      .attr('background-color', '#e5e3e3')
      .style('text-align', 'center')

    selectAll('.selected li')
      .style('background-color', 'white')
  })

  const showModal = (type) => {
    modal.set(bind(OverDitDashboard, { type : type}))
  };
 
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
        <p class='download-and-about-text'>Uitleg grafieken</p>
      </div>
      <div class='download' on:click={() => showModal('download')}>
        <img src='./download.png' width='30px'/>
        <p class='download-and-about-text'>Download data</p>
      </div>
    </div>
    <p class='select-title'>Gemeente:</p>
    <Select items={gemeenteList} placeholder="Zoek gemeente..." value={$gemeenteSelection} on:change={handleGemeenteChange} on:clear={handleGemeenteClear}/>
    {#if $gemeenteSelection !== null}
      <p class='select-title'>Buurt:</p>
      <Select items={buurtList} placeholder="Zoek buurt..." value={$buurtSelection} on:change={handleBuurtChange} on:clear={handleBuurtClear}/>
    {/if}
    {#if $buurtSelection !== null}
        <p style='color:white'>Wijktype: <strong>{wijktype}</strong></p>
    {/if}
    {#if browser}
      <div class='multiselectdiv'>
        <p style='margin-bottom:5px'>Filter indicatoren:</p>
        <MultiSelect bind:value={$indicatorenSelectie} options={indicators} />
      </div>
    {/if}
    </div>
</div>

<style>
  .search{
    padding:10px 40px 10px 40px;
  }

  .multiselectdiv{
    width:330px;
    color:white;
    font-size: 12px;
  }

  .select-title{
    color:white;
    margin:5px;
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