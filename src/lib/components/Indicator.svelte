<script>
  import { buurtData, buurtSelection, gemeenteSelection, buurtenInGemeente } from "$lib/stores";
  import BeeswarmPlot from "./BeeswarmPlot.svelte";
  import Stats from "./Stats.svelte";
  import * as _ from 'lodash';
  import { scaleLinear, max, extent } from 'd3';
  import Map from "./Map.svelte";

  export let h

  let wStats;
  let wGraph;
  let wMap;

  let variable = 'a65oo'

  console.log($buurtData)

  let meanValuesDict = {
    'meanValueNederland':Math.round(_.meanBy($buurtData.features, buurt => buurt.properties[variable])*100)/100,
    'meanValueGemeente':0,
    'meanValueBuurt':0
  };
  // const meanValueNederland = Math.round(meanBy($buurtData.features, buurt => buurt.properties[variable])*100)/100;
  // meanValues.push(meanValueNederland)
  // let meanValueGemeente = 0;
  // let meanValueBuurt = 0;

  $: if($gemeenteSelection !== null){
    // buurten binnen gemeente
    const gemeenteFilter = $buurtData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
    meanValuesDict['meanValueGemeente'] = Math.round(_.meanBy(gemeenteFilter, buurt => buurt.properties[variable])*100)/100
    // meanValues.push(meanValueGemeente)
  }else{
    meanValuesDict['meanValueGemeente'] = 0
  }
  $: if($buurtSelection !== null){
    // deze filter is 1 buurt
    const buurtFilter = $buurtData.features.filter(buurt => buurt.properties['BU_CODE'] === $buurtSelection)
    meanValuesDict['meanValueBuurt'] = Math.round(buurtFilter[0].properties[variable]*100)/100
    // meanValues.push(meanValueBuurt)
  }else{
    meanValuesDict['meanValueBuurt'] = 0
  }

  $: xScale = scaleLinear()
    .domain([0, max([meanValuesDict['meanValueNederland'], meanValuesDict['meanValueGemeente'], meanValuesDict['meanValueBuurt']])])
    .range([0, wStats-190])

  let color = scaleLinear()
  $: if($gemeenteSelection !== null){
    color = scaleLinear()
    .domain(extent($buurtenInGemeente.features, d => d.properties[variable]))
    .range(["#E15759", "green"]);
  }

  
  const titleHeight = h*0.1
  const bodyHeight = h*0.9

</script>

<div class='indicator-div'>
  <div class='indicator-title' style='height: {titleHeight}px'><h2>Populatie 65+</h2></div>
  <div class='indicator-body' style='height: {bodyHeight}px'>
    <div class='indicator-overview' style='height: {bodyHeight*0.2}px'>
      <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px' bind:clientWidth={wStats}><Stats {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Nederland' meanValue={meanValuesDict['meanValueNederland']} {xScale}/></div>
      {#if $gemeenteSelection !== null}
        <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stats {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Gemeente' meanValue={meanValuesDict['meanValueGemeente']} {xScale}/></div>
      {/if}
      {#if $buurtSelection !== null}
        <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stats {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Buurt' meanValue={meanValuesDict['meanValueBuurt']} {xScale}/></div>
        <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stats {color} w={wStats} h={bodyHeight*0.2*0.25} regio='Buurt' meanValue={meanValuesDict['meanValueBuurt']} {xScale}/></div>
      {/if}
    </div>
    <div class='indicator-graph' style='height:{bodyHeight*0.4}px' bind:clientWidth={wGraph}>
      {#if $gemeenteSelection !== null}
        <BeeswarmPlot w={wGraph} h={bodyHeight*0.4} {variable} {color} />
      {/if}
    </div>
    <div class='indicator-map' style='height:{bodyHeight*0.4}px' bind:clientWidth={wMap}>
      {#if $gemeenteSelection !== null}
        <Map w={wMap} h={bodyHeight*0.4} mainMapFlag={false} {color} {variable} />
      {/if}
    </div>
  </div>
</div>


<style>
  .indicator-div{
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
  .indicator-title{
    display: flex;
    background-color: whitesmoke;
    align-items: center;
    justify-content: center;
  }

  .indicator-graph{
    background-color: rgb(255, 249, 227);    
  }

  .indicator-map{
    background-color: #f5fdff;    
  }

  h2{
    margin:15px;
    color: #645F5E;
  }

</style>