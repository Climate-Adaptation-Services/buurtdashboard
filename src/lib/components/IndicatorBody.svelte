<script>
  import { municipalitySelection, neighbourhoodsInMunicipalityJSONData } from "$lib/stores"
  import BeeswarmPlot from "./BeeswarmPlot.svelte"
  import Stats from "./Stats.svelte"
  import Map from "./Map.svelte"
  import BarPlot from "./BarPlot.svelte"
  import BarPlotLegend from "./BarPlotLegend.svelte"
  import { t } from "$lib/i18n/translate.js"
  import { getClassByIndicatorValue } from "$lib/noncomponents/getClassByIndicatorValue"

  export let indicator
  export let bodyHeight
  export let indicatorValueColorscale
  export let indicatorPlottitle

  let graphWidth
  let mapWidth

  $: overviewHeight = bodyHeight * 0.2
  $: graphHeight = bodyHeight * (indicator.numerical ? 0.4 : 0.6)
  $: mapHeight = bodyHeight * 0.4
</script>

<div class="indicator-body" style="height: {bodyHeight}px">
  {#if indicator.numerical === true}
    <div class="indicator-overview" style="height: {overviewHeight}px">
      <Stats {bodyHeight} {indicator} {indicatorValueColorscale} />
    </div>
    <div class="indicator-graph" style="height:{graphHeight}px" bind:clientWidth={graphWidth}>
      {#if $municipalitySelection !== null}
        <svg class={"beeswarm_" + indicator.attribute}>
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
  {:else}
    <div class="indicator-graph" style="height:{graphHeight}px" bind:clientWidth={graphWidth}>
      <BarPlot
        {graphWidth}
        indicatorHeight={graphHeight * 0.75}
        aggregated={indicator.aggregatedIndicator ? true : false}
        {indicator}
        {indicatorValueColorscale}
        {getClassByIndicatorValue}
      />
      <BarPlotLegend {graphWidth} style="height:{graphHeight * 0.25}px" {indicatorValueColorscale} {indicator} />
    </div>
  {/if}
  <div class="indicator-map" style="height:{mapHeight}px" bind:clientWidth={mapWidth}>
    {#if $municipalitySelection !== null}
      <Map {mapWidth} {mapHeight} mapType={"indicator map"} {indicatorValueColorscale} {indicator} {getClassByIndicatorValue} />
    {/if}
    <div class="footer">
      <h5 class="source"><strong>{indicator.source}</strong></h5>
      {#if indicator.link}
        <h5 class="info-link"><a href={indicator.link} target="_blank">{t("Meer_info")}</a></h5>
      {/if}
    </div>
  </div>
</div>

<style>
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

  .footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  h5 {
    padding: 10px;
    margin: 0;
  }

  .info-link {
    pointer-events: auto;
  }

  a {
    color: black;
  }
</style>
