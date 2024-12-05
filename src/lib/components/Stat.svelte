<script>
  import { getRegionName } from "$lib/noncomponents/getRegionName";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator
  export let medianValueOtherYear

  export let regio;
  export let xScaleStats;
  export let medianValue;
  export let indicatorValueColorscale;

  $: regioNaam = getRegionName(regio)
  
  $: if(regioNaam && regioNaam.length > 25){
    regioNaam = regioNaam.slice(0, 23) + '...'
  }

</script>

<svg>
  <g transform='translate(0,{indicatorHeight/2})'>
    <text dx={170} dy='0.32em' text-anchor='end' font-size='13'>{regioNaam}</text>
    <rect x={170+5} y='-0.4em' fill={(indicatorValueColorscale !== null) ? indicatorValueColorscale(medianValue) : 'steelblue'} width={xScaleStats(medianValue)} height={indicatorHeight*0.45} rx="4"></rect>
    {#if regio !== 'Nederland'}
      <g class='hoveryear_{indicator.title.replaceAll(' ', '')}' transform='translate({xScaleStats(medianValueOtherYear)+175},0)' style='visibility:hidden'>
        <line y1='-0.5em' y2={indicatorHeight*0.06} stroke='red' stroke-width='5' stroke-linecap="round"/>
        <text style='fill:red; font-size:10px' text-anchor={'middle'} dx={0} dy='1.25em'>{Math.round(medianValueOtherYear*10)/10}</text>
      </g>
    {/if}
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