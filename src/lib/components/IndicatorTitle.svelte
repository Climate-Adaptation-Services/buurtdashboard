<script>
  import { configStore } from "$lib/stores"
  import { t } from "$lib/i18n/translate.js"
  import YearSwitch from "./YearSwitch.svelte"
  import BEBSwitch from "./BEBSwitch.svelte"

  export let indicator
  export let titleHeight = 120

  // Check if this indicator has BEB variants
  $: hasBEBVariant = indicator.variants &&
    indicator.variants.split(',').map(v => v.trim()).some(v => v !== 'M2' && v !== '')
</script>

<div class="indicator-title" style="height: {titleHeight}px">
  <!-- <h4 class="category">{t("Categorie")}: {indicator.category}</h4> -->
  <h2 class="title" class:long-title={indicator.title.length > 25} style="background-color:{$configStore.mainColor}">
    {indicator.title}
  </h2>
  {#if indicator.subtitle}
    <p class="subtitle">{indicator.subtitle}</p>
  {/if}
  {#if (indicator.AHNversie && indicator.AHNversie.length > 0) || hasBEBVariant}
    <div class="switches-container">
      {#if indicator.AHNversie && indicator.AHNversie.length > 0}
        <YearSwitch {indicator} />
      {/if}
      {#if hasBEBVariant}
        <BEBSwitch {indicator} />
      {/if}
    </div>
  {/if}
</div>

<style>
  .indicator-title {
    display: flex;
    flex-direction: column;
    background-color: whitesmoke;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    position: relative;
    z-index: 2;
    padding-bottom: 10px;
  }

  .category {
    margin: 0;
    color: #bb9012;
  }

  .title {
    padding: 5px 15px;
    margin: 0px 40px 0px 40px;
    border-radius: 15px;
    color: white;
    text-align: center;
    font-size: 1.3rem;
  }

  .title.long-title {
    font-size: 1.0rem;
  }

  .subtitle {
    margin: 8px 0 -8px 0;
    font-size: 0.85rem;
    color: #666;
    text-align: center;
  }

  .switches-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
    padding: 0 10px;
  }
</style>
