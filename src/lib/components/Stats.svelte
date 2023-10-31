<script>
  import { gemeenteSelection, buurtSelection, gemeenteData, buurtData } from "$lib/stores";

  export let w;
  export let h;

  export let regio;
  export let xScale;
  export let meanValue;
  export let color;

  $: name = (regio === 'Nederland')
    ? regio
    : (regio === 'Gemeente')
      ? $gemeenteData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties['GM_Naam']
      : $buurtData.features.filter(buurt => buurt.properties['BU_CODE'] === $buurtSelection)[0].properties['BU_NAAM']
  
  $: if(name.length > 15){
    name = name.slice(0, 13) + '...'
  }

</script>

<svg>
  <g transform='translate(0,{h/2})'>
    <text dx={110} dy='0.48em' text-anchor='end'>{name}</text>
    <rect x={110+5} y='-0.5em' fill={color(meanValue)} width={xScale(meanValue)} height={h*0.5}></rect>
    <text dx={110 + 10 + xScale(meanValue)} dy='0.48em'>{meanValue}</text>  
  </g>
</svg>


<style>
  svg{
    width:100%;
    height:100%;
  }

  text{
    font-size: 13px;
  }
  
</style>