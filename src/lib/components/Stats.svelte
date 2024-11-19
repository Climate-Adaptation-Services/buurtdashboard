<script>

  import { alleBuurtenJSONData, wijkTypeJSONData, wijktypeAfkorting, gemeenteSelection, buurtSelection, buurtCodeAfkorting, gemeenteCodeAfkorting, geselecteerdeBuurtJSONData } from "$lib/stores";
  import Stat from "./Stat.svelte";
  import * as _ from 'lodash';
  import { scaleLinear, max, min } from 'd3';
  import { t } from '$lib/i18n/translate.js';

  export let bodyHeight
  export let indicator
  export let indicatorValueColor

  let wStats;

  const median = (array) => { 

    // is it a number
    const OnlyNumbers = array.filter(d => /\d/.test(d)).map(d => +d)

    OnlyNumbers.sort((a, b) => b - a); 
    const length = OnlyNumbers.length; 
    if (length % 2 == 0) { 
      return (OnlyNumbers[length / 2] + OnlyNumbers[(length / 2) - 1]) / 2; 
    } else { 
      return OnlyNumbers[Math.floor(length / 2)]; 
    } }

  let meanValuesDict = {
    'meanValueNederland':median($alleBuurtenJSONData.features.map(buurt => buurt.properties[indicator.attribute])),
    'meanValueGemeente':0,
    'meanValueBuurt':0,
    'meanValueWijktype':0
  };

  $: if($gemeenteSelection !== null){
    // buurten binnen gemeente
    const gemeenteFilter = $alleBuurtenJSONData.features.filter(buurt => buurt.properties[$gemeenteCodeAfkorting] === $gemeenteSelection)
    meanValuesDict['meanValueGemeente'] = median(gemeenteFilter.map(buurt => buurt.properties[indicator.attribute]))
  }else{
    meanValuesDict['meanValueGemeente'] = 0
  }
  $: if($buurtSelection !== null){
    // deze filter is 1 buurt
    const buurtFilter = $alleBuurtenJSONData.features.filter(buurt => buurt.properties[$buurtCodeAfkorting] === $buurtSelection)
    meanValuesDict['meanValueBuurt'] = (buurtFilter[0].properties[indicator.attribute] !== null)
      ? Math.round(buurtFilter[0].properties[indicator.attribute]*100)/100
      : 'Geen data'

    meanValuesDict['meanValueWijktype'] = median($wijkTypeJSONData.features.map(buurt => buurt.properties[indicator.attribute]))

  }else{
    meanValuesDict['meanValueBuurt'] = 0
    meanValuesDict['meanValueWijktype'] = 0
  }

  // grondwater hoog kan negatief zijn, en de schaal moet wat opgerekt
  $: xScaleMin = min([0, meanValuesDict['meanValueNederland'], meanValuesDict['meanValueGemeente'], meanValuesDict['meanValueBuurt'], meanValuesDict['meanValueWijktype']])
  if(xScaleMin < 0){
    xScaleMin -= 10
  }

  $: xDomain = (indicator.titel !== t('Grondwaterstand 2050 hoog'))
    ? [0, max([meanValuesDict['meanValueNederland'], meanValuesDict['meanValueGemeente'], meanValuesDict['meanValueBuurt'], meanValuesDict['meanValueWijktype']])]
    : [0, min([meanValuesDict['meanValueNederland'], meanValuesDict['meanValueGemeente'], meanValuesDict['meanValueBuurt'], meanValuesDict['meanValueWijktype']])]
  // const xDomain = [xScaleMin, max([meanValuesDict['meanValueNederland'], meanValuesDict['meanValueGemeente'], meanValuesDict['meanValueBuurt'], meanValuesDict['meanValueWijktype']])]
  $: xScaleStats = scaleLinear()
    .domain(xDomain)
    .range([0, wStats-240])

</script>

<div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px' bind:clientWidth={wStats}><Stat {indicatorValueColor} w={wStats} h={bodyHeight*0.2*0.25} regio='Nederland' meanValue={meanValuesDict['meanValueNederland']} {xScaleStats}/></div>
{#if $gemeenteSelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColor} w={wStats} h={bodyHeight*0.2*0.25} regio='Gemeente' meanValue={meanValuesDict['meanValueGemeente']} {xScaleStats}/></div>
{/if}
{#if $buurtSelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColor} w={wStats} h={bodyHeight*0.2*0.25} regio='Buurt' meanValue={meanValuesDict['meanValueBuurt']} {xScaleStats}/></div>
  {#if $geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting]}
    <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColor} w={wStats} h={bodyHeight*0.2*0.25} regio='Wijktype' meanValue={meanValuesDict['meanValueWijktype']} {xScaleStats}/></div>
  {/if}
{/if}




<style>

  
</style>