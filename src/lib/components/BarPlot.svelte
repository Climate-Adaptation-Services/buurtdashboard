<script>
  import { districtTypeJSONData, districtTypeAbbreviation, allNeighbourhoodsJSONData, municipalitySelection, neighbourhoodsInMunicipalityJSONData, neighbourhoodSelection, municipalityNameAbbreviation, allMunicipalitiesJSONData, selectedNeighbourhoodJSONData, tooltipRegion, tooltipValues, neighbourhoodNameAbbreviation } from "$lib/stores";
  import { scaleLinear, scaleBand, stack } from "d3";
  import { checkContrast } from "$lib/noncomponents/checkContrast";
  import { getRegionName } from "$lib/noncomponents/getRegionName";
  import { barPlotMouseOut, barPlotMouseOver } from "$lib/noncomponents/barPlotMouseEvents";
  import { calcPercentagesForEveryClassMultiIndicator, calcPercentagesForEveryClassSingleIndicator } from "$lib/noncomponents/calcPercentagesForEveryClass";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator;
  export let indicatorValueColorscale;
  export let getClassByIndicatorValue
  export let aggregated

  const margin = {bottom:0, top:30, left:30, right:30}

  const calcPercentagesForEveryClass = (aggregated) ? calcPercentagesForEveryClassMultiIndicator : calcPercentagesForEveryClassSingleIndicator

  const nederlandValues = calcPercentagesForEveryClass(indicator, $allNeighbourhoodsJSONData, 'Nederland')
  let barPlotData = []
  let regios = []

  $: {
    if($neighbourhoodSelection !== null){
      if($selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]){
        barPlotData = [calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, 'Gemeente'), calcPercentagesForEveryClass(indicator, {type: 'FeatureCollection', features: [$selectedNeighbourhoodJSONData]}, 'Buurt'), calcPercentagesForEveryClass(indicator, $districtTypeJSONData, 'Wijktype')]
        regios = ['Nederland', 'Gemeente', 'Buurt', 'Wijktype']
      }else{
        barPlotData = [calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, 'Gemeente'), calcPercentagesForEveryClass(indicator, {type: 'FeatureCollection', features: [$selectedNeighbourhoodJSONData]}, 'Buurt')]
        regios = ['Nederland', 'Gemeente', 'Buurt']
      }
    }else if($municipalitySelection !== null){
      barPlotData = [calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, 'Gemeente')]
      regios = ['Nederland', 'Gemeente']
    }else{
      barPlotData = []
      regios = ['Nederland']
    }
  }

  $: if(indicator.title === 'Groen/Grijs/Blauw'){console.log(indicator.title, barPlotData)}

  $: stackedData = stack()
    .keys(Object.keys(indicator.classes))
    (barPlotData)
  
  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([ margin.left, graphWidth-margin.right ])
  
  $: yScale = scaleBand()
    .domain(regios)
    .range([0, (indicatorHeight - margin.top - margin.bottom) * (barPlotData.length/3.5) ])


</script>


<svg class={'barplot_' + indicator.attribute} style='height:66.66%'>

  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class='stack' fill={indicatorValueColorscale(stacked.key)}>
        {#each stacked as st}
          <rect on:mouseover={() => barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked)} on:mouseout={barPlotMouseOut(indicator, st, stacked)} class={'barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>','') + st.data.group}
            x={xScale(st[0])} y={yScale(st.data.group)} width={xScale(st[1]) - xScale(st[0])} height={yScale.bandwidth()/2} stroke-width='4'>
          </rect>
          {#if xScale(st[1]) - xScale(st[0]) > 40}
            <text text-anchor='middle' x={xScale(st[0]) + (xScale(st[1]) - xScale(st[0]))/2} y={yScale(st.data.group)} fill={(checkContrast(indicatorValueColorscale(stacked.key))) ? 'white' : 'black'} dy='1.3em' font-size='14px' pointer-events='none'>{Math.round(st.data[stacked.key]*10)/10}%</text>
          {/if}
        {/each}
      </g>
    {/each}
    {#each regios.slice(1) as regio,i}
      <text style='fill:#645F5E' x={graphWidth/2} text-anchor='middle' y={i*yScale.bandwidth()-5}>{getRegionName(regio)}</text>
    {/each}
  </g>
</svg>



<style>

  svg{
    width:100%;
  }

  rect{
    transition: all 2s;
  }

</style>