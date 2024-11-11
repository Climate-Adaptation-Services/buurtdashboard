<script>
  import { checkContrast } from "$lib/noncomponents/checkContrast";
  import { wijkTypeData, buurtData, gemeenteSelection, buurtenInGemeente, buurtSelection, currentData, gemeenteData, buurtSelectionData, hoveredRegion, hoveredValue, buurtNaam } from "$lib/stores";
  import { scaleLinear, select, scaleBand, stack } from "d3";
  import * as _ from 'lodash';
  import { t } from '$lib/i18n/translate.js';

  export let w;
  export let h;
  export let indicator;
  export let color;

  const margin = {bottom:0, top:30, left:30, right:30}

  function getPercentages(data, regio){
    let totalOpp = 0
    let klassenTotal = []

    for(let i=0;i<Object.keys(indicator.klassen).length;i++){
      klassenTotal.push({klasseNaam: Object.keys(indicator.klassen)[i], waarde:0})
    }
    data.features.forEach(buurt => {
      let buurtOpp = (indicator.titel === 'Functionele gebieden')
        ? buurt.properties['buurt_opp_incl_agrarisch']
        : buurt.properties['buurt_opp_zonderagr']

      totalOpp += buurtOpp

      // zorg ervoor dat groen/grijs openbaar optelt tot 100%, en niet maar tot % openbaar
      // if(indicator.titel === 'Groen en grijs openbare ruimte'){totalOpp -= buurtOpp * ((100 - buurt.properties['Openbaar'])/100)}
      
      // Geen data categorie eruit, rest tot 100%
      if(indicator.titel === t('Gevoelstemperatuur')){totalOpp -= buurtOpp * buurt.properties['NDPETperc']}
      
      Object.keys(indicator.klassen).forEach(kl => {
        // is dit goed zo of moeten we anders met no data (NaN) omgaan
        if(buurt.properties[indicator.klassen[kl]] && !isNaN(parseFloat(buurt.properties[indicator.klassen[kl]]))){
          klassenTotal.filter(kl2 => kl2.klasseNaam === kl)[0].waarde += buurtOpp * +buurt.properties[indicator.klassen[kl]]
        }
      });

    });

    console.log('klassenTotal', klassenTotal, totalOpp, regio, data)

    klassenTotal.forEach(kl => {
      console.log(kl)
      kl.waarde = (kl.waarde/totalOpp)
      if(indicator.titel === t('Gevoelstemperatuur')){kl.waarde *= 100}
    })

    let result = {'group':regio}
    Object.keys(indicator.klassen).forEach(klasse => {
      result[klasse] = klassenTotal.filter(kl => kl.klasseNaam === klasse)[0].waarde
    });  

    return result
  }

  const nederlandValues = getPercentages($buurtData, 'Nederland')
  let barData = []
  let groups = []

  $: {
    if($buurtSelection !== null){
      if($buurtSelectionData.properties['def_wijkty']){
        barData = [nederlandValues, getPercentages($buurtenInGemeente, 'Gemeente'), getPercentages({type: 'FeatureCollection', features: [$buurtSelectionData]}, 'Buurt'), getPercentages($wijkTypeData, 'Wijktype')]
        groups = ['Nederland', 'Gemeente', 'Buurt', 'Wijktype']
      }else{
        barData = [nederlandValues, getPercentages($buurtenInGemeente, 'Gemeente'), getPercentages({type: 'FeatureCollection', features: [$buurtSelectionData]}, 'Buurt')]
        groups = ['Nederland', 'Gemeente', 'Buurt']
      }
    }else if($gemeenteSelection !== null){
      barData = [nederlandValues, getPercentages($buurtenInGemeente, 'Gemeente')]
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
    .range([ margin.left, w-margin.right ])
  
  const padding = 0.6
  $: yScale = scaleBand()
    .domain(groups)
    .range([0, (h - margin.top - margin.bottom) * (barData.length/3.5) ])
    // .padding([padding])
    
  function getName(group){
    return (group === 'Nederland')
    ? t('Nederland')
    : (group === 'Gemeente')
      ? t("Gemeente") + ' ' + $gemeenteData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties['GM_NAAM']
      : (group === 'Buurt')
        ? t('Buurt') + ' ' + $buurtSelectionData.properties[$buurtNaam]
        : t('Wijktype') + ' ' + $buurtSelectionData.properties['def_wijkty']
  }

  function mouseOver(st, stacked){
    hoveredValue.set({
      indicator: stacked.key, 
      value: Math.round((st[1]-st[0])*100)/100 + '%', 
      color: color(stacked.key)
    })

    let elem = document.getElementsByClassName('barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>','')  + st.data.group)[0]
    let rectmap = elem.getBoundingClientRect();
    let tooltipCenter = [rectmap.left, rectmap.top]
    
    hoveredRegion.set({
      'region': ($gemeenteSelection === null) ? 'Gemeente' : 'Buurt',
      'center': tooltipCenter,
      'name': (st.data.group === 'Nederland') 
        ? 'Nederland'
        : (st.data.group === 'Gemeente') 
          ? 'Gemeente ' + $gemeenteData.features.filter(gem => gem.properties['GM_CODE'] === $gemeenteSelection)[0].properties['GM_NAAM']
          : (st.data.group === 'Wijktype') 
            ? 'Wijktype ' + $buurtSelectionData.properties['def_wijkty']
            : 'De buurt ' + $buurtSelectionData.properties[$buurtNaam]
    })
  }

  function mouseOut(st, stacked){
    select('.' + 'barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>','')  + st.data.group)
      .attr('stroke', 'none')
          
    hoveredValue.set(null)

    hoveredRegion.set(null)
  }

</script>


<svg class={'barplot_' + indicator.attribute} style='height:66.66%'>

  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class='stack' fill={color(stacked.key)}>
        {#each stacked as st}
          <rect on:mouseover={() => mouseOver(st, stacked)} on:mouseout={mouseOut(st, stacked)} class={'barplot_rect' + indicator.attribute + stacked.key.replaceAll(' ', '').replaceAll('>','') + st.data.group}
            x={xScale(st[0])} y={yScale(st.data.group)} width={xScale(st[1]) - xScale(st[0])} height={yScale.bandwidth()/2} stroke-width='4'>
          </rect>
          {#if xScale(st[1]) - xScale(st[0]) > 40}
            <text text-anchor='middle' x={xScale(st[0]) + (xScale(st[1]) - xScale(st[0]))/2} y={yScale(st.data.group)} fill={(checkContrast(color(stacked.key))) ? 'white' : 'black'} dy='1.3em' font-size='14px' pointer-events='none'>{Math.round(st.data[stacked.key]*10)/10}%</text>
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