<script>
  import { neighbourhoodSelection, municipalitySelection, allNeighbourhoodsJSONData, jaarSelecties } from "$lib/stores";
  import { getRegionName } from "$lib/noncomponents/getRegionName";

  export let graphWidth;
  export let indicatorHeight;
  export let indicator
  export let medianValueOtherYear

  export let regio;
  export let xScaleStats;
  export let medianValue;
  export let indicatorValueColorscale;

  let regioNaam = ''
  $: if($neighbourhoodSelection || $municipalitySelection || $allNeighbourhoodsJSONData){
    regioNaam = getRegionName(regio)
    if(regioNaam && regioNaam.length > 25){
      regioNaam = regioNaam.slice(0, 23) + '...'
    }
  }

  $: rectWidth = ($jaarSelecties[indicator.title] === 'Difference')
    ? Math.abs(xScaleStats(medianValue) - xScaleStats(0))
    : xScaleStats(medianValue)

  $: rectX = ($jaarSelecties[indicator.title] === 'Difference')
    ? (medianValue > 0)
      ? 175 + xScaleStats(0)
      : 175 + xScaleStats(0) - rectWidth
    : 175

  $: textX = ($jaarSelecties[indicator.title] === 'Difference' && medianValue < 0)
    ? (medianValue !== 'Geen data') ? 170 + xScaleStats(0) - rectWidth : 180
    : (medianValue !== 'Geen data') ? 170 + 10 + xScaleStats(medianValue) : 180

  $: textAnchor = ($jaarSelecties[indicator.title] === 'Difference' && medianValue < 0)
    ? 'end'
    : 'start'
  
  $: textPlus = ($jaarSelecties[indicator.title] === 'Difference' && medianValue > 0)
    ? '+'
    : ''


</script>

<svg>
  <g transform='translate(0,{indicatorHeight/2})'>
    <text dx={170} dy='0.32em' text-anchor='end' font-size='13'>{regioNaam}</text>
    <rect x={rectX} y='-0.4em' fill={(indicatorValueColorscale !== null) ? indicatorValueColorscale(medianValue) : 'steelblue'} width={rectWidth} height={indicatorHeight*0.45} rx="4"></rect>
    {#if $jaarSelecties[indicator.title] === 'Difference'}
      <line x1={xScaleStats(0)+175} x2={xScaleStats(0)+175} y1='-0.5em' y2={indicatorHeight*0.2} stroke='grey' stroke-width='5' stroke-linecap="round"/>
    {/if}
    {#if regio !== 'Nederland'}
      <g class='hoveryear_{indicator.title.replaceAll(' ', '')}' transform='translate({xScaleStats(medianValueOtherYear)+175},0)' style='visibility:hidden'>
        <line y1='-0.5em' y2={indicatorHeight*0.06} stroke='#E1575A' stroke-width='5' stroke-linecap="round"/>
        <text style='fill:#E1575A; font-size:10px' text-anchor={'middle'} dx={0} dy='1.25em'>{Math.round(medianValueOtherYear*10)/10}</text>
      </g>
    {/if}
    <text dx={textX} dy='0.34em' font-size='11' text-anchor={textAnchor}>
      {(medianValue !== 'Geen data') ? textPlus + Math.round(medianValue*100)/100 : 'Geen data'}
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