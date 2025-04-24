<script>
  import BeeswarmPlot from "./BeeswarmPlot.svelte"
  import Stats from "./Stats.svelte"
  import { neighbourhoodsInMunicipalityJSONData, AHNSelecties, municipalitySelection } from "$lib/stores"
  import { t } from "$lib/i18n/translate.js"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

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
    <svg class={"beeswarm_" + getIndicatorAttribute(indicator, indicator.attribute)}>
      <BeeswarmPlot
        {graphWidth}
        indicatorHeight={graphHeight}
        {indicator}
        {indicatorValueColorscale}
        neighbourhoodsInMunicipalityFeaturesClone={structuredClone($neighbourhoodsInMunicipalityJSONData.features)}
      />
      <text class="graph-title" x={graphWidth / 2} y={graphHeight - 18}>{indicatorPlottitle} per buurt</text>
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
