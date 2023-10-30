<script>
  import { buurtData, gemeenteSelection, buurtSelection } from '$lib/stores';

  export let w;
  export let h;

  export let regio;
  export let xScale;
  export let meanValue;

</script>

<svg>
  <g transform='translate(0,{h/2})'>
    <text dx={w*0.25} dy='0.32em' text-anchor='end'>{regio}</text>
    <rect x={xScale(0)} y='-0.5em' width={xScale(meanValue)} height={h*0.5}></rect>
    <text dx={w*0.75} dy='0.32em'>{meanValue}</text>  
  </g>

</svg>


<style>
  svg{
    width:100%;
    height:100%;
  }
  
</style>