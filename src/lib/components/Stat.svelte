<script>
  import { municipalitySelection, neighbourhoodSelection } from "$lib/stores";
  import { getRegionName } from "$lib/noncomponents/getRegionName";

  export let graphWidth;
  export let indicatorHeight;

  export let regio;
  export let xScaleStats;
  export let medianValue;
  export let indicatorValueColorscale;

  let regioNaam = ''
  $: if($neighbourhoodSelection || $municipalitySelection){
    regioNaam = getRegionName(regio)
    if(regioNaam && regioNaam.length > 25){
      regioNaam = regioNaam.slice(0, 23) + '...'
    }
  }

</script>

<svg>
  <g transform='translate(0,{indicatorHeight/2})'>
    <text dx={170} dy='0.32em' text-anchor='end' font-size='13'>{regioNaam}</text>
    <rect x={170+5} y='-0.4em' fill={(indicatorValueColorscale !== null) ? indicatorValueColorscale(medianValue) : 'steelblue'} width={xScaleStats(medianValue)} height={indicatorHeight*0.45} rx="4"></rect>
    <text dx={(medianValue !== 'Geen data') ? 170 + 10 + xScaleStats(medianValue) : 180} dy='0.34em' font-size='11'>
      {(medianValue !== 'Geen data') ? Math.round(medianValue*100)/100 : 'Geen data'}
    </text>  
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