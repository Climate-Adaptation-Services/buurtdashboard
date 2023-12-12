<script>
  import { buurtData, buurtSelection, gemeenteSelection, buurtenInGemeente, wijkTypeData } from "$lib/stores";
  import BeeswarmPlot from "./BeeswarmPlot.svelte";
  import Stats from "./Stats.svelte";
  import { scaleLinear, extent, scaleOrdinal } from 'd3';
  import Map from "./Map.svelte";
  import BarPlot from "./BarPlot.svelte";
  import BarPlotMulti from "./BarPlotMulti.svelte";
  import BarPlotLegend from "./BarPlotLegend.svelte";

  export let h
  export let indicator

  let wGraph;
  let wMap;

  let color = null
  let rangeExtent = [0,1]

  function getClass(value){
    let kl = ''
    Object.keys(indicator.klassen).reverse().forEach(klasse => {
      if(value < indicator.klassen[klasse]){
        kl = klasse;
      }
    });
    return kl;
  }

  $: {
    if(indicator.numerical){
      if($gemeenteSelection !== null){
        rangeExtent = extent($buurtenInGemeente.features, d => d.properties[indicator.attribute])
        color = scaleLinear()
          .domain([rangeExtent[0], (rangeExtent[0]+rangeExtent[1])/2, rangeExtent[1]])
          .range(indicator.color);
      }
    }else{
      color = scaleOrdinal()
        .domain(indicator.color.domain)
        .range(indicator.color.range)
    }
  }

  const titleHeight = h*0.2
  const bodyHeight = h*0.8

</script>

<div class='indicator-div'>
  <div class='indicator-title' style='height: {titleHeight}px'>
    <h4 style='margin:0px; color:#BB9012'>Categorie: {indicator.categorie}</h4>
    <h2 style='margin:0px; padding:5px 15px 5px 15px; margin:15px 0px 15px 0px; background-color:#36575B; border-radius:15px; color:white'>{indicator.titel}</h2>
    <h4 style='margin:0px; padding:0px 10px 0px 10px; font-weight:normal; color:#7e7975; text-align: center;'>{indicator.subtitel}</h4>
  </div>
  <div class='indicator-body' style='height: {bodyHeight}px'>
    {#if indicator.numerical === true}
      <div class='indicator-overview' style='height: {bodyHeight*0.2}px'>
        <Stats {bodyHeight} {indicator} {color}/>
      </div>
      <div class='indicator-graph' style='height:{bodyHeight*0.4}px' bind:clientWidth={wGraph}>
        {#if $gemeenteSelection !== null}
          <BeeswarmPlot w={wGraph} h={bodyHeight*0.4} {indicator} {color} nodesData={structuredClone($buurtenInGemeente.features)}/>
        {:else}
          <p style='text-align:center; padding-top:50px; font-size:18px; position:absolute; left:{wGraph/3}px'><em>Selecteer gemeente...</em></p>
        {/if}
      </div>
    {:else}
      <div class='indicator-graph' style='height:{bodyHeight*0.6}px' bind:clientWidth={wGraph}>
        {#if indicator.multiline}
          <BarPlotMulti w={wGraph} h={bodyHeight*0.4} {indicator} {color} {getClass} />
        {:else}
          <BarPlot w={wGraph} h={bodyHeight*0.4} {indicator} {color} {getClass} />
        {/if}
        <BarPlotLegend w={wGraph} style='height:{bodyHeight*0.2}px' {color} {indicator}/>
      </div>
    {/if}
    <div class='indicator-map' style='height:{bodyHeight*0.4}px' bind:clientWidth={wMap}>
      {#if $gemeenteSelection !== null}
        <Map w={wMap} h={bodyHeight*0.4} mainMapFlag={false} {color} {indicator} {getClass} />
      {/if}
      <span style='width:100%; position:absolute; bottom:0px; display:flex; justify-content:space-between'><h5><strong>Bron: {indicator.bron}</strong></h5><h5><a target='_blank' href={indicator.link}>Naar het kaartverhaal</a></h5></span>
    </div>
  </div>
</div>


<style>
  .indicator-div{
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    position:relative;
  }
  .indicator-title{
    display: flex;
    flex-direction: column;
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

  h5{
    padding:10px;
    margin:0px;
  }
  a{
    color:black;
  }

</style>