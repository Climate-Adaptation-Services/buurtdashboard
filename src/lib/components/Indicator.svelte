<script>
  import { buurtData, buurtSelection, gemeenteSelection, buurtenInGemeente, wijkTypeData } from "$lib/stores";
  import BeeswarmPlot from "./BeeswarmPlot.svelte";
  import Stats from "./Stats.svelte";
  import { scaleLinear, extent } from 'd3';
  import Map from "./Map.svelte";
  import BarPlot from "./BarPlot.svelte";

  export let h

  let wGraph;
  let wMap;

  let variable = 'a65oo'
  let numerical = true

  let color = scaleLinear()
  let rangeExtent = [0,1]
  $: if($gemeenteSelection !== null){
    rangeExtent = extent($buurtenInGemeente.features, d => d.properties[variable])
    color = scaleLinear()
    .domain([rangeExtent[0], (rangeExtent[0]+rangeExtent[1])/2, rangeExtent[1]])
    .range(["#E15759", "#e5e4b5", "green"]);
  }

  const titleHeight = h*0.1
  const bodyHeight = h*0.9

</script>

<div class='indicator-div'>
  <div class='indicator-title' style='height: {titleHeight}px'><h2>Populatie 65+</h2></div>
  <div class='indicator-body' style='height: {bodyHeight}px'>
    {#if numerical}
      <div class='indicator-overview' style='height: {bodyHeight*0.2}px'>
        <Stats {bodyHeight} {variable} {color}/>
      </div>
      <div class='indicator-graph' style='height:{bodyHeight*0.4}px' bind:clientWidth={wGraph}>
        {#if $gemeenteSelection !== null}
          <BeeswarmPlot w={wGraph} h={bodyHeight*0.4} {variable} {color} />
        {/if}
      </div>
    {:else}
      <div class='indicator-graph' style='height:{bodyHeight*0.6}px' bind:clientWidth={wGraph}>
        <BarPlot w={wGraph} h={bodyHeight*0.6} {variable} {color} />
      </div>
    {/if}
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
    background-color: rgb(253, 249, 234);    
  }

  .indicator-map{
    /* background-color: #f5fdff;     */
  }

  h2{
    margin:15px;
    color: #645F5E;
  }

</style>