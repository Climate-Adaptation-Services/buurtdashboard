<script>
  import Map from "./Map.svelte"
  import IndicatorQuantitative from "./IndicatorQuantitative.svelte"
  import IndicatorCategorical from "./IndicatorCategorical.svelte"
  import YearSwitch from "./YearSwitch.svelte"
  import BEBSwitch from "./BEBSwitch.svelte"
  import { t } from "$lib/i18n/translate.js"
  import {
    configStore,
    allMunicipalitiesJSONData,
    municipalitySelection,
    municipalityCodeAbbreviation,
    municipalityNameAbbreviation,
    selectedNeighbourhoodJSONData,
    neighbourhoodNameAbbreviation,
  } from "$lib/stores"

  export let indicator
  export let indicatorValueColorscale
  // Maten uit de indicatortegel, zodat de grafiek er identiek uitziet
  export let graphWidth
  export let bodyHeight
  export let graphHeight

  let mapWidth = 0
  let mapHeight = 0

  // Exact dezelfde maten als in de tegel (zie IndicatorBody.svelte), alleen
  // zonder de kaart - die neemt daar de onderste 40% in.
  $: overviewHeight = bodyHeight * 0.2
  $: chartWrapHeight = (indicator.numerical === true ? overviewHeight : 0) + graphHeight

  // Huidige selectie boven de kaart. Rechtstreeks uit de stores, zodat het
  // meeverandert als je in de modalkaart een andere buurt aanklikt.
  $: municipalityName =
    $allMunicipalitiesJSONData?.features?.find(
      (m) => m.properties[$municipalityCodeAbbreviation] === $municipalitySelection,
    )?.properties[$municipalityNameAbbreviation] ?? null
  $: neighbourhoodName =
    $selectedNeighbourhoodJSONData?.properties?.[$neighbourhoodNameAbbreviation] ?? null

  // Zelfde conditie als IndicatorTitle, zodat de jaar- en BEB-schakelaars ook
  // in de modal beschikbaar blijven
  $: hasBEBVariant =
    indicator.variants &&
    indicator.variants
      .split(",")
      .map((v) => v.trim())
      .some((v) => v !== "M2" && v !== "")
</script>

<!-- data-map-modal begrenst de DOM-lookups van de tooltips tot deze modal -->
<div class="map-modal" data-map-modal>
  <header class="modal-header">
    <h2 style="color:{$configStore.mainColor}">{indicator.title}</h2>
    {#if indicator.subtitle}
      <p class="subtitle">{indicator.subtitle}</p>
    {/if}
    {#if (indicator.AHNversie && indicator.AHNversie.length > 0) || hasBEBVariant}
      <div class="switches">
        {#if indicator.AHNversie && indicator.AHNversie.length > 0}
          <YearSwitch {indicator} />
        {/if}
        {#if hasBEBVariant}
          <BEBSwitch {indicator} />
        {/if}
      </div>
    {/if}
  </header>

  <div class="modal-main">
    <div
      class="chart-column"
      style="width: {graphWidth}px; background-color: {$configStore.mainColor}; border-color: {$configStore.mainColor}"
    >
      <div class="chart-wrap" style="height: {chartWrapHeight}px">
        {#if indicator.numerical === true}
          <IndicatorQuantitative
            {indicator}
            {graphWidth}
            {overviewHeight}
            {graphHeight}
            {indicatorValueColorscale}
            {bodyHeight}
          />
        {:else}
          <IndicatorCategorical {indicator} {graphWidth} {graphHeight} {indicatorValueColorscale} />
        {/if}
      </div>
    </div>

    <div class="map-side">
      <!-- Deze regel houdt de kaart ook weg onder het sluitkruisje van de modal -->
      <p class="map-selection">
        {#if municipalityName}
          <span><span class="label">{t("Gemeente")}</span> {municipalityName}</span>
        {/if}
        {#if neighbourhoodName}
          <span class="separator">·</span>
          <span><span class="label">{t("Buurt")}</span> {neighbourhoodName}</span>
        {/if}
      </p>
      <div class="map-column" bind:clientWidth={mapWidth} bind:clientHeight={mapHeight}>
        {#if mapWidth > 0 && mapHeight > 0}
          <!-- 24px, zelfde maat als het sluitkruisje van de modal, rechts uitgelijnd -->
          <Map
            {mapWidth}
            {mapHeight}
            mapType={"indicator map"}
            {indicatorValueColorscale}
            {indicator}
            infoIconSize={24}
            infoIconInset={0}
          />
        {/if}
      </div>
    </div>
  </div>

  <footer class="modal-footer">
    <span class="source"><strong>{indicator.source}</strong></span>
    {#if indicator.link}
      <a class="info-link" href={indicator.link} target="_blank" rel="noopener">{t("Meer_info")}</a>
    {/if}
  </footer>
</div>

<style>
  .map-modal {
    display: flex;
    flex-direction: column;
    height: min(78vh, 900px);
  }

  .modal-header {
    flex: 0 0 auto;
    text-align: left;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 22px;
  }

  .subtitle {
    margin: 4px 0 0;
    font-size: 14px;
    color: #444;
  }

  .switches {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .modal-main {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    gap: 20px;
    align-items: stretch;
    margin-top: 12px;
  }

  .chart-column {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    /* De grafiek blijft één blok en staat verticaal gecentreerd */
    justify-content: center;
    min-width: 0;
    border-radius: 10px;
    /* Zelfde groen als de achtergrond: verbreedt de groene rand om de grafiek */
    border: 10px solid;
    box-sizing: border-box;
    padding: 12px 0;
  }

  .chart-wrap {
    position: relative;
    width: 100%;
    flex: 0 0 auto;
  }

  /* In de tegel staat de statsstrook op het witte vlak van de kaart zelf. Hier
     staat er groen achter, dus die witte ondergrond expliciet meegeven - anders
     staan de labels (#645f5e) op donkergroen met een contrast van 1,25:1. */
  .chart-wrap :global(.indicator-overview) {
    background-color: white;
  }

  .map-side {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* Ruimte rechts vrijhouden voor het sluitkruisje van de modal */
  .map-selection {
    flex: 0 0 auto;
    margin: 0 0 10px;
    /* Links evenveel ruimte als rechts, zodat de tekst gecentreerd blijft
       ondanks de vrijgehouden ruimte voor het sluitkruisje */
    padding: 0 44px;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
    color: #36575b;
    line-height: 1.3;
    min-height: 24px;
  }

  .map-selection .label {
    font-weight: 300;
    color: #7e7975;
  }

  .separator {
    margin: 0 6px;
    color: #b0aaa6;
  }

  .map-column {
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
  }

  .modal-footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 10px;
    color: #7e7975;
    font-weight: 300;
    font-size: 13px;
  }

  .info-link {
    color: inherit;
  }

  /* Onder 900px past de kaart niet meer naast de grafiek */
  @media (max-width: 900px) {
    .map-modal {
      height: auto;
    }

    .modal-main {
      flex-direction: column;
    }

    .chart-column {
      width: 100% !important;
    }

    .map-side {
      height: 55vh;
    }
  }
</style>
