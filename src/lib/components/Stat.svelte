<script>
  import { gemeenteSelection, gemeenteData, buurtSelectionData, buurtNaam } from "$lib/stores";

  export let w;
  export let h;

  export let regio;
  export let xScaleStats;
  export let meanValue;
  export let color;

  $: name = (regio === 'Nederland')
    ? regio
    : (regio === 'Gemeente')
      ? $gemeenteData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties['GM_Naam']
      : (regio === 'Buurt')
        ? $buurtSelectionData.properties[$buurtNaam]
        : $buurtSelectionData.properties['def_wijkty']
  
  $: if(name && name.length > 15){
    name = name.slice(0, 13) + '...'
  }

</script>

<svg>
  <g transform='translate(0,{h/2})'>
    <text dx={110} dy='0.32em' text-anchor='end' font-size='13'>{name}</text>
    <rect x={110+5} y='-0.4em' fill={(color !== null) ? color(meanValue) : 'steelblue'} width={xScaleStats(meanValue)} height={h*0.45} rx="4"></rect>
    <text dx={110 + 10 + xScaleStats(meanValue)} dy='0.34em' font-size='11'>{meanValue}</text>  
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
  }
  
</style>