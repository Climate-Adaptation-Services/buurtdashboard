<script>
  import { neighbourhoodSelection, configStore, municipalitySelection, neighbourhoodsInMunicipalityJSONData } from "$lib/stores"
  import YearSwitch from "./YearSwitch.svelte"
  import { t } from "$lib/i18n/translate.js"

  export let indicator
  export let titleHeight
</script>

<div class="indicator-title" style="height: {titleHeight}px">
  <!-- <h4 class="category">{t("Categorie")}: {indicator.category}</h4> -->
  <h2 class="title" style="background-color:{$configStore.mainColor}">
    {indicator.title}
  </h2>
  <h4 class="subtitle">{indicator.subtitle}</h4>
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
    justify-content: center;
    border-radius: 10px;
    /* padding-top: 10px; */
  }

  .category {
    margin: 0;
    color: #bb9012;
  }

  .title {
    padding: 5px 15px;
    margin: 10px 40px 7px 40px;
    border-radius: 15px;
    color: white;
    text-align: center;
  }

  .subtitle {
    margin: 0;
    padding: 0 10px;
    font-weight: normal;
    color: #7e7975;
    text-align: center;
  }
</style>
