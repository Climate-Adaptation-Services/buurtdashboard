<script>
  import { buurtData, buurtSelection, gemeenteSelection, buurtenInGemeente, wijkTypeData } from "$lib/stores";
  import BeeswarmPlot from "./BeeswarmPlot.svelte";
  import Stats from "./Stats.svelte";
  import { scaleLinear, extent, scaleOrdinal } from 'd3';
  import Map from "./Map.svelte";
  import BarPlot from "./BarPlot.svelte";
  import BarPlotLegend from "./BarPlotLegend.svelte";

  export let h
  export let variable
  export let numerical

  let wGraph;
  let wMap;

  let color = null
  let rangeExtent = [0,1]

  function getClass(value){
    if(value < 0.8){return 'Zeer laag'}
    else if(value < 3){return 'Laag'}
    else if(value < 6){return 'Midden'}
    else if(value < 15){return 'Hoog'}
    else{return 'Zeer hoog'}
  }

  $: {
    if(numerical){
      if($gemeenteSelection !== null){
        rangeExtent = extent($buurtenInGemeente.features, d => d.properties[variable])
        color = scaleLinear()
          .domain([rangeExtent[0], (rangeExtent[0]+rangeExtent[1])/2, rangeExtent[1]])
          .range(["green", "#e5e4b5", "purple"]);
      }
    }else{
      color = scaleOrdinal()
        .domain(['Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog'])
        .range(['#004c6d', '#346888', '#5886a5', '#7aa6c2', '#9dc6e0'].reverse())

    }
  }

  const titleHeight = h*0.1
  const bodyHeight = h*0.9

</script>

<div class='indicator-div'>
  <div class='indicator-title' style='height: {titleHeight}px'><h2>{variable}</h2></div>
  <div class='indicator-body' style='height: {bodyHeight}px'>
    {#if numerical === true}
      <div class='indicator-overview' style='height: {bodyHeight*0.2}px'>
        <Stats {bodyHeight} {variable} {color}/>
      </div>
      <div class='indicator-graph' style='height:{bodyHeight*0.4}px' bind:clientWidth={wGraph}>
        {#if $gemeenteSelection !== null}
          <BeeswarmPlot w={wGraph} h={bodyHeight*0.4} {variable} {color} />
        {:else}
          <p style='text-align:center; padding-top:50px; font-size:18px'><em>Selecteer gemeente...</em></p>
        {/if}
      </div>
    {:else}
      <div class='indicator-graph' style='height:{bodyHeight*0.6}px' bind:clientWidth={wGraph}>
        <BarPlot w={wGraph} h={bodyHeight*0.4} {variable} {color} {getClass} />
        <BarPlotLegend w={wGraph} style='height:{bodyHeight*0.2}px' {color}/>
      </div>
    {/if}
    <div class='indicator-map' style='height:{bodyHeight*0.4}px' bind:clientWidth={wMap}>
      {#if $gemeenteSelection !== null}
        <Map w={wMap} h={bodyHeight*0.4} mainMapFlag={false} {color} {variable} {getClass} {numerical}/>
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