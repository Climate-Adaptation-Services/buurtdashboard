<script>
  import { gemeenteSelection, buurtenInGemeente, gemeenteData, indicatorenLijst2019 } from "$lib/stores";
  import BeeswarmPlot from "./BeeswarmPlot.svelte";
  import Stats from "./Stats.svelte";
  import { scaleLinear, extent, scaleOrdinal } from 'd3';
  import Map from "./Map.svelte";
  import BarPlot from "./BarPlot.svelte";
  import BarPlotMulti from "./BarPlotMulti.svelte";
  import BarPlotLegend from "./BarPlotLegend.svelte";
  import { afterUpdate, onMount } from "svelte";
  // import { _ } from 'svelte-i18n'
  import { t } from '$lib/i18n/translate.js';


  export let h
  export let indicator

  let wGraph;
  let wMap;

  let color = null
  let rangeExtent = [0,1]

  function getClass(value){
    if(value === null){return t("Geen_data")}
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
        rangeExtent = extent($buurtenInGemeente.features, d => +d.properties[indicator.attribute])
        // this can deal with any amount of colors in the scale
        const step = (rangeExtent[1] - rangeExtent[0]) / (indicator.color.range.length-1)
        if(indicator.titel !== 'Grondwaterstand 2050 hoog'){
          color = scaleLinear()
            .domain([...Array(indicator.color.range.length).keys()].map(i => rangeExtent[0] + i * step))
            .range(indicator.color.range);
        }else{
          color = scaleLinear()
            .domain([...Array(indicator.color.range.length).keys()].map(i => rangeExtent[0] + i * step).reverse())
            .range(indicator.color.range);
        }

      }
    }else{
      color = scaleOrdinal()
        .domain(indicator.color.domain)
        .range(indicator.color.range)
    }
  }

  const titleHeight = h*0.2
  const bodyHeight = h*0.8

  let indicatorInfoPosition
  afterUpdate(() => {
    indicatorInfoPosition = (window.innerWidth - document.getElementsByClassName('indicator-info-'+indicator.attribute)[0].getBoundingClientRect().right > 180)
    ? wGraph
    : 0
  })


</script>

<div class='indicator-div'>
  <h3 class='question-mark' style='padding:3px 10px 3px 10px; margin:0; position:absolute; border-radius:50px; right:5px; top:5px; color:white;background-color:#36575B; cursor:default'>?</h3>
  <div class={'indicator-info indicator-info-'+indicator.attribute} style='left:{indicatorInfoPosition}px'>
    <p style='padding:3px 10px 3px 10px; border-radius:50px; color:white;background-color:#36575B; float:left'><strong>{indicator.titel}</strong></p>
    <hr width='100%'>
    <p>{indicator.omschrijving}</p>
  </div>

  <div class='indicator-title' style='height: {titleHeight}px'>
    <h4 style='margin:0px; color:#BB9012'>{t("Categorie")}: {indicator.categorie}</h4>
    <h2 style='padding:5px 15px 5px 15px; margin:10px 0px 7px 0px; background-color:#36575B; border-radius:15px; color:white'>{indicator.titel}</h2>
    <h4 style='margin:0px; padding:0px 10px 0px 10px; font-weight:normal; color:#7e7975; text-align: center;'>{indicator.subtitel}</h4>
  </div>
  <div class='indicator-body' style='height: {bodyHeight}px'>
    {#if indicator.numerical === true}
      <div class='indicator-overview' style='height: {bodyHeight*0.2}px'>
        <Stats {bodyHeight} {indicator} {color}/>
      </div>
      <div class='indicator-graph' style='height:{bodyHeight*0.4}px' bind:clientWidth={wGraph}>
        {#if $gemeenteSelection !== null}
          <svg class={'beeswarm_' + indicator.attribute}>
            <BeeswarmPlot w={wGraph} h={bodyHeight*0.2} type='upper_beeswarm' {indicator} {color} nodesData={structuredClone($buurtenInGemeente.features)}/>
            <BeeswarmPlot w={wGraph} h={bodyHeight*0.2} type='lower_beeswarm' indicator={$indicatorenLijst2019[0]} {color} nodesData={structuredClone($buurtenInGemeente.features)}/>
            <text x={wGraph/2} y={bodyHeight*0.4-18} fill='#645F5E' text-anchor='middle' font-size='14'>{indicator.plottitel} per buurt in gemeente {$gemeenteData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties['GM_NAAM']}</text>
          </svg>
        {:else}
          <p style='text-align:center; padding-top:50px; font-size:18px; position:absolute; left:{wGraph/3.4}px'><em>{t("Selecteer_gemeente")}...</em></p>
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
      <span style='width:100%; position:absolute; bottom:0px; display:flex; justify-content:space-between; pointer-events:none'>
        <h5><strong>{indicator.bron}</strong></h5>
        <h5 style='pointer-events:auto'><a target='_blank' href={indicator.link}>{t("Meer_info")}</a></h5>
      </span>
    </div>
  </div>
</div>


<style>
  svg{
    width: 100%;
    height:100%;
  }

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
    border-radius: 10px;
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

  .indicator-info{
    visibility:hidden;
    position: absolute;
    width:300px;
    background-color: white;
    top:0px;
    z-index: 1000;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 20px;
    padding:10px 20px 10px 20px;
  }

  .question-mark:hover ~ .indicator-info{
    visibility:visible;
  }



</style>