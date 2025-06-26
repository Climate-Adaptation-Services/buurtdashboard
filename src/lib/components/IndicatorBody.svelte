<script>
  import { municipalitySelection, configStore } from "$lib/stores"

  import Map from "./Map.svelte"

  import { t } from "$lib/i18n/translate.js"
  import IndicatorQuantitative from "./IndicatorQuantitative.svelte"
  import IndicatorCategorical from "./IndicatorCategorical.svelte"

  export let indicator
  export let bodyHeight
  export let indicatorValueColorscale
  export let graphWidth

  let mapWidth

  $: overviewHeight = bodyHeight * 0.2
  $: graphHeight = bodyHeight * (indicator.numerical ? 0.4 : 0.6)
  $: mapHeight = bodyHeight * 0.4
</script>

<div class="indicator-body" style="height: {bodyHeight}px">
  {#if indicator.numerical === true}
    <IndicatorQuantitative {indicator} {graphWidth} {overviewHeight} {graphHeight} {indicatorValueColorscale} {bodyHeight} />
  {:else}
    <IndicatorCategorical {indicator} {graphWidth} {graphHeight} {indicatorValueColorscale} />
  {/if}
  <div class="indicator-map" style="height:{mapHeight}px" bind:clientWidth={mapWidth}>
    {#if $municipalitySelection !== null}
      <Map {mapWidth} {mapHeight} mapType={"indicator map"} {indicatorValueColorscale} {indicator} />
    {/if}
    <div class="footer">
      <h5 class="source"><strong>{indicator.source}</strong></h5>
      {#if indicator.link}
        <h5 class="info-link"><a href={indicator.link} target="_blank" color={$configStore.mainColor}>{t("Meer_info")}</a></h5>
      {/if}
    </div>
  </div>
</div>

<style>
  .footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    color: #7e7975 !important;
    font-weight: 300;
  }

  h5 {
    padding: 10px;
    padding-bottom: 5px;
    margin: 0;
  }

  .info-link {
    pointer-events: auto;
  }

  a {
    color: var(--background-color);
  }
</style>
