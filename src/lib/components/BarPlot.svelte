<script>
  import { wijkTypeJSONData, wijktypeAfkorting, alleBuurtenJSONData, gemeenteSelection, buurtenInGemeenteJSONData, buurtSelection, gemeenteNaamAfkorting, alleGemeentesJSONData, geselecteerdeBuurtJSONData, tooltipRegion, tooltipValues, buurtNaamAfkorting } from "$lib/stores";
  import { scaleLinear, scaleBand, stack } from "d3";
  import { checkContrast } from "$lib/noncomponents/checkContrast";
  import { getRegioNaam } from "$lib/noncomponents/getRegioNaam";
  import { barPlotMouseOut, barPlotMouseOver } from "$lib/noncomponents/barPlotMouseEvents";
  import { berekenPercentagesVoorElkeKlasseMultiIndicator, berekenPercentagesVoorElkeKlasseSingleIndicator } from "$lib/noncomponents/berekenPercentagesVoorElkeKlasse";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator;
  export let indicatorValueColorscale;
  export let getClassByIndicatorValue
  export let multi

  const margin = {bottom:0, top:30, left:30, right:30}

  const berekenPercentagesVoorElkeKlasse = (multi) ? berekenPercentagesVoorElkeKlasseMultiIndicator : berekenPercentagesVoorElkeKlasseSingleIndicator

  const nederlandValues = berekenPercentagesVoorElkeKlasse(indicator, $alleBuurtenJSONData, 'Nederland')
  let barData = []
  let groups = []

  $: {
    if($buurtSelection !== null){
      if($geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting]){
        barData = [nederlandValues, berekenPercentagesVoorElkeKlasse(indicator, $buurtenInGemeenteJSONData, 'Gemeente'), berekenPercentagesVoorElkeKlasse(indicator, {type: 'FeatureCollection', features: [$geselecteerdeBuurtJSONData]}, 'Buurt'), berekenPercentagesVoorElkeKlasse(indicator, $wijkTypeJSONData, 'Wijktype')]
        groups = ['Nederland', 'Gemeente', 'Buurt', 'Wijktype']
      }else{
        barData = [nederlandValues, berekenPercentagesVoorElkeKlasse(indicator, $buurtenInGemeenteJSONData, 'Gemeente'), berekenPercentagesVoorElkeKlasse(indicator, {type: 'FeatureCollection', features: [$geselecteerdeBuurtJSONData]}, 'Buurt')]
        groups = ['Nederland', 'Gemeente', 'Buurt']
      }
    }else if($gemeenteSelection !== null){
      barData = [nederlandValues, berekenPercentagesVoorElkeKlasse(indicator, $buurtenInGemeenteJSONData, 'Gemeente')]
      groups = ['Nederland', 'Gemeente']
    }else{
      barData = [nederlandValues]
      groups = ['Nederland']
    }
  }

  $: stackedData = stack()
    .keys(Object.keys(indicator.klassen))
    (barData)
  
  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([ margin.left, graphWidth-margin.right ])
  
  $: yScale = scaleBand()
    .domain(groups)
    .range([0, (indicatorHeight - margin.top - margin.bottom) * (barData.length/3.5) ])


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
    {#each groups as group,i}
      <text style='fill:#645F5E' x={graphWidth/2} text-anchor='middle' y={i*yScale.bandwidth()-5}>{getRegioNaam(group)}</text>
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