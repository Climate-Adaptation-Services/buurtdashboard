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
  export let isLoading = false

  let mapWidth

  $: overviewHeight = bodyHeight * 0.2
  $: graphHeight = bodyHeight * (indicator.numerical ? 0.4 : 0.6)
  $: mapHeight = bodyHeight * 0.4
</script>

<div class="indicator-body" style="height: {bodyHeight}px">
  {#if indicator.numerical === true}
    <IndicatorQuantitative {indicator} {graphWidth} {overviewHeight} {graphHeight} {indicatorValueColorscale} {bodyHeight} {isLoading} />
  {:else}
    <IndicatorCategorical {indicator} {graphWidth} {graphHeight} {indicatorValueColorscale} {isLoading} />
  {/if}
  <div class="indicator-map" style="height:{mapHeight}px" bind:clientWidth={mapWidth}>
    {#if $municipalitySelection !== null && !isLoading}
      <Map {mapWidth} {mapHeight} mapType={"indicator map"} {indicatorValueColorscale} {indicator} />
    {:else if isLoading}
      <div class="map-loading">
        <div class="loading-spinner"></div>
      </div>
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
  .map-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #f8f8f8;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--background-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

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
