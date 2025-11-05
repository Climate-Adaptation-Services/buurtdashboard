<script>
  import BeeswarmPlot from "./BeeswarmPlot.svelte"
  import Stats from "./Stats.svelte"
  import { neighbourhoodsInMunicipalityJSONData, AHNSelecties, municipalitySelection } from "$lib/stores"
  
  // Memoize cloned data to prevent unnecessary BeeswarmPlot re-renders
  let memoizedClonedFeatures = []
  let lastDataReference = null
  
  $: {
    // Only clone when the actual data reference changes, not on every render
    const currentData = $neighbourhoodsInMunicipalityJSONData?.features
    if (currentData && currentData !== lastDataReference) {
      memoizedClonedFeatures = structuredClone(currentData)
      lastDataReference = currentData
    }
  }
  import { t } from "$lib/i18n/translate.js"
  import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute"

  export let indicator
  export let bodyHeight
  export let indicatorValueColorscale
  export let graphWidth
  export let graphHeight
  export let overviewHeight
  export let indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)

  $: indicatorPlottitle = $AHNSelecties[indicator.title] === "Difference" ? indicator.plottitle.replace("%", "% verandering") : indicator.plottitle
</script>

<div class="indicator-overview" style="height: {overviewHeight}px">
  <Stats {bodyHeight} {indicator} {indicatorValueColorscale} />
</div>
<div class="indicator-graph" style="height:{graphHeight}px" bind:clientWidth={graphWidth}>
  {#if $municipalitySelection !== null}
    <svg class={"beeswarm_" + indicator.title.replaceAll(' ', '').replaceAll(',', '_').replaceAll('/', '_').replaceAll('(', '').replaceAll(')', '')}>
      <BeeswarmPlot
        {graphWidth}
        indicatorHeight={graphHeight}
        {indicator}
        {indicatorValueColorscale}
        neighbourhoodsInMunicipalityFeaturesClone={memoizedClonedFeatures}
      />
      {#if graphWidth > 0 && graphHeight > 0}
        <text class="graph-title" x={graphWidth / 2} y={graphHeight - 18}>{indicatorPlottitle} per buurt</text>
      {/if}
    </svg>
  {:else}
    <p class="select-municipality"><em>{t("Selecteer_gemeente")}...</em></p>
  {/if}
</div>

<style>
  svg {
    width: 100%;
    height: 100%;
  }

  .indicator-graph {
    background-color: rgb(253, 249, 234);
  }

  .graph-title {
    fill: #645f5e;
    text-anchor: middle;
    font-size: 14px;
  }

  .select-municipality {
    text-align: center;
    padding-top: 50px;
    font-size: 18px;
    position: absolute;
    left: 29.4%;
  }
</style>
