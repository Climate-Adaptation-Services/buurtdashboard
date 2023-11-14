<script>
  import { wijkTypeData, buurtData, gemeenteSelection, buurtenInGemeente, buurtSelection, currentData, gemeenteData, buurtSelectionData, hoveredRegion, hoveredValue, buurtNaam } from "$lib/stores";
  import { scaleLinear, select, scaleBand, stack } from "d3";
  import * as _ from 'lodash';
  import { onMount } from "svelte";

  export let w;
  export let h;
  export let variable;
  export let color;
  export let getClass

  const margin = {bottom:30, top:30, left:30, right:30}

  const klasseNamen = ['Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog']

  function getPercentages(data, regio){
    let totalAmount = 0
    const klassen = [
      {klasse: 'Zeer laag', waarde:0},
      {klasse: 'Laag', waarde:0},
      {klasse: 'Midden', waarde:0},
      {klasse: 'Hoog', waarde:0},
      {klasse: 'Zeer hoog', waarde:0},
    ]
    data.features.forEach(buurtOfGemeente => {
      klassen.filter(kl => kl.klasse === getClass(buurtOfGemeente.properties[variable]))[0].waarde += 1
      totalAmount += 1
    });

    klassen.forEach(kl => {
      kl.waarde = (kl.waarde/totalAmount) * 100
    })

    return {
      'group':regio, 
      'Zeer laag':klassen.filter(kl => kl.klasse === 'Zeer laag')[0].waarde,
      'Laag':klassen.filter(kl => kl.klasse === 'Laag')[0].waarde,
      'Midden':klassen.filter(kl => kl.klasse === 'Midden')[0].waarde,
      'Hoog':klassen.filter(kl => kl.klasse === 'Hoog')[0].waarde,
      'Zeer hoog':klassen.filter(kl => kl.klasse === 'Zeer hoog')[0].waarde
    }
  }

  const nederlandValues = getPercentages($buurtData, 'Nederland')
  let barData = []
  let groups = []

  $: {
    if($buurtSelection !== null){
      barData = [getPercentages($buurtData, 'Nederland'), getPercentages($buurtenInGemeente, 'Gemeente'), getPercentages($wijkTypeData, 'Wijktype'), getPercentages({type: 'FeatureCollection', features: [$buurtSelectionData]}, 'Buurt')]
      groups = ['Nederland', 'Gemeente', 'Wijktype', 'Buurt']
    }else if($gemeenteSelection !== null){
      barData = [getPercentages($buurtData, 'Nederland'), getPercentages($buurtenInGemeente, 'Gemeente')]
      groups = ['Nederland', 'Gemeente']
    }else{
      barData = [getPercentages($buurtData, 'Nederland')]
      groups = ['Nederland']
    }
  }

  $: stackedData = stack()
    .keys(klasseNamen)
    (barData)
  
  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([ margin.left, w-margin.right ])
  
  const padding = 0.6
  $: yScale = scaleBand()
    .domain(groups)
    .range([0, (h - margin.top - margin.bottom) * (barData.length/4) ])
    .paddingInner([padding])
    
  function getName(group){
    return (group === 'Nederland')
    ? group
    : (group === 'Gemeente')
      ? 'Gemeente ' + $gemeenteData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties['GM_Naam']
      : (group === 'Buurt')
        ? $buurtSelectionData.properties['bu_naam']
        : 'Wijktype ' + $buurtSelectionData.properties['def_wijkty']
  }

  function mouseOver(st, stacked){
    console.log(st, stacked)

    select('.' + 'barplot_rect' + variable + stacked.key.replace(' ', '')  + st.data.group)
      .attr('stroke', 'white')
      // .raise()

    hoveredValue.set([stacked.key, Math.round((st[1]-st[0])*100)/100 + '%', color(stacked.key)])

    let elem = document.getElementsByClassName('barplot_rect' + variable + stacked.key.replace(' ', '')  + st.data.group)[0]
    let rectmap = elem.getBoundingClientRect();
    let tooltipCenter = [rectmap.left, rectmap.top]
    
    hoveredRegion.set({
      'region': ($gemeenteSelection === null) ? 'Gemeente' : 'Buurt',
      'center': tooltipCenter,
      'name': (st.data.group === 'Nederland') 
        ? 'Nederland'
        : (st.data.group === 'Gemeente') 
          ? 'Gemeente ' + $gemeenteSelection
          : (st.data.group === 'Wijktype') 
            ? 'Wijktype ' + $buurtSelectionData.properties['def_wijkty']
            : $buurtSelectionData.properties[$buurtNaam]
    })
    
  }

  function mouseOut(st, stacked){
    select('.' + 'barplot_rect' + variable + stacked.key.replace(' ', '')  + st.data.group)
      .attr('stroke', 'none')
          
    hoveredValue.set(null)

    hoveredRegion.set(null)
  }

</script>


<svg class={'barplot_' + variable} style='height:{h}'>
  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class='stack' fill={color(stacked.key)}>
        {#each stacked as st}
          <rect on:mouseover={() => mouseOver(st, stacked)} on:mouseout={mouseOut(st, stacked)} class={'barplot_rect' + variable + stacked.key.replace(' ', '') + st.data.group}
            x={xScale(st[0])} y={yScale(st.data.group)} width={xScale(st[1]) - xScale(st[0])} height={yScale.bandwidth()} stroke-width='4'>
          </rect>
          {#if xScale(st[1]) - xScale(st[0]) > 40}
            <text text-anchor='middle' x={xScale(st[0]) + (xScale(st[1]) - xScale(st[0]))/2} y={yScale(st.data.group)} fill='white' dy='1.17em' font-size='14px' pointer-events='none'>{Math.round(st.data[stacked.key]*10)/10}%</text>
          {/if}
        {/each}
      </g>
    {/each}
    {#each groups as group,i}
      <text x={w/2} text-anchor='middle' y={i*((yScale.bandwidth()/40)*100)-5}>{getName(group)}</text>
    {/each}
  </g>
</svg>



<style>

  svg{
    width:100%;
  }


</style>