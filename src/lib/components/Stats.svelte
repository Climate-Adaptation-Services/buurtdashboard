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
    <text dx={110} dy='0.32em' text-anchor='end' font-size='13'>{name}</text>
    <rect x={110+5} y='-0.4em' fill={color(meanValue)} width={xScale(meanValue)} height={h*0.45} rx="4"></rect>
    <text dx={110 + 10 + xScale(meanValue)} dy='0.34em' font-size='11'>{meanValue}</text>  
  </g>
</svg>


<style>
  svg{
    width:100%;
    height:100%;
  }

  rect{
    transition: all 2s;
  }

  text{
    fill:#645F5E;
    transition: all 2s;
  }
  
</style>