<script>
  import { t } from "$lib/i18n/translate"

  export let indicatorValueColorscale
  export let graphWidth
  export let indicator
  export let barPlotData = [] // Actual data to check if "No data" class has values

  // Make klasseNamen reactive to ensure it updates when indicator changes
  $: klasseNamen = indicator ? Object.keys(indicator.classes) : []
  $: marginTop = klasseNamen.length > 6 ? 0 : 15
  $: margin = { top: marginTop, bottom: 30, left: 30, right: 0 }
  $: legendElementWidth = (graphWidth - margin.left - margin.right) / 3

  // Reactive: Check if "No data" has any values > 0 in any region
  $: hasNoDataValues = barPlotData && barPlotData.length > 0
    ? barPlotData.some(regionData => regionData["No data"] > 0)
    : true // Show by default if no data yet

  // Determine if a class should be shown in the legend (reactive version)
  $: visibleClasses = klasseNamen.filter(klasse => {
    // Always hide "No data" for specific indicators (legacy behavior)
    if (["Waterdiepte bij hevige bui", t("Gevoelstemperatuur"), "Maximale overstromingsdiepte"].includes(indicator?.title) && klasse === "No data") {
      return false
    }
    // Hide "No data" class if it has 0% in all regions
    if (klasse === "No data" && !hasNoDataValues) {
      return false
    }
    return true
  })
</script>

{#if indicator && indicator.classes && visibleClasses.length > 0}
<div
  class="barplot-legend"
  style="height:26%; width:{graphWidth - margin.left - margin.right}px; margin-left:{margin.left}px; margin-top:{margin.top}px"
>
  {#each visibleClasses as klasse, i}
    <div class="legend-element" style="width:{legendElementWidth}px">
      <svg>
        <g>
          <rect x={0} y={0} width={12} height={12} fill={indicatorValueColorscale(klasse)}></rect>
          <text style="fill:#645F5E" dx="20px" dy="0.74em" font-size="13px">{klasse}</text>
        </g>
      </svg>
    </div>
  {/each}
</div>
{/if}

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
