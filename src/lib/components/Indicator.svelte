<script>
  import { buurtData, buurtSelection, gemeenteSelection } from "$lib/stores";
  import BeeswarmPlot from "./BeeswarmPlot.svelte";
  import Stats from "./Stats.svelte";
  import * as _ from 'lodash';
  import { scaleLinear, max } from 'd3';

  export let w;
  export let h;
  
  let wGraph;
  let hGraph;
  let wStats;
  let hStats;

  let variable = 'a65oo'

  let meanValues = [];
  const meanValueNederland = Math.round(_.meanBy($buurtData.features, buurt => buurt.properties[variable])*100)/100;
  meanValues.push(meanValueNederland)
  let meanValueGemeente = 0;
  let meanValueBuurt = 0;
  if($gemeenteSelection !== null){
    // buurten binnen gemeente
    const gemeenteFilter = $buurtData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
    meanValueGemeente = Math.round(_.meanBy(gemeenteFilter, buurt => buurt.properties[variable])*100)/100
    meanValues.push(meanValueGemeente)
  }if($buurtSelection !== null){
    // deze filter is 1 buurt
    const buurtFilter = $buurtData.features.filter(buurt => buurt.properties['BU_CODE'] === $buurtSelection)
    meanValueBuurt = Math.round(buurtFilter[0].properties[variable]*100)/100
    meanValues.push(meanValueBuurt)
  }

  $: xScale = scaleLinear()
    .domain([0, max(meanValues)])
    .range([w*0.25+5, w*0.5-10])

</script>

<div class='indicator-div'>
  <div class='indicator-title'><h2>Populatie 65+</h2></div>
  <div class='indicator-body'>
    <div class='indicator-overview'>
      <div class='indicator-stats' {xScale} meanValue={meanValueNederland} bind:clientWidth={wStats} bind:clientHeight={hStats}><Stats w={wStats} h={hStats} regio='Nederland' {variable}/></div>
      {#if $gemeenteSelection !== null}
        <div class='indicator-stats' {xScale} meanValue={meanValueGemeente}><Stats w={wStats} h={hStats} regio='Gemeente' {variable}/></div>
      {/if}
      {#if $buurtSelection !== null}
        <div class='indicator-stats' {xScale} meanValue={meanValueBuurt}><Stats w={wStats} h={hStats} regio='Buurt' {variable}/></div>
        <div class='indicator-stats' {xScale} meanValueBuurt={meanValueBuurt}><Stats w={wStats} h={hStats} regio='Buurt' {variable}/></div>
      {/if}
    </div>
    <div class='indicator-graph' bind:clientWidth={wGraph} bind:clientHeight={hGraph}>
      <BeeswarmPlot w={wGraph} h={hGraph} />
    </div>
    <div class='indicator-map'>

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
    flex:1;
    background-color: whitesmoke;
    align-items: center;
    justify-content: center;
  }

  .indicator-body{
    flex:8;
  }

  .indicator-overview{
    height: 20%;
  }

  .indicator-stats{
    /* width:100%; */
    height: 25%;
    margin: auto;
    /* float: left; */
  }

  .indicator-graph{
    height: 40%;
    background-color: blanchedalmond;    
  }

  .indicator-map{
    height: 40%;
    background-color: mistyrose;    
  }

</style>