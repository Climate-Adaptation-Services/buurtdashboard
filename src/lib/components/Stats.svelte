<script>

  import { alleBuurtenJSONData, wijkTypeJSONData, wijktypeAfkorting, gemeenteSelection, buurtSelection, buurtCodeAfkorting, gemeenteCodeAfkorting, geselecteerdeBuurtJSONData } from "$lib/stores";
  import Stat from "./Stat.svelte";
  import * as _ from 'lodash';
  import { scaleLinear, max, min } from 'd3';
  import { t } from '$lib/i18n/translate.js';
  import { calcMedian } from "$lib/noncomponents/calcMedian";

  export let bodyHeight
  export let indicator
  export let indicatorValueColorscale

  let statsWidth;

  let medianValuesDict = {
    'medianValueNederland':calcMedian($alleBuurtenJSONData.features.map(buurt => buurt.properties[indicator.attribute])),
    'medianValueGemeente':0,
    'medianValueBuurt':0,
    'medianValueWijktype':0
  };

  $: if($gemeenteSelection !== null){
    // buurten binnen gemeente
    const gemeenteFilter = $alleBuurtenJSONData.features.filter(buurt => buurt.properties[$gemeenteCodeAfkorting] === $gemeenteSelection)
    medianValuesDict['medianValueGemeente'] = calcMedian(gemeenteFilter.map(buurt => buurt.properties[indicator.attribute]))
  }else{
    medianValuesDict['medianValueGemeente'] = 0
  }
  $: if($buurtSelection !== null){
    // deze filter is 1 buurt
    const buurtFilter = $alleBuurtenJSONData.features.filter(buurt => buurt.properties[$buurtCodeAfkorting] === $buurtSelection)
    medianValuesDict['medianValueBuurt'] = (buurtFilter[0].properties[indicator.attribute] !== null)
      ? Math.round(buurtFilter[0].properties[indicator.attribute]*100)/100
      : 'Geen data'

    medianValuesDict['medianValueWijktype'] = calcMedian($wijkTypeJSONData.features.map(buurt => buurt.properties[indicator.attribute]))

  }else{
    medianValuesDict['medianValueBuurt'] = 0
    medianValuesDict['medianValueWijktype'] = 0
  }

  $: xScaleMin = min([0, medianValuesDict['medianValueNederland'], medianValuesDict['medianValueGemeente'], medianValuesDict['medianValueBuurt'], medianValuesDict['medianValueWijktype']])
  // grondwater hoog kan negatief zijn, en de schaal moet wat opgerekt
  if(xScaleMin < 0){
    xScaleMin -= 10
  }

  $: xDomain = (indicator.titel !== t('Grondwaterstand 2050 hoog'))
    ? [0, max([medianValuesDict['medianValueNederland'], medianValuesDict['medianValueGemeente'], medianValuesDict['medianValueBuurt'], medianValuesDict['medianValueWijktype']])]
    : [0, min([medianValuesDict['medianValueNederland'], medianValuesDict['medianValueGemeente'], medianValuesDict['medianValueBuurt'], medianValuesDict['medianValueWijktype']])]

  $: xScaleStats = scaleLinear()
    .domain(xDomain)
    .range([0, statsWidth-240])

</script>

<!-- <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px' ><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Nederland' medianValue={medianValuesDict['medianValueNederland']} {xScaleStats}/></div> -->
{#if $gemeenteSelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px' bind:clientWidth={statsWidth}><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Gemeente' medianValue={medianValuesDict['medianValueGemeente']} {xScaleStats}/></div>
{/if}
{#if $buurtSelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Buurt' medianValue={medianValuesDict['medianValueBuurt']} {xScaleStats}/></div>
  {#if $geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting]}
    <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Wijktype' medianValue={medianValuesDict['medianValueWijktype']} {xScaleStats}/></div>
  {/if}
{/if}


<style>

  
</style>