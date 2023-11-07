<script>
  import { wijkTypeData, buurtData, gemeenteSelection, buurtenInGemeente, buurtSelection, currentData } from "$lib/stores";
  import { scaleLinear, select, scaleBand, stack, scaleOrdinal, axisLeft } from "d3";
  import * as _ from 'lodash';
  import { onMount } from "svelte";

  export let w;
  export let h;
  export let variable;
  export let color;

  const margin = {bottom:30, top:30, left:30, right:30}

  const klasseNamen = ['Zeer laag', 'Laag', 'Midden', 'Hoog', 'Zeer hoog']
  
  function getClass(value){
    if(value < 0.8){return 'Zeer laag'}
    else if(value < 3){return 'Laag'}
    else if(value < 6){return 'Midden'}
    else if(value < 15){return 'Hoog'}
    else{return 'Zeer hoog'}
  }

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
      barData = [getPercentages($buurtData, 'Nederland'), getPercentages($buurtenInGemeente, 'Gemeente'), getPercentages($wijkTypeData, 'Wijktype'), getPercentages($currentData, 'Buurt')]
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
  

</script>


<svg class={'barplot_' + variable} style='height:{h}'>
  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class='stack' fill={color(stacked.key)}>
        {#each stacked as st}
          <rect x={xScale(st[0])} y={yScale(st.data.group)} width={xScale(st[1]) - xScale(st[0])} height={yScale.bandwidth()}></rect>
        {/each}
      </g>
    {/each}
    {#each groups as group,i}
      <text x={w/2} text-anchor='middle' y={i*((yScale.bandwidth()/40)*100)-5}>{group}</text>
    {/each}
  </g>
</svg>



<style>

  svg{
    width:100%;
  }


</style>