<script>

  import { buurtData, wijkTypeData, gemeenteSelection, buurtSelection, buurtCode, gemeenteCode, buurtSelectionData } from "$lib/stores";
  import Stat from "./Stat.svelte";
  import * as _ from 'lodash';
  import { scaleLinear, max } from 'd3';

  export let bodyHeight
  export let indicator
  export let color

  let wStats;

  const median = (array) => { 
    array.sort((a, b) => b - a); 
    const length = array.length; 
    if (length % 2 == 0) { 
      return (array[length / 2] + array[(length / 2) - 1]) / 2; 
    } else { 
      return array[Math.floor(length / 2)]; 
    } }

  let meanValuesDict = {
    'meanValueNederland':median($buurtData.features.map(buurt => buurt.properties[indicator.attribute])),
    'meanValueGemeente':0,
    'meanValueBuurt':0,
    'meanValueWijktype':0
  };

  $: if($gemeenteSelection !== null){
    // buurten binnen gemeente
    const gemeenteFilter = $buurtData.features.filter(buurt => buurt.properties[$gemeenteCode] === $gemeenteSelection)
    meanValuesDict['meanValueGemeente'] = median(gemeenteFilter.map(buurt => {
      // console.log(buurt.properties, indicator.attribute)
      return buurt.properties[indicator.attribute]
    }))
    // console.log(meanValuesDict['meanValueGemeente'])
  }else{
    meanValuesDict['meanValueGemeente'] = 0
  }
  $: if($buurtSelection !== null){
    // deze filter is 1 buurt
    const buurtFilter = $buurtData.features.filter(buurt => buurt.properties[$buurtCode] === $buurtSelection)
    meanValuesDict['meanValueBuurt'] = Math.round(buurtFilter[0].properties[indicator.attribute]*100)/100

    meanValuesDict['meanValueWijktype'] = median($wijkTypeData.features.map(buurt => buurt.properties[indicator.attribute]))

  }else{
    meanValuesDict['meanValueBuurt'] = 0
    meanValuesDict['meanValueWijktype'] = 0
  }

  $: xScaleStats = scaleLinear()
    .domain([0, max([meanValuesDict['meanValueNederland'], meanValuesDict['meanValueGemeente'], meanValuesDict['meanValueBuurt'], meanValuesDict['meanValueWijktype']])])
    .range([0, wStats-240])

</script>

<div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px' bind:clientWidth={wStats}><Stat {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Nederland' meanValue={meanValuesDict['meanValueNederland']} {xScaleStats}/></div>
{#if $gemeenteSelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Gemeente' meanValue={meanValuesDict['meanValueGemeente']} {xScaleStats}/></div>
{/if}
{#if $buurtSelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Buurt' meanValue={meanValuesDict['meanValueBuurt']} {xScaleStats}/></div>
  {#if $buurtSelectionData.properties['def_wijkty']}
    <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Wijktype' meanValue={meanValuesDict['meanValueWijktype']} {xScaleStats}/></div>
  {/if}
{/if}




<style>

  
</style>