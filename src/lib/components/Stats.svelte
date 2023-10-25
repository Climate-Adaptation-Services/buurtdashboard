<script>
  import * as _ from 'lodash';
  import { buurtData, gemeenteSelection, buurtSelection } from '$lib/stores';

  export let w;
  export let h;

  export let regio;
  export let variable;

  let meanValue = 0;
  if(regio === 'Nederland'){
    // alle buurten
    meanValue = Math.round(_.meanBy($buurtData.features, buurt => buurt.properties[variable])*100)/100
  }else if(regio === 'Gemeente'){
    // buurten binnen gemeente
    const gemeenteFilter = $buurtData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
    meanValue = Math.round(_.meanBy(gemeenteFilter, buurt => buurt.properties[variable])*100)/100
  }else if(regio === 'Buurt'){
    // deze filter is 1 buurt
    const buurtFilter = $buurtData.features.filter(buurt => buurt.properties['BU_CODE'] === $buurtSelection)
    meanValue = buurtFilter[0].properties[variable]
  }

</script>

<svg>
  <text x={w/2} y={h/2} text-anchor='middle'>{meanValue}</text>
</svg>


<style>
  svg{
    width:100%;
    height:100%;
  }
  
</style>