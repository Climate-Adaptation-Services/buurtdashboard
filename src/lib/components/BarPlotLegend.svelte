<script>
  import { t } from "$lib/i18n/translate"

  export let indicatorValueColorscale
  export let graphWidth
  export let indicator

  // const padding3 = 90
  // const padding2 = 120
  // $: innerwidth3 = (graphWidth - 2*padding3) / 3
  // $: innerwidth2 = (graphWidth - 2*padding2) / 2

  const klasseNamen = Object.keys(indicator.classes)
  const marginTop = klasseNamen.length > 6 ? 0 : 15
  const margin = { top: marginTop, bottom: 30, left: 30, right: 0 }
  $: legendElementWidth = (graphWidth - margin.left - margin.right) / 3
</script>

<div
  class="barplot-legend"
  style="height:26%; width:{graphWidth - margin.left - margin.right}px; margin-left:{margin.left}px; margin-top:{margin.top}px"
>
  {#each klasseNamen as klasse, i}
    {#if !(["Waterdiepte bij hevige bui", t("Gevoelstemperatuur"), "Maximale overstromingsdiepte"].includes(indicator.title) && klasse === "No data")}
      <div class="legend-element" style="width:{legendElementWidth}px">
        <svg>
          <g>
            <rect x={0} y={0} width={12} height={12} fill={indicatorValueColorscale(klasse)}></rect>
            <text style="fill:#645F5E" dx="20px" dy="0.74em" font-size="13px">{klasse}</text>
          </g>
        </svg>
      </div>
    {/if}
  {/each}
</div>

<style>
  svg {
    width: 100%;
    height: 100%;
  }

  .barplot-legend {
    width: 100%;
    /* display: flex; */
    /* flex-direction: column; */
    /* margin-left:50px;
    margin-right:50px; */
  }

  .legend-element {
    float: left;
    height: 27px;
    width: 50%;
  }
</style>
