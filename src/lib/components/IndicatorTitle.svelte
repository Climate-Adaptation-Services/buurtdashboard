<script>
  import { configStore } from "$lib/stores"
  import YearSwitch from "./YearSwitch.svelte"
  import BEBSwitch from "./BEBSwitch.svelte"
  import { t } from "$lib/i18n/translate.js"

  export let indicator
  export let titleHeight = 120

  // Check if indicator has BEB variant (any variant that's not M2 or empty)
  $: hasBEBVariant = indicator.variants && indicator.variants.split(",").map(v => v.trim()).some(v => v !== 'M2' && v !== '')

  // Check if both switches are present
  $: hasBothSwitches = hasBEBVariant && indicator.AHNversie
</script>

<div class="indicator-title" class:both-switches={hasBothSwitches} style="height: {titleHeight}px">
  <!-- <h4 class="category">{t("Categorie")}: {indicator.category}</h4> -->
  <h2 class="title" class:long-title={indicator.title.length > 25} style="background-color:{$configStore.mainColor}">
    {indicator.title}
  </h2>
  <h4 class="subtitle">
    {indicator.subtitle}
    {#if hasBEBVariant}
      <BEBSwitch {indicator} />
    {/if}
  </h4>
  {#if indicator.AHNversie}
    <YearSwitch {indicator} />
  {/if}
</div>

<style>
  .indicator-title {
    display: flex;
    flex-direction: column;
    background-color: whitesmoke;
    align-items: center;
    justify-content: flex-start;
    border-radius: 10px;
    padding-top: 25px;
    position: relative;
    z-index: 2; /* Ensure title and dropdowns appear above indicator body */
  }

  .indicator-title.both-switches {
    padding-top: 5px;
  }

  .category {
    margin: 0;
    color: #bb9012;
  }

  .title {
    padding: 5px 15px;
    margin: 0px 40px 7px 40px;
    border-radius: 15px;
    color: white;
    text-align: center;
  }

  .title.long-title {
    font-size: 1.2rem;
  }

  .subtitle {
    margin: 0;
    padding: 0 10px;
    font-weight: normal;
    color: #7e7975;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
</style>
