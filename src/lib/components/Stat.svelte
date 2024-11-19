<script>
  import { gemeenteSelection, alleGemeentesJSONData, geselecteerdeBuurtJSONData, buurtNaamAfkorting, gemeenteNaamAfkorting, wijktypeAfkorting } from "$lib/stores";
  import { t } from '$lib/i18n/translate.js';

  export let w;
  export let h;

  export let regio;
  export let xScaleStats;
  export let meanValue;
  export let indicatorValueColor;

  $: name = (regio === 'Nederland')
    ? t('Nederland')
    : (regio === 'Gemeente')
      ? t("Gemeente") + ' ' + $alleGemeentesJSONData.features.filter(gemeente => gemeente.properties['GM_CODE'] === $gemeenteSelection)[0].properties[$gemeenteNaamAfkorting]
      : (regio === 'Buurt')
        ? t('Buurt') + ' ' + $geselecteerdeBuurtJSONData.properties[$buurtNaamAfkorting]
        : t('Wijktype') + ' ' + $geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting]
  
  $: if(name && name.length > 25){
    name = name.slice(0, 23) + '...'
  }

</script>

<svg>
  <g transform='translate(0,{h/2})'>
    <text dx={170} dy='0.32em' text-anchor='end' font-size='13'>{name}</text>
    <rect x={170+5} y='-0.4em' fill={(indicatorValueColor !== null) ? indicatorValueColor(meanValue) : 'steelblue'} width={xScaleStats(meanValue)} height={h*0.45} rx="4"></rect>
    <text dx={(meanValue !== 'Geen data') ? 170 + 10 + xScaleStats(meanValue) : 180} dy='0.34em' font-size='11'>
      {(meanValue !== 'Geen data') ? Math.round(meanValue*100)/100 : 'Geen data'}
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