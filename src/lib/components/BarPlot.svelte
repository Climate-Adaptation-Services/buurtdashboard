<script>
  import { wijkTypeJSONData, wijktypeAfkorting, alleBuurtenJSONData, gemeenteSelection, buurtenInGemeenteJSONData, buurtSelection, gemeenteNaamAfkorting, alleGemeentesJSONData, geselecteerdeBuurtJSONData, tooltipRegion, tooltipValues, buurtNaamAfkorting } from "$lib/stores";
  import { scaleLinear, select, scaleBand, stack } from "d3";
  import { onMount } from "svelte";
  import { checkContrast } from "$lib/noncomponents/checkContrast";
  // import { _ } from 'svelte-i18n'
  import { t } from '$lib/i18n/translate.js';


  export let w;
  export let h;
  export let indicator;
  export let indicatorValueColor;
  export let getClassByIndicatorValue

  const margin = {bottom:0, top:30, left:30, right:30}

  function getPercentages(data, regio){
    let totalAmount = 0
    let klassenTotal = []
    for(let i=0;i<Object.keys(indicator.klassen).length;i++){
      klassenTotal.push({klasseNaam: Object.keys(indicator.klassen)[i], waarde:0})
    }
    data.features.forEach(buurtOfGemeente => {
      klassenTotal.filter(kl => kl.klasseNaam === getClassByIndicatorValue(indicator, buurtOfGemeente.properties[indicator.attribute]))[0].waarde += 1
      totalAmount += 1
    });

    klassenTotal.forEach(kl => {
      kl.waarde = (kl.waarde/totalAmount) * 100
    })

    let result = {'group':regio}
    Object.keys(indicator.klassen).forEach(klasse => {
      result[klasse] = klassenTotal.filter(kl => kl.klasseNaam === klasse)[0].waarde
    });
    
    return result
  }

  const nederlandValues = getPercentages($alleBuurtenJSONData, 'Nederland')
  let barData = []
  let groups = []

  $: {
    if($buurtSelection !== null){
      if($geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting]){
        barData = [getPercentages($alleBuurtenJSONData, 'Nederland'), getPercentages($buurtenInGemeenteJSONData, 'Gemeente'), getPercentages({type: 'FeatureCollection', features: [$geselecteerdeBuurtJSONData]}, 'Buurt'), getPercentages($wijkTypeJSONData, 'Wijktype')]
        groups = ['Nederland', 'Gemeente', 'Buurt', 'Wijktype']
      }else{
        barData = [getPercentages($alleBuurtenJSONData, 'Nederland'), getPercentages($buurtenInGemeenteJSONData, 'Gemeente'), getPercentages({type: 'FeatureCollection', features: [$geselecteerdeBuurtJSONData]}, 'Buurt')]
        groups = ['Nederland', 'Gemeente', 'Buurt']
      }
    }else if($gemeenteSelection !== null){
      barData = [getPercentages($alleBuurtenJSONData, 'Nederland'), getPercentages($buurtenInGemeenteJSONData, 'Gemeente')]
      groups = ['Nederland', 'Gemeente']
    }else{
      barData = [getPercentages($alleBuurtenJSONData, 'Nederland')]
      groups = ['Nederland']
    }
  }

  $: stackedData = stack()
    .keys(Object.keys(indicator.klassen))
    (barData)
  
  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([ margin.left, w-margin.right ])
  
  const padding = 0.6
  $: yScale = scaleBand()
    .domain(groups)
    .range([0, (h - margin.top - margin.bottom) * (barData.length/3.5) ])
    // .padding([padding])
    
  function getName(group){
    return (group === 'Nederland')
    ? t("Nederland")
    : (group === 'Gemeente')
      ? t("Gemeente") + ' ' + $alleGemeentesJSONData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties[$gemeenteNaamAfkorting]
      : (group === 'Buurt')
        ? t("Buurt") + ' ' + $geselecteerdeBuurtJSONData.properties[$buurtNaamAfkorting]
        : t("Wijktype") + ' ' + $geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting]
  }

  function mouseOver(st, stacked){
    // console.log(st, stacked)

    // select('.' + 'barplot_rect' + indicator.attribute + stacked.key.replace(' ', '')  + st.data.group)
    //   .style('filter', "url(#highlightFilter)")

    tooltipValues.set({
      indicator: stacked.key, 
      value: Math.round((st[1]-st[0])*100)/100 + '%',
      color: indicatorValueColor(stacked.key)
    })

    let elem = document.getElementsByClassName('barplot_rect' + indicator.attribute + stacked.key.replace(' ', '')  + st.data.group)[0]
    let rectmap = elem.getBoundingClientRect();
    let tooltipCenter = [rectmap.left, rectmap.top]
    
    tooltipRegion.set({
      'region': ($gemeenteSelection === null) ? 'Gemeente' : 'Buurt',
      'center': tooltipCenter,
      'name': (st.data.group === 'Nederland') 
        ? 'Nederland'
        : (st.data.group === 'Gemeente') 
          ? 'Gemeente ' + $alleGemeentesJSONData.features.filter(gem => gem.properties['GM_CODE'] === $gemeenteSelection)[0].properties[$gemeenteNaamAfkorting]
          : (st.data.group === 'Wijktype') 
            ? 'Wijktype ' + $geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting]
            : 'De buurt ' + $geselecteerdeBuurtJSONData.properties[$buurtNaamAfkorting]
    })
    
  }

  function mouseOut(st, stacked){
    select('.' + 'barplot_rect' + indicator.attribute + stacked.key.replace(' ', '')  + st.data.group)
      .attr('stroke', 'none')
          
    tooltipValues.set(null)

    tooltipRegion.set(null)
  }

</script>


<svg class={'barplot_' + indicator.attribute} style='height:66.66%'>

  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class='stack' fill={indicatorValueColor(stacked.key)}>
        {#each stacked as st}
          <rect on:mouseover={() => mouseOver(st, stacked)} on:mouseout={mouseOut(st, stacked)} class={'barplot_rect' + indicator.attribute + stacked.key.replace(' ', '') + st.data.group}
            x={xScale(st[0])} y={yScale(st.data.group)} width={xScale(st[1]) - xScale(st[0])} height={yScale.bandwidth()/2} stroke-width='4'>
          </rect>
          {#if xScale(st[1]) - xScale(st[0]) > 40}
            <text text-anchor='middle' x={xScale(st[0]) + (xScale(st[1]) - xScale(st[0]))/2} y={yScale(st.data.group)} fill={(checkContrast(indicatorValueColor(stacked.key))) ? 'white' : 'black'} dy='1.3em' font-size='14px' pointer-events='none'>{Math.round(st.data[stacked.key]*10)/10}%</text>
          {/if}
        {/each}
      </g>
    {/each}
    {#each groups as group,i}
      <text style='fill:#645F5E' x={w/2} text-anchor='middle' y={i*yScale.bandwidth()-5}>{getName(group)}</text>
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