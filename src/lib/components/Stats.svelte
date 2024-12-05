<script>

  import { allNeighbourhoodsJSONData, districtTypeJSONData, districtTypeAbbreviation, municipalitySelection, neighbourhoodSelection, neighbourhoodCodeAbbreviation, municipalityCodeAbbreviation, selectedNeighbourhoodJSONData, alleIndicatoren2019, jaarSelecties } from "$lib/stores";
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
    'medianValueNederland':calcMedian($allNeighbourhoodsJSONData.features.map(neighbourhood => neighbourhood.properties[indicator.attribute])),
    'medianValueGemeente':0,
    'medianValueBuurt':0,
    'medianValueWijktype':0
  };

  $: if($municipalitySelection !== null){
    // Neighbourhoods binnen municipality
    const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection)
    medianValuesDict['medianValueGemeente'] = calcMedian(municipalityFilter.map(neighbourhood => neighbourhood.properties[indicator.attribute]))
  }else{
    medianValuesDict['medianValueGemeente'] = 0
  }
  $: if($neighbourhoodSelection !== null){
    // deze filter is 1 neighbourhood
    const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection)
    medianValuesDict['medianValueBuurt'] = (neighbourhoodFilter[0].properties[indicator.attribute] !== null)
      ? Math.round(neighbourhoodFilter[0].properties[indicator.attribute]*100)/100
      : 'Geen data'

    medianValuesDict['medianValueWijktype'] = calcMedian($districtTypeJSONData.features.map(neighbourhood => neighbourhood.properties[indicator.attribute]))

  }else{
    medianValuesDict['medianValueBuurt'] = 0
    medianValuesDict['medianValueWijktype'] = 0
  }

  $: xScaleMin = min([0, medianValuesDict['medianValueNederland'], medianValuesDict['medianValueGemeente'], medianValuesDict['medianValueBuurt'], medianValuesDict['medianValueWijktype']])
  // grondwater hoog kan negatief zijn, en de schaal moet wat opgerekt
  if(xScaleMin < 0){
    xScaleMin -= 10
  }

  let xDomain;
  $:{
    let medianValues = [medianValuesDict['medianValueNederland'], medianValuesDict['medianValueGemeente'], medianValuesDict['medianValueBuurt'], medianValuesDict['medianValueWijktype']]
    console.log(indicator.title, medianValues)
    if(indicator.title !== t('Grondwaterstand 2050 hoog')){
      // ingewikkelde code kan verbeterd
      if($alleIndicatoren2019.map(d => d.title).includes(indicator.title)){
        const otherYear = ($jaarSelecties[indicator.title] === '2019')
          ? '2023'
          : '2019'
        const attributeYearSliced = indicator.attribute.slice(0,-4)
        const otherYearAttribute = attributeYearSliced + otherYear
        console.log(otherYearAttribute, indicator.attribute)
        medianValues.push(calcMedian($allNeighbourhoodsJSONData.features.map(neighbourhood => neighbourhood.properties[otherYearAttribute])))
        if($municipalitySelection !== null){
          const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection)
          medianValues.push(calcMedian(municipalityFilter.map(neighbourhood => neighbourhood.properties[otherYearAttribute])))
        }
        if($neighbourhoodSelection !== null){
          const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection)
          const medianValueBuurt = (neighbourhoodFilter[0].properties[otherYearAttribute] !== null)
            ? Math.round(neighbourhoodFilter[0].properties[otherYearAttribute]*100)/100
            : 'Geen data'
          if(medianValueBuurt !== 'Geen data'){medianValues.push(medianValueBuurt)}
          
          medianValues.push(calcMedian($districtTypeJSONData.features.map(neighbourhood => neighbourhood.properties[otherYearAttribute])))
        }
      }
      console.log(medianValues)
      xDomain = [0, max(medianValues)]
    }else{
      xDomain = [0, min(medianValues)]
    }
  }

  $: xScaleStats = scaleLinear()
    .domain(xDomain)
    .range([0, statsWidth-240])

</script>

<div class='indicator-stats' style='visibility:hidden; height: {bodyHeight*0.2*0.25}px' bind:clientWidth={statsWidth}><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Nederland' medianValue={medianValuesDict['medianValueNederland']} {xScaleStats}/></div>
{#if $municipalitySelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Gemeente' medianValue={medianValuesDict['medianValueGemeente']} {xScaleStats}/></div>
{/if}
{#if $neighbourhoodSelection !== null}
  <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Buurt' medianValue={medianValuesDict['medianValueBuurt']} {xScaleStats}/></div>
  {#if $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]}
    <div class='indicator-stats' style='height: {bodyHeight*0.2*0.25}px'><Stat {indicatorValueColorscale} graphWidth={statsWidth} indicatorHeight={bodyHeight*0.2*0.25} regio='Wijktype' medianValue={medianValuesDict['medianValueWijktype']} {xScaleStats}/></div>
  {/if}
{/if}


<style>

  
</style>